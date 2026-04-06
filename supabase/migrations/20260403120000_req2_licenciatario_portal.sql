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
