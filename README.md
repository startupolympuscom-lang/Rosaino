# Rosaino storefront + operations demo

The existing Rosaino landing page and original bundled assets are preserved. Its footer now links to **Rosaino Admin Demo**, at `/admin/`.

## Run locally

No dependency install or build step is required:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 and use the footer, or visit http://localhost:8000/admin/.

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

## Data and security

All customer names and records are fictional. Changes are saved in this browser under `rosaino-operations-demo-v1`. Reset restores sample data and does not affect the storefront bag.

**There is no admin authentication or authorization in this demo.** The footer link is navigable by anyone who can visit the site. Do not enter real customer records or secrets. Role selection is illustrative and grants no protection.

Before production, implement Supabase Auth, an administrator membership table, row-level security for every table, server-side integration secrets, validated webhooks and backend order/stock transactions. Create a data repository layer to replace the demo's local storage functions. Add server-side import validation and audit logging, carrier reconciliation and real payment flows. API keys must never be stored in this frontend.

## Source

- `dist/index.html`, `dist/style.css`, `dist/app.js`: existing storefront.
- `dist/assets/`: bundled original logo, icon, ribbon, pattern and collection image.
- `dist/admin/index.html`, `demo.css`, `demo.js`: new operations demo.
- `vercel.json`: static deployment configuration.

Validation: JavaScript syntax checked; all 13 page render functions tested; stock reservation, dispatch and return lifecycle, invalid status rejection, quoted CSV parsing, routing and HTML escaping checked. Browser visual QA was unavailable for this static project in the managed preview environment.
