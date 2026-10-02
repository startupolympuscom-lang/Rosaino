import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const distAdminDir = path.join(distDir, 'admin');
const distAssetsDir = path.join(distDir, 'assets');
const distProductDir = path.join(distDir, 'product');
const distTrackDir = path.join(distDir, 'track');
const distPDir = path.join(distDir, 'p');

// Ensure all output directories exist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(distAdminDir, { recursive: true });
fs.mkdirSync(distAssetsDir, { recursive: true });
fs.mkdirSync(distProductDir, { recursive: true });
fs.mkdirSync(distTrackDir, { recursive: true });
fs.mkdirSync(distPDir, { recursive: true });

// Copy storefront files
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(distDir, 'style.css'));
fs.copyFileSync(path.join(__dirname, 'app.js'), path.join(distDir, 'app.js'));
if (fs.existsSync(path.join(__dirname, 'demo.css'))) {
  fs.copyFileSync(path.join(__dirname, 'demo.css'), path.join(distDir, 'demo.css'));
}
if (fs.existsSync(path.join(__dirname, 'demo.js'))) {
  fs.copyFileSync(path.join(__dirname, 'demo.js'), path.join(distDir, 'demo.js'));
}

// Copy public track portal (both as file and folder index for trailingSlash tolerance)
if (fs.existsSync(path.join(__dirname, 'track.html'))) {
  fs.copyFileSync(path.join(__dirname, 'track.html'), path.join(distDir, 'track.html'));
  fs.copyFileSync(path.join(__dirname, 'track.html'), path.join(distTrackDir, 'index.html'));
}

// Copy policies page
if (fs.existsSync(path.join(__dirname, 'policy.html'))) {
  fs.mkdirSync(path.join(distDir, 'policy'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'policy.html'), path.join(distDir, 'policy.html'));
  fs.copyFileSync(path.join(__dirname, 'policy.html'), path.join(distDir, 'policy', 'index.html'));
}

// Copy dedicated product landing page (both as file and folder index for trailingSlash tolerance)
if (fs.existsSync(path.join(__dirname, 'product.html'))) {
  fs.copyFileSync(path.join(__dirname, 'product.html'), path.join(distDir, 'product.html'));
  fs.copyFileSync(path.join(__dirname, 'product.html'), path.join(distProductDir, 'index.html'));
  fs.copyFileSync(path.join(__dirname, 'product.html'), path.join(distPDir, 'index.html'));
}

// Copy admin demo files
fs.copyFileSync(path.join(__dirname, 'admin', 'index.html'), path.join(distAdminDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'admin', 'demo.css'), path.join(distAdminDir, 'demo.css'));
fs.copyFileSync(path.join(__dirname, 'admin', 'demo.js'), path.join(distAdminDir, 'demo.js'));

// Copy asset files (both into dist/assets and root of dist)
const assets = ['collection.png', 'icon.png', 'logo.png', 'pattern.png', 'ribbon.png'];
for (const asset of assets) {
  const src = path.join(__dirname, 'assets', asset);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distAssetsDir, asset));
    fs.copyFileSync(src, path.join(distDir, asset));
  } else if (fs.existsSync(path.join(__dirname, asset))) {
    fs.copyFileSync(path.join(__dirname, asset), path.join(distAssetsDir, asset));
    fs.copyFileSync(path.join(__dirname, asset), path.join(distDir, asset));
  }
}

// Copy uploads if exist
const uploadsSrc = path.join(__dirname, 'assets', 'uploads');
const distUploads = path.join(distAssetsDir, 'uploads');
fs.mkdirSync(distUploads, { recursive: true });
if (fs.existsSync(uploadsSrc)) {
  const files = fs.readdirSync(uploadsSrc);
  for (const f of files) {
    fs.copyFileSync(path.join(uploadsSrc, f), path.join(distUploads, f));
  }
}

console.log('Build completed successfully. Artifacts created in dist/ for Storefront, Landing Page, and Admin Dashboard.');
