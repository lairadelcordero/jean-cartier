-- Entity types catalog (Argentina), payment FX snapshots, license category hierarchy, license detail fields

CREATE TABLE IF NOT EXISTS public.entity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_types_active_sort_idx ON public.entity_types (active, sort_order, name);

DROP TRIGGER IF EXISTS trg_entity_types_updated_at ON public.entity_types;
CREATE TRIGGER trg_entity_types_updated_at
BEFORE UPDATE ON public.entity_types
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.entity_types (name, slug, sort_order)
VALUES
  ('Pendiente de definir', 'pendiente', 0),
  ('Persona humana', 'persona_humana', 10),
  ('Monotributista', 'monotributista', 20),
  ('Responsable inscripto', 'responsable_inscripto', 30),
  ('Sociedad anónima (SA)', 'sociedad_anonima', 40),
  ('Sociedad de responsabilidad limitada (SRL)', 'sociedad_responsabilidad_limitada', 50),
  ('Sociedad por acciones simplificada (SAS)', 'sociedad_acciones_simplificada', 60),
  ('Cooperativa', 'cooperativa', 70),
  ('Fundación / asociación civil', 'fundacion_asociacion_civil', 80),
  ('Organismo público', 'organismo_publico', 90),
  ('Otro', 'otro', 100)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.license_categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.license_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS license_categories_parent_idx ON public.license_categories (parent_id);

ALTER TABLE public.licenciatario_licenses
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS legal_counsel_name text,
  ADD COLUMN IF NOT EXISTS legal_counsel_email text,
  ADD COLUMN IF NOT EXISTS legal_counsel_phone text,
  ADD COLUMN IF NOT EXISTS patent_registration text;

ALTER TABLE public.licenciatario_payments
  ADD COLUMN IF NOT EXISTS fx_rate_used numeric(14, 4),
  ADD COLUMN IF NOT EXISTS fx_date date,
  ADD COLUMN IF NOT EXISTS fx_reference_note text,
  ADD COLUMN IF NOT EXISTS amount_ars_equivalent numeric(14, 2);

ALTER TABLE public.licenciatario_payments
  DROP CONSTRAINT IF EXISTS licenciatario_payments_currency_chk;

ALTER TABLE public.licenciatario_payments
  ADD CONSTRAINT licenciatario_payments_currency_chk
  CHECK (currency IN ('ARS', 'USD', 'EUR'));

ALTER TABLE public.licenciatario_payments
  DROP CONSTRAINT IF EXISTS licenciatario_payments_fx_snapshot_chk;

ALTER TABLE public.licenciatario_payments
  ADD CONSTRAINT licenciatario_payments_fx_snapshot_chk
  CHECK (
    (currency = 'USD' AND fx_rate_used IS NOT NULL AND fx_rate_used > 0 AND amount_ars_equivalent IS NOT NULL) OR
    (currency = 'ARS' AND fx_rate_used IS NULL AND amount_ars_equivalent IS NULL)
  );

ALTER TABLE public.entity_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS entity_types_editor_select ON public.entity_types;
CREATE POLICY entity_types_editor_select ON public.entity_types
FOR SELECT USING (public.is_editor_or_above());

DROP POLICY IF EXISTS entity_types_admin_write ON public.entity_types;
CREATE POLICY entity_types_admin_write ON public.entity_types
FOR ALL USING (public.is_admin_or_sudo())
WITH CHECK (public.is_admin_or_sudo());
