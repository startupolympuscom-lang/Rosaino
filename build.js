import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const distAdminDir = path.join(distDir, 'admin');
const distAssetsDir = path.join(distDir, 'assets');

// Ensure directories exist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(distAdminDir, { recursive: true });
fs.mkdirSync(distAssetsDir, { recursive: true });

// Copy storefront files
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(distDir, 'style.css'));
fs.copyFileSync(path.join(__dirname, 'app.js'), path.join(distDir, 'app.js'));
if (fs.existsSync(path.join(__dirname, 'track.html'))) {
  fs.copyFileSync(path.join(__dirname, 'track.html'), path.join(distDir, 'track.html'));
}
if (fs.existsSync(path.join(__dirname, 'product.html'))) {
  fs.copyFileSync(path.join(__dirname, 'product.html'), path.join(distDir, 'product.html'));
}

// Copy admin demo files
fs.copyFileSync(path.join(__dirname, 'admin', 'index.html'), path.join(distAdminDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'admin', 'demo.css'), path.join(distAdminDir, 'demo.css'));
fs.copyFileSync(path.join(__dirname, 'admin', 'demo.js'), path.join(distAdminDir, 'demo.js'));

// Copy asset files
const assets = ['collection.png', 'icon.png', 'logo.png', 'pattern.png', 'ribbon.png'];
for (const asset of assets) {
  const src = path.join(__dirname, 'assets', asset);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distAssetsDir, asset));
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

console.log('Build completed successfully. Artifacts created in dist/');
