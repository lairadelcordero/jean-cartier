-- Admin licenciatario MVP v1 schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'license_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.license_status AS ENUM ('active', 'inactive', 'pending');
  END IF;
END $$;

ALTER TYPE public.license_status ADD VALUE IF NOT EXISTS 'expired';

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Compatibility guards for environments with repaired/partial migration history.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid();
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

CREATE TABLE IF NOT EXISTS public.licenciatarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
  razon_social text NOT NULL,
  rut_cuit text NOT NULL UNIQUE,
  domicilio text NOT NULL,
  tipo_entidad text NOT NULL,
  regimen_tributario text NOT NULL,
  numero_inscripcion text,
  actividad_principal text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  archived boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  last_modified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.licenciatario_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid NOT NULL REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  contact_type text NOT NULL CHECK (contact_type IN ('primary', 'secondary')),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (licenciatario_id, contact_type)
);

CREATE TABLE IF NOT EXISTS public.licenciatario_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid NOT NULL REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'expired')),
  issue_date date NOT NULL,
  expiration_date date NOT NULL,
  renewal_date date,
  terms_accepted boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  last_modified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT licenciatario_licenses_issue_expiration_chk CHECK (expiration_date > issue_date)
);

CREATE TABLE IF NOT EXISTS public.license_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.license_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  base_price numeric(12,2) NOT NULL DEFAULT 0,
  exclusive_price_multiplier numeric(8,4) NOT NULL DEFAULT 1.25,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE public.licenciatario_licenses
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.license_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tier_id uuid REFERENCES public.license_tiers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS exclusive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exclusive_scope text NOT NULL DEFAULT 'none'
    CHECK (exclusive_scope IN ('none', 'production', 'import', 'both')),
  ADD COLUMN IF NOT EXISTS agreed_price numeric(12,2);

INSERT INTO public.license_categories (name, slug, sort_order)
VALUES
  ('Blancos', 'blancos', 10),
  ('Perfumes', 'perfumes', 20),
  ('Colchones', 'colchones', 30),
  ('Anteojos', 'anteojos', 40),
  ('Camisas', 'camisas', 50),
  ('Swetters', 'swetters', 60),
  ('Ambos', 'ambos', 70),
  ('Pañuelos', 'panuelos', 80),
  ('Corbatas', 'corbatas', 90),
  ('Calzado Hombre', 'calzado-hombre', 100),
  ('Calzado Mujer', 'calzado-mujer', 110),
  ('Calzado Deportivo', 'calzado-deportivo', 120),
  ('Ropa Deportiva', 'ropa-deportiva', 130)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.license_tiers (name, code, base_price, exclusive_price_multiplier)
VALUES
  ('Base', 'base', 1000, 1.25),
  ('Importación', 'importacion', 1500, 1.35),
  ('Producción', 'produccion', 2000, 1.40),
  ('Premium', 'premium', 3000, 1.50)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.licenciatario_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid NOT NULL REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  admin_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  change_type text NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.access_ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  ip_address inet NOT NULL,
  reason text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (licenciatario_id, ip_address)
);

CREATE TABLE IF NOT EXISTS public.licenciatario_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid REFERENCES public.licenciatarios(id) ON DELETE SET NULL,
  access_type text NOT NULL CHECK (access_type IN ('login_attempt', 'portal_access', 'data_view', 'download')),
  result text NOT NULL CHECK (result IN ('success', 'denied', 'error')),
  denial_reason text CHECK (
    denial_reason IS NULL OR denial_reason IN ('license_expired', 'license_inactive', 'license_not_found', 'account_deactivated', 'ip_blocked', 'other')
  ),
  ip_address inet,
  user_agent text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.licenciatario_commercial_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid NOT NULL REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  payment_model text NOT NULL CHECK (payment_model IN ('monthly', 'annual', 'per_container', 'per_quantity', 'custom')),
  base_tariff_amount numeric(12,2) NOT NULL CHECK (base_tariff_amount >= 0),
  currency text NOT NULL CHECK (currency IN ('ARS', 'USD', 'EUR')),
  effective_date date NOT NULL,
  end_date date,
  payment_due_day integer,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT licenciatario_terms_dates_chk CHECK (end_date IS NULL OR end_date > effective_date)
);

