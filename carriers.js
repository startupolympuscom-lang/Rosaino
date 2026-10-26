// Carriers (transporteurs) and shipments.
//
// - Admins add carriers with their API key in the portal. Keys are encrypted
//   (AES-256-GCM, derived from AUTH_SECRET) and never sent back to browsers.
// - Dispatching an order sends it to the carrier's API and stores the tracking
//   number. Carriers without an API can be used manually (tracking typed in).
// - Status updates arrive two ways: the carrier calls our webhook URL, or we
//   poll the carrier's status endpoint ("Sync"). Carrier wording such as
//   "Livré", "Ramassé" or "Retourné" is mapped to Rosaino order statuses.
// - Stored in Supabase Postgres when DATABASE_URL is set (tables are created
//   automatically, RLS on with no public policies), otherwise in memory.
//
// Each carrier's API is different, so the connector is configurable: base URL,
// create/status paths, how the key is sent, JSON or form body, field names and
// where the tracking number/status are found in responses.
import crypto from 'crypto';
import { getStore, requireAuth, audit } from './auth.js';
import { createClient as nearyaClientFor, matchRegion, inventoryCount, NEARYA_BASE_URL } from './nearya.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.carriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'api',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  api_key_enc TEXT,
  key_hint TEXT,
  webhook_token TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.shipments (
  order_id TEXT PRIMARY KEY,
  carrier_id TEXT,
  carrier_name TEXT NOT NULL,
  tracking_number TEXT,
  status TEXT NOT NULL,
  carrier_status TEXT,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS shipments_tracking_idx ON public.shipments (UPPER(tracking_number));
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
`;

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------
const KEY = crypto.createHash('sha256').update('rosaino-carrier-keys:' + (process.env.AUTH_SECRET
  || crypto.createHash('sha256').update('rosaino-admin:' + (process.env.SUPABASE_KEY || 'local-dev')).digest('hex'))).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const data = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(b => b.toString('base64')).join('.');
}

function decrypt(blob) {
  if (!blob) return '';
  try {
    const [iv, tag, data] = blob.split('.').map(p => Buffer.from(p, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null; // AUTH_SECRET changed since the key was saved
  }
}

// ---------------------------------------------------------------------------
// Storage (Postgres or memory)
// ---------------------------------------------------------------------------
const mem = { carriers: new Map(), shipments: new Map() };
let schemaReady = null;

async function db() {
  const store = await getStore();
  if (store.kind !== 'postgres') return null;
  if (!schemaReady) schemaReady = store.query(SCHEMA_SQL).catch(err => { schemaReady = null; throw err; });
  await schemaReady;
  return store;
}

const iso = v => (v instanceof Date ? v.toISOString() : v);
const carrierFromRow = r => r && ({
  id: r.id, name: r.name, kind: r.kind, config: r.config || {}, apiKeyEnc: r.api_key_enc, keyHint: r.key_hint,
  webhookToken: r.webhook_token, active: r.active, createdAt: iso(r.created_at), updatedAt: iso(r.updated_at)
});
const shipmentFromRow = r => r && ({
  orderId: r.order_id, carrierId: r.carrier_id, carrierName: r.carrier_name, trackingNumber: r.tracking_number,
  status: r.status, carrierStatus: r.carrier_status, events: r.events || [], snapshot: r.snapshot || {},
  createdAt: iso(r.created_at), updatedAt: iso(r.updated_at)
});

const repo = {
  async listCarriers() {
    const s = await db();
    if (!s) return [...mem.carriers.values()];
    return (await s.query('SELECT * FROM carriers ORDER BY created_at')).rows.map(carrierFromRow);
  },
  async getCarrier(id) {
    const s = await db();
    if (!s) return mem.carriers.get(id) || null;
    return carrierFromRow((await s.query('SELECT * FROM carriers WHERE id = $1', [id])).rows[0]);
  },
  async saveCarrier(c) {
    c.updatedAt = new Date().toISOString();
    const s = await db();
    if (!s) return void mem.carriers.set(c.id, { ...c });
    await s.query(
      `INSERT INTO carriers (id, name, kind, config, api_key_enc, key_hint, webhook_token, active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, kind=EXCLUDED.kind, config=EXCLUDED.config, api_key_enc=EXCLUDED.api_key_enc,
         key_hint=EXCLUDED.key_hint, webhook_token=EXCLUDED.webhook_token, active=EXCLUDED.active, updated_at=EXCLUDED.updated_at`,
      [c.id, c.name, c.kind, JSON.stringify(c.config || {}), c.apiKeyEnc || null, c.keyHint || null, c.webhookToken, c.active !== false, c.createdAt, c.updatedAt]
    );
  },
  async deleteCarrier(id) {
    const s = await db();
    if (!s) return void mem.carriers.delete(id);
    await s.query('DELETE FROM carriers WHERE id = $1', [id]);
  },
  async getShipment(orderId) {
    const s = await db();
    if (!s) return mem.shipments.get(orderId) || null;
    return shipmentFromRow((await s.query('SELECT * FROM shipments WHERE order_id = $1', [orderId])).rows[0]);
  },
  async findShipment(query) {
    const q = String(query).trim().toUpperCase();
    const s = await db();
    if (!s) return [...mem.shipments.values()].find(x => x.orderId.toUpperCase() === q || String(x.trackingNumber || '').toUpperCase() === q) || null;
    return shipmentFromRow((await s.query('SELECT * FROM shipments WHERE UPPER(order_id) = $1 OR UPPER(tracking_number) = $1 LIMIT 1', [q])).rows[0]);
  },
  async listShipments() {
    const s = await db();
    if (!s) return [...mem.shipments.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return (await s.query('SELECT * FROM shipments ORDER BY updated_at DESC LIMIT 1000')).rows.map(shipmentFromRow);
  },
  async saveShipment(x) {
    x.updatedAt = new Date().toISOString();
    const s = await db();
    if (!s) return void mem.shipments.set(x.orderId, JSON.parse(JSON.stringify(x)));
    await s.query(
      `INSERT INTO shipments (order_id, carrier_id, carrier_name, tracking_number, status, carrier_status, events, snapshot, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (order_id) DO UPDATE SET carrier_id=EXCLUDED.carrier_id, carrier_name=EXCLUDED.carrier_name, tracking_number=EXCLUDED.tracking_number,
         status=EXCLUDED.status, carrier_status=EXCLUDED.carrier_status, events=EXCLUDED.events, snapshot=EXCLUDED.snapshot, updated_at=EXCLUDED.updated_at`,
      [x.orderId, x.carrierId, x.carrierName, x.trackingNumber, x.status, x.carrierStatus, JSON.stringify(x.events || []), JSON.stringify(x.snapshot || {}), x.createdAt, x.updatedAt]
    );
  }
};

// ---------------------------------------------------------------------------
// Status mapping: carrier wording -> Rosaino status
// ---------------------------------------------------------------------------
const normalize = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function mapStatus(raw, customMap = {}) {
  const text = normalize(raw);
  if (!text) return null;
  for (const [from, to] of Object.entries(customMap || {})) {
    if (normalize(from) === text && ['In transit', 'Delivered', 'Returned'].includes(to)) return to;
  }
  if (/(retour|return|refus|rejet|reject|annul|cancel)/.test(text)) return 'Returned';
  if (/(^|[^a-z])(non|not|pas|un)[ _-]?(livr|deliver)/.test(text)) return 'In transit'; // failed attempt
  if (/(livr|deliver|distribu|complete|remis)/.test(text)) return 'Delivered';
  if (/(ramass|pick|collect|recu|receiv|transit|expedi|ship|depart|en cours|in progress|out for|hub|agence|scan|dispatch|accept|attente)/.test(text)) return 'In transit';
  return null;
}

const ORDER = { 'In transit': 1, Delivered: 2, Returned: 2 };

async function applyCarrierStatus(shipment, raw, source, customMap, onStatus) {
  const mapped = mapStatus(raw, customMap);
  shipment.events = [...(shipment.events || []), { at: new Date().toISOString(), raw: String(raw).slice(0, 120), status: mapped, source }].slice(-50);
  shipment.carrierStatus = String(raw).slice(0, 120);
  let changed = false;
  // Only move forward (In transit -> Delivered/Returned); never undo a final status.
  if (mapped && (ORDER[mapped] || 0) > (ORDER[shipment.status] || 0)) {
    shipment.status = mapped;
    changed = true;
  }
  await repo.saveShipment(shipment);
  if (changed && onStatus) await onStatus(shipment);
  return { mapped, changed };
}

// ---------------------------------------------------------------------------
// Configurable HTTP connector
// ---------------------------------------------------------------------------
const pick = (obj, path) => String(path || '').split('.').filter(Boolean).reduce((v, k) => (v == null ? v : v[k]), obj);
const TRACKING_KEYS = ['tracking_number', 'trackingNumber', 'tracking', 'tracking_code', 'code', 'barcode', 'awb', 'waybill', 'parcel_code', 'id'];
const STATUS_KEYS = ['status', 'state', 'statut', 'etat', 'status_name', 'last_status'];

function findValue(obj, configuredPath, keys) {
  if (configuredPath) return pick(obj, configuredPath);
  for (const scope of [obj, obj?.data, obj?.parcel, obj?.shipment, obj?.result, Array.isArray(obj?.data) ? obj.data[0] : null]) {
    if (!scope || typeof scope !== 'object') continue;
    for (const k of keys) if (scope[k] != null && typeof scope[k] !== 'object') return scope[k];
  }
  return undefined;
}

function validateBaseUrl(url) {
  let u;
  try { u = new URL(url); } catch { return 'Enter a valid API URL, e.g. https://api.carrier.ma/v1'; }
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && process.env.CARRIER_ALLOW_HTTP === '1')) return 'The API URL must start with https://';
  return null;
}

async function callCarrier(carrier, method, pathTemplate, { payload, tracking } = {}) {
  const cfg = carrier.config || {};
  const apiKey = decrypt(carrier.apiKeyEnc);
  if (apiKey === null) throw new Error('The saved API key can no longer be read (AUTH_SECRET changed). Re-enter it.');
  const url = new URL(cfg.baseUrl.replace(/\/+$/, '') + '/' + String(pathTemplate || '').replace(/^\/+/, '').replace('{tracking}', encodeURIComponent(tracking || '')));
  const headers = { Accept: 'application/json' };
  if (apiKey) {
    if (cfg.keyPlacement === 'header') headers[cfg.keyName || 'X-API-Key'] = apiKey;
    else if (cfg.keyPlacement === 'query') url.searchParams.set(cfg.keyName || 'api_key', apiKey);
    else headers.Authorization = `Bearer ${apiKey}`;
  }
  let body;
  if (payload) {
    if (cfg.bodyFormat === 'form') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(Object.entries(payload).map(([k, v]) => [k, String(v ?? '')])).toString();
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }
  }
  const res = await fetch(url, { method, headers, body, signal: AbortSignal.timeout(10000) });
  const text = await res.text();
  let data = text;
  try { data = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, data };
}

function shipmentPayload(carrier, order) {
  const base = {
    reference: order.id,
    recipient_name: order.customer,
    recipient_phone: order.phone,
    city: order.city,
    address: order.address,
    cod_amount: Number(order.amount) || 0,
    product: order.productName || order.product || '',
    quantity: Number(order.quantity) || 1,
    note: order.note || ''
  };
  const map = carrier.config?.fieldMap || {};
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [map[k] || k, v]));
}

// ---------------------------------------------------------------------------
// Public helpers for server.js
// ---------------------------------------------------------------------------
const maskName = n => {
  const [first, last] = String(n || '').split(' ');
  return first + (last ? ' ' + last[0] + '***' : '');
};

export async function countActiveCarriers() {
  return (await repo.listCarriers()).filter(c => c.active !== false).length;
}

export async function findShipmentForTracking(query) {
  try {
    return await repo.findShipment(query);
  } catch (err) {
    console.warn('[carriers] tracking lookup failed:', err.message);
    return null;
  }
}

function publicCarrier(c, req) {
  const origin = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, '') || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.get('host')}`;
  return {
    id: c.id, name: c.name, kind: c.kind, active: c.active !== false,
    config: c.config || {}, keyHint: c.keyHint || '', hasKey: !!c.apiKeyEnc,
    webhookUrl: `${origin}/api/carriers/webhook/${c.id}/${c.webhookToken}`,
    createdAt: c.createdAt, updatedAt: c.updatedAt
  };
}

// Nearya Express has a fixed API, so it only needs credentials and a few choices.
function cleanNearyaConfig(input = {}) {
  const regionMap = typeof input.regionMap === 'object' && input.regionMap && !Array.isArray(input.regionMap) ? input.regionMap : {};
  return {
    baseUrl: String(input.baseUrl || NEARYA_BASE_URL).trim(),
    clientId: String(input.clientId || '').trim().slice(0, 120),
    businessId: String(input.businessId || '').trim().slice(0, 120),
    parcelType: input.parcelType === 'store' ? 'store' : 'simple',
    stockRegion: String(input.stockRegion || '').trim().slice(0, 60),
    autoDispatch: !!input.autoDispatch,
    pickupAddress: String(input.pickupAddress || '').trim().slice(0, 300),
    pickupPhone: String(input.pickupPhone || '').trim().slice(0, 30),
    regionMap: Object.fromEntries(Object.entries(regionMap).slice(0, 500).map(([k, v]) => [String(k).slice(0, 80), String(v).slice(0, 60)])),
    trackingUrl: /^https:\/\//i.test(String(input.trackingUrl || '').trim()) ? String(input.trackingUrl).trim() : ''
  };
}

const KINDS = ['api', 'manual', 'nearya'];
const kindOf = k => (KINDS.includes(k) ? k : 'api');
const configFor = (kind, input) => (kind === 'nearya' ? cleanNearyaConfig(input) : cleanConfig(input));

function validateCarrier(c, apiKey) {
  if (c.kind === 'api') {
    const err = validateBaseUrl(c.config.baseUrl);
    if (err) return err;
  }
  if (c.kind === 'nearya') {
    const err = validateBaseUrl(c.config.baseUrl);
    if (err) return err;
    if (!c.config.clientId) return 'Enter your Nearya Client ID (x-api-id).';
    if (!c.config.businessId) return 'Enter your Nearya Business ID.';
  }
  if (c.kind !== 'manual' && !apiKey && !c.apiKeyEnc) return 'Paste the API key from your carrier account.';
  return null;
}

// ---------------------------------------------------------------------------
// Nearya Express
// ---------------------------------------------------------------------------
function nearya(c) {
  const apiKey = decrypt(c.apiKeyEnc);
  if (apiKey === null) throw fail(400, 'The saved API key can no longer be read (AUTH_SECRET changed). Re-enter it.');
  return nearyaClientFor({ baseUrl: c.config.baseUrl, clientId: c.config.clientId, apiKey, businessId: c.config.businessId });
}

const regionCache = new Map(); // carrierId -> { at, list }
async function nearyaRegions(c, { fresh = false } = {}) {
  const hit = regionCache.get(c.id);
  if (!fresh && hit && Date.now() - hit.at < 60 * 60 * 1000) return hit.list;
  const list = await nearya(c).regions();
  regionCache.set(c.id, { at: Date.now(), list });
  return list;
}

// Turn a Nearya error into one the portal shows as-is.
const asFail = err => (err.expose ? err : fail(502, err.message));

// Send one order to a carrier. Returns the new shipment.
// order: { id, customer, phone, city, address, amount, quantity, productName, sku, note, date }
async function dispatchToCarrier(c, order, { trackingNumber = '', regionId = '' } = {}) {
  let carrierStatus = 'Dispatched';
  let parcelId = '';
  let regionName = '';
  if (c.kind === 'nearya') {
    const regions = await nearyaRegions(c).catch(err => { throw asFail(err); });
    const region = regionId ? regions.find(r => r.id === String(regionId)) : matchRegion(regions, order.city, c.config.regionMap);
    if (!region) throw Object.assign(fail(400, `Choose the Nearya region for "${order.city || 'this city'}".`), { needsRegion: true });
    regionName = region.name;
    const parcel = {
      orderId: order.id,
      regionId: region.id,
      recipient: order.customer,
      address: order.address,
      phone: order.phone,
      price: Number(order.amount) || 0,
      comment: [order.quantity && order.productName ? `${order.quantity} × ${order.productName}` : '', order.note].filter(Boolean).join(' · ').slice(0, 250)
    };
    let ref;
    try {
      if (c.config.parcelType === 'store') {
        if (!order.sku) throw fail(400, 'This product has no SKU, which Nearya needs to ship from your stock. Add the SKU in Products, or use simple parcels.');
        ref = await nearya(c).createStore({ ...parcel, items: [{ sku: order.sku, quantity: Number(order.quantity) || 1 }] });
      } else {
        ref = await nearya(c).createSimple(parcel);
      }
    } catch (err) {
      throw asFail(err);
    }
    trackingNumber = ref.trackingCode;
    parcelId = ref.parcelId;
    carrierStatus = 'Created';
  } else if (c.kind === 'api') {
    let r;
    try {
      r = await callCarrier(c, 'POST', c.config.createPath || '/shipments', { payload: shipmentPayload(c, order) });
    } catch (err) {
      throw fail(502, `${c.name} could not be reached: ${err.message}`);
    }
    if (!r.ok) {
      const detail = typeof r.data === 'object' ? (r.data.message || r.data.error || JSON.stringify(r.data)) : String(r.data);
      throw fail(502, `${c.name} refused the shipment (HTTP ${r.status}): ${String(detail).slice(0, 160)}`);
    }
    trackingNumber = String(findValue(r.data, c.config.trackingField, TRACKING_KEYS) ?? '').trim();
    if (!trackingNumber) throw fail(502, `${c.name} accepted the shipment but returned no tracking number. Set "Tracking number field" in the carrier settings.`);
    carrierStatus = String(findValue(r.data, c.config.statusField, STATUS_KEYS) ?? 'Created');
  } else if (!trackingNumber) {
    throw fail(400, 'Enter the tracking number given by the carrier.');
  }

  const source = c.kind === 'manual' ? 'manual' : 'api';
  const shipment = {
    orderId: order.id, carrierId: c.id, carrierName: c.name, trackingNumber, status: 'In transit', carrierStatus,
    events: [{ at: new Date().toISOString(), raw: carrierStatus, status: 'In transit', source }],
    snapshot: {
      customer: maskName(order.customer), city: order.city || '', productName: order.productName || '',
      amount: Number(order.amount) || 0, quantity: Number(order.quantity) || 1, date: order.date || new Date().toISOString().slice(0, 10),
      trackingUrl: c.config.trackingUrl ? c.config.trackingUrl.replace('{tracking}', encodeURIComponent(trackingNumber)) : '',
      ...(parcelId ? { parcelId } : {}),
      ...(regionName ? { region: regionName } : {})
    },
    createdAt: new Date().toISOString()
  };
  await repo.saveShipment(shipment);
  if (hooks.onStatus) await hooks.onStatus(shipment);
  return shipment;
}

// Latest status from the carrier for one shipment (Nearya or a configured API).
async function pollShipment(c, s) {
  if (c.kind === 'nearya') {
    // Nearya's docs call it the parcel identifier: try the tracking code, then its internal id.
    const ids = [...new Set([s.trackingNumber, s.snapshot?.parcelId].filter(Boolean))];
    for (const [i, id] of ids.entries()) {
      try {
        return (await nearya(c).status(id)).status;
      } catch (err) {
        if (err.status !== 404 || i === ids.length - 1) throw err;
      }
    }
  }
  if (c.kind === 'api' && c.config.statusPath) {
    const r = await callCarrier(c, 'GET', c.config.statusPath, { tracking: s.trackingNumber });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return findValue(r.data, c.config.statusField, STATUS_KEYS);
  }
  return undefined;
}

async function refreshShipment(c, s) {
  const raw = await pollShipment(c, s);
  s.checkedAt = new Date().toISOString();
  if (raw != null && String(raw) !== s.carrierStatus) {
    return applyCarrierStatus(s, raw, 'sync', c.config.statusMap, hooks.onStatus);
  }
  await repo.saveShipment(s);
  return { mapped: null, changed: false };
}

// Re-open a parcel (relaunch / new recipient): it is on its way again.
async function reopenShipment(s, raw, onStatus) {
  s.events = [...(s.events || []), { at: new Date().toISOString(), raw, status: 'In transit', source: 'portal' }].slice(-50);
  s.carrierStatus = raw;
  const wasClosed = s.status !== 'In transit';
  s.status = 'In transit';
  await repo.saveShipment(s);
  if (wasClosed && onStatus) await onStatus(s);
}

const hooks = { onStatus: null, getProduct: null };

// Only one carrier receives confirmed orders automatically.
async function clearOtherAutoDispatch(keepId) {
  for (const other of await repo.listCarriers()) {
    if (other.id !== keepId && other.config?.autoDispatch) {
      other.config = { ...other.config, autoDispatch: false };
      await repo.saveCarrier(other);
    }
  }
}

/**
 * When an order is confirmed: send it to the carrier set to receive confirmed
 * orders automatically, if there is one. Returns the shipment, or null.
 */
export async function autoDispatchOrder(order) {
  const c = (await repo.listCarriers()).find(x => x.active !== false && x.config?.autoDispatch);
  if (!c || await repo.getShipment(String(order.id))) return null;
  const product = hooks.getProduct ? await hooks.getProduct(order.product) : null;
  return dispatchToCarrier(c, {
    ...order,
    id: String(order.id),
    productName: product?.name || order.productName || '',
    sku: product?.sku || order.sku || '',
    note: Array.isArray(order.notes) ? '' : (order.note || '')
  });
}

/**
 * The customer tracking page asks the carrier for news, at most every 10 minutes per parcel.
 */
export async function refreshForTracking(shipment) {
  if (!shipment || shipment.status !== 'In transit') return shipment;
  if (shipment.checkedAt && Date.now() - new Date(shipment.checkedAt) < 10 * 60 * 1000) return shipment;
  try {
    const c = await repo.getCarrier(shipment.carrierId);
    if (c && c.active !== false && c.kind !== 'manual') await refreshShipment(c, shipment);
  } catch (err) {
    console.warn('[carriers] tracking refresh failed:', err.message);
  }
  return shipment;
}

function cleanConfig(input = {}) {
  const fieldMap = typeof input.fieldMap === 'string' && input.fieldMap.trim() ? JSON.parse(input.fieldMap) : (input.fieldMap || {});
  const statusMap = typeof input.statusMap === 'string' && input.statusMap.trim() ? JSON.parse(input.statusMap) : (input.statusMap || {});
  return {
    baseUrl: String(input.baseUrl || '').trim(),
    createPath: String(input.createPath ?? '/shipments').trim(),
    statusPath: String(input.statusPath ?? '').trim(),
    keyPlacement: ['bearer', 'header', 'query'].includes(input.keyPlacement) ? input.keyPlacement : 'bearer',
    keyName: String(input.keyName || '').trim().slice(0, 60),
    bodyFormat: input.bodyFormat === 'form' ? 'form' : 'json',
    trackingField: String(input.trackingField || '').trim(),
    statusField: String(input.statusField || '').trim(),
    fieldMap: typeof fieldMap === 'object' && !Array.isArray(fieldMap) ? fieldMap : {},
    statusMap: typeof statusMap === 'object' && !Array.isArray(statusMap) ? statusMap : {},
    // Shown as a link to customers, so only allow web addresses.
    trackingUrl: /^https:\/\//i.test(String(input.trackingUrl || '').trim()) ? String(input.trackingUrl).trim() : ''
  };
}

const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('[carriers]', err.message);
    res.status(err.status || 500).json({
      error: err.expose ? err.message : 'Something went wrong. Please try again.',
      ...(err.needsRegion ? { needsRegion: true } : {})
    });
  }
};
const fail = (status, message) => Object.assign(new Error(message), { status, expose: true });

