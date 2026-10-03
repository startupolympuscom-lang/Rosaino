// Rosaino Storefront Client
const STORAGE_KEY = 'rosaino-operations-demo-v1';
const BAG_KEY = 'rosaino-bag';

const cats = ['Home & Living', 'Electronics', 'Fashion', 'Beauty & Care', 'Sports & Outdoors', 'Kids & Toys'];
const positions = [6.73, 23.8, 41.1, 58.4, 76.5, 93.3];

// Initial seed products in case store opens before admin initialized
const seedProducts = [
  { id: 'p1', name: 'Wireless Headphones', sku: 'ROS-TECH-01', category: 'Electronics', price: 490, cost: 210, stock: 90, supplier: 'Atlas Trading', desc: 'A softer soundtrack for your day. A clean, over-ear silhouette in a warm neutral finish.', x: 7.05, y: 96.2, type: 'product' },
  { id: 'p2', name: 'Everyday Tote', sku: 'ROS-FASH-02', category: 'Fashion', price: 240, cost: 75, stock: 145, supplier: 'Casablanca Textiles', desc: 'Your daily carry, with a little Rosaino colour. A roomy tote featuring our signature flowing ribbon.', x: 31.8, y: 96.2, type: 'product' },
  { id: 'p3', name: 'Ceramic Table Lamp', sku: 'ROS-HOME-03', category: 'Home & Living', price: 390, cost: 160, stock: 12, supplier: 'Atlas Trading', desc: 'A warm corner starts here. A sculptural ceramic silhouette to bring a little calm to your space.', x: 56.45, y: 96.2, type: 'product' },
  { id: 'p4', name: 'Insulated Bottle', sku: 'ROS-LIFE-04', category: 'Sports & Outdoors', price: 220, cost: 80, stock: 68, supplier: 'Atlas Trading', desc: 'A companion for your everyday adventures. Rosaino midnight, finished with our colourful ribbon icon.', x: 81.05, y: 96.2, type: 'product' },
  { id: 'p5', name: 'Daily Care Edit', sku: 'ROS-CARE-05', category: 'Beauty & Care', price: 320, cost: 130, stock: 9, supplier: 'Care Collective', desc: 'An introduction to everyday care, with a coordinated collection for your daily routine.', x: 58.4, y: 65.3, type: 'category' },
  { id: 'p6', name: 'Little Discoveries Set', sku: 'ROS-KIDS-06', category: 'Kids & Toys', price: 290, cost: 100, stock: 44, supplier: 'Care Collective', desc: 'A playful collection of soft textures and colourful shapes for a world of little discoveries.', x: 93.3, y: 65.3, type: 'category' }
];

let db = null;
let products = [];
let category = 'All';
let query = '';
let cart = {};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n);

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      db = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading db', e);
  }

  if (!db || !Array.isArray(db.products) || db.products.length === 0) {
    // If db doesn't exist yet, initialize it
    db = {
      products: seedProducts,
      orders: [],
      activity: [],
      suppliers: [
        { id: 's1', name: 'Atlas Trading', contact: 'atlas@example.test', city: 'Casablanca', lead: 5 },
        { id: 's2', name: 'Casablanca Textiles', contact: 'textiles@example.test', city: 'Casablanca', lead: 7 },
        { id: 's3', name: 'Care Collective', contact: 'care@example.test', city: 'Rabat', lead: 4 }
      ],
      agents: [
        { id: 'a0', name: 'Rosaino Super Admin', email: 'superadmin@rosaino.com', role: 'Super Admin', status: 'Available' },
        { id: 'a1', name: 'Sara Amrani', email: 'sara@rosaino.com', role: 'Confirmation agent', status: 'Available' },
        { id: 'a2', name: 'Youssef Idrissi', email: 'youssef@rosaino.com', role: 'Confirmation agent', status: 'Available' },
        { id: 'a3', name: 'Lina Benali', email: 'lina@rosaino.com', role: 'Operations manager', status: 'Paused' },
        { id: 'a4', name: 'Tariq Mansouri', email: 'tariq@rosaino.com', role: 'Finance viewer', status: 'Available' }
      ],
      currentUser: { id: 'a0', name: 'Rosaino Super Admin', email: 'superadmin@rosaino.com', role: 'Super Admin' },
      roles: {
        'Super Admin': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'suppliers', 'finance', 'reports', 'stores', 'integrations', 'team', 'rbac_manage', 'settings'],
        'Admin': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'suppliers', 'finance', 'reports', 'stores', 'integrations', 'team', 'settings'],
        'Operations manager': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'suppliers', 'stores'],
        'Confirmation agent': ['calls'],
        'Finance viewer': ['overview', 'finance', 'reports']
      },
      expenses: [],
      calls: [],
      rules: [],
      connections: {},
      settings: { company: 'Rosaino', currency: 'MAD', region: 'Morocco' },
      pages: []
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {}
  }

  products = db.products;
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving db', e);
  }
}

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem(BAG_KEY) || '{}');
    if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
    for (const k of Object.keys(cart)) {
      if (!products.some(p => String(p.id) === String(k)) || !Number.isInteger(cart[k]) || cart[k] < 1) {
        delete cart[k];
      }
    }
  } catch {
    cart = {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(BAG_KEY, JSON.stringify(cart));
  } catch {}
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  const badge = $('#bag-count');
  if (badge) badge.textContent = total;
}

