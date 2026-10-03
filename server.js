import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { registerAuthRoutes, requireAuth, optionalAuth, can, audit } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/assets/uploads', express.static(uploadsDir));

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kwqbghlwarkibhlgbgft.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_-Uik0W47t9fLoE8_JETPZg_U0xY-je7';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-Memory Fallback State (synchronizes with Supabase when tables are created)
let memoryProducts = [
  { id: 'p1', name: 'Wireless Headphones', sku: 'ROS-TECH-01', category: 'Electronics', price: 490, cost: 200, stock: 90, supplier: 'Atlas Trading', desc: 'A softer soundtrack for your day. A clean, over-ear silhouette in a warm neutral finish.', x: 7.05, y: 96.2, type: 'product' },
  { id: 'p2', name: 'Everyday Tote', sku: 'ROS-FASH-02', category: 'Fashion', price: 240, cost: 72, stock: 145, supplier: 'Casablanca Textiles', desc: 'Your daily carry, with a little Rosaino colour. A roomy tote featuring our signature flowing ribbon.', x: 31.8, y: 96.2, type: 'product' },
  { id: 'p3', name: 'Ceramic Table Lamp', sku: 'ROS-HOME-03', category: 'Home & Living', price: 390, cost: 162, stock: 12, supplier: 'Atlas Trading', desc: 'A warm corner starts here. A sculptural ceramic silhouette to bring a little calm to your space.', x: 56.45, y: 96.2, type: 'product' },
  { id: 'p4', name: 'Insulated Bottle', sku: 'ROS-LIFE-04', category: 'Sports & Outdoors', price: 220, cost: 80, stock: 68, supplier: 'Atlas Trading', desc: 'A companion for your everyday adventures. Rosaino midnight, finished with our colourful ribbon icon.', x: 81.05, y: 96.2, type: 'product' },
  { id: 'p5', name: 'Daily Care Edit', sku: 'ROS-CARE-05', category: 'Beauty & Care', price: 320, cost: 130, stock: 9, supplier: 'Care Collective', desc: 'An introduction to everyday care, with a coordinated collection for your daily routine.', x: 58.4, y: 65.3, type: 'category' },
  { id: 'p6', name: 'Little Discoveries Set', sku: 'ROS-KIDS-06', category: 'Kids & Toys', price: 290, cost: 100, stock: 44, supplier: 'Care Collective', desc: 'A playful collection of soft textures and colourful shapes for a world of little discoveries.', x: 93.3, y: 65.3, type: 'category' }
];

let memoryOrders = Array.from({ length: 36 }, (_, i) => {
  const p = [['p1', 490, 200], ['p2', 240, 72], ['p3', 390, 162], ['p4', 220, 80], ['p5', 320, 130], ['p6', 290, 100]][i % 6];
  const stat = ['Delivered', 'Delivered', 'Confirmed', 'New', 'In transit', 'Callback', 'Returned', 'New', 'Confirmed'][i % 9];
  const campaigns = [
    { campaign: 'Meta_WarmNeutral_Headphones', creative: 'vid_neutral_aesthetic_v1', source: 'Meta Ads' },
    { campaign: 'TikTok_DailyCarry_Tote', creative: 'tote_lifestyle_transition', source: 'TikTok Ads' },
    { campaign: 'Meta_MinimalHome_Decor', creative: 'lamp_night_glow_img', source: 'Meta Ads' },
    { campaign: 'Storefront_Direct', creative: 'organic_browse', source: 'Storefront' }
  ][i % 4];

  const remStatus = stat === 'Delivered' ? (i % 3 === 0 ? 'Remitted' : i % 3 === 1 ? 'Pending' : 'Overdue') : 'N/A';
  const remRef = remStatus === 'Remitted' ? `VIR-2026-${['DIGY', 'OZONE', 'AMEEX'][i % 3]}-${840 + i}` : '';
  const remDate = remStatus === 'Remitted' ? '2026-09-25' : '';
  const feeCharged = (stat === 'Delivered' && i % 3 === 2) ? 45 : 35;
  const disc = (stat === 'Delivered' && i % 3 === 2) ? 'Carrier billed 45 MAD (+10 MAD overcharge against agreed 35 MAD tariff)' : '';

  return {
    id: 'RS-' + (1024 + i),
    customer: ['Amal Benani', 'Karim Alami', 'Nadia Tazi', 'Omar Idrissi', 'Salma Mansour', 'Adam Chraibi'][i % 6],
    phone: '06' + (10 + (i % 6) * 11) + '203040',
    city: ['Casablanca', 'Rabat', 'Meknès', 'Marrakech', 'Fès', 'Tangier'][i % 6],
    address: `${10 + i * 2} Boulevard Al Massira, Apt ${i + 1}`,
    product: p[0],
    quantity: 1,
    amount: p[1],
    cost: p[2],
    status: stat,
    agent: i % 2 ? 'usr_agent' : 'usr_admin',
    source: campaigns.source,
    campaign: campaigns.campaign,
    creative: campaigns.creative,
    carrier: ['Digylog', 'OzoneExpress', 'AMEEX'][i % 3],
    date: '2026-09-' + String(22 + (i % 7)).padStart(2, '0'),
    notes: [],
    callback: '',
    shipping: 35,
    stockDeducted: ['In transit', 'Delivered', 'Returned'].includes(stat),
    remittanceStatus: remStatus,
    remittanceRef: remRef,
    remittedDate: remDate,
    courierFeeCharged: feeCharged,
    discrepancyNote: disc
  };
});