CREATE TABLE IF NOT EXISTS public.licenciatario_tariff_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commercial_terms_id uuid NOT NULL REFERENCES public.licenciatario_commercial_terms(id) ON DELETE CASCADE,
  quantity_from integer NOT NULL,
  quantity_to integer,
  price_per_unit numeric(12,2) NOT NULL CHECK (price_per_unit >= 0),
  CONSTRAINT licenciatario_tariff_tiers_chk CHECK (quantity_to IS NULL OR quantity_to > quantity_from)
);

CREATE TABLE IF NOT EXISTS public.licenciatario_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid NOT NULL REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency IN ('ARS', 'USD', 'EUR')),
  payment_method text NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'check', 'other')),
  reference text,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'pending', 'overdue')),
  notes text,
  recorded_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  recorded_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.licenciatario_documents_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenciatario_id uuid NOT NULL REFERENCES public.licenciatarios(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size >= 0 AND file_size <= 52428800),
  file_type text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('contract', 'terms', 'compliance', 'other')),
  description text,
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  uploaded_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS licenciatarios_status_idx ON public.licenciatarios(status);
CREATE INDEX IF NOT EXISTS licenciatarios_rut_cuit_idx ON public.licenciatarios(rut_cuit);
CREATE INDEX IF NOT EXISTS licenciatario_licenses_status_idx ON public.licenciatario_licenses(status);
CREATE INDEX IF NOT EXISTS licenciatario_licenses_category_idx ON public.licenciatario_licenses(category);
CREATE INDEX IF NOT EXISTS licenciatario_licenses_expiration_idx ON public.licenciatario_licenses(expiration_date);
CREATE INDEX IF NOT EXISTS licenciatario_licenses_category_id_idx ON public.licenciatario_licenses(category_id);
CREATE INDEX IF NOT EXISTS licenciatario_licenses_tier_id_idx ON public.licenciatario_licenses(tier_id);
CREATE INDEX IF NOT EXISTS licenciatario_access_logs_timestamp_idx ON public.licenciatario_access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS licenciatario_access_logs_result_idx ON public.licenciatario_access_logs(result);
CREATE INDEX IF NOT EXISTS licenciatario_access_logs_access_type_idx ON public.licenciatario_access_logs(access_type);
CREATE INDEX IF NOT EXISTS access_ip_blocks_active_idx ON public.access_ip_blocks(active, ip_address);
CREATE INDEX IF NOT EXISTS licenciatario_documents_v2_type_idx ON public.licenciatario_documents_v2(document_type, created_at DESC);
CREATE INDEX IF NOT EXISTS licenciatario_payments_status_idx ON public.licenciatario_payments(status, payment_date DESC);