/**
 * Register carrier & shipment routes.
 * onStatus(shipment) is called when a carrier moves a shipment to a new status,
 * so server.js can update the order everywhere else.
 */
export function registerCarrierRoutes(app, { onStatus, getProduct } = {}) {
  hooks.onStatus = onStatus;
  hooks.getProduct = getProduct;

  // --- Carriers --------------------------------------------------------------
  app.get('/api/carriers', requireAuth('shipping', 'integrations'), wrap(async (req, res) => {
    res.json((await repo.listCarriers()).map(c => publicCarrier(c, req)));
  }));

  app.post('/api/carriers', requireAuth('integrations'), wrap(async (req, res) => {
    const b = req.body || {};
    const name = String(b.name || '').trim().slice(0, 60);
    if (!name) throw fail(400, 'Carrier name is required.');
    const kind = kindOf(b.kind);
    let config;
    try { config = configFor(kind, b.config); } catch { throw fail(400, 'Field names and status mapping must be valid JSON.'); }
    const key = String(b.apiKey || '').trim();
    const invalid = validateCarrier({ kind, config }, key);
    if (invalid) throw fail(400, invalid);
    if ((await repo.listCarriers()).some(c => c.name.toLowerCase() === name.toLowerCase())) throw fail(409, 'A carrier with this name already exists.');
    const c = {
      id: 'car_' + crypto.randomBytes(5).toString('hex'), name, kind, config,
      apiKeyEnc: key ? encrypt(key) : null, keyHint: key ? '••••' + key.slice(-4) : '',
      webhookToken: crypto.randomBytes(18).toString('base64url'), active: true, createdAt: new Date().toISOString()
    };
    if (config.autoDispatch) await clearOtherAutoDispatch(c.id);
    await repo.saveCarrier(c);
    await audit(req.user, 'carrier.added', name, req);
    res.status(201).json({ success: true, carrier: publicCarrier(c, req) });
  }));

  app.patch('/api/carriers/:id', requireAuth('integrations'), wrap(async (req, res) => {
    const c = await repo.getCarrier(req.params.id);
    if (!c) throw fail(404, 'Carrier not found.');
    const b = req.body || {};
    if (b.name !== undefined) {
      const name = String(b.name).trim().slice(0, 60);
      if (!name) throw fail(400, 'Carrier name is required.');
      c.name = name;
    }
    if (b.active !== undefined) c.active = !!b.active;
    if (b.kind !== undefined) c.kind = kindOf(b.kind);
    if (b.config !== undefined) {
      // Nearya: keep saved settings (e.g. city → region choices) not sent in this edit.
      const merged = c.kind === 'nearya' ? { ...c.config, ...b.config } : b.config;
      try { c.config = configFor(c.kind, merged); } catch { throw fail(400, 'Field names and status mapping must be valid JSON.'); }
    }
    const invalid = validateCarrier(c, String(b.apiKey || '').trim());
    if (invalid) throw fail(400, invalid);
    if (c.config.autoDispatch) await clearOtherAutoDispatch(c.id);
    regionCache.delete(c.id);
    if (String(b.apiKey || '').trim()) {
      const key = String(b.apiKey).trim();
      c.apiKeyEnc = encrypt(key);
      c.keyHint = '••••' + key.slice(-4);
    }
    if (b.rotateWebhook) c.webhookToken = crypto.randomBytes(18).toString('base64url');
    await repo.saveCarrier(c);
    await audit(req.user, 'carrier.updated', c.name, req);
    res.json({ success: true, carrier: publicCarrier(c, req) });
  }));

  app.delete('/api/carriers/:id', requireAuth('integrations'), wrap(async (req, res) => {
    const c = await repo.getCarrier(req.params.id);
    if (!c) throw fail(404, 'Carrier not found.');
    await repo.deleteCarrier(c.id);
    await audit(req.user, 'carrier.deleted', c.name, req);
    res.json({ success: true });
  }));

  // Check the URL and key without creating a parcel.
  app.post('/api/carriers/:id/test', requireAuth('integrations'), wrap(async (req, res) => {
    const c = await repo.getCarrier(req.params.id);
    if (!c) throw fail(404, 'Carrier not found.');
    if (c.kind === 'manual') return res.json({ ok: true, message: 'Manual carrier: no API to test. Tracking numbers are entered when dispatching.' });
    if (c.kind === 'nearya') {
      try {
        const regions = await nearyaRegions(c, { fresh: true });
        // The status endpoint needs valid credentials; an unknown parcel is fine.
        try {
          await nearya(c).status('ROSAINO-TEST');
        } catch (err) {
          if (err.status === 401 || err.status === 403) return res.json({ ok: false, httpStatus: err.status, message: err.message });
        }
        return res.json({ ok: true, regions: regions.length, message: `Connected to Nearya · ${regions.length} delivery regions available.` });
      } catch (err) {
        return res.json({ ok: false, httpStatus: err.status, message: err.message });
      }
    }
    try {
      const r = await callCarrier(c, 'GET', c.config.statusPath || '', { tracking: 'ROSAINO-TEST' });
      if (r.status === 401 || r.status === 403) return res.json({ ok: false, httpStatus: r.status, message: 'The carrier rejected the API key. Check it was copied completely.' });
      return res.json({ ok: true, httpStatus: r.status, message: `Connected: the carrier answered (HTTP ${r.status}).` });
    } catch (err) {
      return res.json({ ok: false, message: `Could not reach the carrier: ${err.message}` });
    }
  }));

  // --- Shipments -------------------------------------------------------------
  app.get('/api/shipments', requireAuth('shipping', 'orders'), wrap(async (req, res) => {
    res.json(await repo.listShipments());
  }));

  app.post('/api/shipments', requireAuth('shipping'), wrap(async (req, res) => {
    const b = req.body || {};
    const order = b.order || {};
    const orderId = String(b.orderId || order.id || '').trim();
    if (!orderId) throw fail(400, 'Order is required.');
    const existing = await repo.getShipment(orderId);
    if (existing && existing.status !== 'Returned') {
      throw fail(409, `Already dispatched with ${existing.carrierName}${existing.trackingNumber ? ` (tracking ${existing.trackingNumber})` : ''}.`);
    }
    const c = await repo.getCarrier(String(b.carrierId || ''));
    if (!c || c.active === false) throw fail(400, 'Choose an active carrier.');
    if (c.kind === 'nearya' && b.regionId && b.rememberRegion && order.city) {
      c.config.regionMap = { ...(c.config.regionMap || {}), [String(order.city)]: String(b.regionId) };
      await repo.saveCarrier(c);
    }
    const product = hooks.getProduct && order.product ? await hooks.getProduct(order.product) : null;
    const shipment = await dispatchToCarrier(c, { ...order, id: orderId, sku: order.sku || product?.sku || '' }, {
      trackingNumber: String(b.trackingNumber || '').trim().slice(0, 80),
      regionId: String(b.regionId || '')
    });
    const trackingNumber = shipment.trackingNumber;
    await audit(req.user, 'shipment.dispatched', `${orderId} → ${c.name} (${trackingNumber})`, req);
    res.status(201).json({ success: true, shipment });
  }));

  // Ask carriers for the latest status of parcels still in transit.
  app.post('/api/shipments/sync', requireAuth('shipping'), wrap(async (req, res) => {
    const carriers = new Map((await repo.listCarriers()).map(c => [c.id, c]));
    const open = (await repo.listShipments()).filter(s => s.status === 'In transit').slice(0, 100);
    const results = { checked: 0, updated: 0, errors: [] };
    for (const s of open) {
      const c = carriers.get(s.carrierId);
      if (!c || c.kind === 'manual' || (c.kind === 'api' && !c.config.statusPath)) continue;
      results.checked++;
      try {
        const { changed } = await refreshShipment(c, s);
        if (changed) results.updated++;
      } catch (err) {
        results.errors.push(`${s.orderId}: ${err.message}`);
      }
    }
    res.json({ success: true, ...results });
  }));

  // Manually record a delivery outcome (e.g. carrier without API).
  app.post('/api/shipments/:orderId/status', requireAuth('shipping'), wrap(async (req, res) => {
    const s = await repo.getShipment(req.params.orderId);
    if (!s) throw fail(404, 'No shipment for this order.');
    const status = req.body?.status;
    if (!['Delivered', 'Returned'].includes(status)) throw fail(400, 'Status must be Delivered or Returned.');
    await applyCarrierStatus(s, status, 'manual', {}, onStatus);
    await audit(req.user, 'shipment.status', `${s.orderId}: ${status}`, req);
    res.json({ success: true, shipment: s });
  }));

  // --- Nearya Express ----------------------------------------------------------
  const nearyaCarrier = async id => {
    const c = await repo.getCarrier(id);
    if (!c || c.kind !== 'nearya') throw fail(404, 'Nearya carrier not found.');
    return c;
  };
  const nearyaShipment = async orderId => {
    const s = await repo.getShipment(orderId);
    if (!s) throw fail(404, 'No shipment for this order.');
    const c = await repo.getCarrier(s.carrierId);
    if (!c || c.kind !== 'nearya') throw fail(400, 'This parcel was not sent with Nearya.');
    return { s, c };
  };
  const call = async fn => { try { return await fn(); } catch (err) { throw asFail(err); } };

  // Delivery regions (cities) and the saved city → region choices.
  app.get('/api/carriers/:id/regions', requireAuth('shipping', 'integrations'), wrap(async (req, res) => {
    const c = await nearyaCarrier(req.params.id);
    const regions = await call(() => nearyaRegions(c, { fresh: req.query.fresh === '1' }));
    const city = String(req.query.city || '');
    res.json({ regions, match: city ? matchRegion(regions, city, c.config.regionMap)?.id || null : null, regionMap: c.config.regionMap || {} });
  }));

  // Ask Nearya to come and collect the parcels.
  app.post('/api/carriers/:id/pickup', requireAuth('shipping'), wrap(async (req, res) => {
    const c = await nearyaCarrier(req.params.id);
    const b = req.body || {};
    const clientAddress = String(b.clientAddress || c.config.pickupAddress || '').trim();
    const clientPhone = String(b.clientPhone || c.config.pickupPhone || '').trim();
    if (!clientAddress || !clientPhone) throw fail(400, 'Enter the pickup address and phone number.');
    const reply = await call(() => nearya(c).pickup({
      type: b.type === 'store' ? 'store' : (b.type === 'simple' ? 'simple' : c.config.parcelType),
      pickup: b.pickup !== false, clientAddress, clientPhone, ticket: !!b.ticket
    }));
    await audit(req.user, 'carrier.pickup', `${c.name} · ${clientAddress}`, req);
    res.json({ success: true, reply });
  }));

  // Stock held by Nearya, by product SKU (variant) or product name.
  app.get('/api/carriers/:id/inventory', requireAuth('shipping', 'products'), wrap(async (req, res) => {
    const c = await nearyaCarrier(req.params.id);
    const region = String(req.query.region || c.config.stockRegion || '');
    const sku = String(req.query.sku || '').trim();
    const name = String(req.query.name || '').trim();
    if (!sku && !name) throw fail(400, 'Give a SKU or a product name.');
    const reply = await call(() => (sku ? nearya(c).variantInventory(sku, region) : nearya(c).productInventory(name, region)));
    res.json({ quantity: inventoryCount(reply), reply });
  }));

  // One parcel: latest status now.
  app.post('/api/shipments/:orderId/refresh', requireAuth('shipping', 'orders'), wrap(async (req, res) => {
    const s = await repo.getShipment(req.params.orderId);
    if (!s) throw fail(404, 'No shipment for this order.');
    const c = await repo.getCarrier(s.carrierId);
    if (!c || c.kind === 'manual') throw fail(400, 'This carrier has no status API.');
    const result = await call(() => refreshShipment(c, s));
    res.json({ success: true, shipment: s, ...result });
  }));

  // Relaunch a parcel (e.g. after a failed delivery).
  app.post('/api/shipments/:orderId/relaunch', requireAuth('shipping'), wrap(async (req, res) => {
    const { s, c } = await nearyaShipment(req.params.orderId);
    await call(() => nearya(c).restart(s.trackingNumber));
    await reopenShipment(s, 'Relancé', hooks.onStatus);
    await audit(req.user, 'shipment.relaunched', `${s.orderId} (${s.trackingNumber})`, req);
    res.json({ success: true, shipment: s });
  }));

  // Send the parcel to a new customer instead.
  app.post('/api/shipments/:orderId/new-recipient', requireAuth('shipping'), wrap(async (req, res) => {
    const { s, c } = await nearyaShipment(req.params.orderId);
    const b = req.body || {};
    for (const [k, label] of [['recipient', 'name'], ['phone', 'phone'], ['address', 'address'], ['regionId', 'region']]) {
      if (!String(b[k] || '').trim()) throw fail(400, `Enter the new customer's ${label}.`);
    }
    const r = await call(() => nearya(c).newRecipient(s.trackingNumber, {
      regionId: b.regionId, recipient: b.recipient, address: b.address, phone: b.phone, comment: b.comment, price: Number(b.price) || 0
    }));
    if (r.trackingCode && r.trackingCode !== s.trackingNumber) s.trackingNumber = r.trackingCode;
    s.snapshot = { ...s.snapshot, customer: maskName(b.recipient), amount: Number(b.price) || 0 };
    await reopenShipment(s, `Nouveau destinataire: ${String(b.recipient).slice(0, 40)}`, hooks.onStatus);
    await audit(req.user, 'shipment.new_recipient', `${s.orderId} → ${String(b.recipient).slice(0, 40)}`, req);
    res.json({ success: true, shipment: s });
  }));

  // Exchange: a replacement parcel for the same customer.
  app.post('/api/shipments/:orderId/replace', requireAuth('shipping'), wrap(async (req, res) => {
    const { s, c } = await nearyaShipment(req.params.orderId);
    const order = req.body?.order || {};
    const regions = await call(() => nearyaRegions(c));
    const region = req.body?.regionId ? regions.find(r => r.id === String(req.body.regionId)) : matchRegion(regions, order.city, c.config.regionMap);
    if (!region) throw Object.assign(fail(400, `Choose the Nearya region for "${order.city || 'this city'}".`), { needsRegion: true });
    const ref = await call(() => nearya(c).replace(s.trackingNumber, {
      orderId: s.orderId, regionId: region.id, recipient: order.customer, address: order.address, phone: order.phone,
      price: Number(req.body?.price ?? 0) || 0, comment: String(req.body?.comment || 'Échange').slice(0, 250)
    }));
    s.events = [...(s.events || []), { at: new Date().toISOString(), raw: `Échange: nouveau colis ${ref.trackingCode}`, status: s.status, source: 'portal' }].slice(-50);
    s.snapshot = { ...s.snapshot, replacements: [...(s.snapshot?.replacements || []), { trackingCode: ref.trackingCode, at: new Date().toISOString() }] };
    await repo.saveShipment(s);
    await audit(req.user, 'shipment.replaced', `${s.orderId} → ${ref.trackingCode}`, req);
    res.json({ success: true, shipment: s, replacement: ref });
  }));

  // --- Carrier webhook (public; authenticated by the secret in the URL) ------
  const webhook = wrap(async (req, res) => {
    const c = await repo.getCarrier(req.params.id);
    const token = String(req.params.token || '');
    if (!c || token.length !== c.webhookToken.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(c.webhookToken))) {
      return res.status(404).json({ error: 'Unknown webhook' });
    }
    const payload = { ...(req.query || {}), ...(typeof req.body === 'object' ? req.body : {}) };
    const tracking = String(findValue(payload, c.config.trackingField, TRACKING_KEYS) ?? '').trim();
    const raw = findValue(payload, c.config.statusField, STATUS_KEYS);
    if (!tracking || raw == null) return res.status(400).json({ error: 'Expected a tracking number and a status.' });
    const s = await repo.findShipment(tracking);
    if (!s || s.carrierId !== c.id) return res.status(404).json({ error: 'Unknown tracking number' });
    const { mapped, changed } = await applyCarrierStatus(s, raw, 'webhook', c.config.statusMap, onStatus);
    res.json({ success: true, orderId: s.orderId, status: s.status, recognised: !!mapped, changed });
  });
  app.post('/api/carriers/webhook/:id/:token', webhook);
  app.get('/api/carriers/webhook/:id/:token', webhook);
}
