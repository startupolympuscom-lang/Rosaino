// Business data (products, orders, purchase orders, landing pages, contact
// messages, blacklist, uploaded images) in Supabase Postgres via DATABASE_URL.
// Each record is stored as JSON in one private table that only the server can
// reach. Without DATABASE_URL the server keeps using its in-memory demo data.
import { getStore } from './auth.js';
import { createStore } from './auth-store.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.app_records (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  seq BIGSERIAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS app_records_collection_seq_idx ON public.app_records (collection, seq);
ALTER TABLE public.app_records ENABLE ROW LEVEL SECURITY;
`;

let schemaReady = null;

// The Postgres store, or null when the server runs on in-memory data (no
// DATABASE_URL). If a database is configured but unreachable this throws,
// so nothing is ever silently kept in memory instead.
let ownStore = null;
export async function dataDb() {
  if (!process.env.DATABASE_URL?.trim()) return null;
  let store = await getStore().catch(() => null);
  // If sign-in fell back to built-in accounts (database down at start-up),
  // use our own pool: every request retries and reports the real error.
  if (store?.kind !== 'postgres') store = ownStore ||= createStore();
  if (!schemaReady) schemaReady = store.query(SCHEMA_SQL).catch(err => { schemaReady = null; throw err; });
  await schemaReady;
  return store;
}

// All records of the given collections, oldest first: { orders: [...], ... }
export async function loadCollections(names) {
  const s = await dataDb();
  if (!s) return null;
  const { rows } = await s.query(
    'SELECT collection, data FROM app_records WHERE collection = ANY($1) ORDER BY seq ASC',
    [names]
  );
  const out = Object.fromEntries(names.map(n => [n, []]));
  rows.forEach(r => out[r.collection].push(r.data));
  return out;
}

export async function getRecord(collection, id) {
  const s = await dataDb();
  if (!s) return null;
  const { rows } = await s.query('SELECT data FROM app_records WHERE collection = $1 AND id = $2', [collection, String(id)]);
  return rows[0]?.data ?? null;
}

// Insert or replace records. Each needs an id.
export async function saveRecords(collection, records) {
  const s = await dataDb();
  if (!s || !records.length) return false;
  for (const r of records) {
    await s.query(
      `INSERT INTO app_records (collection, id, data) VALUES ($1, $2, $3)
       ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [collection, String(r.id), JSON.stringify(r)]
    );
  }
  return true;
}

export const saveRecord = (collection, record) => saveRecords(collection, [record]);

// Change one stored record inside a transaction: the row is locked, so two
// simultaneous edits are applied one after the other instead of the slower
// one overwriting the faster. fn(data, tx) returns the new data; tx.adjust
// changes a number on another record (e.g. product stock) in the same
// transaction. Returns the saved data, or null if the record doesn't exist.
export async function updateRecord(collection, id, fn) {
  const s = await dataDb();
  if (!s) return null;
  const client = await s.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT data FROM app_records WHERE collection = $1 AND id = $2 FOR UPDATE',
      [collection, String(id)]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return null;
    }
    const tx = {
      async adjust(coll, recordId, field, delta) {
        const r = await client.query(
          `UPDATE app_records
           SET data = jsonb_set(data, $3::text[], to_jsonb(COALESCE((data #>> $3::text[])::numeric, 0) + $4)), updated_at = NOW()
           WHERE collection = $1 AND id = $2 RETURNING data`,
          [coll, String(recordId), `{${field}}`, delta]
        );
        return r.rows[0]?.data ?? null;
      },
      async set(coll, recordId, field, value) {
        const r = await client.query(
          `UPDATE app_records SET data = jsonb_set(data, $3::text[], $4::jsonb), updated_at = NOW()
           WHERE collection = $1 AND id = $2 RETURNING data`,
          [coll, String(recordId), `{${field}}`, JSON.stringify(value)]
        );
        return r.rows[0]?.data ?? null;
      }
    };
    const next = await fn(rows[0].data, tx);
    await client.query(
      'UPDATE app_records SET data = $3, updated_at = NOW() WHERE collection = $1 AND id = $2',
      [collection, String(id), JSON.stringify(next)]
    );
    await client.query('COMMIT');
    return next;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function countRecords() {
  const s = await dataDb();
  if (!s) return null;
  const { rows } = await s.query('SELECT collection, COUNT(*)::int AS n FROM app_records GROUP BY collection');
  return Object.fromEntries(rows.map(r => [r.collection, r.n]));
}

// First run on a new database: bring over products and orders from the older
// public.products / public.orders tables if they hold data, otherwise start
// the catalogue from the default products. Orders start empty (no demo data).
export async function seedIfEmpty(defaultProducts) {
  const s = await dataDb();
  if (!s) return;
  const { rows } = await s.query("SELECT COUNT(*)::int AS n FROM app_records WHERE collection = 'products'");
  if (rows[0].n > 0) return;

  const legacy = async table => {
    try {
      const exists = await s.query('SELECT to_regclass($1) AS t', [`public.${table}`]);
      if (!exists.rows[0].t) return [];
      return (await s.query(`SELECT * FROM public.${table}`)).rows;
    } catch {
      return [];
    }
  };
  // Old tables use snake_case and NUMERIC columns (returned as text by pg).
  const NUMBERS = ['price', 'cost', 'stock', 'amount', 'quantity', 'shipping', 'x', 'y'];
  const camel = row => Object.fromEntries(Object.entries(row).map(([k, v]) => {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    return [key, NUMBERS.includes(key) && v !== null && v !== '' ? Number(v) : v];
  }));

  const oldProducts = (await legacy('products')).map(camel).filter(p => p.id && p.name);
  await saveRecords('products', oldProducts.length ? oldProducts : defaultProducts);

  const { rows: o } = await s.query("SELECT COUNT(*)::int AS n FROM app_records WHERE collection = 'orders'");
  if (o[0].n === 0) {
    const oldOrders = (await legacy('orders')).map(camel).filter(x => x.id && x.customer);
    oldOrders.forEach(x => { if (x.date instanceof Date) x.date = x.date.toISOString().slice(0, 10); });
    await saveRecords('orders', oldOrders.reverse());
  }
}

// Health check used by /api/health and the setup checklist.
export async function databaseHealth() {
  if (!process.env.DATABASE_URL?.trim()) return { configured: false, connected: false };
  try {
    const s = await dataDb();
    const started = Date.now();
    await s.query('SELECT 1');
    return { configured: true, connected: true, latencyMs: Date.now() - started, records: await countRecords() };
  } catch (err) {
    return { configured: true, connected: false, error: describeDbError(err) };
  }
}

// A readable reason without credentials or host names.
export function describeDbError(err) {
  const m = String(err?.message || err || '');
  if (/password authentication failed/i.test(m)) return 'Wrong database password in DATABASE_URL.';
  if (/ENOTFOUND|getaddrinfo/i.test(m)) return 'The database host in DATABASE_URL was not found.';
  if (/ECONNREFUSED|ETIMEDOUT|timeout/i.test(m)) return 'The database did not answer (check the host, port and that the project is not paused).';
  if (/Tenant or user not found/i.test(m)) return 'The user name in DATABASE_URL does not match the Supabase project (use the pooler string from Connect).';
  if (/self.signed|certificate/i.test(m)) return 'SSL certificate problem connecting to the database.';
  if (/does not exist/i.test(m)) return 'The database named in DATABASE_URL does not exist.';
  return 'Database error: ' + m.replace(/postgres(ql)?:\/\/\S+/gi, '[connection string]').slice(0, 160);
}