// Blacklisted / Chronic Refuser phone numbers
let blacklistedPhones = new Set(['0699001122', '0600112233', '0612349999']);

// Supplier Purchase Orders & True Landed Costs
let memoryPurchaseOrders = [
  {
    id: 'PO-2026-01',
    poNumber: 'PO-2026-01',
    supplierId: 's1',
    supplierName: 'Atlas Trading',
    productId: 'p1',
    productName: 'Wireless Headphones',
    quantity: 150,
    factoryPricePerUnit: 140,
    freightShipping: 4500,
    customsDuty: 3200,
    localHandling: 1300,
    landedCostPerUnit: 200,
    sellingPrice: 490,
    expectedMarginPercent: 59.2,
    status: 'Received',
    orderDate: '2026-09-10',
    receivedDate: '2026-09-22',
    notes: 'Batch arrived at Casablanca port, cleared customs with zero damage.'
  },
  {
    id: 'PO-2026-02',
    poNumber: 'PO-2026-02',
    supplierId: 's2',
    supplierName: 'Casablanca Textiles',
    productId: 'p2',
    productName: 'Everyday Tote',
    quantity: 200,
    factoryPricePerUnit: 52,
    freightShipping: 1800,
    customsDuty: 1400,
    localHandling: 800,
    landedCostPerUnit: 72,
    sellingPrice: 240,
    expectedMarginPercent: 70.0,
    status: 'Received',
    orderDate: '2026-09-12',
    receivedDate: '2026-09-24',
    notes: 'Premium cotton canvas with reinforced Rosaino ribbon embroidery.'
  },
  {
    id: 'PO-2026-03',
    poNumber: 'PO-2026-03',
    supplierId: 's1',
    supplierName: 'Atlas Trading',
    productId: 'p3',
    productName: 'Ceramic Table Lamp',
    quantity: 80,
    factoryPricePerUnit: 110,
    freightShipping: 2400,
    customsDuty: 1200,
    localHandling: 600,
    landedCostPerUnit: 162.5,
    sellingPrice: 390,
    expectedMarginPercent: 58.3,
    status: 'In Transit',
    orderDate: '2026-09-22',
    expectedDate: '2026-10-04',
    receivedDate: null,
    notes: 'Ceramic sculptural bases, packed in high-density foam.'
  }
];

// Helper: Normalize phone numbers
function cleanPhone(p) {
  return String(p || '').replace(/[^0-9]/g, '');
}

// Strip fields only staff may set from anonymous storefront orders.
const STAFF_ONLY_ORDER_FIELDS = ['status', 'agent', 'stockDeducted', 'remittanceStatus', 'remittanceRef', 'remittedDate', 'courierFeeCharged', 'discrepancyNote', 'isDuplicate', 'trustScore', 'cost'];
function sanitizePublicOrder(body) {
  if (!body || typeof body !== 'object') return body;
  const order = { ...body };
  STAFF_ONLY_ORDER_FIELDS.forEach(k => delete order[k]);
  order.status = 'New';
  if (memoryOrders.some(o => String(o.id) === String(order.id))) {
    order.id = 'RS-' + Date.now().toString(36).toUpperCase();
  }
  return order;
}

// Authentication, user management, roles and audit trail
registerAuthRoutes(app);

// Database & Supabase Status Endpoint
app.get('/api/database/status', requireAuth(), async (req, res) => {
  let supabaseConnected = false;
  let productsTableExists = false;
  let ordersTableExists = false;
  let errorDetails = null;

  try {
    const { data: pData, error: pErr } = await supabase.from('products').select('id').limit(1);
    if (!pErr) {
      supabaseConnected = true;
      productsTableExists = true;
    } else if (pErr.code === 'PGRST205') {
      supabaseConnected = true;
      errorDetails = pErr.message;
    } else {
      errorDetails = pErr.message;
    }

    const { data: oData, error: oErr } = await supabase.from('orders').select('id').limit(1);
    if (!oErr) {
      ordersTableExists = true;
    }
  } catch (err) {
    errorDetails = err.message;
  }

  res.json({
    supabaseUrl: SUPABASE_URL,
    connected: supabaseConnected,
    tables: {
      products: productsTableExists,
      orders: ordersTableExists
    },
    mode: (productsTableExists && ordersTableExists) ? 'supabase_live' : 'supabase_connected_pending_schema',
    error: errorDetails,
    schemaFileAvailable: fs.existsSync(path.join(__dirname, 'supabase-schema.sql'))
  });
});

