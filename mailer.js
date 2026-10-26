// Email notifications through Resend (https://resend.com).
//
// Configure in the environment (never in code):
//   RESEND_API_KEY      your Resend API key (re_...)
//   CONTACT_TO_EMAIL    where contact-form messages are delivered
//   CONTACT_FROM_EMAIL  sender; Resend's test sender works until you verify a domain
// This calls Resend's REST API directly (same request the `resend` package makes).

const RESEND_API_URL = process.env.RESEND_API_URL || 'https://api.resend.com';
const DEFAULT_TO = 'boucheikhasofyane@gmail.com';
const DEFAULT_FROM = 'Rosaino <onboarding@resend.dev>';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const emailConfigured = () => !!process.env.RESEND_API_KEY?.trim();

async function sendEmail({ to, subject, html, text, replyTo }) {
  const res = await fetch(`${RESEND_API_URL}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {})
    }),
    signal: AbortSignal.timeout(8000)
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Resend responded with HTTP ${res.status}`);
  return body.id;
}

/** Email a contact-form message to the shop owner. Replying answers the customer. */
export function sendContactNotification(msg) {
  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
  const rows = [
    ['Name', msg.name],
    ['Email', msg.email],
    ['Phone', msg.phone || '—'],
    ['Order', msg.orderId || '—'],
    ['Topic', msg.topic],
    ['Received', new Date(msg.date).toUTCString()]
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;color:#173540;max-width:560px">
      <h2 style="margin:0 0 4px">New message from the Rosaino website</h2>
      <p style="margin:0 0 18px;color:#526b72">Reply to this email to answer ${esc(msg.name)} directly.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#526b72;width:90px">${k}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`).join('')}
      </table>
      <div style="margin-top:18px;padding:16px;background:#f7f6f2;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(msg.message)}</div>
      <p style="margin-top:18px;font-size:12px;color:#7d8f93">Message ${esc(msg.id)} · also listed in the Operations Portal under Stores &amp; media → Contact inbox.</p>
    </div>`;
  const text = `New message from the Rosaino website\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${msg.message}\n\nReply to this email to answer ${msg.name}.`;
  return sendEmail({
    to,
    subject: `[Rosaino] ${msg.topic}${msg.orderId ? ` · ${msg.orderId}` : ''}: ${msg.name}`,
    html,
    text,
    replyTo: `${msg.name.replace(/[<>"]/g, '')} <${msg.email}>`
  });
}
