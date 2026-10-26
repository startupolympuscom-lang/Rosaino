// Nearya Express API client (https://nearya.express).
//
// Requests are authenticated with two headers, x-api-id (Client ID) and
// x-api-key (API key), and most bodies carry the "company" (Business ID).
// Nearya's documentation shows request formats only, so replies are read
// tolerantly: the usual field names are looked for at the top level and under
// "data", and anything unexpected is reported back with the raw reply.

export const NEARYA_BASE_URL = 'https://nearya.express';

const normalize = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export class NearyaError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// What Nearya said, in a sentence (for error messages shown to staff).
function replyText(data) {
  if (data == null || data === '') return '';
  if (typeof data === 'string') return data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
  for (const k of ['message', 'error', 'msg', 'detail', 'errors']) {
    const v = data[k];
    if (typeof v === 'string' && v) return v.slice(0, 200);
    if (v && typeof v === 'object') return JSON.stringify(v).slice(0, 200);
  }
  return JSON.stringify(data).slice(0, 200);
}

// Where Nearya puts the useful part of a reply: the reply itself, or
// a data / result / parcel wrapper.
function scopes(data) {
  const out = [];
  const add = v => { if (v && typeof v === 'object') out.push(v); };
  add(data);
  for (const k of ['data', 'result', 'parcel', 'colis', 'response']) {
    const v = data?.[k];
    if (Array.isArray(v)) add(v[v.length - 1]); else add(v);
  }
  return out;
}

function firstValue(data, keys) {
  for (const scope of scopes(data)) {
    for (const k of keys) {
      const v = scope[k];
      if (v == null || v === '') continue;
      if (typeof v === 'object' && !Array.isArray(v)) {
        const inner = v.name ?? v.label ?? v.libelle ?? v.title ?? v.value;
        if (inner != null && typeof inner !== 'object') return inner;
        continue;
      }
      if (typeof v !== 'object') return v;
    }
  }
  return undefined;
}

const TRACKING_KEYS = ['trackingCode', 'tracking_code', 'codeSuivi', 'code_suivi', 'tracking', 'trackingNumber', 'tracking_number', 'code', 'barcode', 'parcelCode', 'parcel_code', 'reference', 'ref'];
const PARCEL_ID_KEYS = ['parcelId', 'parcel_id', '_id', 'id', 'uuid'];
const STATUS_KEYS = ['status', 'statut', 'state', 'etat', 'currentStatus', 'lastStatus', 'last_status', 'libelle', 'label', 'name'];

