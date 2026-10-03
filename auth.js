// Simple email + password authentication for the Rosaino operations portal.
//
// - No external auth provider (Supabase Auth is not used). Accounts, roles,
//   login throttling and the audit trail are stored in Supabase Postgres via
//   auth-store.js (or in memory for local development).
// - Passwords are hashed with scrypt (never stored or returned in plain text).
// - Sessions are HMAC-signed tokens, so they work across serverless instances
//   (Vercel). Each request re-checks the account in the database, so disabling
//   a user or changing a password takes effect immediately.
// - Role permissions are enforced on the server for every admin API route.
import crypto from 'crypto';
import { createStore, createMemoryStore } from './auth-store.js';

export const PERMISSIONS = [
  'overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'cms', 'suppliers',
  'finance', 'reconciliation', 'reports', 'stores', 'integrations', 'team', 'audit',
  'rbac_manage', 'settings'
];

export const SUPER_ADMIN = 'Super Admin';

export const DEFAULT_ROLES = {
  'Super Admin': [...PERMISSIONS],
  'Admin': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'cms', 'suppliers', 'finance', 'reconciliation', 'reports', 'stores', 'integrations', 'team', 'audit', 'settings'],
  'Operations manager': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'cms', 'suppliers', 'reconciliation', 'stores'],
  'Confirmation agent': ['calls'],
  'Finance viewer': ['overview', 'finance', 'reconciliation', 'reports']
};

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const MIN_PASSWORD_LENGTH = 8;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const AUDIT_LIMIT = 500;

const SECRET = process.env.AUTH_SECRET
  || crypto.createHash('sha256').update('rosaino-admin:' + (process.env.SUPABASE_KEY || 'local-dev')).digest('hex');
if (!process.env.AUTH_SECRET) {
  console.warn('[auth] AUTH_SECRET is not set; using a derived development secret. Set AUTH_SECRET in production.');
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(String(password), salt, expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

// ---------------------------------------------------------------------------
// Store, roles and first-run setup
// ---------------------------------------------------------------------------
let store = createStore();
let storageError = null;
let roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));

const initials = name => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

function newUser({ id, name, email, role, password }) {
  return {
    id: id || 'usr_' + crypto.randomBytes(6).toString('hex'),
    name,
    email: email.trim().toLowerCase(),
    role,
    avatar: initials(name),
    active: true,
    passwordHash: hashPassword(password),
    tokenVersion: 1,
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  };
}

const DEFAULT_SUPER_ADMIN = { id: 'usr_superadmin', email: 'superadmin@rosaino.com', password: 'RosainoSuperAdmin2026!' };

const RETIRED_DEMO_ACCOUNTS = [
  { id: 'usr_admin', email: 'admin@rosaino.com', password: 'RosainoAdmin2026!' },
  { id: 'usr_ops', email: 'operations@rosaino.com', password: 'OpsManager2026!' },
  { id: 'usr_agent', email: 'agent@rosaino.com', password: 'Agent2026!' },
  { id: 'usr_finance', email: 'finance@rosaino.com', password: 'Finance2026!' }
];

