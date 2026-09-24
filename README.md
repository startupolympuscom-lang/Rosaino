# Rosaino — GitHub & Vercel export

Complete editable static storefront, exported from the Rosaino Site on 24 September 2026.

## Upload to GitHub

1. Extract this ZIP on your computer.
2. Open your GitHub repository and choose Add file → Upload files.
3. Upload the extracted CONTENTS so `vercel.json`, `README.md`, and `public/` are at the repository root. Do not upload only the ZIP or add an extra enclosing folder.
4. Commit the files.

## Deploy to Vercel

1. Create a new Vercel project and import that GitHub repository.
2. Use framework preset **Other** and the repository root as Root Directory.
3. The included `vercel.json` sets the output directory to `public` and skips installation and build commands. No environment variables or package installation are needed.
4. Deploy. Later GitHub commits can trigger new deployments.

Vercel documentation: https://vercel.com/docs/builds/configure-a-build
Configuration reference: https://vercel.com/docs/project-configuration/vercel-json

## Files

- `public/index.html`: complete page markup and metadata.
- `public/style.css`: responsive layout, typography, colour palette and graphic treatment.
- `public/app.js`: editable product data, search, collection filters, product dialogs and shopping bag.
- `public/assets/`: every image used by the site, including the original logo, brand icon, collection image, ribbon and modular pattern.
- `brand-reference/`: approved identity board and merchandise reference, outside the public deployment folder.
- `vercel.json`: static deployment configuration.

All website images are bundled locally. Product and category visuals use CSS crops of the supplied collection mockup (`collection.png`), exactly as in the current site. They are not separate high-resolution product photographs. The original raster brand elements are included; editable vector masters are not part of this website.

The CSS loads Outfit and DM Sans through Google Fonts, with system-font fallbacks. Fonts require internet access; no image depends on an external service. The charter names Rosaino Display and Rosaino Sans, but no font binaries were supplied; these are the website's existing substitute families.

## Preview locally

Run `python3 -m http.server 8000 --directory public` from this folder, then open http://localhost:8000 in your browser.

## Editing

Change products, categories, indicative USD prices and descriptions in `public/app.js`. Update copy in `public/index.html` and visual styling in `public/style.css`.

## Current functionality and limits

This is the full current static storefront, not a production commerce backend. Search, filters, detail dialogs, bag quantities and removal work in the browser. The bag is saved on the visitor's device using localStorage.

Products and prices are illustrative. No payment processing, checkout, orders, inventory management, customer accounts, delivery integrations, tax calculation or administration backend is connected. The interface makes the preview status explicit.

The Sites owner-only access gate is provided by the original hosting service and is not part of this portable source. Review the Vercel project's access settings before sharing its URL.

No API keys, credentials, original Git history or Sites-specific hosting metadata are included.