// Calculate reserved & available stock
function getStockInfo(p) {
  const reserved = (db?.orders || [])
    .filter(o => String(o.product) === String(p.id) && o.status === 'Confirmed')
    .reduce((s, o) => s + (Number(o.quantity) || 0), 0);
  const onHand = Number(p.stock) || 0;
  const available = Math.max(0, onHand - reserved);
  return { onHand, reserved, available };
}

// Photo styling helper
function photoStyle(p) {
  if (p.x !== undefined && p.y !== undefined) {
    return `background-position:${p.x}% ${p.y}%;${p.type === 'category' ? 'background-size:714.42% auto;' : ''}`;
  }
  // Fallback for new products added via admin
  const idx = cats.indexOf(p.category);
  const posX = idx >= 0 ? positions[idx] : 50;
  return `background-position:${posX}% 65.3%;background-size:714.42% auto;`;
}

// Category helpers. The shop page (/shop) lists every category with its products.
const isShopPage = () => !!$('#shop-catalog');
const slug = c => String(c).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const categoryHref = c => (isShopPage() ? '' : '/shop') + '#' + slug(c);
// Known categories first, then any new category created in the admin portal
const allCategories = () => [...cats, ...[...new Set(products.map(p => p.category))].filter(c => c && !cats.includes(c))];
const categoryPhoto = c => {
  const i = cats.indexOf(c);
  return `background-position:${i >= 0 ? positions[i] : 50}% 65.3%`;
};

// Initialize navigation
function initNav() {
  const nav = $('#nav');
  if (nav) {
    nav.innerHTML = `<a href="/shop" class="${isShopPage() ? 'active' : ''}">Shop all</a>` +
      allCategories().map(c => `<a href="${categoryHref(c)}">${esc(c)}</a>`).join('');
  }

  const catGrid = $('#categories');
  if (catGrid) {
    catGrid.innerHTML = allCategories().map(c => {
      const count = products.filter(p => p.category === c).length;
      return `<a class="category" href="${categoryHref(c)}">
        <div class="category-photo" role="img" aria-label="${esc(c)} collection" style="${categoryPhoto(c)}"></div>
        <div class="category-label"><span>${esc(c)}<small>${count} ${count === 1 ? 'product' : 'products'}</small></span><span aria-hidden="true">↗</span></div>
      </a>`;
    }).join('');
  }
}

