// Confirmation call log: when agents call leads by phone or WhatsApp, the
// portal records who called, the channel, start/end time, duration, outcome,
// notes and (optionally) the transcript captured in the agent's browser.
// Stored in Supabase Postgres when DATABASE_URL is set, otherwise in memory.
import crypto from 'crypto';
import { getStore, requireAuth } from './auth.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.call_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  agent_id TEXT,
  agent_name TEXT,
  channel TEXT NOT NULL,
  phone TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_sec INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  notes TEXT,
  transcript TEXT,
  transcript_lang TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS call_logs_order_idx ON public.call_logs (order_id);
CREATE INDEX IF NOT EXISTS call_logs_started_idx ON public.call_logs (started_at DESC);
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
`;

export const CALL_OUTCOMES = ['Confirmed', 'Callback', 'No answer', 'Cancelled', 'Spam'];
const CHANNELS = ['phone', 'whatsapp'];

const memory = [];
let schemaReady = null;

async function db() {
  const store = await getStore();
  if (store.kind !== 'postgres') return null;
  if (!schemaReady) schemaReady = store.query(SCHEMA_SQL).catch(err => { schemaReady = null; throw err; });
  await schemaReady;
  return store;
}

const iso = v => (v instanceof Date ? v.toISOString() : v);
const fromRow = r => ({
  id: r.id, orderId: r.order_id, agentId: r.agent_id, agentName: r.agent_name, channel: r.channel, phone: r.phone,
  startedAt: iso(r.started_at), endedAt: iso(r.ended_at), durationSec: r.duration_sec, outcome: r.outcome,
  notes: r.notes || '', transcript: r.transcript || '', transcriptLang: r.transcript_lang || '', createdAt: iso(r.created_at)
});

const fail = (status, message) => Object.assign(new Error(message), { status, expose: true });
const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (!err.expose) console.error('[calls]', err.message);
    res.status(err.status || 500).json({ error: err.expose ? err.message : 'The call could not be saved. Please try again.' });
  }
};

export function registerCallRoutes(app) {
  app.post('/api/calls', requireAuth('calls', 'orders'), wrap(async (req, res) => {
    const b = req.body || {};
    const orderId = String(b.orderId || '').trim().slice(0, 40);
    if (!orderId) throw fail(400, 'Order is required.');
    const channel = CHANNELS.includes(b.channel) ? b.channel : null;
    if (!channel) throw fail(400, 'Channel must be phone or whatsapp.');
    const outcome = CALL_OUTCOMES.includes(b.outcome) ? b.outcome : null;
    if (!outcome) throw fail(400, 'Choose a call outcome.');
    const started = new Date(b.startedAt);
    const ended = new Date(b.endedAt || Date.now());
    if (Number.isNaN(started.getTime()) || Number.isNaN(ended.getTime()) || ended < started) throw fail(400, 'Invalid call times.');
    // Clamp to sensible bounds (no more than 4 hours, not in the future).
    const durationSec = Math.min(4 * 3600, Math.max(0, Math.round((ended - started) / 1000)));

    const log = {
      id: 'call_' + crypto.randomBytes(6).toString('hex'),
      orderId,
      agentId: req.user.id,
      agentName: req.user.name,
      channel,
      phone: String(b.phone || '').slice(0, 30),
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      durationSec,
      outcome,
      notes: String(b.notes || '').slice(0, 2000),
      transcript: String(b.transcript || '').slice(0, 20000),
      transcriptLang: String(b.transcriptLang || '').slice(0, 10),
      createdAt: new Date().toISOString()
    };

    const s = await db();
    if (!s) {
      memory.unshift(log);
      memory.length = Math.min(memory.length, 2000);
    } else {
      await s.query(
        `INSERT INTO call_logs (id, order_id, agent_id, agent_name, channel, phone, started_at, ended_at, duration_sec, outcome, notes, transcript, transcript_lang, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [log.id, log.orderId, log.agentId, log.agentName, log.channel, log.phone, log.startedAt, log.endedAt, log.durationSec,
          log.outcome, log.notes, log.transcript, log.transcriptLang, log.createdAt]
      );
    }
    res.status(201).json({ success: true, call: log });
  }));

  app.get('/api/calls', requireAuth('calls', 'orders', 'reports'), wrap(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const orderId = req.query.orderId ? String(req.query.orderId) : null;
    const s = await db();
    if (!s) {
      return res.json(memory.filter(c => !orderId || c.orderId === orderId).slice(0, limit));
    }
    const rows = orderId
      ? (await s.query('SELECT * FROM call_logs WHERE order_id = $1 ORDER BY started_at DESC LIMIT $2', [orderId, limit])).rows
      : (await s.query('SELECT * FROM call_logs ORDER BY started_at DESC LIMIT $1', [limit])).rows;
    res.json(rows.map(fromRow));
  }));
}