export function createClient({ baseUrl = NEARYA_BASE_URL, clientId, apiKey, businessId, fetchImpl = fetch } = {}) {
  const root = String(baseUrl || NEARYA_BASE_URL).replace(/\/+$/, '');

  async function request(method, path, { query, body } = {}) {
    const url = new URL(root + path);
    Object.entries(query || {}).forEach(([k, v]) => { if (v != null && v !== '') url.searchParams.set(k, String(v)); });
    const headers = { Accept: 'application/json' };
    if (clientId) headers['x-api-id'] = clientId;
    if (apiKey) headers['x-api-key'] = apiKey;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetchImpl(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    } catch (err) {
      throw new NearyaError(`Nearya could not be reached (${err.name === 'TimeoutError' ? 'no answer after 15 s' : err.message}).`);
    }
    const text = await res.text();
    let data = text;
    try { data = text ? JSON.parse(text) : null; } catch {}
    const refused = data && typeof data === 'object' && (data.success === false || data.status === 'error' || data.error === true);
    if (!res.ok || refused) {
      const why = res.status === 401 || res.status === 403
        ? 'Nearya rejected the Client ID or API key.'
        : `Nearya refused the request (HTTP ${res.status})${replyText(data) ? ': ' + replyText(data) : '.'}`;
      throw new NearyaError(why, { status: res.status, data });
    }
    return data;
  }

  // Parcel body shared by "simple", "store" and "replace".
  const parcelBody = p => ({
    company: businessId,
    orderId: String(p.orderId ?? ''),
    region: String(p.regionId ?? ''),
    recipient: String(p.recipient ?? ''),
    recipientAddress: String(p.address ?? ''),
    recipientPhone: String(p.phone ?? ''),
    comment: String(p.comment ?? ''),
    price: String(p.price ?? 0)
  });

  // A created parcel: its tracking code (Code_suivi) and Nearya's own id.
  function parcelRef(data) {
    if (typeof data === 'string' && data.trim() && data.length < 80 && !/\s/.test(data.trim())) return { trackingCode: data.trim(), parcelId: data.trim() };
    const trackingCode = firstValue(data, TRACKING_KEYS);
    const parcelId = firstValue(data, PARCEL_ID_KEYS);
    const code = String(trackingCode ?? parcelId ?? '').trim();
    if (!code) throw new NearyaError(`Nearya accepted the parcel but its reply has no tracking code: ${replyText(data) || 'empty reply'}.`, { data });
    return { trackingCode: code, parcelId: String(parcelId ?? code) };
  }

  return {
    // GET /api/region -> [{ id, name }]
    async regions() {
      const data = await request('GET', '/api/region');
      const list = Array.isArray(data) ? data
        : [data?.data, data?.regions, data?.result, data?.items, data?.cities].find(Array.isArray) || [];
      return list.map(r => {
        if (typeof r !== 'object' || !r) return { id: String(r), name: String(r) };
        const id = r.id ?? r._id ?? r.regionId ?? r.value ?? r.code;
        const name = r.name ?? r.nom ?? r.label ?? r.libelle ?? r.region ?? r.city ?? r.ville ?? r.title;
        return { id: String(id ?? name ?? ''), name: String(name ?? id ?? '') };
      }).filter(r => r.id);
    },

    // POST /api/parcelTrash/v1/simple
    async createSimple(p) {
      return parcelRef(await request('POST', '/api/parcelTrash/v1/simple', { body: parcelBody(p) }));
    },

    // POST /api/parcelTrash/v1/store (products shipped from Nearya's stock)
    async createStore(p) {
      const body = { ...parcelBody(p), expectedStore: (p.items || []).map(i => ({ sku: String(i.sku), quantity: String(i.quantity) })) };
      return parcelRef(await request('POST', '/api/parcelTrash/v1/store', { body }));
    },

    // GET /api/docParcelStatus/v1?parcel=...
    async status(parcel) {
      const data = await request('GET', '/api/docParcelStatus/v1', { query: { parcel } });
      let source = data;
      const history = Array.isArray(data) ? data : [data?.history, data?.statuses, data?.data?.history].find(Array.isArray);
      if (history?.length) {
        const dated = history.filter(h => h && (h.date || h.createdAt || h.updatedAt));
        source = dated.length === history.length
          ? [...history].sort((a, b) => new Date(a.date || a.createdAt || a.updatedAt) - new Date(b.date || b.createdAt || b.updatedAt)).pop()
          : history[history.length - 1];
      }
      const status = firstValue(source, STATUS_KEYS);
      if (status == null) throw new NearyaError(`Nearya's status reply was not understood: ${replyText(data) || 'empty reply'}.`, { data });
      return { status: String(status), raw: data };
    },

    // POST /api/pickup/v1?company=&type=&pickup=
    async pickup({ type = 'simple', pickup = true, clientAddress, clientPhone, ticket = false }) {
      return request('POST', '/api/pickup/v1', {
        query: { company: businessId, type: type === 'store' ? 'store' : 'simple', pickup: pickup ? 'true' : 'false' },
        body: { information: { clientAddress: String(clientAddress || ''), clientPhone: String(clientPhone || ''), ticket: ticket ? 'true' : 'false' } }
      });
    },

    // GET /api/storeState/v1/product/inventory?name=&company=&region=
    async productInventory(name, region) {
      return request('GET', '/api/storeState/v1/product/inventory', { query: { name, company: businessId, region } });
    },

    // GET /api/storeState/v1/variant/inventory?sku=&company=&region=
    async variantInventory(sku, region) {
      return request('GET', '/api/storeState/v1/variant/inventory', { query: { sku, company: businessId, region } });
    },

    // GET /api/parcel/v1/restart/{Code_suivi}
    async restart(trackingCode) {
      return request('GET', `/api/parcel/v1/restart/${encodeURIComponent(trackingCode)}`);
    },

    // POST /api/parcel/v1/address/{Code_suivi}: send the parcel to a new customer
    async newRecipient(trackingCode, p) {
      const data = await request('POST', `/api/parcel/v1/address/${encodeURIComponent(trackingCode)}`, {
        body: {
          receivingRegion: String(p.regionId ?? ''),
          recipient: String(p.recipient ?? ''),
          recipientAddress: String(p.address ?? ''),
          recipientPhone: String(p.phone ?? ''),
          comment: String(p.comment ?? ''),
          price: String(p.price ?? 0)
        }
      });
      const code = firstValue(data, TRACKING_KEYS);
      return { data, trackingCode: code != null ? String(code) : null };
    },

    // POST /api/parcelTrash/v1/replace/{Code_suivi}: exchange parcel
    async replace(trackingCode, p) {
      return parcelRef(await request('POST', `/api/parcelTrash/v1/replace/${encodeURIComponent(trackingCode)}`, { body: parcelBody(p) }));
    }
  };
}

// Find the Nearya region for a city: saved choices first, then the region
// whose name matches the city (accents, case and spacing ignored).
export function matchRegion(regions, city, savedMap = {}) {
  const key = normalize(city);
  if (!key) return null;
  const saved = Object.entries(savedMap || {}).find(([c]) => normalize(c) === key)?.[1];
  if (saved && regions.some(r => r.id === String(saved))) return regions.find(r => r.id === String(saved));
  return regions.find(r => normalize(r.name) === key)
    || regions.find(r => normalize(r.name).split(' ').includes(key) || key.split(' ').includes(normalize(r.name)))
    || null;
}

// Stock count from an inventory reply, if one can be found.
export function inventoryCount(data) {
  const v = firstValue(data, ['quantity', 'qty', 'stock', 'available', 'availableQuantity', 'inventory', 'count', 'total']);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