async function bootstrap() {
  try {
    await store.init();
  } catch (err) {
    if (store.kind !== 'postgres') throw err;
    // Keep sign-in working: fall back to built-in accounts for this server instance.
    storageError = `Database unreachable (${err.message}); using built-in sign-in.`;
    console.error('[auth] ' + storageError + ' Check DATABASE_URL.');
    store = createMemoryStore();
    await store.init();
  }

  const storedRoles = await store.getRoles();
  if (storedRoles) {
    roles = { ...storedRoles, [SUPER_ADMIN]: [...PERMISSIONS] };
  } else {
    await store.saveRoles(roles);
  }

  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  // Pasted values often carry a stray space or line break; ignore it.
  const envPassword = process.env.ADMIN_PASSWORD?.trim() || undefined;

  // First run: create the Super Admin. No sample/demo accounts are created.
  if ((await store.countUsers()) === 0) {
    await store.saveUser(newUser({
      id: 'usr_superadmin',
      name: 'Rosaino Super Admin',
      email: envEmail || DEFAULT_SUPER_ADMIN.email,
      password: envPassword || DEFAULT_SUPER_ADMIN.password,
      role: SUPER_ADMIN
    }));
    console.log(`[auth] Created the Super Admin account in ${store.kind} storage.`);
    if (!envPassword) {
      console.warn('[auth] Default Super Admin password in use. Set ADMIN_EMAIL/ADMIN_PASSWORD before going live, or change it in the portal.');
    }
  } else if (envEmail && envPassword && !(await store.findByEmail(envEmail))) {
    // Recovery: a new ADMIN_EMAIL/ADMIN_PASSWORD pair adds a fresh Super Admin.
    await store.saveUser(newUser({ name: 'Rosaino Super Admin', email: envEmail, password: envPassword, role: SUPER_ADMIN }));
    console.log(`[auth] Added Super Admin ${envEmail} from environment variables.`);
  }

  // Once your own Super Admin comes from ADMIN_EMAIL/ADMIN_PASSWORD, the default
  // login (whose password is public) is retired the same way as the samples.
  const retired = [...RETIRED_DEMO_ACCOUNTS];
  if (envEmail && envPassword && envEmail !== DEFAULT_SUPER_ADMIN.email && (await store.findByEmail(envEmail))?.active !== false) {
    retired.push(DEFAULT_SUPER_ADMIN);
  }

  // Sample accounts created by earlier versions are switched off and signed out,
  // unless someone has since given them a new password.
  for (const demo of retired) {
    const u = await store.getUser(demo.id);
    if (u && u.active !== false && u.email === demo.email && verifyPassword(demo.password, u.passwordHash)) {
      u.active = false;
      u.tokenVersion += 1;
      await store.saveUser(u);
      console.log(`[auth] Disabled default account ${u.email}.`);
    }
  }
}

let ready = null;
function ensureReady() {
  if (!ready) {
    ready = bootstrap().catch(err => {
      ready = null; // retry on the next request
      throw err;
    });
  }
  return ready;
}

// Refresh role permissions so every serverless instance sees the same matrix.
async function loadRoles() {
  const stored = await store.getRoles();
  if (stored) roles = { ...stored, [SUPER_ADMIN]: [...PERMISSIONS] };
  return roles;
}

export function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || initials(u.name),
    active: u.active !== false,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  };
}

export function permissionsFor(role) {
  if (role === SUPER_ADMIN) return [...PERMISSIONS];
  return [...(roles[role] || [])];
}

export function can(user, perm) {
  return !!user && (user.role === SUPER_ADMIN || (roles[user.role] || []).includes(perm));
}

async function activeSuperAdminCount() {
  return (await store.listUsers()).filter(u => u.active !== false && u.role === SUPER_ADMIN).length;
}

export function audit(actor, action, detail = '', req = null) {
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor: actor ? (typeof actor === 'string' ? actor : actor.email) : 'anonymous',
    action,
    detail,
    ip: req ? clientIp(req) : ''
  };
  // Returns a promise; await it where the response should wait for the write.
  return store.addAudit(entry).catch(err => console.warn('[auth] audit write failed:', err.message));
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
const b64url = buf => Buffer.from(buf).toString('base64url');
const sign = data => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

function issueToken(u) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = b64url(JSON.stringify({ sub: u.id, ver: u.tokenVersion, exp: expiresAt }));
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(expiresAt).toISOString() };
}

async function verifyToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
  if (!data.exp || data.exp < Date.now()) return null;
  const [u] = await Promise.all([store.getUser(data.sub), loadRoles()]);
  if (!u || u.active === false || u.tokenVersion !== data.ver) return null;
  return u;
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

