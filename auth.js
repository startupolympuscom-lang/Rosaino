// Simple, stateless admin authentication for the Rosaino operations portal.
//
// - Passwords are hashed with scrypt (never stored or returned in plain text).
// - Sessions are HMAC-signed tokens, so they keep working across serverless
//   instances (Vercel) without a shared session store.
// - Role permissions are enforced on the server for every admin API route.
// - No external auth provider (no Supabase Auth): accounts are defined here
//   and in environment variables; users, roles and the audit trail live in
//   server memory.
import crypto from 'crypto';

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
// Users and roles
// ---------------------------------------------------------------------------
const initials = name => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

function seedUsers() {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  const demoUsersEnabled = process.env.DISABLE_DEMO_USERS !== 'true';

  const seeds = [
    { id: 'usr_superadmin', name: 'Rosaino Super Admin', email: envEmail || 'superadmin@rosaino.com', password: envPassword || 'RosainoSuperAdmin2026!', role: SUPER_ADMIN }
  ];
  if (demoUsersEnabled) {
    seeds.push(
      { id: 'usr_admin', name: 'Operations Admin', email: 'admin@rosaino.com', password: 'RosainoAdmin2026!', role: 'Admin' },
      { id: 'usr_ops', name: 'Lina Benali', email: 'operations@rosaino.com', password: 'OpsManager2026!', role: 'Operations manager' },
      { id: 'usr_agent', name: 'Sara Amrani', email: 'agent@rosaino.com', password: 'Agent2026!', role: 'Confirmation agent' },
      { id: 'usr_finance', name: 'Tariq Mansouri', email: 'finance@rosaino.com', password: 'Finance2026!', role: 'Finance viewer' }
    );
  }
  if (!envPassword) {
    console.warn('[auth] ADMIN_PASSWORD is not set; the default demo Super Admin password is active. Set ADMIN_EMAIL/ADMIN_PASSWORD in production.');
  }

  const now = new Date().toISOString();
  return new Map(seeds.map(({ password, ...u }) => [u.id, {
    ...u,
    avatar: initials(u.name),
    active: true,
    passwordHash: hashPassword(password),
    tokenVersion: 1,
    createdAt: now,
    lastLoginAt: null
  }]));
}

const users = seedUsers();
let roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
const auditLog = [];
const failedLogins = new Map();

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

const findByEmail = email => [...users.values()].find(u => u.email.toLowerCase() === String(email || '').trim().toLowerCase());
const activeSuperAdmins = () => [...users.values()].filter(u => u.active !== false && u.role === SUPER_ADMIN);

export function audit(actor, action, detail = '', req = null) {
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor: actor ? (typeof actor === 'string' ? actor : actor.email) : 'anonymous',
    action,
    detail,
    ip: req ? clientIp(req) : ''
  };
  auditLog.unshift(entry);
  auditLog.length = Math.min(auditLog.length, 500);
  return entry;
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

function verifyToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || data.exp < Date.now()) return null;
    const u = users.get(data.sub);
    if (!u || u.active === false || u.tokenVersion !== data.ver) return null;
    return u;
  } catch {
    return null;
  }
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/** Attach req.user when a valid token is present; never rejects. */
export function optionalAuth(req, res, next) {
  req.user = verifyToken(bearer(req));
  next();
}