// Product card shared by the home page and the shop page
function productCard(p) {
  const { available } = getStockInfo(p);
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available < 15;

  return `
    <article class="product ${isOutOfStock ? 'out-of-stock' : ''}">
      <div class="product-visual">
        ${isOutOfStock ? '<span class="stock-badge out-of-stock">Out of stock</span>' : isLowStock ? `<span class="stock-badge low-stock">Only ${available} left</span>` : ''}
        <a href="/product?id=${esc(p.id)}" class="product-open" aria-label="View ${esc(p.name)} dedicated landing page">
          <div class="product-photo" role="img" aria-label="${esc(p.name)}" style="${photoStyle(p)}"></div>
        </a>
        <button class="add-button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to bag" ${isOutOfStock ? 'disabled title="Out of stock"' : ''}>
          ${isOutOfStock ? '✕' : '+'}
        </button>
      </div>
      <div class="product-meta">
        <div>
          <a href="/product?id=${esc(p.id)}" style="padding:0;text-align:left;color:inherit;text-decoration:none;display:block;">
            <h3>${esc(p.name)}</h3>
          </a>
          <p>${esc(p.category)} · <small>${isOutOfStock ? 'Out of stock' : available + ' available'}</small></p>
        </div>
        <span class="price">${money(p.price)}</span>
      </div>
      <div class="product-landing-row">
        <a href="/product?id=${esc(p.id)}" class="btn-product-landing" aria-label="Open dedicated landing page and order ${esc(p.name)}">
          <span>View Landing Page & Order</span>
          <span class="landing-arrow">➔</span>
        </a>
      </div>
      <div class="swatches" aria-hidden="true"><i></i><i></i><i></i></div>
    </article>
  `;
}

const matchesQuery = p => `${p.name} ${p.category} ${p.sku || ''} ${p.desc || ''}`.toLowerCase().includes(query);

// Shop page: every category with all of its products
function renderShop() {
  const catalog = $('#shop-catalog');
  const sections = allCategories().map(c => {
    const items = products.filter(p => p.category === c && matchesQuery(p));
    if (query && !items.length) return '';
    return `
      <section class="shop-category" id="${slug(c)}" aria-labelledby="${slug(c)}-title">
        <div class="shop-category-head">
          <div class="shop-category-photo category-photo" role="img" aria-label="${esc(c)} collection" style="${categoryPhoto(c)}"></div>
          <div>
            <span class="eyebrow">COLLECTION</span>
            <h2 id="${slug(c)}-title">${esc(c)}</h2>
            <p>${items.length} ${items.length === 1 ? 'product' : 'products'}</p>
          </div>
          <a href="#top" class="text-button">Back to top ↑</a>
        </div>
        ${items.length
          ? `<div class="products">${items.map(productCard).join('')}</div>`
          : '<p class="shop-empty">New pieces are coming to this collection soon.</p>'}
      </section>
    `;
  }).join('');

  catalog.innerHTML = sections || `
    <div class="empty">
      <h3>No discoveries found</h3>
      <p>No products match "${esc(query)}". Try a different keyword.</p>
      <button class="primary" style="margin-top:16px;" data-category="All">Show all products ↗</button>
    </div>
  `;

  const total = products.filter(matchesQuery).length;
  const results = $('#results');
  if (results) results.textContent = `${total} ${total === 1 ? 'product' : 'products'} · ${allCategories().length} collections`;
}

// Render product catalog
function render() {
  loadDb();
  if (isShopPage()) {
    initNav();
    renderShop();
    return;
  }
  const list = products.filter(p => (category === 'All' || p.category === category) && matchesQuery(p));

  const productContainer = $('#products');
  if (productContainer) {
    if (list.length) {
      productContainer.innerHTML = list.map(productCard).join('');
    } else {
      productContainer.innerHTML = `
        <div class="empty">
          <h3>No discoveries found</h3>
          <p>No products match "${esc(query || category)}". Explore all collections or try a different keyword.</p>
          <button class="primary" style="margin-top:16px;" data-category="All">View all collections ↗</button>
        </div>
      `;
    }
  }

  const results = $('#results');
  if (results) results.textContent = `${list.length} discoveries · MAD`;

  const activeFilter = $('#active-filter');
  if (activeFilter) activeFilter.textContent = category === 'All' ? 'All collections' : category;

  const productTitle = $('#product-title');
  if (productTitle) {
    productTitle.textContent = query ? `Search: "${query}"` : (category === 'All' ? 'Everyday favourites.' : `${category}.`);
  }

}

function filterCategory(c) {
  if (!isShopPage() && c !== 'All') {
    location.href = categoryHref(c);
    return;
  }
  category = 'All';
  query = '';
  const searchInput = $('#search');
  if (searchInput) searchInput.value = '';
  render();
  const target = c === 'All' ? ($('#shop-catalog') || $('#shop')) : document.getElementById(slug(c));
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2400);
}

