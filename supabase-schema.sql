-- Rosaino Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/kwqbghlwarkibhlgbgft/sql/new)

-- 1. Products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  supplier TEXT,
  "desc" TEXT,
  x NUMERIC,
  y NUMERIC,
  type TEXT DEFAULT 'product',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'New',
  agent TEXT DEFAULT '',
  source TEXT DEFAULT 'Storefront',
  carrier TEXT DEFAULT 'Digylog',
  date TEXT NOT NULL,
  notes JSONB DEFAULT '[]'::jsonb,
  callback TEXT DEFAULT '',
  shipping NUMERIC DEFAULT 35,
  stock_deducted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activity Log table
CREATE TABLE IF NOT EXISTS public.activity (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  city TEXT,
  lead INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Roles & RBAC table
CREATE TABLE IF NOT EXISTS public.roles (
  role TEXT PRIMARY KEY,
  permissions JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial products if table is empty
INSERT INTO public.products (id, name, sku, category, price, cost, stock, supplier, "desc", x, y, type)
VALUES 
  ('p1', 'Wireless Headphones', 'ROS-TECH-01', 'Electronics', 490, 210, 90, 'Atlas Trading', 'A softer soundtrack for your day. A clean, over-ear silhouette in a warm neutral finish.', 7.05, 96.2, 'product'),
  ('p2', 'Everyday Tote', 'ROS-FASH-02', 'Fashion', 240, 75, 145, 'Casablanca Textiles', 'Your daily carry, with a little Rosaino colour. A roomy tote featuring our signature flowing ribbon.', 31.8, 96.2, 'product'),
  ('p3', 'Ceramic Table Lamp', 'ROS-HOME-03', 'Home & Living', 390, 160, 12, 'Atlas Trading', 'A warm corner starts here. A sculptural ceramic silhouette to bring a little calm to your space.', 56.45, 96.2, 'product'),
  ('p4', 'Insulated Bottle', 'ROS-LIFE-04', 'Sports & Outdoors', 220, 80, 68, 'Atlas Trading', 'A companion for your everyday adventures. Rosaino midnight, finished with our colourful ribbon icon.', 81.05, 96.2, 'product'),
  ('p5', 'Daily Care Edit', 'ROS-CARE-05', 'Beauty & Care', 320, 130, 9, 'Care Collective', 'An introduction to everyday care, with a coordinated collection for your daily routine.', 58.4, 65.3, 'category'),
  ('p6', 'Little Discoveries Set', 'ROS-KIDS-06', 'Kids & Toys', 290, 100, 44, 'Care Collective', 'A playful collection of soft textures and colourful shapes for a world of little discoveries.', 93.3, 65.3, 'category')
ON CONFLICT (id) DO NOTHING;

-- Seed initial suppliers
INSERT INTO public.suppliers (id, name, contact, city, lead)
VALUES 
  ('s1', 'Atlas Trading', 'atlas@example.test', 'Casablanca', 5),
  ('s2', 'Casablanca Textiles', 'textiles@example.test', 'Casablanca', 7),
  ('s3', 'Care Collective', 'care@example.test', 'Rabat', 4)
ON CONFLICT (id) DO NOTHING;

-- Seed initial RBAC roles
INSERT INTO public.roles (role, permissions)
VALUES
  ('Super Admin', '["overview", "orders", "calls", "routing", "shipping", "products", "cms", "suppliers", "finance", "reconciliation", "reports", "stores", "integrations", "team", "audit", "rbac_manage", "settings"]'::jsonb),
  ('Admin', '["overview", "orders", "calls", "routing", "shipping", "products", "cms", "suppliers", "finance", "reconciliation", "reports", "stores", "integrations", "team", "audit", "settings"]'::jsonb),
  ('Operations manager', '["overview", "orders", "calls", "routing", "shipping", "products", "cms", "suppliers", "reconciliation", "stores"]'::jsonb),
  ('Confirmation agent', '["calls"]'::jsonb),
  ('Finance viewer', '["overview", "finance", "reconciliation", "reports"]'::jsonb)
ON CONFLICT (role) DO NOTHING;

-- Enable Row Level Security (RLS) with open read/write for anon API key
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public read activity" ON public.activity FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity" ON public.activity FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read roles" ON public.roles FOR SELECT USING (true);
-- Admin sign-in and roles are handled by the app server (auth.js), not Supabase.
DROP POLICY IF EXISTS "Allow public update roles" ON public.roles;
