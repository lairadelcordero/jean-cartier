-- =============================================================================
-- Jean Cartier: esquema completo para Supabase en la NUBE (un solo pegado)
-- =============================================================================
-- Dónde: Supabase Dashboard → SQL Editor → New query → pegar todo → Run
-- Cuándo: tu proyecto NO tiene public.users (error "schema cache" / promote falla)
-- Después: Table Editor → comprobar tablas → pnpm promote:licenciatario tu@email.com
-- No re-ejecutar tal cual en proyecto que ya tiene políticas/tablas (usar migraciones).
-- Generado desde migraciones con: pnpm db:bundle-remote-schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('admin', 'licensee', 'customer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.licenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  licensee_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('active', 'pending', 'suspended')),
  fee_amount      NUMERIC,
  commission_pct  NUMERIC,
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_id       UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  price_retail     NUMERIC,
  price_wholesale  NUMERIC,
  stock            INTEGER NOT NULL DEFAULT 0,
  category         TEXT,
  images           TEXT[],
  status           TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'inactive')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_amount  NUMERIC,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL,
  unit_price  NUMERIC
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- users: SELECT own row only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- licenses: SELECT for admin (all) and licensee (own)
CREATE POLICY "licenses_select_admin" ON public.licenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "licenses_select_own_licensee" ON public.licenses
  FOR SELECT USING (licensee_id = auth.uid());

-- licenses: INSERT/UPDATE admin only
CREATE POLICY "licenses_insert_admin" ON public.licenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "licenses_update_admin" ON public.licenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- products: SELECT for all authenticated
CREATE POLICY "products_select_authenticated" ON public.products
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- products: INSERT/UPDATE for admin and owning licensee
CREATE POLICY "products_insert_admin_or_licensee" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_id AND l.licensee_id = auth.uid()
    )
  );

CREATE POLICY "products_update_admin_or_licensee" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_id AND l.licensee_id = auth.uid()
    )
  );

-- orders: SELECT/INSERT own orders for customers; SELECT all for admin
CREATE POLICY "orders_select_own_or_admin" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- order_items: SELECT own order items
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- order_items: INSERT with order ownership check
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

-- REQ-1: health_check RPC, users RLS for admins, schema aligned to requirement doc.

-- ---------------------------------------------------------------------------
-- health_check: lightweight DB connectivity (SECURITY DEFINER, callable by anon)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS smallint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 1::smallint;
$$;

REVOKE ALL ON FUNCTION public.health_check() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.health_check() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Drop RLS policies before column renames
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "licenses_select_admin" ON public.licenses;
DROP POLICY IF EXISTS "licenses_select_own_licensee" ON public.licenses;
DROP POLICY IF EXISTS "licenses_insert_admin" ON public.licenses;
DROP POLICY IF EXISTS "licenses_update_admin" ON public.licenses;
DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;
DROP POLICY IF EXISTS "products_insert_admin_or_licensee" ON public.products;
DROP POLICY IF EXISTS "products_update_admin_or_licensee" ON public.products;
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;

-- ---------------------------------------------------------------------------
-- Schema alignment: roles, columns, statuses (REQ-1)
-- ---------------------------------------------------------------------------
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

UPDATE public.users SET role = 'licenciatario' WHERE role = 'licensee';

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'licenciatario', 'customer'));

DO $$
DECLARE cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.licenses'::regclass
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.licenses DROP CONSTRAINT %I', cname);
  END IF;
END $$;
UPDATE public.licenses SET status = 'inactive' WHERE status = 'suspended';
ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_status_check
  CHECK (status IN ('active', 'inactive', 'pending'));

ALTER TABLE public.licenses RENAME COLUMN licensee_id TO licenciatario_id;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
UPDATE public.products
SET price = COALESCE(price_retail, price_wholesale, 0)
WHERE price IS NULL;

DO $$
DECLARE cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.orders'::regclass
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', cname);
  END IF;
END $$;

UPDATE public.orders SET status = 'completed' WHERE status IN ('paid', 'shipped', 'delivered');

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'completed', 'cancelled'));

ALTER TABLE public.orders RENAME COLUMN customer_id TO user_id;
ALTER TABLE public.orders RENAME COLUMN total_amount TO total;

ALTER TABLE public.order_items RENAME COLUMN unit_price TO price;
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ---------------------------------------------------------------------------
-- RLS policies (recreated with new column names)
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "licenses_select_admin" ON public.licenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "licenses_select_own_licenciatario" ON public.licenses
  FOR SELECT USING (licenciatario_id = auth.uid());

CREATE POLICY "licenses_insert_admin" ON public.licenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "licenses_update_admin" ON public.licenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "products_select_authenticated" ON public.products
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "products_insert_admin_or_licenciatario" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_id AND l.licenciatario_id = auth.uid()
    )
  );

CREATE POLICY "products_update_admin_or_licenciatario" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_id AND l.licenciatario_id = auth.uid()
    )
  );

CREATE POLICY "orders_select_own_or_admin" ON public.orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- REQ-2: Licenciatario portal — product SKU, updated_at, catalog RLS, auth → public.users, realtime

-- ---------------------------------------------------------------------------
-- Products: SKU (unique per license, case-insensitive), updated_at + trigger
-- ---------------------------------------------------------------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;

UPDATE public.products p
SET sku = 'LEGACY-' || REPLACE(p.id::text, '-', '')
WHERE p.sku IS NULL OR TRIM(COALESCE(p.sku, '')) = '';

ALTER TABLE public.products ALTER COLUMN sku SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS products_license_sku_unique
  ON public.products (license_id, lower(sku));

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.set_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_products_updated_at();

-- ---------------------------------------------------------------------------
-- Products SELECT: admin (all), licenciatario (own licenses), catalog (active only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;

CREATE POLICY "products_select_admin" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "products_select_licenciatario_own" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = products.license_id AND l.licenciatario_id = auth.uid()
    )
  );

CREATE POLICY "products_select_active_catalog" ON public.products
  FOR SELECT USING (status = 'active');

-- ---------------------------------------------------------------------------
-- New Auth users → public.users (default role customer)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'customer')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Realtime (Supabase): ignore if publication missing
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.licenses;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;

-- users_select_admin hacía EXISTS (SELECT ... FROM public.users ...), lo que disparaba
-- otra vez las policies de users → "infinite recursion detected in policy for relation users".
-- Esta función corre como SECURITY DEFINER y lee el rol sin aplicar RLS.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.role FROM public.users u WHERE u.id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "users_select_admin" ON public.users;

CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.current_user_role() = 'admin');