function addToBag(id) {
  loadDb();
  const p = products.find(p => String(p.id) === String(id));
  if (!p) return;
  const { available } = getStockInfo(p);
  const currentInCart = cart[p.id] || 0;

  if (available <= 0) {
    toast(`${p.name} is currently out of stock.`);
    return;
  }
  if (currentInCart >= available) {
    toast(`Only ${available} available in stock.`);
    return;
  }

  cart[p.id] = Math.min(currentInCart + 1, available);
  saveCart();
  toast(`Added ${p.name} to bag`);

  const bagDialog = $('#bag');
  if (bagDialog && bagDialog.open) {
    renderBag();
  }
}

function showDetail(id) {
  loadDb();
  const p = products.find(p => String(p.id) === String(id));
  if (!p) return;

  const { available } = getStockInfo(p);
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available < 15;

  const detailContent = $('#detail-content');
  if (detailContent) {
    detailContent.innerHTML = `
      <div class="detail-grid">
        <div style="position:relative;">
          ${isOutOfStock ? '<span class="stock-badge out-of-stock">Out of stock</span>' : isLowStock ? `<span class="stock-badge low-stock">Only ${available} in stock</span>` : ''}
          <div class="product-photo" role="img" aria-label="${esc(p.name)}" style="${photoStyle(p)}"></div>
        </div>
        <div>
          <span class="eyebrow">${esc(p.category)} · SKU: ${esc(p.sku || 'ROS-' + p.id)}</span>
          <h2 id="detail-title">${esc(p.name)}</h2>
          <p>${esc(p.desc || 'A thoughtfully designed object for your daily life. Crafted with durable materials and refined finishes.')}</p>
          <div class="detail-price">${money(p.price)} <small style="font-size:13px">MAD</small></div>
          <div style="margin-bottom:14px;font-size:13px;color:${isOutOfStock ? '#dc2626' : '#147d86'};">
            <strong>${isOutOfStock ? 'Sold Out' : `In Stock: ${available} units available`}</strong>
          </div>
          <button class="primary" data-add="${esc(p.id)}" ${isOutOfStock ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
            ${isOutOfStock ? 'Out of stock' : 'Add to bag <span>+</span>'}
          </button>
          <a href="/product?id=${esc(p.id)}" class="primary" style="display:block;text-align:center;text-decoration:none;margin-top:12px;padding:12px 18px;font-weight:700;background:var(--ink);color:#fff;">
            Visit Dedicated Landing Page & Fast Checkout ➔
          </a>
          <p class="detail-note">Cash on delivery available nationwide across Morocco. Free delivery on all orders.</p>
        </div>
      </div>
    `;
  }
  const detailModal = $('#detail');
  if (detailModal) detailModal.showModal();
}

function renderBag() {
  loadDb();
  const list = products.filter(p => cart[p.id]);
  const bagItems = $('#bag-items');
  const bagSummary = $('#bag-summary');

  if (bagItems) {
    bagItems.innerHTML = list.length ? list.map(p => {
      const qty = cart[p.id];
      const { available } = getStockInfo(p);
      return `
        <div class="bag-row">
          <div>
            <h3>${esc(p.name)}</h3>
            <small>${money(p.price)} each · ${esc(p.category)}</small><br>
            <a href="/product?id=${esc(p.id)}" style="font-size:11px;color:var(--teal);text-decoration:underline;display:inline-block;margin:4px 0;">View Landing Page ↗</a>
            <button class="remove" data-remove="${esc(p.id)}">Remove</button>
          </div>
          <div class="quantity">
            <button data-minus="${esc(p.id)}" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button data-add="${esc(p.id)}" aria-label="Increase quantity" ${qty >= available ? 'disabled' : ''}>+</button>
          </div>
          <b>${money(p.price * qty)}</b>
        </div>
      `;
    }).join('') : `
      <div class="empty">
        <h3>Your shopping bag is empty.</h3>
        <p>Explore our thoughtfully designed collections and discover everyday favorites.</p>
        <button class="primary" data-close="bag" style="margin-top:14px;">Continue exploring ↗</button>
      </div>
    `;
  }

  if (bagSummary) {
    if (list.length) {
      const subtotal = list.reduce((sum, p) => sum + (p.price * cart[p.id]), 0);
      bagSummary.innerHTML = `
        <div class="bag-total">
          <span>Subtotal</span>
          <span>${money(subtotal)}</span>
        </div>
        <div class="cod-badge">
          <span>✓ Cash on Delivery Available</span>
        </div>
        <p class="catalog-note" style="margin-top:10px;">Free delivery across Morocco. Pay upon arrival.</p>
        <button class="primary checkout-btn" id="open-checkout-btn">
          Proceed to Checkout (Cash on Delivery) →
        </button>
      `;
    } else {
      bagSummary.innerHTML = '';
    }
  }
}