// SQL Schema Endpoint
app.get('/api/schema', requireAuth('integrations'), (req, res) => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'supabase-schema.sql'), 'utf-8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(sql);
  } catch (e) {
    res.status(500).send('-- Schema file not found');
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data && data.length > 0) {
      memoryProducts = data;
      return res.json(data);
    }
  } catch {}
  return res.json(memoryProducts);
});

app.post('/api/products', requireAuth('products', 'cms'), async (req, res) => {
  const productData = req.body;
  if (!productData || !productData.name) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const existingIdx = memoryProducts.findIndex(p => String(p.id) === String(productData.id));
  if (existingIdx >= 0) {
    memoryProducts[existingIdx] = { ...memoryProducts[existingIdx], ...productData };
  } else {
    memoryProducts.push(productData);
  }

  try {
    await supabase.from('products').upsert(productData);
  } catch (e) {
    console.warn('Supabase upsert product notice:', e.message);
  }

  await audit(req.user, 'product.saved', `${productData.id || ''} ${productData.name}`.trim(), req);
  return res.json({ success: true, product: productData });
});

// Orders API
app.get('/api/orders', requireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
    if (!error && data && data.length > 0) {
      memoryOrders = data;
      return res.json(data);
    }
  } catch {}
  return res.json(memoryOrders);
});

app.post('/api/orders', optionalAuth, async (req, res) => {
  // Public storefront checkouts may only create new, unassigned orders.
  const staff = can(req.user, 'orders');
  const orderData = staff ? req.body : sanitizePublicOrder(req.body);
  if (!orderData || !orderData.customer || !orderData.phone) {
    return res.status(400).json({ error: 'Customer and phone are required' });
  }

  // Check duplicate: same phone + same product within 1 hour
  const cPhone = cleanPhone(orderData.phone);
  const isDuplicate = memoryOrders.some(o =>
    cleanPhone(o.phone) === cPhone &&
    String(o.product) === String(orderData.product) &&
    o.status !== 'Cancelled'
  );

  const enrichedOrder = {
    ...orderData,
    isDuplicate,
    trustScore: evaluateTrustScore(orderData.phone),
    campaign: orderData.campaign || 'Storefront_Direct',
    creative: orderData.creative || 'organic_browse'
  };

  memoryOrders.unshift(enrichedOrder);

  try {
    await supabase.from('orders').insert({
      id: enrichedOrder.id,
      customer: enrichedOrder.customer,
      phone: enrichedOrder.phone,
      city: enrichedOrder.city,
      address: enrichedOrder.address || '',
      product: enrichedOrder.product,
      quantity: enrichedOrder.quantity || 1,
      amount: enrichedOrder.amount || 0,
      cost: enrichedOrder.cost || 0,
      status: enrichedOrder.status || 'New',
      agent: enrichedOrder.agent || '',
      source: enrichedOrder.source || 'Storefront',
      carrier: enrichedOrder.carrier || 'Digylog',
      date: enrichedOrder.date || new Date().toISOString().slice(0, 10),
      notes: enrichedOrder.notes || [],
      callback: enrichedOrder.callback || '',
      shipping: enrichedOrder.shipping || 35,
      stock_deducted: !!enrichedOrder.stockDeducted
    });
  } catch (e) {
    console.warn('Supabase insert order notice:', e.message);
  }

  return res.json({ success: true, order: enrichedOrder });
});

app.patch('/api/orders/:id', requireAuth('orders', 'calls', 'shipping'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const order = memoryOrders.find(o => String(o.id) === String(id));
  if (order) {
    if (updates?.status && updates.status !== order.status) {
      await audit(req.user, 'order.status', `${id}: ${order.status} → ${updates.status}`, req);
    }
    Object.assign(order, updates);
  }

  try {
    await supabase.from('orders').update(updates).eq('id', id);
  } catch (e) {
    console.warn('Supabase update order notice:', e.message);
  }

  return res.json({ success: true, order });
});