/** Require a signed-in user holding at least one of the given permissions. */
export function requireAuth(...perms) {
  return (req, res, next) => {
      const u = verifyToken(bearer(req));
    if (!u) return res.status(401).json({ error: 'Authentication required' });
    if (perms.length && !perms.some(p => can(u, p))) {
      return res.status(403).json({ error: `Your role (${u.role}) is not allowed to perform this action` });
    }
    req.user = u;
    next();
  };
}

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
  app.post('/api/auth/login', (req, res) => {
      const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const key = `${clientIp(req)}|${email}`;
    const attempt = failedLogins.get(key);
    if (attempt && attempt.count >= MAX_FAILED_LOGINS && Date.now() - attempt.first < LOCKOUT_MS) {
      const minutes = Math.ceil((LOCKOUT_MS - (Date.now() - attempt.first)) / 60000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutes} minute(s).` });
    }

    const u = findByEmail(email);
    if (!u || !verifyPassword(password, u.passwordHash) || u.active === false) {
      const fresh = !attempt || Date.now() - attempt.first >= LOCKOUT_MS;
      failedLogins.set(key, fresh ? { count: 1, first: Date.now() } : { ...attempt, count: attempt.count + 1 });
      audit(email, 'login.failed', u && u.active === false ? 'Account disabled' : 'Invalid credentials', req);
      return res.status(401).json({ error: u && u.active === false ? 'This account has been disabled' : 'Invalid email or password' });
    }

    failedLogins.delete(key);
    u.lastLoginAt = new Date().toISOString();
    audit(u, 'login', '', req);
    return res.json({ success: true, ...issueToken(u), ...sessionPayload(u) });
  });

  app.get('/api/auth/me', requireAuth(), (req, res) => {
    res.json({ authenticated: true, ...sessionPayload(req.user) });
  });

  app.post('/api/auth/logout', optionalAuth, (req, res) => {
    if (req.user) audit(req.user, 'logout', '', req);
    res.json({ success: true });
  });

  // Invalidate every token for the current user (all devices).
  app.post('/api/auth/logout-all', requireAuth(), (req, res) => {
    req.user.tokenVersion += 1;
    audit(req.user, 'logout.all', 'All sessions revoked', req);
    res.json({ success: true });
  });

  app.post('/api/auth/change-password', requireAuth(), (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!verifyPassword(currentPassword || '', req.user.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const err = validatePassword(newPassword);
    if (err) return res.status(400).json({ error: err });
    req.user.passwordHash = hashPassword(newPassword);
    req.user.tokenVersion += 1; // sign out other devices
    audit(req.user, 'password.changed', '', req);
    res.json({ success: true, ...issueToken(req.user), ...sessionPayload(req.user) });
  });

  // --- Roles & permissions ---------------------------------------------------
  app.get('/api/roles', requireAuth(), (req, res) => {
    res.json({ roles, permissions: PERMISSIONS });
  });

  app.put('/api/roles', requireAuth('rbac_manage'), (req, res) => {
    if (req.body?.reset) {
      const removed = Object.keys(roles).filter(r => !DEFAULT_ROLES[r]);
      const inUse = removed.filter(r => [...users.values()].some(u => u.role === r));
      if (inUse.length) return res.status(400).json({ error: `Reassign users before resetting; custom role(s) in use: ${inUse.join(', ')}` });
      roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
      audit(req.user, 'roles.reset', 'Permissions reset to defaults', req);
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
    const inUse = removed.filter(r => [...users.values()].some(u => u.role === r));
    if (inUse.length) return res.status(400).json({ error: `Cannot delete role(s) still assigned to users: ${inUse.join(', ')}` });

    const changes = Object.keys(next).filter(r => JSON.stringify(next[r]) !== JSON.stringify(roles[r]));
    roles = next;
    audit(req.user, 'roles.updated', [changes.length ? `Changed: ${changes.join(', ')}` : '', removed.length ? `Removed: ${removed.join(', ')}` : ''].filter(Boolean).join(' · '), req);
    res.json({ success: true, roles });
  });

  // --- User management -------------------------------------------------------
  app.get('/api/users', requireAuth(), (req, res) => {
    res.json([...users.values()].map(publicUser));
  });

  app.post('/api/users', requireAuth('rbac_manage'), (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const email = String(req.body?.email || '').trim().toLowerCase();
    const role = String(req.body?.role || '');
    const password = req.body?.password;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!validEmail(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (findByEmail(email)) return res.status(409).json({ error: 'A user with this email already exists' });
    if (!roles[role]) return res.status(400).json({ error: 'Unknown role' });
    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const u = {
      id: 'usr_' + crypto.randomBytes(6).toString('hex'),
      name, email, role,
      avatar: initials(name),
      active: true,
      passwordHash: hashPassword(password),
      tokenVersion: 1,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };
    users.set(u.id, u);
    audit(req.user, 'user.created', `${email} (${role})`, req);
    res.status(201).json({ success: true, user: publicUser(u) });
  });

  app.patch('/api/users/:id', requireAuth('rbac_manage'), (req, res) => {
    const u = users.get(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const { name, email, role, active, password } = req.body || {};
    const isSelf = u.id === req.user.id;
    const losesSuper = u.role === SUPER_ADMIN && ((role !== undefined && role !== SUPER_ADMIN) || active === false);
    if (losesSuper && activeSuperAdmins().length <= 1) {
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
      const other = findByEmail(e);
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
    if (changes.length) audit(req.user, 'user.updated', `${u.email}: ${changes.join(', ')}`, req);
    res.json({ success: true, user: publicUser(u) });
  });

  app.delete('/api/users/:id', requireAuth('rbac_manage'), (req, res) => {
    const u = users.get(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (u.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
    if (u.role === SUPER_ADMIN && u.active !== false && activeSuperAdmins().length <= 1) {
      return res.status(400).json({ error: 'At least one active Super Admin is required' });
    }
    users.delete(u.id);
    audit(req.user, 'user.deleted', u.email, req);
    res.json({ success: true });
  });

  // --- Audit trail -----------------------------------------------------------
  app.get('/api/audit', requireAuth('audit'), (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    res.json(auditLog.slice(0, limit));
  });
}