function openBag() {
  renderBag();
  const bagDialog = $('#bag');
  if (bagDialog) bagDialog.showModal();
}

// Cash on Delivery Checkout
function openCheckout() {
  loadDb();
  const list = products.filter(p => cart[p.id]);
  if (!list.length) {
    toast('Your bag is empty.');
    return;
  }

  // Close bag modal first
  const bagDialog = $('#bag');
  if (bagDialog) bagDialog.close();

  const subtotal = list.reduce((sum, p) => sum + (p.price * cart[p.id]), 0);
  const shipping = 0; // Free delivery
  const total = subtotal + shipping;

  const container = $('#checkout-container');
  if (container) {
    container.innerHTML = `
      <div class="checkout-grid">
        <form id="cod-checkout-form" class="checkout-form">
          <div class="form-field">
            <label for="co-name">Full Name *</label>
            <input id="co-name" name="customer" required placeholder="e.g. Fatima Zahra Bennani" autocomplete="name">
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="co-phone">Phone Number *</label>
              <input id="co-phone" name="phone" type="tel" required placeholder="e.g. 06 12 34 56 78" autocomplete="tel">
              <small>Our agent will call this number to confirm delivery.</small>
            </div>
            <div class="form-field">
              <label for="co-city">City *</label>
              <select id="co-city" name="city" required>
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Tangier">Tangier</option>
                <option value="Fès">Fès</option>
                <option value="Meknès">Meknès</option>
                <option value="Agadir">Agadir</option>
                <option value="Kenitra">Kenitra</option>
                <option value="Tetouan">Tetouan</option>
                <option value="Oujda">Oujda</option>
                <option value="Other">Other City</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label for="co-address">Delivery Address *</label>
            <textarea id="co-address" name="address" required placeholder="Street address, building, apartment, neighborhood, landmark"></textarea>
          </div>

          <div class="form-field">
            <label for="co-notes">Delivery Instructions (Optional)</label>
            <input id="co-notes" name="notes" placeholder="e.g. Call before arrival, deliver in the afternoon">
          </div>

          <div class="form-field">
            <label>Payment Method</label>
            <div class="payment-methods">
              <label class="payment-card active">
                <input type="radio" name="paymentMethod" value="COD" checked>
                <div class="payment-card-body">
                  <strong>Cash on Delivery (COD)</strong>
                  <small>Pay with cash directly to the courier upon doorstep delivery.</small>
                </div>
              </label>

              <label class="payment-card disabled" title="Stripe card payment will be integrated soon">
                <input type="radio" name="paymentMethod" value="STRIPE" disabled>
                <div class="payment-card-body">
                  <strong>Credit / Debit Card <span class="payment-tag">Coming soon</span></strong>
                  <small>Online card payments via Stripe will be available in the next release.</small>
                </div>
              </label>
            </div>
          </div>

          <div style="display:flex;gap:12px;margin-top:14px;justify-content:space-between;align-items:center;">
            <button type="button" data-close="checkout" class="text-button">← Back to shopping</button>
            <button type="submit" class="primary" style="flex:1;max-width:280px;justify-content:center;">
              Confirm Order (COD) ↗
            </button>
          </div>
        </form>

        <div class="order-summary-card">
          <h3>Order Summary</h3>
          <div class="order-item-list">
            ${list.map(p => `
              <div class="order-item-row">
                <div>
                  <strong>${esc(p.name)}</strong><br>
                  <span>${cart[p.id]} × ${money(p.price)}</span>
                </div>
                <b>${money(p.price * cart[p.id])}</b>
              </div>
            `).join('')}
          </div>
          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${money(subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Delivery across Morocco</span>
              <span style="color:#137333;font-weight:600;">FREE</span>
            </div>
            <div class="total-row final">
              <span>Total upon delivery</span>
              <span>${money(total)}</span>
            </div>
          </div>
          <div class="cod-badge" style="width:100%;justify-content:center;margin-top:16px;">
            <span>🛡️ No online payment required · 100% Risk Free</span>
          </div>
        </div>
      </div>
    `;

    const form = $('#cod-checkout-form');
    if (form) {
      form.onsubmit = handleCheckoutSubmit;
    }
  }

  const checkoutDialog = $('#checkout');
  if (checkoutDialog) checkoutDialog.showModal();
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  loadDb();

  const form = e.target;
  const formData = new FormData(form);
  const customer = formData.get('customer')?.toString().trim();
  const phone = formData.get('phone')?.toString().trim();
  const city = formData.get('city')?.toString().trim();
  const address = formData.get('address')?.toString().trim();
  const notes = formData.get('notes')?.toString().trim();

  if (!customer || !phone || !city || !address) {
    toast('Please fill in all required fields.');
    return;
  }

  const list = products.filter(p => cart[p.id]);
  if (!list.length) {
    toast('Your bag is empty.');
    return;
  }

  const primaryProduct = list[0];
  const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = list.reduce((sum, p) => sum + (p.price * cart[p.id]), 0);
  const totalCost = list.reduce((sum, p) => sum + ((p.cost || p.price * 0.4) * cart[p.id]), 0);

  const orderId = 'RS-' + Math.floor(1000 + Math.random() * 9000);
  const itemsBreakdown = list.map(p => `${p.name} × ${cart[p.id]}`).join(', ');

  const urlParams = new URLSearchParams(window.location.search);
  const campaign = urlParams.get('utm_campaign') || 'Storefront_Direct';
  const creative = urlParams.get('utm_content') || 'organic_browse';
  const source = urlParams.get('utm_source') ? (urlParams.get('utm_source').toLowerCase().includes('meta') || urlParams.get('utm_source').toLowerCase().includes('fb') ? 'Meta Ads' : urlParams.get('utm_source').toLowerCase().includes('tiktok') ? 'TikTok Ads' : 'Storefront') : 'Storefront';

  const newOrder = {
    id: orderId,
    customer,
    phone,
    city,
    address,
    product: primaryProduct.id,
    quantity: totalQuantity,
    amount: totalAmount,
    cost: totalCost,
    status: 'New',
    agent: '',
    source,
    campaign,
    creative,
    carrier: 'Digylog',
    date: new Date().toISOString().slice(0, 10),
    notes: [
      `Online COD order · Items: ${itemsBreakdown}`,
      notes ? `Customer note: ${notes}` : ''
    ].filter(Boolean),
    callback: '',
    shipping: 35,
    stockDeducted: false
  };

  db.orders.unshift(newOrder);
  db.activity.unshift({
    text: `New storefront COD order ${newOrder.id} placed by ${newOrder.customer} (${money(totalAmount)})`,
    date: new Date().toISOString()
  });
  db.activity = db.activity.slice(0, 100);

  saveDb();

  // Sync order to backend & Supabase
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOrder)
  }).catch(() => {});

  // Clear cart
  cart = {};
  saveCart();

  // Close checkout modal
  const checkoutDialog = $('#checkout');
  if (checkoutDialog) checkoutDialog.close();

  // Open order success dialog
  showOrderSuccess(newOrder, itemsBreakdown);
}