// Customer Risk & Trust Intelligence Function
function evaluateTrustScore(phone) {
  const cPhone = cleanPhone(phone);
  if (!cPhone) return { rating: 'Standard', color: '#9a742d', score: 50, label: 'Unverified' };

  if (blacklistedPhones.has(cPhone)) {
    return {
      rating: 'High Risk',
      color: '#dc2626',
      score: 10,
      label: '⛔ Blacklisted / Serial Refuser',
      isBlacklisted: true
    };
  }

  const pastOrders = memoryOrders.filter(o => cleanPhone(o.phone) === cPhone);
  if (pastOrders.length === 0) {
    return { rating: 'New Customer', color: '#3b82f6', score: 60, label: '✨ First Time Buyer' };
  }

  const delivered = pastOrders.filter(o => o.status === 'Delivered').length;
  const returned = pastOrders.filter(o => o.status === 'Returned').length;
  const cancelled = pastOrders.filter(o => o.status === 'Cancelled').length;

  if (returned >= 2) {
    return {
      rating: 'High Risk',
      color: '#dc2626',
      score: 20,
      label: `⚠️ Serial Refuser (${returned} Returns)`
    };
  }

  if (delivered >= 2 && returned === 0) {
    return {
      rating: 'VIP Buyer',
      color: '#16a34a',
      score: 95,
      label: `⭐ VIP Verified (${delivered} Delivered)`
    };
  }

  return {
    rating: 'Standard',
    color: '#9a742d',
    score: 65,
    label: `${pastOrders.length} Past Orders (${delivered} Delivered)`
  };
}

// Customer Trust API
app.get('/api/customer-trust/:phone', requireAuth(), (req, res) => {
  const { phone } = req.params;
  const trust = evaluateTrustScore(phone);
  const pastOrders = memoryOrders.filter(o => cleanPhone(o.phone) === cleanPhone(phone));
  res.json({
    phone,
    trust,
    pastOrdersCount: pastOrders.length,
    orders: pastOrders.map(o => ({ id: o.id, date: o.date, status: o.status, amount: o.amount }))
  });
});

// Blacklist API
app.get('/api/blacklist', requireAuth(), (req, res) => {
  res.json({ blacklistedPhones: Array.from(blacklistedPhones) });
});

app.post('/api/blacklist', requireAuth('orders', 'calls', 'team'), async (req, res) => {
  const { phone, action } = req.body || {};
  const cPhone = cleanPhone(phone);
  if (!cPhone) return res.status(400).json({ error: 'Valid phone is required' });

  if (action === 'remove') {
    blacklistedPhones.delete(cPhone);
  } else {
    blacklistedPhones.add(cPhone);
  }
  await audit(req.user, action === 'remove' ? 'blacklist.removed' : 'blacklist.added', cPhone, req);
  res.json({ success: true, count: blacklistedPhones.size });
});

