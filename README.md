# Rosaino storefront + operations demo

The existing Rosaino landing page and original bundled assets are preserved. Its footer now links to **Rosaino Admin Demo**, at `/admin/`.

## Run locally

```sh
npm install
npm start
```

Open http://localhost:3000 and use the footer, or visit http://localhost:3000/admin/ and sign in (see **Admin sign-in**).

## GitHub and Vercel

Upload the **extracted contents** of this ZIP to the existing Rosaino repository. Keep the files at the repository root, including `dist/` and `vercel.json`. The included Vercel configuration serves `dist` without a build. If your repository already has a different framework or newer storefront changes, merge `dist/admin/` into its public output and add a footer link to `/admin/`; do not replace unrelated changes.

This export comes from the existing Rosaino Sites source. It preserves that source's preview storefront. It does not incorporate separate, later ZIP-only storefront work that was never committed to the Site.

## Demo scope

- Overview: KPIs, collected revenue by date, order pipeline, pending orders.
- Leads and orders: add, search, filter, detail view, status progression, assignments, notes, callbacks, CSV import and export. For Excel imports, save the sheet as CSV first.
- Call center: per-agent queues, pause/resume, simulated call timer, outcomes, callback dates, notes and call history. No real phone call is placed.
- Routing: product ID, source, city or all-lead matching, percentage allocation, manual assignment, round-robin fallback, paused-agent exclusion.
- Shipping: carrier selection, simulated dispatch, delivered/returned outcomes, preview shipping labels.
- Products and stock: add/edit products, SKU validation, pricing/costs, reservations, stock adjustments, low-stock indicators, activity history.
- Suppliers: supplier records, lead times, stock receipt.
- Finance: COD revenue, delivered product costs, shipping expenses, expense ledger and net contribution. This is not an accounting or payment system.
- Reports: product sales, channel attribution, agent confirmation rates, calls and talk time.
- Stores/media: page records and bundled downloadable brand assets. Page counts are channel totals, not actual page-level attribution.
- Integrations: clearly simulated setup cards for Google Sheets, WooCommerce, Meta Ads, Digylog, OzoneExpress, AMEEX and Supabase.
- Team: sample members and editable role labels. Settings: company/region preferences, demo reset.

## Storefront pages

- `/`: storefront home, with featured products and a **Contact us** section (`#contact`). Messages appear in the portal under **Stores & media → Contact inbox**.
- `/shop`: every category with all of its products. The category menu, the home page's collections link and every footer's **Shop** link open it.
- `/policy`: shipping, cash on delivery, returns, privacy and terms. Linked from the footer.

### Carriers (transporteurs)

In the portal, **Carriers** lets an admin add each delivery company: choose it from the list (Digylog, OzoneExpress, AMEEX, Sendit, Cathedis, Amana or Other), paste the **API URL** and **API key** from the carrier's developer documentation, and click **Test connection**. Carriers without an API can be added as *manual*: you type the tracking number when dispatching.

- **Dispatch:** on **Shipping**, *Dispatch* sends the order (reference, recipient name and phone, city, address, cash-on-delivery amount, product, quantity) to the chosen carrier and stores the tracking number it returns.
- **Status updates:** each carrier gets its own **update link** (webhook). Paste it into the carrier's dashboard and their *picked up / delivered / returned* notifications update the order automatically. *Check carrier updates* also asks carriers that offer a status API.
- Carrier wording is understood in French and English (e.g. *Ramassé*, *En cours*, *Livré*, *Retourné*, *Refusé*, *Non livré*); extra wording can be mapped per carrier.
- **Tracking:** customers can search the tracking page by order number, carrier tracking number or phone, and see the carrier's updates.
- API keys are encrypted with `AUTH_SECRET` and never sent to browsers. Carriers and shipments are stored in Supabase Postgres (`carriers`, `shipments` tables, created automatically) when `DATABASE_URL` is set. Changing `AUTH_SECRET` later means re-entering carrier keys.
- Every carrier's API is different, so connection details (paths, how the key is sent, JSON or form body, field names, where the tracking number and status are in replies) are adjustable under *Connection details*.