function showOrderSuccess(order, itemsSummary) {
  const content = $('#order-success-content');
  if (content) {
    content.innerHTML = `
      <div class="success-check">✓</div>
      <h2>Order Confirmed!</h2>
      <p style="color:#556b71;">Thank you, <strong>${esc(order.customer)}</strong>. Your Cash on Delivery order has been successfully placed.</p>
      
      <div class="order-ref">Order Reference: ${esc(order.id)}</div>

      <div class="order-success-details">
        <div><strong>Items:</strong> ${esc(itemsSummary)}</div>
        <div><strong>Total Payable (COD):</strong> ${money(order.amount)}</div>
        <div><strong>Delivery Destination:</strong> ${esc(order.city)} · ${esc(order.address)}</div>
        <div><strong>Contact Phone:</strong> ${esc(order.phone)}</div>
        <div style="margin-top:8px;padding-top:8px;border-top:1px dashed #d5dedc;color:#147d86;">
          📞 <strong>What happens next:</strong> Our confirmation agent will call you within 24 hours to confirm your delivery time before courier dispatch.
        </div>
      </div>

      <div class="order-success-actions">
        <a href="/track?id=${encodeURIComponent(order.id)}" class="primary" style="display:inline-flex;align-items:center;gap:6px;">
          🚚 Track Your Order Live ↗
        </a>
        <button data-close="order-success" style="padding:12px 18px;border:1px solid #d3dbd9;border-radius:5px;background:#fff;font-weight:600;">
          Continue Shopping
        </button>
        <a href="/admin/#orders" style="display:inline-flex;align-items:center;padding:12px 18px;border:1px solid #147d86;border-radius:5px;color:#147d86;font-weight:600;">
          View in Admin Operations ↗
        </a>
      </div>
    `;
  }

  const successDialog = $('#order-success');
  if (successDialog) successDialog.showModal();
}

