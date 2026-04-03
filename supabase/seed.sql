-- =============================================================================
-- Jean Cartier — datos de desarrollo local (REQ-2 portal licenciatario)
-- =============================================================================
-- Ejecuta automáticamente con:  supabase db reset
-- O manual en SQL Editor / psql contra la misma DB que usás con Next.js.
--
-- Cuentas (contraseña para ambas: DevPassword123!)
--   • licenciatario@jeancartier.test  → rol licenciatario (portal + licencias)
--   • customer@jeancartier.test        → rol customer (no puede entrar al portal)
--
-- Tras reset: iniciá sesión en la app con el mail de licenciatario y abrí
--   /licenciatario/dashboard
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- UUIDs fijos para re-ejecutar el seed sin duplicar datos
-- Licenciatario
-- 11111111-1111-4111-a111-111111111111
-- Customer (403 en /licenciatario)
-- 22222222-2222-4222-a222-222222222222
-- Licencias
-- 33333333-3333-4333-a333-333333333333  marroquinería
-- 44444444-4444-4444-a444-444444444444  accesorios

BEGIN;

-- ---------------------------------------------------------------------------
-- Limpiar corridas anteriores del mismo seed (mismo orden FK)
-- ---------------------------------------------------------------------------
DELETE FROM public.products
WHERE id IN (
  '55555555-5555-4555-a555-555555555501',
  '55555555-5555-4555-a555-555555555502',
  '66666666-6666-4666-a666-666666666601'
);

DELETE FROM public.licenses
WHERE id IN (
  '33333333-3333-4333-a333-333333333333',
  '44444444-4444-4444-a444-444444444444'
);

DELETE FROM public.users
WHERE id IN (
  '11111111-1111-4111-a111-111111111111',
  '22222222-2222-4222-a222-222222222222'
);

DELETE FROM auth.identities
WHERE user_id IN (
  '11111111-1111-4111-a111-111111111111',
  '22222222-2222-4222-a222-222222222222'
);

DELETE FROM auth.users
WHERE id IN (
  '11111111-1111-4111-a111-111111111111',
  '22222222-2222-4222-a222-222222222222'
);

-- ---------------------------------------------------------------------------
-- Auth: licenciatario
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-4111-a111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'licenciatario@jeancartier.test',
  crypt('DevPassword123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Demo Licenciatario"}',
  NOW(),
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '11111111-1111-4111-a111-111111111111',
  '{"sub":"11111111-1111-4111-a111-111111111111","email":"licenciatario@jeancartier.test"}'::jsonb,
  'email',
  '11111111-1111-4111-a111-111111111111',
  NOW(),
  NOW(),
  NOW()
);

-- Trigger creó public.users con rol customer → elevamos a licenciatario
UPDATE public.users
SET role = 'licenciatario'
WHERE id = '11111111-1111-4111-a111-111111111111';

-- ---------------------------------------------------------------------------
-- Auth: customer (para probar /licenciatario/access-denied)
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '22222222-2222-4222-a222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'customer@jeancartier.test',
  crypt('DevPassword123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Demo Cliente"}',
  NOW(),
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '22222222-2222-4222-a222-222222222222',
  '{"sub":"22222222-2222-4222-a222-222222222222","email":"customer@jeancartier.test"}'::jsonb,
  'email',
  '22222222-2222-4222-a222-222222222222',
  NOW(),
  NOW(),
  NOW()
);

-- ---------------------------------------------------------------------------
-- Licencias y productos (REQ-2)
-- ---------------------------------------------------------------------------
INSERT INTO public.licenses (
  id,
  licenciatario_id,
  category,
  status,
  fee_amount,
  commission_pct,
  start_date,
  end_date,
  created_at
)
VALUES (
  '33333333-3333-4333-a333-333333333333',
  '11111111-1111-4111-a111-111111111111',
  'marroquinería',
  'active',
  NULL,
  NULL,
  '2024-01-15',
  '2025-01-15',
  '2024-01-15T10:00:00Z'
),
(
  '44444444-4444-4444-a444-444444444444',
  '11111111-1111-4111-a111-111111111111',
  'accesorios',
  'active',
  NULL,
  NULL,
  '2024-02-01',
  '2025-02-01',
  '2024-02-01T10:00:00Z'
);

INSERT INTO public.products (
  id,
  license_id,
  name,
  sku,
  description,
  price,
  stock,
  status,
  created_at
)
VALUES (
  '55555555-5555-4555-a555-555555555501',
  '33333333-3333-4333-a333-333333333333',
  'Cartera de cuero negro',
  'CRT-001',
  'Cartera de cuero genuino, color negro',
  150.00,
  25,
  'active',
  NOW()
),
(
  '55555555-5555-4555-a555-555555555502',
  '33333333-3333-4333-a333-333333333333',
  'Cinturón de cuero marrón',
  'CIN-002',
  NULL,
  85.00,
  40,
  'active',
  NOW()
),
(
  '66666666-6666-4666-a666-666666666601',
  '44444444-4444-4444-a444-444444444444',
  'Pañuelo seda',
  'ACC-001',
  NULL,
  45.00,
  12,
  'inactive',
  NOW()
);

COMMIT;
