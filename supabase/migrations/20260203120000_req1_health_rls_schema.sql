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
