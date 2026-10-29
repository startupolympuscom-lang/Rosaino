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
import { requireAuth, audit } from './auth.js';
import { dataDb, loadCollections, saveRecords } from './data-store.js';

const KEY_PREFIX = 'rsk_live_';
export const PLATFORMS = ['Shopify', 'YouCan', 'WooCommerce', 'Other'];

// ---------------------------------------------------------------------------
// Secrets (Shopify webhook signing secret), encrypted like carrier keys
// ---------------------------------------------------------------------------
const ENC_KEY = crypto.createHash('sha256').update('rosaino-store-secrets:' + (process.env.AUTH_SECRET || 'rosaino-local-development-only')).digest();
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
  hasSigningSecret: !!k.signingSecretEnc, createdAt: k.createdAt, createdBy: k.createdBy,
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
  if (!items.length && (b.product || b.sku || b.product_name)) {
    items.push({ sku: str(b.sku), name: first(b.product_name, b.product, b.sku), quantity: Math.max(1, Math.floor(num(b.quantity)) || 1), price: num(b.price) });
  }
  return items;
}

/**
 * Turn a store's order into Rosaino's lead fields.
 * Returns { lead } or { error } when something required is missing.
 */
export function normalizeOrder(body, hintedPlatform) {
  const b = body && typeof body === 'object' ? (body.order && typeof body.order === 'object' && !body.customer ? body.order : body) : {};
  const platform = detectPlatform(b, hintedPlatform);
  const cust = b.customer && typeof b.customer === 'object' ? b.customer : {};
  const firstOf = v => (Array.isArray(v) ? v[0] : v);
  // An address object, possibly nested one level (shipping.address).
  const flat = a => (a && typeof a === 'object' && a.address && typeof a.address === 'object' && !Array.isArray(a.address) ? { ...a, ...a.address } : a);
  const ship = [b.shipping_address, b.shipping, b.shippingAddress, b.billing_address, b.billing, cust.default_address, firstOf(cust.addresses), firstOf(cust.address), b.address]
    .map(flat).find(a => a && typeof a === 'object' && !Array.isArray(a) && (a.city || a.address1 || a.address_1 || a.phone || a.first_name || a.name || a.street || typeof a.address === 'string')) || {};

  const customer = first(
    typeof b.customer === 'string' ? b.customer : '', b.customer_name, b.full_name, b.name && platform === 'API' ? b.name : '',
    ship.name, joinName(ship.first_name, ship.last_name), cust.full_name, cust.name, joinName(cust.first_name, cust.last_name)
  );
  const phone = normalizePhone(first(b.phone, b.customer_phone, b.telephone, ship.phone, cust.phone, b.billing?.phone, b.billing_address?.phone));
  const city = first(b.city, ship.city, cust.city, ship.region, ship.province);
  const address = first(
    typeof b.address === 'string' ? b.address : '', b.customer_address,
    [ship.address1 ?? ship.address_1 ?? (typeof ship.address === 'string' ? ship.address : null) ?? ship.street ?? ship.line1, ship.address2 ?? ship.address_2 ?? ship.line2].map(str).filter(Boolean).join(', '),
    ship.zone
  );
  const items = readItems(b, platform);
  const shipping = num(b.shipping_price ?? b.shipping_lines?.[0]?.price ?? b.shipping_total ?? b.total_shipping_price_set?.shop_money?.amount);
  const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const amount = num(b.total ?? b.total_price ?? b.amount ?? b.grand_total ?? b.total_amount) || itemsTotal + shipping;
  const financial = str(b.financial_status ?? b.payment_status ?? b.payment?.status ?? b.status).toLowerCase();
  const gateway = str(b.payment_method ?? b.gateway ?? (Array.isArray(b.payment_gateway_names) ? b.payment_gateway_names.join(' ') : '') ?? b.payment?.method).toLowerCase();
  const prepaid = b.prepaid === true || (financial === 'paid' && !/cod|cash|livraison|delivery/.test(gateway));
  const externalId = first(b.external_id, b.order_id, b.id, b.ref, b.order_number, b.number, b.name && platform !== 'API' ? b.name : '');
  const displayRef = first(b.order_number && platform === 'Shopify' ? `#${b.order_number}` : '', b.name && platform === 'Shopify' ? b.name : '', b.ref, b.number, b.order_number, externalId);
  const note = first(b.note, b.notes, b.customer_note, b.comment, b.customer_note_text);
  const utm = b.utm && typeof b.utm === 'object' ? b.utm : {};
  const landing = str(b.landing_site);
  const qs = (() => { try { return new URL(landing, 'https://x').searchParams; } catch { return new URLSearchParams(); } })();

  const missing = [!customer && 'customer name', !phone && 'phone', !items.length && 'at least one item'].filter(Boolean);
  if (missing.length) return { error: `Missing ${missing.join(', ')}.`, platform };

  return {
    platform,
    lead: {
      externalId: externalId || null,
      externalRef: displayRef || externalId || null,
      customer: customer.slice(0, 120),
      phone: phone.slice(0, 20),
      city: city.slice(0, 80),
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
    }
  };
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
export function registerStoreApi(app, { createLead, findOrder }) {
  // --- Keys (portal) ---------------------------------------------------------
  app.get('/api/store-keys', requireAuth('integrations'), wrap(async (req, res) => {
    res.json((await repo.list()).map(publicKey).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }));

  app.post('/api/store-keys', requireAuth('integrations'), wrap(async (req, res) => {
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
    if (!presented.startsWith(KEY_PREFIX)) throw fail(401, 'Send your Rosaino API key in the Authorization header (Bearer …), the X-API-Key header, or ?key=… in the URL.');
    const k = await repo.byHash(sha256(presented));
    if (!k || k.active === false) throw fail(401, 'This API key is not valid or has been revoked.');
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
    const hinted = req.headers['x-shopify-topic'] ? 'Shopify' : (req.query.platform && PLATFORMS.includes(req.query.platform) ? req.query.platform : null);
    if (req.headers['x-shopify-hmac-sha256'] && !verifyShopify(req, k)) {
      await note(k, { result: 'rejected', reason: 'Shopify signature did not match the signing secret' });
      throw fail(401, 'Shopify signature does not match. Check the webhook signing secret saved with this key.');
    }
    // WooCommerce checks a new webhook with a ping that only has webhook_id.
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (body.webhook_id && Object.keys(body).length === 1) {
      await note(k, { result: 'ping', platform: 'WooCommerce' });
      return res.json({ ok: true, message: 'Connected to Rosaino.' });
    }
    // Shopify's "Send test notification" is a sample order: it is received like any order.
    const { lead, error, platform } = normalizeOrder(body, hinted);
    if (error) {
      await note(k, { result: 'rejected', reason: error, platform });
      throw fail(422, error);
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