function unavailable(res, err) {
  console.error('[auth] storage error:', err.message);
  return res.status(503).json({ error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/** Attach req.user when a valid token is present; never rejects. */
export async function optionalAuth(req, res, next) {
  try {
    await ensureReady();
    req.user = await verifyToken(bearer(req));
  } catch {
    req.user = null;
  }
  next();
}

/** Require a signed-in user holding at least one of the given permissions. */
export function requireAuth(...perms) {
  return async (req, res, next) => {
    let u;
    try {
      await ensureReady();
      u = await verifyToken(bearer(req));
    } catch (err) {
      return unavailable(res, err);
    }
    if (!u) return res.status(401).json({ error: 'Authentication required' });
    if (perms.length && !perms.some(p => can(u, p))) {
      return res.status(403).json({ error: `Your role (${u.role}) is not allowed to perform this action` });
    }
    req.user = u;
    next();
  };
}

// Wrap async route handlers so storage errors return 503 instead of hanging.
const handle = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    unavailable(res, err);
  }
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
function validatePassword(pw) {
  if (typeof pw !== 'string' || pw.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function sessionPayload(u) {
  return { user: publicUser(u), permissions: permissionsFor(u.role), roles };
}

export function registerAuthRoutes(app) {
  // --- Session ---------------------------------------------------------------
  app.post('/api/auth/login', handle(async (req, res) => {
    await ensureReady();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const key = `${clientIp(req)}|${email}`;
    const attempt = await store.getAttempt(key);
    if (attempt && attempt.count >= MAX_FAILED_LOGINS && Date.now() - attempt.first < LOCKOUT_MS) {
      const minutes = Math.ceil((LOCKOUT_MS - (Date.now() - attempt.first)) / 60000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutes} minute(s).` });
    }

    const u = await store.findByEmail(email);
    if (!u || !verifyPassword(password, u.passwordHash) || u.active === false) {
      const fresh = !attempt || Date.now() - attempt.first >= LOCKOUT_MS;
      await store.setAttempt(key, fresh ? { count: 1, first: Date.now() } : { ...attempt, count: attempt.count + 1 });
      await audit(email, 'login.failed', u && u.active === false ? 'Account disabled' : 'Invalid credentials', req);
      return res.status(401).json({ error: u && u.active === false ? 'This account has been disabled' : 'Invalid email or password' });
    }

    await store.clearAttempt(key);
    u.lastLoginAt = new Date().toISOString();
    await store.saveUser(u);
    await loadRoles();
    await audit(u, 'login', '', req);
    return res.json({ success: true, ...issueToken(u), ...sessionPayload(u) });
  }));

  app.get('/api/auth/me', requireAuth(), (req, res) => {
    res.json({ authenticated: true, ...sessionPayload(req.user) });
  });

  app.post('/api/auth/logout', optionalAuth, async (req, res) => {
    if (req.user) await audit(req.user, 'logout', '', req);
    res.json({ success: true });
  });

  // Invalidate every token for the current user (all devices).
  app.post('/api/auth/logout-all', requireAuth(), handle(async (req, res) => {
    req.user.tokenVersion += 1;
    await store.saveUser(req.user);
    await audit(req.user, 'logout.all', 'All sessions revoked', req);
    res.json({ success: true });
  }));

  app.post('/api/auth/change-password', requireAuth(), handle(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!verifyPassword(currentPassword || '', req.user.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const err = validatePassword(newPassword);
    if (err) return res.status(400).json({ error: err });
    req.user.passwordHash = hashPassword(newPassword);
    req.user.tokenVersion += 1; // sign out other devices
    await store.saveUser(req.user);
    await audit(req.user, 'password.changed', '', req);
    res.json({ success: true, ...issueToken(req.user), ...sessionPayload(req.user) });
  }));

  // --- Roles & permissions ---------------------------------------------------
  app.get('/api/roles', requireAuth(), (req, res) => {
    res.json({ roles, permissions: PERMISSIONS });
  });

  app.put('/api/roles', requireAuth('rbac_manage'), handle(async (req, res) => {
    const assigned = new Set((await store.listUsers()).map(u => u.role));

    if (req.body?.reset) {
      const inUse = Object.keys(roles).filter(r => !DEFAULT_ROLES[r] && assigned.has(r));
      if (inUse.length) return res.status(400).json({ error: `Reassign users before resetting; custom role(s) in use: ${inUse.join(', ')}` });
      roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
      await store.saveRoles(roles);
      await audit(req.user, 'roles.reset', 'Permissions reset to defaults', req);
      return res.json({ success: true, roles });
    }

    const incoming = req.body?.roles;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return res.status(400).json({ error: 'roles object is required' });
    }
    const next = {};
    for (const [name, perms] of Object.entries(incoming)) {
      const role = String(name).trim().slice(0, 40);
      if (!role || !Array.isArray(perms)) return res.status(400).json({ error: `Invalid role definition: ${name}` });
      next[role] = [...new Set(perms.filter(p => PERMISSIONS.includes(p)))];
    }
    next[SUPER_ADMIN] = [...PERMISSIONS];

    const removed = Object.keys(roles).filter(r => !(r in next));
    const inUse = removed.filter(r => assigned.has(r));
    if (inUse.length) return res.status(400).json({ error: `Cannot delete role(s) still assigned to users: ${inUse.join(', ')}` });

    const changes = Object.keys(next).filter(r => JSON.stringify(next[r]) !== JSON.stringify(roles[r]));
    roles = next;
    await store.saveRoles(roles);
    await audit(req.user, 'roles.updated', [changes.length ? `Changed: ${changes.join(', ')}` : '', removed.length ? `Removed: ${removed.join(', ')}` : ''].filter(Boolean).join(' · '), req);
    res.json({ success: true, roles });
  }));

  // --- User management -------------------------------------------------------
  app.get('/api/users', requireAuth(), handle(async (req, res) => {
    res.json((await store.listUsers()).map(publicUser));
  }));

  app.post('/api/users', requireAuth('rbac_manage'), handle(async (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const email = String(req.body?.email || '').trim().toLowerCase();
    const role = String(req.body?.role || '');
    const password = req.body?.password;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!validEmail(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (await store.findByEmail(email)) return res.status(409).json({ error: 'A user with this email already exists' });
    if (!roles[role]) return res.status(400).json({ error: 'Unknown role' });
    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const u = newUser({ name, email, role, password });
    await store.saveUser(u);
    await audit(req.user, 'user.created', `${email} (${role})`, req);
    res.status(201).json({ success: true, user: publicUser(u) });
  }));

  app.patch('/api/users/:id', requireAuth('rbac_manage'), handle(async (req, res) => {
    const u = await store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const { name, email, role, active, password } = req.body || {};
    const isSelf = u.id === req.user.id;
    const losesSuper = u.role === SUPER_ADMIN && ((role !== undefined && role !== SUPER_ADMIN) || active === false);
    if (losesSuper && (await activeSuperAdminCount()) <= 1) {
      return res.status(400).json({ error: 'At least one active Super Admin is required' });
    }
    if (isSelf && (active === false || (role !== undefined && role !== u.role))) {
      return res.status(400).json({ error: 'You cannot disable your own account or change your own role' });
    }

    const changes = [];
    if (name !== undefined) {
      const n = String(name).trim().slice(0, 80);
      if (!n) return res.status(400).json({ error: 'Name cannot be empty' });
      u.name = n; u.avatar = initials(n); changes.push('name');
    }
    if (email !== undefined) {
      const e = String(email).trim().toLowerCase();
      if (!validEmail(e)) return res.status(400).json({ error: 'A valid email is required' });
      const other = await store.findByEmail(e);
      if (other && other.id !== u.id) return res.status(409).json({ error: 'A user with this email already exists' });
      u.email = e; changes.push('email');
    }
    if (role !== undefined && role !== u.role) {
      if (!roles[role]) return res.status(400).json({ error: 'Unknown role' });
      changes.push(`role ${u.role} → ${role}`); u.role = role;
    }
    if (active !== undefined && !!active !== (u.active !== false)) {
      u.active = !!active; changes.push(u.active ? 'enabled' : 'disabled');
      if (!u.active) u.tokenVersion += 1;
    }
    if (password !== undefined && password !== '') {
      const pwErr = validatePassword(password);
      if (pwErr) return res.status(400).json({ error: pwErr });
      u.passwordHash = hashPassword(password);
      u.tokenVersion += 1;
      changes.push('password reset');
    }
    await store.saveUser(u);
    if (changes.length) await audit(req.user, 'user.updated', `${u.email}: ${changes.join(', ')}`, req);
    res.json({ success: true, user: publicUser(u) });
  }));

  app.delete('/api/users/:id', requireAuth('rbac_manage'), handle(async (req, res) => {
    const u = await store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (u.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
    if (u.role === SUPER_ADMIN && u.active !== false && (await activeSuperAdminCount()) <= 1) {
      return res.status(400).json({ error: 'At least one active Super Admin is required' });
    }
    await store.deleteUser(u.id);
    await audit(req.user, 'user.deleted', u.email, req);
    res.json({ success: true });
  }));

  // --- Audit trail -----------------------------------------------------------
  app.get('/api/audit', requireAuth('audit'), handle(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 200, AUDIT_LIMIT);
    res.json(await store.listAudit(limit));
  }));

  // --- Health ----------------------------------------------------------------
  app.get('/api/auth/status', handle(async (req, res) => {
    await ensureReady();
    res.json({ storage: store.kind, ok: true, ...(storageError ? { warning: storageError } : {}) });
  }));
}