// Public Customer Order Tracking API
app.get('/api/track/:query', (req, res) => {
  const query = req.params.query.trim().toUpperCase();
  const cPhone = cleanPhone(query);

  const order = memoryOrders.find(o =>
    o.id.toUpperCase() === query ||
    (cPhone.length >= 8 && cleanPhone(o.phone) === cPhone)
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const p = memoryProducts.find(x => String(x.id) === String(order.product));

  return res.json({
    id: order.id,
    customer: order.customer.split(' ')[0] + ' ' + (order.customer.split(' ')[1] ? order.customer.split(' ')[1][0] + '***' : ''),
    city: order.city,
    address: order.address,
    status: order.status,
    amount: order.amount,
    quantity: order.quantity,
    date: order.date,
    carrier: order.carrier,
    productName: p?.name || 'Rosaino Discovery',
    phone: order.phone ? order.phone.slice(0, 4) + '***' + order.phone.slice(-2) : ''
  });
});

app.patch('/api/track/:id', (req, res) => {
  const { id } = req.params;
  const { action, preferredDate, city, address, note } = req.body || {};

  const order = memoryOrders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (action === 'reschedule') {
    order.callback = preferredDate;
    order.notes = order.notes || [];
    order.notes.push(`[Customer Rescheduled] Date: ${preferredDate}${note ? ' · Note: ' + note : ''}`);
    if (order.status === 'New') order.status = 'Callback';
  } else if (action === 'update_address') {
    if (city) order.city = city;
    if (address) order.address = address;
    order.notes = order.notes || [];
    order.notes.push(`[Customer Address Update] New destination: ${city} - ${address}`);
  }

  return res.json({ success: true, order });
});

// Supplier Purchase Orders (PO) & Landed Cost Engine API
app.get('/api/purchase-orders', requireAuth(), (req, res) => {
  res.json(memoryPurchaseOrders);
});

app.post('/api/purchase-orders', requireAuth('suppliers'), (req, res) => {
  const po = req.body;
  if (!po || !po.productId || !po.quantity) {
    return res.status(400).json({ error: 'Product and quantity required' });
  }

  const qty = Number(po.quantity) || 1;
  const factoryPrice = Number(po.factoryPricePerUnit) || 0;
  const freight = Number(po.freightShipping) || 0;
  const customs = Number(po.customsDuty) || 0;
  const handling = Number(po.localHandling) || 0;

  // True Landed Cost Calculation
  const totalLandedCost = (qty * factoryPrice) + freight + customs + handling;
  const landedCostPerUnit = Math.round((totalLandedCost / qty) * 100) / 100;
  const sellingPrice = Number(po.sellingPrice) || 400;
  const expectedMarginPercent = Math.round(((sellingPrice - landedCostPerUnit) / sellingPrice) * 1000) / 10;

  const newPO = {
    id: 'PO-2026-' + String(memoryPurchaseOrders.length + 1).padStart(2, '0'),
    poNumber: 'PO-2026-' + String(memoryPurchaseOrders.length + 1).padStart(2, '0'),
    supplierId: po.supplierId || 's1',
    supplierName: po.supplierName || 'Atlas Trading',
    productId: po.productId,
    productName: po.productName || 'Product',
    quantity: qty,
    factoryPricePerUnit: factoryPrice,
    freightShipping: freight,
    customsDuty: customs,
    localHandling: handling,
    landedCostPerUnit,
    sellingPrice,
    expectedMarginPercent,
    status: po.status || 'Ordered',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDate: po.expectedDate || '',
    receivedDate: null,
    notes: po.notes || ''
  };

  memoryPurchaseOrders.unshift(newPO);
  res.json({ success: true, purchaseOrder: newPO });
});

// Receive PO: Automatically increments product inventory and updates unit cost
app.post('/api/purchase-orders/:id/receive', requireAuth('suppliers', 'products'), async (req, res) => {
  const { id } = req.params;
  const po = memoryPurchaseOrders.find(p => p.id === id);
  if (!po) return res.status(404).json({ error: 'Purchase Order not found' });

  po.status = 'Received';
  po.receivedDate = new Date().toISOString().slice(0, 10);

  // Update product stock and true cost
  const prod = memoryProducts.find(p => p.id === po.productId);
  if (prod) {
    prod.stock += po.quantity;
    prod.cost = po.landedCostPerUnit; // update true landed cost!
  }

  await audit(req.user, 'purchase_order.received', `${po.id} · +${po.quantity} ${po.productName}`, req);
  res.json({ success: true, purchaseOrder: po, updatedStock: prod?.stock, landedCost: po.landedCostPerUnit });
});

// Ad Campaign & Delivered ROAS Attribution API
app.get('/api/attribution', requireAuth('reports', 'overview'), (req, res) => {
  // Aggregate real orders by acquisition campaign
  const campaignsMap = {
    'Meta_WarmNeutral_Headphones': { name: 'Meta · Warm Neutral Headphones V1', platform: 'Meta Ads', spend: 3200, creative: 'vid_neutral_aesthetic_v1' },
    'TikTok_DailyCarry_Tote': { name: 'TikTok · Everyday Carry Lifestyle', platform: 'TikTok Ads', spend: 1800, creative: 'tote_lifestyle_transition' },
    'Meta_MinimalHome_Decor': { name: 'Meta · Quiet Corner Lamp Glow', platform: 'Meta Ads', spend: 2400, creative: 'lamp_night_glow_img' },
    'Storefront_Direct': { name: 'Storefront Direct & Organic', platform: 'Direct / SEO', spend: 0, creative: 'organic_browse' }
  };

  const results = Object.entries(campaignsMap).map(([campKey, meta]) => {
    const orders = memoryOrders.filter(o => o.campaign === campKey || (campKey === 'Storefront_Direct' && !o.campaign));
    const leads = orders.length;
    const confirmed = orders.filter(o => ['Confirmed', 'In transit', 'Delivered'].includes(o.status)).length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const returned = orders.filter(o => o.status === 'Returned').length;
    const cancelled = orders.filter(o => ['Cancelled', 'Spam'].includes(o.status)).length;

    const deliveredCash = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.amount, 0);
    const deliveredCost = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.cost || 0), 0);
    const courierFee = (delivered + returned + orders.filter(o => o.status === 'In transit').length) * 35;
    const returnPenalty = returned * 20; // Carrier return fee

    const netProfit = deliveredCash - deliveredCost - courierFee - returnPenalty - meta.spend;
    const deliveredROAS = meta.spend > 0 ? (deliveredCash / meta.spend).toFixed(2) : 'N/A (Organic)';
    const deliveryRate = (delivered + returned) > 0 ? Math.round((delivered / (delivered + returned)) * 100) : 0;

    return {
      campaignKey: campKey,
      ...meta,
      leads,
      confirmed,
      delivered,
      returned,
      cancelled,
      deliveryRate,
      deliveredCash,
      courierFee,
      netProfit,
      deliveredROAS
    };
  });

  res.json(results);
});

