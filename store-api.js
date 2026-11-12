// Store API: Rosaino's own online store (Shopify, YouCan, WooCommerce or
// custom code) sends its orders here with an API key, and they arrive in the
// operations portal as new leads.
//
// - Keys are created in the portal (Store connection). The full key is shown
//   once; only its SHA-256 fingerprint is stored, so a database leak can't be
//   used to send orders.
// - POST /api/v1/orders accepts a Shopify order webhook, a YouCan or
//   WooCommerce order, or a simple JSON order, and recognises which one it is.
// - The same order sent twice (webhook retries) is recorded once.
// - GET /api/v1/orders/:ref tells the store where an order is (status,
//   carrier, tracking number), using the store's own order number.
import crypto from 'crypto';
import { requireAuth, audit, serverSecret } from './auth.js';
import { dataDb, loadCollections, saveRecords, getRecord } from './data-store.js';

const KEY_PREFIX = 'rsk_live_';
export const PLATFORMS = ['Shopify', 'YouCan', 'WooCommerce', 'Lightfunnels', 'Google Sheets', 'Zapier / Make', 'Other'];

// ---------------------------------------------------------------------------
// Secrets (Shopify webhook signing secret), encrypted like carrier keys
// ---------------------------------------------------------------------------
const ENC_KEY = crypto.createHash('sha256').update('rosaino-store-secrets:' + serverSecret()).digest();
function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const data = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), data].map(b => b.toString('base64')).join('.');
}
function decrypt(blob) {
  if (!blob) return '';
  try {
    const [iv, tag, data] = blob.split('.').map(p => Buffer.from(p, 'base64'));
    const d = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}

const sha256 = s => crypto.createHash('sha256').update(String(s)).digest('hex');

// ---------------------------------------------------------------------------
// Key storage: app_records (collection "api_keys") or memory
// ---------------------------------------------------------------------------
const memKeys = new Map();
const repo = {
  async list() {
    if (!(await dataDb())) return [...memKeys.values()];
    return (await loadCollections(['api_keys'])).api_keys;
  },
  async save(k) {
    if (!(await dataDb())) return void memKeys.set(k.id, JSON.parse(JSON.stringify(k)));
    await saveRecords('api_keys', [k]);
  },
  async byHash(hash) {
    return (await this.list()).find(k => k.hash === hash) || null;
  }
};

// For the portal's setup checklist.
export async function storeConnectionStatus() {
  const keys = (await repo.list()).filter(k => k.active !== false);
  return { keys: keys.length, received: keys.reduce((n, k) => n + (k.ordersReceived || 0), 0) };
}

const publicKey = k => ({
  id: k.id, name: k.name, platform: k.platform, prefix: k.prefix, active: k.active !== false,
  hasSigningSecret: !!k.signingSecretEnc, shopDomain: k.shopDomain || null, connectedVia: k.connectedVia || null, createdAt: k.createdAt, createdBy: k.createdBy,
  lastUsedAt: k.lastUsedAt || null, ordersReceived: k.ordersReceived || 0, recent: (k.recent || []).slice(0, 15)
});

// ---------------------------------------------------------------------------
// Reading orders from different platforms
// ---------------------------------------------------------------------------
const str = v => (v == null ? '' : String(v).trim());
const num = v => {
  const n = Number(String(v ?? '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const first = (...vals) => vals.map(str).find(Boolean) || '';
const joinName = (a, b) => [str(a), str(b)].filter(Boolean).join(' ');

// Moroccan numbers are kept the way couriers expect them: 06… / 07… / 05….
export function normalizePhone(raw) {
  let d = str(raw).replace(/[^0-9+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('212') && d.length >= 12) d = '0' + d.slice(3);
  if (/^[5-7]\d{8}$/.test(d)) d = '0' + d;
  return d;
}

function detectPlatform(b, hinted) {
  if (hinted) return hinted;
  if (Array.isArray(b.line_items) && (b.shipping_address || b.billing_address || b.admin_graphql_api_id || b.order_number)) return 'Shopify';
  if (Array.isArray(b.line_items) && b.billing && typeof b.billing === 'object') return 'WooCommerce';
  if (b.ref && (b.variants || b.items) && b.customer) return 'YouCan';
  return 'API';
}

// Column / field names stores use for the same thing (English, French,
// Arabic, and common spellings), for sheets, forms and simple JSON.
const ALIASES = {
  customer: ['customer', 'customer_name', 'client', 'client_name', 'nom', 'nom_complet', 'nom_et_prenom', 'nom_prenom', 'full_name', 'fullname', 'name', 'الاسم', 'الاسم_الكامل', 'اسم'],
  phone: ['phone', 'phone_number', 'telephone', 'tel', 'mobile', 'gsm', 'numero', 'numero_de_telephone', 'whatsapp', 'الهاتف', 'رقم_الهاتف', 'الجوال'],
  city: ['city', 'ville', 'المدينة', 'مدينة'],
  address: ['address', 'adresse', 'address1', 'adresse_de_livraison', 'shipping_address', 'العنوان'],
  product: ['product', 'product_name', 'produit', 'article', 'المنتج', 'منتج'],
  sku: ['sku', 'product_sku', 'ref_produit', 'reference_produit'],
  quantity: ['quantity', 'qty', 'quantite', 'qte', 'الكمية'],
  total: ['total', 'total_price', 'montant', 'montant_total', 'prix_total', 'amount', 'المبلغ', 'المجموع'],
  price: ['price', 'prix', 'unit_price', 'الثمن', 'السعر'],
  email: ['email', 'e_mail', 'mail', 'courriel', 'البريد_الالكتروني', 'البريد'],
  country: ['country', 'country_code', 'pays', 'code_pays', 'الدولة', 'البلد'],
  orderId: ['order_id', 'external_id', 'id_commande', 'numero_commande', 'commande', 'order_number', 'رقم_الطلب', 'sheet_row'],
  note: ['note', 'notes', 'remarque', 'commentaire', 'comment', 'ملاحظة', 'ملاحظات']
};
const keyOf = k => String(k).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');

// A flat { normalised key: value } view of an order's plain fields, plus
// Shopify note_attributes / additional fields ([{ name, value }]) that COD
// form apps fill in.
function flatFields(b) {
  const out = {};
  const put = (k, v) => { if (v != null && typeof v !== 'object' && str(v) !== '' && !(keyOf(k) in out)) out[keyOf(k)] = v; };
  Object.entries(b).forEach(([k, v]) => put(k, v));
  for (const list of [b.note_attributes, b.additional_fields, b.custom_fields, b.attributes, b.meta_data]) {
    if (Array.isArray(list)) list.forEach(a => a && put(a.name ?? a.key ?? a.label ?? '', a.value));
  }
  return out;
}
const pickAlias = (flat, field) => {
  for (const a of ALIASES[field]) if (flat[keyOf(a)] != null) return flat[keyOf(a)];
  return undefined;
};

// Last resort: a phone number anywhere in the order (any key mentioning phone).
function findPhoneDeep(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return '';
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && typeof v !== 'object' && /phone|tel|mobile|gsm|هاتف/i.test(k) && str(v).replace(/\D/g, '').length >= 8) return str(v);
  }
  for (const v of Object.values(obj)) {
    const found = typeof v === 'object' ? findPhoneDeep(v, depth + 1) : '';
    if (found) return found;
  }
  return '';
}

// Webhooks often wrap the order: { event, data: {...} }, { payload: {...} }, { order: {...} }.
const looksLikeOrder = o => o && typeof o === 'object' && !Array.isArray(o)
  && !!(o.line_items || o.items || o.variants || o.products || o.customer || o.shipping_address || o.billing || o.phone || o.total || o.total_price);
function unwrapOrder(body) {
  let b = body && typeof body === 'object' ? body : {};
  for (let i = 0; i < 3; i++) {
    const inner = ['order', 'data', 'payload', 'resource', 'object', 'record'].map(k => b[k]).find(looksLikeOrder);
    if (!inner || (looksLikeOrder(b) && (b.line_items || b.items || b.variants))) break;
    b = inner;
  }
  return b;
}

// Items: [{ sku, name, quantity, price }]
function readItems(b, platform) {
  const list = [b.line_items, b.items, b.products, b.variants, b.cart?.items].find(Array.isArray) || [];
  const items = list.map(it => {
    const v = it.variant && typeof it.variant === 'object' ? it.variant : {};
    const p = it.product && typeof it.product === 'object' ? it.product : (v.product && typeof v.product === 'object' ? v.product : {});
    const quantity = Math.max(1, Math.min(999, Math.floor(num(it.quantity ?? it.qty ?? 1)) || 1));
    // Shopify/Woo give the unit price; others may give a line total.
    let price = num(it.price ?? it.unit_price ?? v.price ?? p.price);
    if (!price && (it.total || it.line_total)) price = num(it.total || it.line_total) / quantity;
    return {
      sku: first(it.sku, v.sku, p.sku, it.variant_sku),
      name: first(it.name, it.title, it.product_name, p.name, p.title, v.name, it.sku, 'Item'),
      quantity,
      price
    };
  }).filter(i => i.name || i.sku);
  if (!items.length) {
    // One product given as plain fields (forms, sheets): Produit / Quantité / Prix.
    const flat = flatFields(b);
    const name = first(typeof b.product === 'string' ? b.product : '', b.product_name, pickAlias(flat, 'product'));
    const sku = first(b.sku, pickAlias(flat, 'sku'));
    if (name || sku) {
      const quantity = Math.max(1, Math.floor(num(b.quantity ?? pickAlias(flat, 'quantity'))) || 1);
      let price = num(b.price ?? pickAlias(flat, 'price'));
      if (!price) price = num(pickAlias(flat, 'total')) / quantity;
      items.push({ sku, name: name || sku, quantity, price });
    }
  }
  return items;
}

/**
 * Turn a store's order into Rosaino's lead fields.
 * Returns { lead } or { error } when something required is missing.
 */
export function normalizeOrder(body, hintedPlatform) {
  const b = unwrapOrder(body);
  const platform = detectPlatform(b, hintedPlatform);
  const fields = flatFields(b);
  const cust = b.customer && typeof b.customer === 'object' ? b.customer : {};
  const firstOf = v => (Array.isArray(v) ? v[0] : v);
  // An address object, possibly nested one level (shipping.address).
  const flat = a => (a && typeof a === 'object' && a.address && typeof a.address === 'object' && !Array.isArray(a.address) ? { ...a, ...a.address } : a);
  const ship = [b.shipping_address, b.shipping, b.shippingAddress, b.billing_address, b.billing, cust.default_address, firstOf(cust.addresses), firstOf(cust.address), b.address]
    .map(flat).find(a => a && typeof a === 'object' && !Array.isArray(a) && (a.city || a.address1 || a.address_1 || a.phone || a.first_name || a.name || a.street || typeof a.address === 'string')) || {};

  const customer = first(
    typeof b.customer === 'string' ? b.customer : '', b.customer_name, b.full_name, b.name && platform === 'API' ? b.name : '',
    ship.name, joinName(ship.first_name, ship.last_name), cust.full_name, cust.name, joinName(cust.first_name, cust.last_name),
    platform === 'API' || platform === 'Google Sheets' ? pickAlias(fields, 'customer') : ''
  );
  const email = first(b.email, b.contact_email, cust.email, ship.email, b.billing?.email, b.billing_address?.email, pickAlias(fields, 'email'));
  const phone = normalizePhone(first(b.phone, b.customer_phone, b.telephone, ship.phone, cust.phone, b.billing?.phone, b.billing_address?.phone, pickAlias(fields, 'phone'), findPhoneDeep(b)));
  const city = first(b.city, ship.city, cust.city, ship.region, ship.province, pickAlias(fields, 'city'));
  const country = first(ship.country_code, ship.countryCode, ship.country_iso, typeof ship.country === 'string' ? ship.country : ship.country?.code, b.country_code, typeof b.country === 'string' ? b.country : '', pickAlias(fields, 'country'));
  const latN = Number(ship.latitude ?? ship.lat), lngN = Number(ship.longitude ?? ship.lng ?? ship.lon);
  const geo = Number.isFinite(latN) && Number.isFinite(lngN) && (latN || lngN) && Math.abs(latN) <= 90 && Math.abs(lngN) <= 180 ? { lat: latN, lng: lngN } : null;
  const address = first(
    typeof b.address === 'string' ? b.address : '', b.customer_address,
    [ship.address1 ?? ship.address_1 ?? (typeof ship.address === 'string' ? ship.address : null) ?? ship.street ?? ship.line1, ship.address2 ?? ship.address_2 ?? ship.line2].map(str).filter(Boolean).join(', '),
    ship.zone, pickAlias(fields, 'address')
  );
  const items = readItems(b, platform);
  const shipping = num(b.shipping_price ?? b.shipping_lines?.[0]?.price ?? b.shipping_total ?? b.total_shipping_price_set?.shop_money?.amount);
  const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const amount = num(b.total ?? b.total_price ?? b.amount ?? b.grand_total ?? b.total_amount ?? pickAlias(fields, 'total')) || itemsTotal + shipping;
  const financial = str(b.financial_status ?? b.payment_status ?? b.payment?.status ?? b.status).toLowerCase();
  const gateway = str(b.payment_method ?? b.gateway ?? (Array.isArray(b.payment_gateway_names) ? b.payment_gateway_names.join(' ') : '') ?? b.payment?.method).toLowerCase();
  const prepaid = b.prepaid === true || (financial === 'paid' && !/cod|cash|livraison|delivery/.test(gateway));
  const externalId = first(b.external_id, b.order_id, b.id, b._id, b.ref, b.order_number, b.number, pickAlias(fields, 'orderId'), b.name && platform !== 'API' ? b.name : '');
  const displayRef = first(b.order_number && platform === 'Shopify' ? `#${b.order_number}` : '', b.name && platform === 'Shopify' ? b.name : '', b.ref, b.number, b.order_number, externalId);
  const noteBase = first(typeof b.note === 'string' ? b.note : '', typeof b.notes === 'string' ? b.notes : '', b.customer_note, b.comment, b.customer_note_text, pickAlias(fields, 'note'));
  const note = [noteBase, !phone && email ? `No phone number in the order: contact the customer at ${email}.` : ''].filter(Boolean).join(' · ');
  const utm = b.utm && typeof b.utm === 'object' ? b.utm : {};
  const landing = str(b.landing_site);
  const qs = (() => { try { return new URL(landing, 'https://x').searchParams; } catch { return new URLSearchParams(); } })();

  // No phone but an email (e.g. a Shopify checkout that only asks for email):
  // keep the order so it isn't lost; the call center contacts them by email.
  const missing = [!customer && 'customer name', !phone && !email && 'phone', !items.length && 'at least one item'].filter(Boolean);
  const lead = {
      externalId: externalId || null,
      externalRef: displayRef || externalId || null,
      customer: customer.slice(0, 120),
      phone: phone.slice(0, 20),
      city: city.slice(0, 80),
      country: String(country).slice(0, 60),
      email: String(email).slice(0, 120),
      geo,
      address: address.slice(0, 300),
      items: items.slice(0, 50).map(i => ({ ...i, sku: i.sku.slice(0, 80), name: i.name.slice(0, 160) })),
      amount: Math.max(0, Math.round(amount * 100) / 100),
      shipping,
      prepaid,
      note: note.slice(0, 1000),
      campaign: first(utm.campaign, b.utm_campaign, qs.get('utm_campaign')).slice(0, 120),
      creative: first(utm.content, b.utm_content, qs.get('utm_content')).slice(0, 120),
      adSource: first(utm.source, b.utm_source, qs.get('utm_source'), b.source_name).slice(0, 60),
      currency: first(b.currency, 'MAD').slice(0, 8)
  };
  // What could be read is returned with the error, so staff can complete it.
  if (missing.length) return { error: `Missing ${missing.join(', ')}.`, platform, draft: lead };
  return { platform, lead };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
const rate = new Map(); // key id -> timestamps (last minute)
function allowed(id) {
  const now = Date.now();
  const recent = (rate.get(id) || []).filter(t => now - t < 60000);
  if (recent.length >= 120) return false;
  recent.push(now);
  rate.set(id, recent);
  return true;
}

function presentedKey(req) {
  const auth = String(req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return String(req.headers['x-api-key'] || req.query.key || req.query.api_key || '').trim();
}

const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('[store-api]', err.message);
    res.status(err.status || 500).json({ error: err.expose ? err.message : 'Something went wrong. Please try again.' });
  }
};
const fail = (status, message) => Object.assign(new Error(message), { status, expose: true });

async function note(k, entry) {
  k.recent = [{ at: new Date().toISOString(), ...entry }, ...(k.recent || [])].slice(0, 25);
  k.lastUsedAt = new Date().toISOString();
  await repo.save(k).catch(err => console.error('[store-api] could not save key activity:', err.message));
}

/**
 * createLead(lead, { platform, keyName }) -> { order, duplicate }
 * findOrder(ref) -> { order, shipment } | null
 */

// ---------------------------------------------------------------------------
// Shopify one-step connect: the store address plus the credentials of a
// Shopify app installed on that store (Admin API access token, or the app's
// Client ID + Client secret). Rosaino checks them, creates a key and
// registers the "order created" webhook in the store itself.
// ---------------------------------------------------------------------------
const SHOPIFY_API_VERSION = '2025-10';

export function shopifyDomain(input) {
  let s = str(input).toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].trim();
  if (s && !s.includes('.')) s += '.myshopify.com';
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(s) ? s : null;
}

const shopifyOrigin = shop => process.env.SHOPIFY_API_ORIGIN_FOR_TESTS || `https://${shop}`;

async function shopifyCall(shop, token, method, path, body) {
  let res;
  try {
    res = await fetch(`${shopifyOrigin(shop)}/admin/api/${SHOPIFY_API_VERSION}${path}`, {
      method, headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000)
    });
  } catch (err) {
    throw fail(502, `Shopify could not be reached (${err.message}). Check the store address.`);
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (res.status === 401) throw fail(400, 'Shopify rejected the access token. Copy the Admin API access token again (it starts with shpat_).');
  if (res.status === 403) throw fail(400, 'The Shopify app is missing permissions. In its Admin API scopes, turn on read_orders, then install or update the app and try again.');
  if (res.status === 404) throw fail(400, 'Shopify did not find this store. Use its .myshopify.com address (Settings → Domains in Shopify).');
  if (!res.ok) {
    const why = data?.errors ? (typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors)) : text.slice(0, 160);
    throw fail(400, `Shopify refused the request (HTTP ${res.status}): ${why}`);
  }
  return data;
}

// A Dev Dashboard app installed on the merchant's own store gets its token
// with the client credentials grant (valid 24 h; the webhook stays after).
async function shopifyClientToken(shop, clientId, clientSecret) {
  let res;
  try {
    res = await fetch(`${shopifyOrigin(shop)}/admin/oauth/access_token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
      signal: AbortSignal.timeout(15000)
    });
  } catch (err) {
    throw fail(502, `Shopify could not be reached (${err.message}). Check the store address.`);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw fail(400, 'Shopify did not accept the Client ID and Client secret. Check that they are copied correctly and that the app is installed on this store.');
  }
  return data.access_token;
}

function publicOrigin(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return `${proto}://${host}`;
}

// On Vercel each request can run on a different server: without a database a
// key (and the orders it receives) would only exist on one of them.
function requireDatabaseForKeys() {
  if (process.env.VERCEL && !process.env.DATABASE_URL?.trim()) {
    throw fail(503, 'Connect the database first: set DATABASE_URL in Vercel (Supabase → Connect → Transaction pooler) and redeploy. Without it, store orders would be lost.');
  }
}

// Orders sent with a key Rosaino doesn't know (an old link still set in the
// store): kept so Store connection can say so instead of failing silently.
const memRefused = [];
async function refusedDelivery(req, reason, presented = '') {
  const entry = {
    at: new Date().toISOString(), reason,
    keyStart: presented ? presented.slice(0, KEY_PREFIX.length + 6) : '',
    source: req.headers['x-shopify-topic'] || req.headers['x-shopify-shop-domain'] ? 'Shopify' : req.headers['x-wc-webhook-source'] ? 'WooCommerce' : '',
    shop: String(req.headers['x-shopify-shop-domain'] || req.headers['x-wc-webhook-source'] || '').slice(0, 120)
  };
  try {
    if (!(await dataDb())) { memRefused.unshift(entry); memRefused.length = Math.min(memRefused.length, 30); return; }
    const doc = (await getRecord('settings', 'store_refused')) || { id: 'store_refused', list: [] };
    doc.list = [entry, ...(doc.list || [])].slice(0, 30);
    await saveRecords('settings', [doc]);
  } catch (err) {
    console.error('[store-api] could not record a refused delivery:', err.message);
  }
}
async function refusedDeliveries() {
  if (!(await dataDb())) return memRefused;
  return (await getRecord('settings', 'store_refused'))?.list || [];
}

// Minimal XML → object for store webhooks (Shopify's XML format):
// <line-items type="array"><line-item>…</line-item></line-items> becomes
// line_items: [{…}], hyphens become underscores, nil="true" becomes null.
export function xmlToObject(xml) {
  const text = String(xml || '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[^>]*>/gi, '');
  const decode = v => v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, '&');
  const key = n => n.replace(/^.*:/, '').replace(/-/g, '_');
  const root = { children: {}, array: false };
  const stack = [root];
  const re = /<(\/?)([A-Za-z_][\w.:-]*)([^>]*?)(\/?)>|([^<]+)|(<!\[CDATA\[[\s\S]*?\]\]>)/g;
  let m;
  while ((m = re.exec(text))) {
    const top = stack[stack.length - 1];
    if (m[5] != null || m[6] != null) { top.text = (top.text || '') + (m[6] ?? m[5]); continue; }
    const [, closing, name, attrs, selfClose] = m;
    if (closing) {
      const node = stack.pop();
      const parent = stack[stack.length - 1];
      let value;
      if (node.array) value = Object.values(node.children).flat();
      else if (Object.keys(node.children).length) value = Object.fromEntries(Object.entries(node.children).map(([k, v]) => [k, v.length > 1 ? v : v[0]]));
      else value = node.nil ? null : decode((node.text || '').trim());
      (parent.children[node.key] ||= []).push(value);
      continue;
    }
    const node = { key: key(name), children: {}, array: /type\s*=\s*["']array["']/.test(attrs), nil: /nil\s*=\s*["']true["']/.test(attrs) };
    if (selfClose) { (top.children[node.key] ||= []).push(node.array ? [] : null); continue; }
    stack.push(node);
  }
  const first = Object.values(root.children)[0];
  return first ? first[0] : {};
}

// The webhook body as an object, whatever format the store used.
function readBody(req) {
  const b = req.body;
  if (b && typeof b === 'object' && !Buffer.isBuffer(b) && Object.keys(b).length) return { body: b, format: 'JSON' };
  const raw = typeof b === 'string' ? b : req.rawBody ? req.rawBody.toString('utf8') : '';
  const t = raw.trim();
  if (t.startsWith('<')) return { body: xmlToObject(t), format: 'XML' };
  if (t.startsWith('{') || t.startsWith('[')) { try { return { body: JSON.parse(t), format: 'JSON' }; } catch {} }
  return { body: {}, format: t ? 'unreadable' : 'empty' };
}

// What was received, for the "Recent deliveries" details (field names only).
function describeReceived(req, body, format) {
  const ct = String(req.headers['content-type'] || 'none').split(';')[0];
  const keys = Object.keys(body || {}).slice(0, 12);
  return `received ${format} (${ct})${keys.length ? `, fields: ${keys.join(', ')}` : ', no fields'}`;
}

// Refused store orders are kept (what was received) so staff can complete
// and add them from Store connection instead of losing them.
const memInbox = new Map();
const inbox = {
  async save(rec) {
    if (!(await dataDb())) return void memInbox.set(rec.id, rec);
    await saveRecords('store_inbox', [rec]);
  },
  async get(id) {
    if (!(await dataDb())) return memInbox.get(id) || null;
    return getRecord('store_inbox', id);
  }
};

// Shopify webhook events in English and French (as shown in Shopify's settings).
const SHOPIFY_EVENT_NAMES = {
  'checkouts/create': 'Checkout creation (Création du paiement)', 'checkouts/update': 'Checkout update (Mise à jour du paiement)',
  'checkouts/delete': 'Checkout deletion', 'carts/create': 'Cart creation (Création de panier)', 'carts/update': 'Cart update (Mise à jour du panier)',
  'customers/create': 'Customer creation (Création de client)', 'customers/update': 'Customer update (Mise à jour du client)',
  'products/create': 'Product creation (Création de produit)', 'products/update': 'Product update (Mise à jour du produit)',
  'fulfillments/create': 'Fulfillment creation (Création de traitement)', 'fulfillments/update': 'Fulfillment update',
  'refunds/create': 'Refund creation (Création de remboursement)', 'collections/create': 'Collection creation', 'app/uninstalled': 'App uninstalled'
};

export function registerStoreApi(app, { createLead, findOrder }) {
  // --- Keys (portal) ---------------------------------------------------------
  app.get('/api/store-keys/refused', requireAuth('integrations'), wrap(async (req, res) => {
    res.json(await refusedDeliveries());
  }));


  // A refused order: what was read from it, to complete it in the portal.
  app.get('/api/store-keys/:id/inbox/:inboxId', requireAuth('integrations', 'orders'), wrap(async (req, res) => {
    const rec = await inbox.get(req.params.inboxId);
    if (!rec || rec.keyId !== req.params.id) throw fail(404, 'This delivery is no longer available.');
    const parsed = normalizeOrder(rec.body || {}, rec.hinted);
    res.json({ id: rec.id, at: rec.at, format: rec.format, error: parsed.error || null, resolvedOrderId: rec.resolvedOrderId || null,
      fields: Object.keys(rec.body || {}).slice(0, 40), draft: parsed.lead || parsed.draft || null });
  }));

  // Complete a refused order (staff fill in what was missing) and add it as a lead.
  app.post('/api/store-keys/:id/inbox/:inboxId', requireAuth('integrations', 'orders'), wrap(async (req, res) => {
    const k = (await repo.list()).find(x => x.id === req.params.id);
    const rec = await inbox.get(req.params.inboxId);
    if (!k || !rec || rec.keyId !== k.id) throw fail(404, 'This delivery is no longer available.');
    if (rec.resolvedOrderId) return res.json({ success: true, id: rec.resolvedOrderId, duplicate: true });
    const parsed = normalizeOrder(rec.body || {}, rec.hinted);
    const base = parsed.lead || parsed.draft || {};
    const b = req.body || {};
    const lead = { ...base };
    if (b.customer !== undefined) lead.customer = str(b.customer).slice(0, 120);
    if (b.phone !== undefined) lead.phone = normalizePhone(b.phone).slice(0, 20);
    if (b.city !== undefined) lead.city = str(b.city).slice(0, 80);
    if (b.address !== undefined) lead.address = str(b.address).slice(0, 300);
    if (str(b.product)) {
      const quantity = Math.max(1, Math.round(num(b.quantity) || 1));
      const total = num(b.amount);
      lead.items = [{ name: str(b.product).slice(0, 160), sku: str(b.sku).slice(0, 80), quantity, price: total ? Math.round((total / quantity) * 100) / 100 : 0 }];
    }
    if (b.amount !== undefined && num(b.amount)) lead.amount = num(b.amount);
    lead.items ||= [];
    lead.externalId ||= 'manual-' + rec.id;
    const missing = [!lead.customer && 'customer name', !lead.phone && !lead.email && 'phone', !lead.items.length && 'product'].filter(Boolean);
    if (missing.length) throw fail(400, `Still missing: ${missing.join(', ')}.`);
    const platform = rec.platform || k.platform;
    const { order, duplicate } = await createLead(lead, { platform, keyName: k.name, keyId: k.id });
    rec.resolvedOrderId = order.id;
    rec.resolvedBy = req.user?.name || '';
    await inbox.save(rec);
    const entry = (k.recent || []).find(r => r.inboxId === rec.id);
    if (entry) Object.assign(entry, { result: 'created', orderId: order.id, ref: lead.externalRef, reason: `Completed and added by ${req.user?.name || 'staff'}` });
    if (!duplicate) k.ordersReceived = (k.ordersReceived || 0) + 1;
    await repo.save(k);
    await audit(req.user, 'store_order.completed', `${order.id} from ${k.name}`, req);
    res.json({ success: true, id: order.id, duplicate });
  }));

  app.get('/api/store-keys', requireAuth('integrations'), wrap(async (req, res) => {
    res.json((await repo.list()).map(publicKey).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }));

  app.post('/api/store-keys', requireAuth('integrations'), wrap(async (req, res) => {
    requireDatabaseForKeys();
    const b = req.body || {};
    const name = str(b.name).slice(0, 60);
    if (!name) throw fail(400, 'Give the key a name, e.g. "Shopify store".');
    const platform = PLATFORMS.includes(b.platform) ? b.platform : 'Other';
    const secret = KEY_PREFIX + crypto.randomBytes(24).toString('base64url');
    const k = {
      id: 'key_' + crypto.randomBytes(6).toString('hex'), name, platform,
      prefix: secret.slice(0, KEY_PREFIX.length + 6), hash: sha256(secret), active: true,
      signingSecretEnc: str(b.signingSecret) ? encrypt(str(b.signingSecret)) : null,
      createdAt: new Date().toISOString(), createdBy: req.user?.name || '', ordersReceived: 0, recent: []
    };
    await repo.save(k);
    await audit(req.user, 'store_key.created', `${name} (${platform})`, req);
    // The only time the full key is sent anywhere.
    res.status(201).json({ success: true, key: publicKey(k), secret });
  }));


  // One step: check the Shopify credentials, create the key, add the webhook.
  app.post('/api/store-keys/shopify-connect', requireAuth('integrations'), wrap(async (req, res) => {
    requireDatabaseForKeys();
    const b = req.body || {};
    const shop = shopifyDomain(b.shop);
    if (!shop) throw fail(400, 'Enter the store address, e.g. rosaino.myshopify.com (Shopify → Settings → Domains).');
    const accessToken = str(b.accessToken);
    const clientId = str(b.clientId), clientSecret = str(b.clientSecret);
    if (!accessToken && !(clientId && clientSecret)) throw fail(400, 'Paste the Admin API access token, or the app\'s Client ID and Client secret.');
    const token = accessToken || await shopifyClientToken(shop, clientId, clientSecret);

    const info = (await shopifyCall(shop, token, 'GET', '/shop.json'))?.shop || {};
    const origin = publicOrigin(req);
    if (!/^https:\/\//.test(origin) && !process.env.SHOPIFY_API_ORIGIN_FOR_TESTS) throw fail(400, 'Shopify only sends orders to an https address. Open the portal from its https URL and try again.');

    // Replace earlier Rosaino keys and webhooks for this store.
    const keys = await repo.list();
    for (const old of keys.filter(x => x.shopDomain === shop && x.active !== false)) {
      old.active = false;
      await repo.save(old);
    }
    const existing = (await shopifyCall(shop, token, 'GET', '/webhooks.json?topic=orders/create'))?.webhooks || [];
    for (const w of existing.filter(w => String(w.address || '').startsWith(origin + '/api/v1/orders'))) {
      await shopifyCall(shop, token, 'DELETE', `/webhooks/${w.id}.json`).catch(() => {});
    }

    const secret = KEY_PREFIX + crypto.randomBytes(24).toString('base64url');
    const k = {
      id: 'key_' + crypto.randomBytes(6).toString('hex'), name: str(info.name || shop).slice(0, 60), platform: 'Shopify',
      prefix: secret.slice(0, KEY_PREFIX.length + 6), hash: sha256(secret), active: true,
      // Webhooks an app creates are signed with that app's secret.
      signingSecretEnc: clientSecret ? encrypt(clientSecret) : (str(b.signingSecret) ? encrypt(str(b.signingSecret)) : null),
      shopDomain: shop, connectedVia: 'shopify-app',
      createdAt: new Date().toISOString(), createdBy: req.user?.name || '', ordersReceived: 0, recent: []
    };
    const hook = await shopifyCall(shop, token, 'POST', '/webhooks.json', {
      webhook: { topic: 'orders/create', address: `${origin}/api/v1/orders?key=${secret}`, format: 'json' }
    });
    k.shopifyWebhookId = hook?.webhook?.id ? String(hook.webhook.id) : null;
    await repo.save(k);
    await audit(req.user, 'store_key.shopify_connected', `${k.name} (${shop})`, req);
    res.status(201).json({ success: true, key: publicKey(k), shop, shopName: info.name || shop });
  }));

  app.patch('/api/store-keys/:id', requireAuth('integrations'), wrap(async (req, res) => {
    const k = (await repo.list()).find(x => x.id === req.params.id);
    if (!k) throw fail(404, 'Key not found.');
    const b = req.body || {};
    if (b.name !== undefined) k.name = str(b.name).slice(0, 60) || k.name;
    if (b.active !== undefined) k.active = !!b.active;
    if (b.signingSecret !== undefined) k.signingSecretEnc = str(b.signingSecret) ? encrypt(str(b.signingSecret)) : null;
    await repo.save(k);
    await audit(req.user, b.active === false ? 'store_key.revoked' : 'store_key.updated', k.name, req);
    res.json({ success: true, key: publicKey(k) });
  }));

  // A sample order through the same path a real one takes, to check the setup.
  app.post('/api/store-keys/:id/test', requireAuth('integrations'), wrap(async (req, res) => {
    const k = (await repo.list()).find(x => x.id === req.params.id);
    if (!k) throw fail(404, 'Key not found.');
    if (k.active === false) throw fail(400, 'This key is revoked. Activate it first.');
    const { lead } = normalizeOrder({
      external_id: 'test-' + Date.now().toString(36), customer: 'Test Customer', phone: '0600000000', city: 'Casablanca',
      address: 'Test order from Store connection (you can cancel it)', items: [{ name: 'Test product', quantity: 1, price: 100 }], total: 100
    }, 'API');
    const { order } = await createLead(lead, { platform: 'Test', keyName: k.name, keyId: k.id });
    await note(k, { result: 'test', orderId: order.id, customer: 'Test', platform: 'Test' });
    await audit(req.user, 'store_key.tested', k.name, req);
    res.json({ success: true, id: order.id });
  }));

  // --- Store → Rosaino ---------------------------------------------------------
  async function authenticate(req) {
    const presented = presentedKey(req);
    if (!presented.startsWith(KEY_PREFIX)) {
      await refusedDelivery(req, presented ? 'not a Rosaino key' : 'no key in the link');
      throw fail(401, 'Send your Rosaino API key in the Authorization header (Bearer …), the X-API-Key header, or ?key=… in the URL.');
    }
    const k = await repo.byHash(sha256(presented));
    if (!k || k.active === false) {
      await refusedDelivery(req, !k ? 'key not found (deleted, or made before the database was connected)' : 'key revoked', presented);
      throw fail(401, 'This API key is not valid or has been revoked.');
    }
    if (!allowed(k.id)) throw fail(429, 'Too many requests. Slow down to 120 per minute.');
    return k;
  }

  // Shopify signs webhooks with the store's webhook signing secret.
  function verifyShopify(req, k) {
    const sig = String(req.headers['x-shopify-hmac-sha256'] || '');
    if (!k.signingSecretEnc) return true;
    const secret = decrypt(k.signingSecretEnc);
    if (!secret || !sig || !req.rawBody) return false;
    const expected = crypto.createHmac('sha256', secret).update(req.rawBody).digest('base64');
    return expected.length === sig.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  }

  app.get('/api/v1/ping', wrap(async (req, res) => {
    const k = await authenticate(req);
    res.json({ ok: true, key: k.name, platform: k.platform });
  }));

  app.post('/api/v1/orders', wrap(async (req, res) => {
    const k = await authenticate(req);
    const topic = String(req.headers['x-shopify-topic'] || '');
    const fromShopify = !!(topic || req.headers['x-shopify-hmac-sha256'] || req.headers['x-shopify-shop-domain']);
    const hinted = fromShopify ? 'Shopify' : (req.query.platform && PLATFORMS.includes(req.query.platform) ? req.query.platform : null);
    // Shopify deletes a webhook that keeps getting errors, so a refused Shopify
    // delivery is answered 200 and the reason is shown in Store connection.
    const refuse = async (status, reason) => {
      if (fromShopify) return res.status(200).json({ success: false, accepted: false, reason });
      throw fail(status, reason);
    };
    if (req.headers['x-shopify-hmac-sha256'] && !verifyShopify(req, k)) {
      await note(k, { result: 'rejected', reason: 'Shopify signature did not match the signing code saved with this connection', platform: 'Shopify' });
      return refuse(401, 'Shopify signature does not match. Check the webhook signing code saved with this key.');
    }
    // Which Shopify event this is. Anything that is really an order is
    // received, whatever the event's spelling (orders/create, ORDERS_CREATE…).
    if (topic) {
      const t = topic.trim().toLowerCase().replace(/_/g, '/').replace(/^draft\/orders/, 'draft_orders');
      const peek = readBody(req).body;
      const p = unwrapOrder(peek);
      const orderShaped = !!(p && (p.order_number != null || p.financial_status || p.confirmation_number || (Array.isArray(p.line_items) && (p.name || p.order_id))) && !p.abandoned_checkout_url && !p.cart_token_only);
      if (!/^(orders|draft_orders)\//.test(t) && !orderShaped) {
        const label = SHOPIFY_EVENT_NAMES[t] || topic;
        const reason = `Shopify sent the event "${label}", which is not an order. In Shopify → Settings → Notifications → Webhooks, edit the Rosaino webhook and choose the event "Order creation" (Création de commande).`;
        await note(k, { result: 'ignored', reason, platform: 'Shopify', topic });
        return res.json({ success: true, ignored: true, reason });
      }
    }
    // WooCommerce checks a new webhook with a ping that only has webhook_id.
    const { body, format } = readBody(req);
    if (body.webhook_id && Object.keys(body).length === 1) {
      await note(k, { result: 'ping', platform: 'WooCommerce' });
      return res.json({ ok: true, message: 'Connected to Rosaino.' });
    }
    // Shopify's "Send test notification" is a sample order: it is received like any order.
    const parsed = normalizeOrder(body, hinted);
    const { lead, error } = parsed;
    // The payload didn't say which platform sent it: use the key's platform.
    const platform = parsed.platform === 'API' && k.platform && k.platform !== 'Other' ? k.platform : parsed.platform;
    if (error) {
      const why = `${error} (${describeReceived(req, body, format)})`;
      const inboxId = 'in_' + crypto.randomBytes(6).toString('hex');
      const keep = JSON.stringify(body).length < 400000;
      await inbox.save({ id: inboxId, keyId: k.id, at: new Date().toISOString(), format, topic: req.headers['x-shopify-topic'] || '', hinted, platform, error, body: keep ? body : {} })
        .catch(err => console.error('[store-api] could not keep the refused order:', err.message));
      await note(k, { result: 'rejected', reason: why, platform, inboxId });
      return refuse(422, format === 'JSON' || format === 'XML' ? error : `${error} The request body could not be read: send JSON.`);
    }
    const { order, duplicate } = await createLead(lead, { platform, keyName: k.name, keyId: k.id });
    if (!duplicate) k.ordersReceived = (k.ordersReceived || 0) + 1;
    await note(k, { result: duplicate ? 'duplicate' : 'created', orderId: order.id, ref: lead.externalRef, customer: lead.customer.split(' ')[0], platform });
    res.status(duplicate ? 200 : 201).json({
      success: true, duplicate, id: order.id, status: order.status,
      message: duplicate ? 'This order was already received.' : 'Order received. It is now a lead in the Rosaino portal.'
    });
  }));

  // Where is my order? (by the store's own order number, or Rosaino's RS- number)
  app.get('/api/v1/orders/:ref', wrap(async (req, res) => {
    const k = await authenticate(req);
    const found = await findOrder(String(req.params.ref), k.id);
    if (!found) throw fail(404, 'No order with this reference.');
    const { order, shipment } = found;
    res.json({
      id: order.id,
      ref: order.externalRef || null,
      status: order.status,
      carrier: shipment?.carrierName || (order.trackingNumber ? order.carrier : null) || null,
      trackingNumber: shipment?.trackingNumber || order.trackingNumber || null,
      carrierStatus: shipment?.carrierStatus || null,
      updatedAt: shipment?.updatedAt || null
    });
  }));
}