// Global click delegation
document.addEventListener('click', e => {
  const b = e.target.closest('button, a');
  if (!b) return;

  const d = b.dataset;

  if (d.category) {
    filterCategory(d.category);
  } else if (d.detail) {
    showDetail(d.detail);
  } else if (d.add) {
    addToBag(d.add);
  } else if (d.close) {
    const dialog = $('#' + d.close);
    if (dialog) dialog.close();
  } else if (d.minus) {
    const pid = d.minus;
    if (cart[pid]) {
      cart[pid]--;
      if (cart[pid] <= 0) delete cart[pid];
      saveCart();
      renderBag();
    }
  } else if (d.remove) {
    const pid = d.remove;
    delete cart[pid];
    saveCart();
    renderBag();
  } else if (b.id === 'open-checkout-btn') {
    openCheckout();
  }
});

// Setup handlers once DOM is loaded
// Contact form: sends the message to the operations team inbox
async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const status = $('#contact-status');
  const button = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form));
  const setStatus = (text, ok) => {
    status.textContent = text;
    status.className = 'contact-status ' + (ok ? 'ok' : 'err');
  };

  if (!data.name.trim() || !data.message.trim()) return setStatus('Please add your name and a message.', false);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return setStatus('Please enter a valid email address.', false);

  button.disabled = true;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Your message could not be sent.');
    form.reset();
    setStatus('Thank you! Your message has been sent. We will reply by email within one business day.', true);
  } catch (err) {
    setStatus(err.message + ' You can also email hello@rosaino.com.', false);
  } finally {
    button.disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadDb();
  loadCart();
  saveCart();
  initNav();
  render();

  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  const bagOpen = $('#bag-open');
  if (bagOpen) bagOpen.onclick = openBag;

  const footerBag = $('#footer-bag');
  if (footerBag) footerBag.onclick = openBag;

  const contactForm = $('#contact-form');
  if (contactForm) contactForm.onsubmit = submitContact;

  const resetBtn = $('#reset');
  if (resetBtn) {
    resetBtn.onclick = () => {
      category = 'All';
      query = '';
      const s = $('#search');
      if (s) s.value = '';
      render();
    };
  }

  const searchForm = $('#searchform');
  if (searchForm) {
    searchForm.onsubmit = e => {
      e.preventDefault();
      const shopEl = $('#shop-catalog') || $('#shop');
      if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
    };
  }

  const searchInput = $('#search');
  if (searchInput) {
    searchInput.oninput = e => {
      query = e.target.value.trim().toLowerCase();
      render();
    };
  }

  // Background sync with Supabase products
  fetch('/api/products')
    .then(r => r.json())
    .then(prods => {
      if (Array.isArray(prods) && prods.length > 0) {
        db.products = prods;
        products = prods;
        saveDb();
        initNav();
        render();
      }
    })
    .catch(() => {});

  // Dialog backdrop click close
  document.querySelectorAll('dialog').forEach(d => {
    d.addEventListener('click', e => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          d.close();
        }
      }
    });
  });
});

// Live synchronization when admin updates products/stock in another tab or in admin
window.addEventListener('storage', e => {
  if (!e.key || e.key === STORAGE_KEY || e.key === BAG_KEY) {
    loadDb();
    loadCart();
    saveCart();
    render();
    if ($('#bag')?.open) renderBag();
  }
});

window.addEventListener('focus', () => {
  loadDb();
  render();
});