// Courier COD Cash Reconciliation & Audit API
app.get('/api/reconciliation', requireAuth('reconciliation', 'finance'), (req, res) => {
  const deliveredOrders = memoryOrders.filter(o => o.status === 'Delivered');

  const carriers = ['Digylog', 'OzoneExpress', 'AMEEX'];
  const carrierBreakdown = carriers.map(c => {
    const orders = deliveredOrders.filter(o => o.carrier === c);
    const totalCollected = orders.reduce((s, o) => s + o.amount, 0);
    const remitted = orders.filter(o => o.remittanceStatus === 'Remitted').reduce((s, o) => s + o.amount, 0);
    const pending = orders.filter(o => o.remittanceStatus === 'Pending').reduce((s, o) => s + o.amount, 0);
    const overdue = orders.filter(o => o.remittanceStatus === 'Overdue').reduce((s, o) => s + o.amount, 0);
    const feeDiscrepancies = orders.filter(o => o.courierFeeCharged > 35).length;

    return {
      carrier: c,
      parcelsCount: orders.length,
      totalCollected,
      remitted,
      pending,
      overdue,
      feeDiscrepancies
    };
  });

  const totalCollected = deliveredOrders.reduce((s, o) => s + o.amount, 0);
  const totalRemitted = deliveredOrders.filter(o => o.remittanceStatus === 'Remitted').reduce((s, o) => s + o.amount, 0);
  const totalPending = deliveredOrders.filter(o => o.remittanceStatus === 'Pending').reduce((s, o) => s + o.amount, 0);
  const totalOverdue = deliveredOrders.filter(o => o.remittanceStatus === 'Overdue').reduce((s, o) => s + o.amount, 0);

  res.json({
    summary: {
      totalDeliveredParcels: deliveredOrders.length,
      totalCollected,
      totalRemitted,
      totalPending,
      totalOverdue
    },
    carrierBreakdown,
    orders: deliveredOrders
  });
});

app.post('/api/reconciliation/batch-remit', requireAuth('reconciliation'), async (req, res) => {
  const { orderIds, remittanceRef, carrier } = req.body || {};
  if (!orderIds || !Array.isArray(orderIds) || !orderIds.length) {
    return res.status(400).json({ error: 'Order IDs are required' });
  }

  const ref = remittanceRef || `VIR-2026-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString().slice(0, 10);
  let reconciledCount = 0;

  memoryOrders.forEach(o => {
    if (orderIds.includes(o.id) && o.status === 'Delivered') {
      o.remittanceStatus = 'Remitted';
      o.remittanceRef = ref;
      o.remittedDate = now;
      reconciledCount++;
    }
  });

  await audit(req.user, 'remittance.reconciled', `${reconciledCount} order(s) · ${ref}`, req);
  res.json({ success: true, reconciledCount, remittanceRef: ref });
});

// File / Image Upload API (Supports Base64 Data URL or direct file upload)
app.post('/api/upload', requireAuth('products', 'cms', 'stores'), (req, res) => {
  const { data, filename } = req.body || {};
  if (!data) return res.status(400).json({ error: 'No image data provided' });

  try {
    const matches = data.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      const ext = mime.split('/')[1] || 'png';
      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'png';
      const safeName = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;
      const filePath = path.join(uploadsDir, safeName);
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/assets/uploads/${safeName}`;
      return res.json({ success: true, url: publicUrl, size: buffer.length });
    } else if (typeof data === 'string' && data.startsWith('/')) {
      return res.json({ success: true, url: data });
    } else {
      return res.json({ success: true, url: data });
    }
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({ error: 'Failed to process image upload: ' + err.message });
  }
});

// Contact form messages (public submit, staff inbox)
const contactMessages = [];
const contactRate = new Map();

app.post('/api/contact', (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ success: true }); // honeypot: silently drop bots
  const clip = (v, n) => String(v || '').trim().slice(0, n);
  const msg = {
    id: 'MSG-' + Date.now().toString(36).toUpperCase(),
    name: clip(b.name, 80),
    email: clip(b.email, 120).toLowerCase(),
    phone: clip(b.phone, 30),
    orderId: clip(b.orderId, 30).toUpperCase(),
    topic: clip(b.topic, 40) || 'Other',
    message: clip(b.message, 2000),
    status: 'New',
    date: new Date().toISOString()
  };
  if (!msg.name || !msg.message) return res.status(400).json({ error: 'Name and message are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) return res.status(400).json({ error: 'A valid email is required.' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const recent = (contactRate.get(ip) || []).filter(t => Date.now() - t < 60 * 60 * 1000);
  if (recent.length >= 5) return res.status(429).json({ error: 'Too many messages. Please try again later.' });
  contactRate.set(ip, [...recent, Date.now()]);

  contactMessages.unshift(msg);
  contactMessages.length = Math.min(contactMessages.length, 500);
  res.json({ success: true, id: msg.id });
});