### Call center (confirmation calls)

Confirmation agents work from **Call center** (also from the order details and the order list).

- **Phone call** opens the device dialer (`tel:` link). On a computer this needs a linked phone or softphone (e.g. Phone Link, FaceTime, a VoIP app).
- **WhatsApp call** opens the customer's WhatsApp chat; the agent taps the call icon (WhatsApp does not allow websites to start a call by themselves).
- A call panel opens with a running timer. The agent picks the outcome (Confirmed, Callback, No answer, Cancelled, Spam), adds a note, and clicks *End call & save*. The order is updated and the call (agent, channel, start/end time, duration, outcome, notes, transcript) is saved in the `call_logs` table (created automatically when `DATABASE_URL` is set).
- **Transcript (optional):** in Chrome or Edge, *Start transcription* writes the conversation live using the agent's microphone. Put the call on speaker so both voices are captured, and tick the box confirming the customer was told. French, Moroccan Arabic and English are available. The agent can correct the text before saving. Saved transcripts open from *Call history*.
- Recording the audio itself or transcribing without the speaker would need a calling provider such as Twilio; this can be added later.

### Contact form emails (Resend)

Every message sent from the **Contact us** section is emailed through [Resend](https://resend.com) and also listed in the portal's Contact inbox. Replying to the email answers the customer directly. Set these in Vercel (Project → Settings → Environment Variables), never in code:

- `RESEND_API_KEY`: your Resend API key.
- `CONTACT_TO_EMAIL`: where messages go (defaults to boucheikhasofyane@gmail.com).
- `CONTACT_FROM_EMAIL`: optional sender. The default, `onboarding@resend.dev`, only delivers to the email address of your Resend account; verify your own domain in Resend to send from e.g. `hello@yourdomain.com`.

If Resend rejects a message, the customer is told it couldn't be delivered instead of seeing a false confirmation. Without `RESEND_API_KEY`, messages only appear in the portal inbox.
- `/product`, `/track`: product landing page and order tracking.

## Admin sign-in

The operations portal at `/admin/` requires an account. Sign-in is the app's own email + password authentication (`auth.js`). **Supabase Auth is not used.** Supabase is used only as the PostgreSQL database.

- **Storage:** with `DATABASE_URL` set to your Supabase Postgres connection string, accounts, role permissions, login lockouts and the audit trail are stored in Supabase Postgres (`auth-store.js`). The server connects to Postgres directly; the tables `admin_users`, `admin_roles`, `admin_audit` and `admin_login_attempts` are created automatically on first start, with row-level security enabled and no policies, so the public (anon) API key can never read them. Without `DATABASE_URL` (local development) the same data is kept in memory.
- **Passwords** are hashed with scrypt. **Sessions** are signed tokens that expire after 12 hours; every request re-checks the account in the database, so disabling a user or changing a password takes effect immediately on every server instance.
- Every admin API route checks the caller's role permissions on the server. The storefront, shop, product landing page and tracking page stay public; anonymous storefront orders are always created as `New`.
- Five failed sign-ins for the same email and IP lock that pair out for 15 minutes.
- If `DATABASE_URL` is wrong or the database can't be reached at startup, sign-in keeps working with the built-in Super Admin (accounts are then kept in memory), and `/api/auth/status` shows a warning. Set `ADMIN_EMAIL`/`ADMIN_PASSWORD` so that fallback uses your own credentials.
- The server needs Node.js 22 (`engines` in `package.json`, which Vercel follows).
- Setting `ADMIN_EMAIL`/`ADMIN_PASSWORD` retires the default `superadmin@rosaino.com` login (unless you gave it a new password). `?sslmode=require` on `DATABASE_URL` is fine; TLS is handled by the app.

### Connecting Supabase Postgres

1. In the Supabase dashboard, open **Connect** and copy the **Transaction pooler** connection string (port 6543), with your database password filled in.
2. In Vercel (Project → Settings → Environment Variables), add `DATABASE_URL` with that value, plus `AUTH_SECRET` (a long random string, e.g. `openssl rand -hex 32`).
3. Optionally add `ADMIN_EMAIL` and `ADMIN_PASSWORD` **before the first deploy** to choose the Super Admin login.
4. Redeploy. The first request creates the tables and the Super Admin account.
5. Check it: open `https://<your-site>/api/health`. It shows `"database":"connected"` when everything is saved to Supabase, `"not_configured"` when `DATABASE_URL` is missing, or `"unreachable"` with the reason (wrong password, wrong host, paused project…). The portal header and the Overview checklist show the same.

**What is saved in the database:** orders, products and stock, purchase orders, product landing pages, contact messages, the blacklist, uploaded images (table `app_records`), plus sign-in accounts and roles, carriers and shipments, and call logs. Every table has Row Level Security on and no public access; only the app server reads and writes them. Order and stock changes run as database transactions, so two people editing the same order at once don't overwrite each other. Products and orders from the older `products`/`orders` tables are copied over automatically on first start.

If the database is configured but unreachable, the shop catalogue stays visible, but checkouts and changes are refused with a clear message instead of being kept in temporary memory and lost. Without `DATABASE_URL` the app runs on built-in demo data that resets on restart.

If an older version of `supabase-schema.sql` was run in your Supabase project, run the current one once in the SQL Editor: it removes the public read/write access those versions gave to the old `orders` and `products` tables (it does not delete data).

Accounts are only seeded when `admin_users` is empty. Later, setting `ADMIN_EMAIL`/`ADMIN_PASSWORD` to an email that doesn't exist yet adds it as a new Super Admin (useful for recovering access).

Only one account is created: the **Super Admin**. There are no demo or sample accounts; create your team's accounts in the portal under **Team & RBAC**. Sample accounts created by earlier versions (admin@, operations@, agent@, finance@rosaino.com) are disabled automatically on startup.

Default Super Admin login, used only when `ADMIN_EMAIL`/`ADMIN_PASSWORD` are not set on first start. Change it before going live (Settings → Change password):

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | superadmin@rosaino.com | RosainoSuperAdmin2026! |

### Admin features

- **Team & RBAC** (Super Admin, or any role given `Users & RBAC Control`): create accounts with a temporary password, edit name/email/role, reset passwords, disable/enable or delete accounts, edit the role permission matrix, create and delete custom roles, and preview the workspace as any role. You can't disable or demote yourself, and the last active Super Admin can't be removed.
- **Security & audit**: sign-ins, failed sign-ins, sign-outs, password changes, user and permission changes, order status changes, blacklist edits, remittances, PO receipts and product/CMS saves.
- **My account** (click your profile, or Settings): change password, sign out, sign out on every device.

## Data and security

The demo data (used without `DATABASE_URL`) is fictional. The portal keeps a working copy in the browser (`rosaino_operations_workspace_v1`), loads the server's data when it opens, and sends every order and landing-page change back to the server automatically.

Still worth adding for a larger operation: carrier remittance reconciliation against carrier statements, and real online payments. API keys must never be stored in this frontend.

## Source

- `dist/index.html`, `dist/style.css`, `dist/app.js`: existing storefront.
- `dist/assets/`: bundled original logo, icon, ribbon, pattern and collection image.
- `dist/admin/index.html`, `demo.css`, `demo.js`: new operations demo.
- `vercel.json`: static deployment configuration.

Validation: JavaScript syntax checked; all 13 page render functions tested; stock reservation, dispatch and return lifecycle, invalid status rejection, quoted CSV parsing, routing and HTML escaping checked. Browser visual QA was unavailable for this static project in the managed preview environment.
