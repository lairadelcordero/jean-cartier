-- Licencias pueden existir sin titular (alta años antes de contraparte / producción).
ALTER TABLE public.licenciatario_licenses
  DROP CONSTRAINT IF EXISTS licenciatario_licenses_licenciatario_id_fkey;

ALTER TABLE public.licenciatario_licenses
  ALTER COLUMN licenciatario_id DROP NOT NULL;

ALTER TABLE public.licenciatario_licenses
  ADD CONSTRAINT licenciatario_licenses_licenciatario_id_fkey
  FOREIGN KEY (licenciatario_id) REFERENCES public.licenciatarios(id) ON DELETE SET NULL;
