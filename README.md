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
- `/product`, `/track`: product landing page and order tracking.

## Admin sign-in

The operations portal at `/admin/` requires an account. Sign-in is the app's own email + password authentication (`auth.js`). **Supabase Auth is not used.** Supabase is used only as the PostgreSQL database.

- **Storage:** with `DATABASE_URL` set to your Supabase Postgres connection string, accounts, role permissions, login lockouts and the audit trail are stored in Supabase Postgres (`auth-store.js`). The server connects to Postgres directly; the tables `admin_users`, `admin_roles`, `admin_audit` and `admin_login_attempts` are created automatically on first start, with row-level security enabled and no policies, so the public (anon) API key can never read them. Without `DATABASE_URL` (local development) the same data is kept in memory.
- **Passwords** are hashed with scrypt. **Sessions** are signed tokens that expire after 12 hours; every request re-checks the account in the database, so disabling a user or changing a password takes effect immediately on every server instance.
- Every admin API route checks the caller's role permissions on the server. The storefront, shop, product landing page and tracking page stay public; anonymous storefront orders are always created as `New`.
- Five failed sign-ins for the same email and IP lock that pair out for 15 minutes.
- If the database can't be reached, sign-in returns "temporarily unavailable" instead of falling back to default passwords.

### Connecting Supabase Postgres

1. In the Supabase dashboard, open **Connect** and copy the **Transaction pooler** connection string (port 6543), with your database password filled in.
2. In Vercel (Project → Settings → Environment Variables), add `DATABASE_URL` with that value, plus `AUTH_SECRET` (a long random string, e.g. `openssl rand -hex 32`).
3. Optionally add `ADMIN_EMAIL` and `ADMIN_PASSWORD` **before the first deploy** to choose the Super Admin login, and `DISABLE_DEMO_USERS=true` to skip the sample accounts.
4. Redeploy. The first request creates the tables and the accounts.

Accounts are only seeded when `admin_users` is empty. Later, setting `ADMIN_EMAIL`/`ADMIN_PASSWORD` to an email that doesn't exist yet adds it as a new Super Admin (useful for recovering access).

Default accounts (created on first start unless you set the variables above; change them before going live):

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | superadmin@rosaino.com | RosainoSuperAdmin2026! |
| Admin | admin@rosaino.com | RosainoAdmin2026! |
| Operations manager | operations@rosaino.com | OpsManager2026! |
| Confirmation agent | agent@rosaino.com | Agent2026! |
| Finance viewer | finance@rosaino.com | Finance2026! |

### Admin features

- **Team & RBAC** (Super Admin, or any role given `Users & RBAC Control`): create accounts with a temporary password, edit name/email/role, reset passwords, disable/enable or delete accounts, edit the role permission matrix, create and delete custom roles, and preview the workspace as any role. You can't disable or demote yourself, and the last active Super Admin can't be removed.
- **Security & audit**: sign-ins, failed sign-ins, sign-outs, password changes, user and permission changes, order status changes, blacklist edits, remittances, PO receipts and product/CMS saves.
- **My account** (click your profile, or Settings): change password, sign out, sign out on every device.

## Data and security

All customer names and records are fictional. Operations data is still cached in this browser under `rosaino_operations_workspace_v1` and synced to the server API where available.

Still needed for production: tighten the open Supabase RLS policies on `products`, `orders`, `activity` and `suppliers`, which the server writes with the public key; validate webhooks; run order and stock changes as backend transactions; reconcile with carriers; and add real payment flows. API keys must never be stored in this frontend.

## Source

- `dist/index.html`, `dist/style.css`, `dist/app.js`: existing storefront.
- `dist/assets/`: bundled original logo, icon, ribbon, pattern and collection image.
- `dist/admin/index.html`, `demo.css`, `demo.js`: new operations demo.
- `vercel.json`: static deployment configuration.

Validation: JavaScript syntax checked; all 13 page render functions tested; stock reservation, dispatch and return lifecycle, invalid status rejection, quoted CSV parsing, routing and HTML escaping checked. Browser visual QA was unavailable for this static project in the managed preview environment.
