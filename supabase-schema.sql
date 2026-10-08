-- Rosaino · Supabase database
--
-- Nothing needs to be created by hand. With DATABASE_URL set in Vercel, the app
-- creates its own tables on first use, with Row Level Security on and no public
-- access (only the app server can read or write them):
--   app_records   orders, products, purchase orders, landing pages,
--                 contact messages, blacklist, uploaded images
--   admin_users, admin_roles, admin_audit, admin_login_attempts   sign-in
--   carriers, shipments                                          delivery
--   call_logs                                                    call center
--
-- Run this script once in the Supabase SQL Editor if an older version of this
-- file was run before. Those versions let anyone holding the public (anon or
-- publishable) key read and change orders, including customer names, phones
-- and addresses. This removes that access. It is safe to run more than once
-- and does not delete any data (existing products and orders were copied into
-- app_records automatically).

DO $$
DECLARE
  t TEXT;
  p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['products', 'orders', 'activity', 'suppliers', 'roles'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      END LOOP;
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    END IF;
  END LOOP;
END $$;