DROP TRIGGER IF EXISTS trg_licenciatarios_updated_at ON public.licenciatarios;
CREATE TRIGGER trg_licenciatarios_updated_at
BEFORE UPDATE ON public.licenciatarios
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_licenciatario_contacts_updated_at ON public.licenciatario_contacts;
CREATE TRIGGER trg_licenciatario_contacts_updated_at
BEFORE UPDATE ON public.licenciatario_contacts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_licenciatario_licenses_updated_at ON public.licenciatario_licenses;
CREATE TRIGGER trg_licenciatario_licenses_updated_at
BEFORE UPDATE ON public.licenciatario_licenses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_license_categories_updated_at ON public.license_categories;
CREATE TRIGGER trg_license_categories_updated_at
BEFORE UPDATE ON public.license_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_license_tiers_updated_at ON public.license_tiers;
CREATE TRIGGER trg_license_tiers_updated_at
BEFORE UPDATE ON public.license_tiers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.licenciatarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_ip_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_commercial_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_tariff_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenciatario_documents_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS licenciatarios_editor_select ON public.licenciatarios;
CREATE POLICY licenciatarios_editor_select ON public.licenciatarios
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatarios_admin_write ON public.licenciatarios;
CREATE POLICY licenciatarios_admin_write ON public.licenciatarios
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_contacts_editor_select ON public.licenciatario_contacts;
CREATE POLICY licenciatario_contacts_editor_select ON public.licenciatario_contacts
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_contacts_admin_write ON public.licenciatario_contacts;
CREATE POLICY licenciatario_contacts_admin_write ON public.licenciatario_contacts
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_licenses_editor_select ON public.licenciatario_licenses;
CREATE POLICY licenciatario_licenses_editor_select ON public.licenciatario_licenses
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_licenses_admin_write ON public.licenciatario_licenses;
CREATE POLICY licenciatario_licenses_admin_write ON public.licenciatario_licenses
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS license_categories_editor_select ON public.license_categories;
CREATE POLICY license_categories_editor_select ON public.license_categories
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS license_categories_admin_write ON public.license_categories;
CREATE POLICY license_categories_admin_write ON public.license_categories
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS license_tiers_editor_select ON public.license_tiers;
CREATE POLICY license_tiers_editor_select ON public.license_tiers
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS license_tiers_admin_write ON public.license_tiers;
CREATE POLICY license_tiers_admin_write ON public.license_tiers
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_change_history_editor_select ON public.licenciatario_change_history;
CREATE POLICY licenciatario_change_history_editor_select ON public.licenciatario_change_history
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_change_history_admin_insert ON public.licenciatario_change_history;
CREATE POLICY licenciatario_change_history_admin_insert ON public.licenciatario_change_history
FOR INSERT WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_access_logs_editor_select ON public.licenciatario_access_logs;
CREATE POLICY licenciatario_access_logs_editor_select ON public.licenciatario_access_logs
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_access_logs_admin_insert ON public.licenciatario_access_logs;
CREATE POLICY licenciatario_access_logs_admin_insert ON public.licenciatario_access_logs
FOR INSERT WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS access_ip_blocks_editor_select ON public.access_ip_blocks;
CREATE POLICY access_ip_blocks_editor_select ON public.access_ip_blocks
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS access_ip_blocks_admin_write ON public.access_ip_blocks;
CREATE POLICY access_ip_blocks_admin_write ON public.access_ip_blocks
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_commercial_terms_editor_select ON public.licenciatario_commercial_terms;
CREATE POLICY licenciatario_commercial_terms_editor_select ON public.licenciatario_commercial_terms
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_commercial_terms_admin_write ON public.licenciatario_commercial_terms;
CREATE POLICY licenciatario_commercial_terms_admin_write ON public.licenciatario_commercial_terms
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_tariff_tiers_editor_select ON public.licenciatario_tariff_tiers;
CREATE POLICY licenciatario_tariff_tiers_editor_select ON public.licenciatario_tariff_tiers
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_tariff_tiers_admin_write ON public.licenciatario_tariff_tiers;
CREATE POLICY licenciatario_tariff_tiers_admin_write ON public.licenciatario_tariff_tiers
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_payments_editor_select ON public.licenciatario_payments;
CREATE POLICY licenciatario_payments_editor_select ON public.licenciatario_payments
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_payments_admin_write ON public.licenciatario_payments;
CREATE POLICY licenciatario_payments_admin_write ON public.licenciatario_payments
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());

DROP POLICY IF EXISTS licenciatario_documents_v2_editor_select ON public.licenciatario_documents_v2;
CREATE POLICY licenciatario_documents_v2_editor_select ON public.licenciatario_documents_v2
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS licenciatario_documents_v2_admin_write ON public.licenciatario_documents_v2;
CREATE POLICY licenciatario_documents_v2_admin_write ON public.licenciatario_documents_v2
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());
