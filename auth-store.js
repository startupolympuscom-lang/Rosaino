// Storage for admin accounts, role permissions, login throttling and the audit
// trail. Authentication itself lives in auth.js; this module only persists data.
//
// With DATABASE_URL set (your Supabase project's Postgres connection string),
// everything is stored in Supabase Postgres through a direct server-side
// connection. Supabase Auth is not used. The tables are created on startup and
// have row-level security enabled with no policies, so the public (anon) API
// key can never read password hashes.
//
// Without DATABASE_URL, or if the database can't be reached at startup, the same
// data is kept in memory so the Super Admin can always sign in.
import pg from 'pg';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  avatar TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  password_hash TEXT NOT NULL,
  token_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS public.admin_roles (
  role TEXT PRIMARY KEY,
  permissions JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.admin_audit (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS admin_audit_at_idx ON public.admin_audit (at DESC);
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  first_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS owner_login_retired BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
`;

const AUDIT_LIMIT = 500;

const fromRow = r => r && ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  avatar: r.avatar,
  active: r.active,
  passwordHash: r.password_hash,
  tokenVersion: r.token_version,
  ownerLoginRetired: !!r.owner_login_retired,
  createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  lastLoginAt: r.last_login_at instanceof Date ? r.last_login_at.toISOString() : r.last_login_at
});

const auditFromRow = r => ({ ...r, at: r.at instanceof Date ? r.at.toISOString() : r.at });

// Supabase connection strings may carry ?sslmode=require, which makes the pg
// driver override our TLS settings and reject Supabase's certificate. TLS is
// configured below instead, so drop those URL parameters.
function normalizeConnectionString(raw) {
  const value = String(raw).trim();
  try {
    const url = new URL(value);
    ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat'].forEach(k => url.searchParams.delete(k));
    return url.toString();
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// Supabase: Vercel can't use the "Direct connection" string
// ---------------------------------------------------------------------------
// db.<project>.supabase.co only has an IPv6 address, and Vercel has no IPv6,
// so connections hang until they time out. The project's connection pooler
// accepts the same password over IPv4. Its address depends on the project's
// region, which isn't in the string, so every region is tried at once: the
// wrong ones answer "Tenant or user not found" straight away.
const SUPABASE_REGIONS = [
  'eu-west-3', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-central-2', 'eu-north-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2'
];

// The project id from a direct (db.<id>.supabase.co) or API (<id>.supabase.co) host.
export function supabaseProjectRef(host) {
  const m = /^(?:db\.)?([a-z0-9]{20})\.supabase\.co$/i.exec(String(host || ''));
  return m ? m[1].toLowerCase() : null;
}

/**
 * Find the pooler that serves this project. tryConnect(config) resolves when
 * a connection succeeds and rejects with the server's error otherwise.
 * Returns the pooler connection string (transaction mode, port 6543).
 */
export async function findSupabasePooler(connectionString, tryConnect) {
  const url = new URL(connectionString);
  const ref = supabaseProjectRef(url.hostname);
  if (!ref) return connectionString;
  const password = decodeURIComponent(url.password);
  const database = decodeURIComponent(url.pathname.replace(/^\//, '')) || 'postgres';
  const user = `postgres.${ref}`;
  const hosts = SUPABASE_REGIONS.flatMap(r => [`aws-0-${r}.pooler.supabase.com`, `aws-1-${r}.pooler.supabase.com`]);
  const errors = [];
  const attempt = host => tryConnect({ host, port: 6543, user, password, database })
    .then(() => host, err => { errors.push(String(err?.message || err)); throw err; });
  try {
    const host = await Promise.any(hosts.map(attempt));
    const out = new URL(connectionString);
    out.hostname = host;
    out.port = '6543';
    out.username = user;
    return out.toString();
  } catch {
    // The right region answers with the real problem (e.g. a wrong password).
    const real = errors.find(e => !/tenant or user not found|ENOTFOUND|getaddrinfo/i.test(e));
    const err = new Error(real || `No Supabase pooler knows project ${ref}. Check the project exists and copy the Transaction pooler string from Connect.`);
    err.supabaseRef = ref;
    throw err;
  }
}

// Where the server is (trying to be) connected, for the health check.
// Never includes the user name or password.
let dbTarget = null;
export const databaseTarget = () => dbTarget;
const describeTarget = (cs, note) => {
  try {
    const u = new URL(cs);
    return { host: u.hostname, port: u.port || '5432', note: note || null };
  } catch {
    return { host: '?', port: '?', note: note || null };
  }
};

function postgresStore(rawConnectionString) {
  const connectionString = normalizeConnectionString(rawConnectionString);
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
  // Supabase requires TLS. Its certificates are signed by Supabase's own CA,
  // so verification is opt-in via DATABASE_SSL_CA (the CA from the dashboard).
  const ssl = local ? false : process.env.DATABASE_SSL_CA
    ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, '\n') }
    : { rejectUnauthorized: false };
  dbTarget = describeTarget(connectionString);

  // Direct / API Supabase hosts are switched to the project's pooler first.
  async function resolveConnectionString() {
    let host;
    try { host = new URL(connectionString).hostname; } catch { return connectionString; }
    if (!supabaseProjectRef(host) || process.env.DATABASE_DIRECT === 'true') return connectionString;
    const pooled = await findSupabasePooler(connectionString, async cfg => {
      const client = new pg.Client({ ...cfg, ssl, connectionTimeoutMillis: 8000 });
      try {
        await client.connect();
      } finally {
        client.end().catch(() => {});
      }
    });
    dbTarget = describeTarget(pooled, `DATABASE_URL uses Supabase's direct address (${host}), which Vercel can't reach; connected through the project's pooler instead. You can paste the Transaction pooler string from Supabase → Connect into DATABASE_URL to skip this lookup.`);
    console.warn('[db] ' + dbTarget.note);
    return pooled;
  }

  let poolPromise = null;
  const getPool = () => (poolPromise ||= resolveConnectionString()
    .then(cs => new pg.Pool({
      connectionString: cs,
      ssl,
      max: Number(process.env.DATABASE_POOL_MAX) || 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000
    }))
    .catch(err => { poolPromise = null; throw err; }));
  const q = async (text, params) => (await getPool()).query(text, params);

  return {
    kind: 'postgres',
    // Shared connection for other server modules (carriers & shipments).
    query: q,
    // A dedicated connection, for transactions (release it when done).
    connect: async () => (await getPool()).connect(),
    async init() {
      await q(SCHEMA_SQL);
    },
    async countUsers() {
      return (await q('SELECT COUNT(*)::int AS n FROM admin_users')).rows[0].n;
    },
    async getUser(id) {
      return fromRow((await q('SELECT * FROM admin_users WHERE id = $1', [id])).rows[0]);
    },
    async findByEmail(email) {
      return fromRow((await q('SELECT * FROM admin_users WHERE email = $1', [email])).rows[0]);
    },
    async listUsers() {
      return (await q('SELECT * FROM admin_users ORDER BY created_at, email')).rows.map(fromRow);
    },
    async saveUser(u) {
      await q(
        `INSERT INTO admin_users (id, name, email, role, avatar, active, password_hash, token_version, created_at, last_login_at, owner_login_retired)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role,
           avatar = EXCLUDED.avatar, active = EXCLUDED.active, password_hash = EXCLUDED.password_hash,
           token_version = EXCLUDED.token_version, last_login_at = EXCLUDED.last_login_at,
           owner_login_retired = EXCLUDED.owner_login_retired`,
        [u.id, u.name, u.email, u.role, u.avatar, u.active !== false, u.passwordHash, u.tokenVersion, u.createdAt, u.lastLoginAt, !!u.ownerLoginRetired]
      );
    },
    async deleteUser(id) {
      await q('DELETE FROM admin_users WHERE id = $1', [id]);
    },
    async getRoles() {
      const rows = (await q('SELECT role, permissions FROM admin_roles')).rows;
      return rows.length ? Object.fromEntries(rows.map(r => [r.role, r.permissions])) : null;
    },
    async saveRoles(roles) {
      const client = await (await getPool()).connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM admin_roles WHERE NOT (role = ANY($1))', [Object.keys(roles)]);
        for (const [role, permissions] of Object.entries(roles)) {
          await client.query(
            `INSERT INTO admin_roles (role, permissions, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (role) DO UPDATE SET permissions = EXCLUDED.permissions, updated_at = NOW()`,
            [role, JSON.stringify(permissions)]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    },
    async addAudit(entry) {
      await q('INSERT INTO admin_audit (id, at, actor, action, detail, ip) VALUES ($1, $2, $3, $4, $5, $6)',
        [entry.id, entry.at, entry.actor, entry.action, entry.detail, entry.ip]);
    },
    async listAudit(limit) {
      return (await q('SELECT id, at, actor, action, detail, ip FROM admin_audit ORDER BY at DESC LIMIT $1', [limit])).rows.map(auditFromRow);
    },
    async getAttempt(key) {
      const r = (await q('SELECT count, first_at FROM admin_login_attempts WHERE key = $1', [key])).rows[0];
      return r ? { count: r.count, first: new Date(r.first_at).getTime() } : null;
    },
    async setAttempt(key, attempt) {
      await q(
        `INSERT INTO admin_login_attempts (key, count, first_at) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET count = EXCLUDED.count, first_at = EXCLUDED.first_at`,
        [key, attempt.count, new Date(attempt.first)]
      );
    },
    async clearAttempt(key) {
      await q('DELETE FROM admin_login_attempts WHERE key = $1', [key]);
    }
  };
}

export function createMemoryStore() {
  const users = new Map();
  const attempts = new Map();
  const audit = [];
  let roles = null;
  const copy = v => v && JSON.parse(JSON.stringify(v));

  return {
    kind: 'memory',
    async init() {},
    async countUsers() { return users.size; },
    async getUser(id) { return copy(users.get(id)); },
    async findByEmail(email) { return copy([...users.values()].find(u => u.email === email)); },
    async listUsers() { return [...users.values()].map(copy); },
    async saveUser(u) { users.set(u.id, copy(u)); },
    async deleteUser(id) { users.delete(id); },
    async getRoles() { return copy(roles); },
    async saveRoles(next) { roles = copy(next); },
    async addAudit(entry) {
      audit.unshift(entry);
      audit.length = Math.min(audit.length, AUDIT_LIMIT);
    },
    async listAudit(limit) { return audit.slice(0, limit); },
    async getAttempt(key) { return attempts.get(key) || null; },
    async setAttempt(key, attempt) { attempts.set(key, attempt); },
    async clearAttempt(key) { attempts.delete(key); }
  };
}

export function createStore() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return postgresStore(url);
  console.warn('[auth] DATABASE_URL is not set; admin accounts are kept in memory and reset on restart. Set it to your Supabase Postgres connection string.');
  return createMemoryStore();
}