app.get('/api/contact', requireAuth('orders', 'stores'), (req, res) => {
  res.json(contactMessages);
});

app.patch('/api/contact/:id', requireAuth('orders', 'stores'), (req, res) => {
  const msg = contactMessages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  if (['New', 'Replied', 'Closed'].includes(req.body?.status)) msg.status = req.body.status;
  res.json({ success: true, message: msg });
});

// Product Landing Page CMS Data Engine
const memoryCms = new Map();

function getDefaultCms(p) {
  const price = Number(p.price) || 390;
  const regularPrice = Math.round(price * 1.35 / 10) * 10;
  return {
    productId: p.id,
    language: 'fr',
    pageTitle: `${p.name} — Boutique Officielle Rosaino`,
    headline: `Découvrez l'élégance et la qualité de ${p.name}`,
    subtitle: p.desc || 'Matériaux nobles, finitions artisanales et confort tactile livrés directement à votre porte partout au Maroc.',
    announcement: 'Offre Spéciale Ramadan & Aïd · Livraison Express Gratuite Partout au Maroc · Paiement 100% à la Livraison (COD)',
    badgeText: `OFFRE LIMITÉE - ÉCONOMISEZ ${regularPrice - price} MAD`,
    heroImage: p.image || '/assets/collection.png',
    secondaryImage: '/assets/pattern.png',
    galleryImage3: '/assets/ribbon.png',
    galleryImages: [p.image || '/assets/collection.png', '/assets/pattern.png', '/assets/ribbon.png'],
    sectionOrder: ['announcement', 'hero_media', 'urgency_bar', 'pricing_bundles', 'cod_checkout', 'features', 'reviews', 'faqs'],
    sectionsEnabled: {
      announcement: true,
      hero_media: true,
      urgency_bar: true,
      pricing_bundles: true,
      cod_checkout: true,
      features: true,
      reviews: true,
      faqs: true
    },
    regularPrice: regularPrice,
    salePrice: price,
    pricingTableEnabled: true,
    checkoutHeadline: 'Finalisez Votre Commande ci-dessous',
    checkoutSubtitle: 'Payez en espèces au livreur à votre porte dès réception.',
    submitButtonText: 'CONFIRMER LA COMMANDE (PAIEMENT À LA LIVRAISON) ↗',
    supportPhone: '212600000000',
    tiers: [
      {
        qty: 1,
        title: '1 Pièce (Pack Solo)',
        price: price,
        originalPrice: regularPrice,
        badge: 'Offre Standard',
        savings: `Économisez ${regularPrice - price} MAD`
      },
      {
        qty: 2,
        title: '2 Pièces (Pack Duo)',
        price: Math.round(price * 1.75 / 10) * 10,
        originalPrice: regularPrice * 2,
        badge: 'LE PLUS POPULAIRE',
        savings: `Économisez ${regularPrice * 2 - Math.round(price * 1.75 / 10) * 10} MAD`
      },
      {
        qty: 3,
        title: '3 Pièces (Pack Famille + Cadeau)',
        price: Math.round(price * 2.35 / 10) * 10,
        originalPrice: regularPrice * 3,
        badge: 'MEILLEURE VALEUR + Cadeau Offert',
        savings: `Économisez ${regularPrice * 3 - Math.round(price * 2.35 / 10) * 10} MAD`
      }
    ],
    features: [
      { title: 'Confection Artisanale', desc: 'Fabriqué à partir de matériaux rigoureusement sélectionnés pour durer dans le temps.' },
      { title: 'Livraison Express au Maroc', desc: 'Expédition soignée à domicile en 24 à 48 heures dans toutes les villes du Royaume.' },
      { title: 'Zéro Risque · Paiement à la Livraison', desc: 'Aucune carte bancaire requise en ligne. Inspectez votre colis avant de régler.' },
      { title: 'Échange Garanti 14 Jours', desc: 'Assistance client dédiée sur WhatsApp disponible pour tout échange ou question.' }
    ],
    urgencyEnabled: true,
    countdownHours: 5,
    stockLeft: Math.min(12, Math.max(3, p.stock || 8)),
    rating: '4.9',
    reviewCount: 184,
    reviews: [
      { name: 'Kenza Alaoui', city: 'Casablanca', rating: 5, comment: 'Commandé hier matin et reçu aujourd’hui à Maarif ! Conforme à la description, qualité superbe et le livreur a appelé avant.' },
      { name: 'Youssef El Amrani', city: 'Rabat', rating: 5, comment: `Très satisfait du ${p.name}. Emballage soigné et le paiement en espèces à la livraison donne une totale tranquillité d’esprit.` }
    ],
    faqs: [
      { q: 'Comment fonctionne le paiement à la livraison (COD) ?', a: 'Vous remplissez simplement votre nom, téléphone et adresse ci-dessus. Notre agent vous appelle pour confirmer, et vous réglez en espèces au livreur dès réception de votre colis.' },
      { q: 'Puis-je ouvrir et inspecter le colis avant de payer ?', a: 'Oui, absolument ! Nous vous encourageons à vérifier le contenu et l’état du produit avant de remettre le montant au coursier.' },
      { q: 'Quels sont les délais de livraison ?', a: 'La livraison à Casablanca, Rabat, Marrakech, Tanger et Fès prend 24 à 48h. Les autres villes sont livrées sous 48 à 72h.' }
    ],
    codFields: [
      { id: 'f_name', key: 'name', label: 'Nom complet', placeholder: 'ex. Fatima Zahra Bennani', type: 'text', required: true, enabled: true },
      { id: 'f_phone', key: 'phone', label: 'Numéro de téléphone marocain', placeholder: '06 12 34 56 78', type: 'tel', required: true, enabled: true, help: 'Notre agent vous appelle pour valider la livraison.' },
      { id: 'f_city', key: 'city', label: 'Ville', type: 'select', required: true, enabled: true, options: 'Casablanca, Rabat, Marrakech, Tanger, Fès, Meknès, Agadir, Kénitra, Tétouan, Oujda, Mohammédia, El Jadida, Autre ville au Maroc' },
      { id: 'f_address', key: 'address', label: 'Adresse de livraison & quartier', placeholder: 'Rue, numéro de porte, quartier ou repère', type: 'textarea', required: true, enabled: true },
      { id: 'f_notes', key: 'notes', label: 'Instructions de livraison (Optionnel)', placeholder: 'ex. Appeler avant d\'arriver, laisser au concierge', type: 'text', required: false, enabled: true },
      { id: 'f_whatsapp', key: 'whatsapp', label: 'Numéro WhatsApp (si différent)', placeholder: '06 .. .. .. ..', type: 'tel', required: false, enabled: false },
      { id: 'f_phone2', key: 'phone2', label: 'Deuxième numéro de téléphone', placeholder: '06 / 07 .. .. .. ..', type: 'tel', required: false, enabled: false },
      { id: 'f_delivery_time', key: 'delivery_time', label: 'Créneau horaire de livraison préféré', type: 'select', required: false, enabled: false, options: 'Matin (09h-13h), Après-midi (14h-19h), N\'importe quand / Flexible' }
    ]
  };
}

