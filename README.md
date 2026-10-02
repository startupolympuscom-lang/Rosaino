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

- `/`: storefront, with a **Contact us** section (`#contact`). Messages appear in the portal under **Stores & media → Contact inbox**.
- `/policy`: shipping, cash on delivery, returns, privacy and terms. Linked from the footer.
- `/product`, `/track`: product landing page and order tracking.

## Admin sign-in

The operations portal at `/admin/` requires an account. Sign-in is simple email + password auth handled entirely by this app's server (`auth.js`). It does not use Supabase Auth or any external provider.

- Passwords are hashed with scrypt; sessions are HMAC-signed tokens that expire after 12 hours and work on Vercel without a session store.
- Every admin API route checks the caller's role permissions on the server. The storefront, product landing page and tracking page stay public; anonymous storefront orders are always created as `New`.
- Five failed sign-ins for the same email and IP lock that pair out for 15 minutes.

Default accounts (change these before going live):

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | superadmin@rosaino.com | RosainoSuperAdmin2026! |
| Admin | admin@rosaino.com | RosainoAdmin2026! |
| Operations manager | operations@rosaino.com | OpsManager2026! |
| Confirmation agent | agent@rosaino.com | Agent2026! |
| Finance viewer | finance@rosaino.com | Finance2026! |

Production environment variables (see `.env.example`):

- `AUTH_SECRET`: long random string that signs sessions. Required in production.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: replace the default Super Admin login.
- `DISABLE_DEMO_USERS=true`: remove the four sample accounts.

The Super Admin and sample accounts always come from `auth.js` and these variables, so they work on every restart. Accounts, role changes and audit entries you add in the portal are kept in server memory, so they reset when the server restarts or Vercel starts a new instance. Put permanent accounts in `auth.js` or the environment variables.

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
