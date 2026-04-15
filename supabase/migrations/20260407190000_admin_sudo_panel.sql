-- SUDO/Admin panel foundation:
-- - hierarchical roles (sudo/admin/editor/licenciatario/customer)
-- - helper functions for role checks
-- - backfill auth.users -> public.users
-- - tax profiles, payments, licenciatario documents, audit logs
-- - RLS for admin/editor features

DO $$
DECLARE cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.users'::regclass
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%role%'
  LIMIT 1;

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('sudo', 'admin', 'editor', 'licenciatario', 'customer'));

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.role FROM public.users u WHERE u.id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_sudo()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_user_role() = 'sudo';
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_sudo()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_user_role() IN ('admin', 'sudo');
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_above()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_user_role() IN ('editor', 'admin', 'sudo');
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_sudo() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_or_sudo() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_editor_or_above() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_sudo() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_sudo() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_editor_or_above() TO anon, authenticated, service_role;

INSERT INTO public.users (id, email, role)
SELECT
  au.id,
  COALESCE(NULLIF(TRIM(COALESCE(au.email, '')), ''), au.id::text || '@auth.synced'),
  'customer'::text
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);

CREATE TABLE IF NOT EXISTS public.customer_tax_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  legal_name text,
  tax_id text,
  tax_condition text,
  billing_address text,
  city text,
  country text,
  postal_code text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mercadopago',
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'ARS',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  external_reference text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.licenciatario_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  licenciatario_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'general',
  url text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  notes text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_admin" ON public.users;
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.is_admin_or_sudo());

DROP POLICY IF EXISTS "users_update_admin_or_sudo" ON public.users;
CREATE POLICY "users_update_admin_or_sudo" ON public.users
  FOR UPDATE
  USING (public.is_admin_or_sudo())
  WITH CHECK (CASE WHEN public.is_sudo() THEN true ELSE role <> 'sudo' END);

DROP POLICY IF EXISTS "users_insert_admin_or_sudo" ON public.users;
CREATE POLICY "users_insert_admin_or_sudo" ON public.users
  FOR INSERT WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS "licenses_select_sudo" ON public.licenses;
CREATE POLICY "licenses_select_sudo" ON public.licenses
  FOR SELECT USING (public.is_sudo());

DROP POLICY IF EXISTS "licenses_insert_sudo" ON public.licenses;
CREATE POLICY "licenses_insert_sudo" ON public.licenses
  FOR INSERT WITH CHECK (public.is_sudo());

DROP POLICY IF EXISTS "licenses_update_sudo" ON public.licenses;
CREATE POLICY "licenses_update_sudo" ON public.licenses
  FOR UPDATE USING (public.is_sudo());

DROP POLICY IF EXISTS "products_select_sudo" ON public.products;
CREATE POLICY "products_select_sudo" ON public.products
  FOR SELECT USING (public.is_sudo());

DROP POLICY IF EXISTS "products_insert_sudo" ON public.products;
CREATE POLICY "products_insert_sudo" ON public.products
  FOR INSERT WITH CHECK (public.is_sudo());

DROP POLICY IF EXISTS "products_update_sudo" ON public.products;
CREATE POLICY "products_update_sudo" ON public.products
  FOR UPDATE USING (public.is_sudo());

DROP POLICY IF EXISTS "orders_select_sudo" ON public.orders;
CREATE POLICY "orders_select_sudo" ON public.orders
  FOR SELECT USING (public.is_sudo());

DROP POLICY IF EXISTS "order_items_select_sudo" ON public.order_items;
CREATE POLICY "order_items_select_sudo" ON public.order_items
  FOR SELECT USING (public.is_sudo());

DROP POLICY IF EXISTS "tax_profiles_select_own" ON public.customer_tax_profiles;
CREATE POLICY "tax_profiles_select_own" ON public.customer_tax_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "tax_profiles_admin_all" ON public.customer_tax_profiles;
CREATE POLICY "tax_profiles_admin_all" ON public.customer_tax_profiles
  FOR ALL
  USING (public.is_admin_or_sudo())
  WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;
CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL
  USING (public.is_admin_or_sudo())
  WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS "documents_select_owner_or_editor" ON public.licenciatario_documents;
CREATE POLICY "documents_select_owner_or_editor" ON public.licenciatario_documents
  FOR SELECT USING (licenciatario_id = auth.uid() OR public.is_editor_or_above());

DROP POLICY IF EXISTS "documents_editor_manage" ON public.licenciatario_documents;
CREATE POLICY "documents_editor_manage" ON public.licenciatario_documents
  FOR ALL
  USING (public.is_editor_or_above())
  WITH CHECK (public.is_editor_or_above());

DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
  FOR SELECT USING (public.is_admin_or_sudo());

DROP POLICY IF EXISTS "audit_logs_admin_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin_or_sudo());