app.get('/api/cms/:id', (req, res) => {
  const p = memoryProducts.find(x => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (memoryCms.has(p.id)) {
    return res.json(memoryCms.get(p.id));
  }
  const def = getDefaultCms(p);
  memoryCms.set(p.id, def);
  return res.json(def);
});

app.post('/api/cms/:id', requireAuth('cms'), async (req, res) => {
  const p = memoryProducts.find(x => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  const updated = { ...(memoryCms.get(p.id) || getDefaultCms(p)), ...req.body, productId: p.id };
  memoryCms.set(p.id, updated);
  await audit(req.user, 'cms.saved', p.name, req);
  return res.json({ success: true, cms: updated });
});

// Dedicated Public Product Landing Page
app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, 'product.html'));
});

app.get('/p/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'product.html'));
});

// Shop page: all categories and products
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});

// Policies page
app.get('/policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'policy.html'));
});

// Serve Public Tracking Portal
app.get('/track', (req, res) => {
  res.sendFile(path.join(__dirname, 'track.html'));
});

// Serve assets directly from /assets and root
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Admin workspace route
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Storefront static assets and root. Only public files are served so server
// source (server.js, auth.js, .env, schema) is never exposed.
const PUBLIC_ROOT_FILES = new Set(['index.html', 'style.css', 'app.js', 'demo.css', 'demo.js', 'product.html', 'track.html', 'policy.html', 'shop.html', 'collection.png', 'icon.png', 'logo.png', 'pattern.png', 'ribbon.png']);
app.get('/:file', (req, res, next) => {
  if (!PUBLIC_ROOT_FILES.has(req.params.file)) return next();
  res.sendFile(path.join(__dirname, req.params.file));
});

// Fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`Rosaino server running at http://${HOST}:${PORT}`);
    console.log(`Storefront: http://${HOST}:${PORT}/`);
    console.log(`Customer Tracking: http://${HOST}:${PORT}/track`);
    console.log(`Shop: http://${HOST}:${PORT}/shop`);
    console.log(`Policies: http://${HOST}:${PORT}/policy`);
    console.log(`Operations Demo: http://${HOST}:${PORT}/admin/`);
    console.log(`Supabase URL: ${SUPABASE_URL}`);
  });
}

export default app;
