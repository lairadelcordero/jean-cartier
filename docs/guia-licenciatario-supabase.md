# Guía paso a paso: login y portal licenciatario (Supabase en la nube)

Hacé **un solo paso**, confirmá que está **listo**, y recién después seguí con el siguiente.

La app local debe usar el mismo proyecto que configuraste en `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`).

---

## Paso 1 — Abrir el proyecto correcto

1. Entrá al [dashboard de Supabase](https://supabase.com/dashboard).
2. Abrí el proyecto cuya **URL** sea la misma que `NEXT_PUBLIC_SUPABASE_URL` en tu `.env.local` (termina en `xxxx.supabase.co`).

**Listo cuando:** ves el panel de ese proyecto (menú con *Authentication*, *Table Editor*, etc.).

---

## Paso 2 — Quitar bloqueo de “confirmar email” (solo desarrollo)

1. Menú izquierdo: **Authentication** → **Providers**.
2. Abrí **Email**.
3. **Desactivá** la confirmación por correo si existe (*Confirm email* / *Enable email confirmations*).
4. Guardá los cambios.

**Listo cuando:** podés registrar una cuenta y usarla para login sin abrir el mail.

---

## Paso 3 — Crear tu cuenta en la app

1. Con `pnpm dev` corriendo, abrí **http://localhost:777**.
2. Entrá a **Crear cuenta**.
3. Usá un email y contraseña que **recuerdes**.

**Listo cuando:** el registro termina sin error visible.

---

## Atajo (en tu PC): script con service role

Si ya tenés **confirmada** la cuenta en Auth y en `.env.local` pegaste la clave **`SUPABASE_SERVICE_ROLE_KEY`** (service_role del dashboard):

```bash
pnpm promote:licenciatario tu-email@ejemplo.com
```

Eso hace `upsert` en **`public.users`** con `role = licenciatario` y crea una licencia de ejemplo si no tenés ninguna. Luego iniciá sesión de nuevo en localhost y entrá al portal.

---

## Paso 4 — Dar rol `licenciatario` en la base

1. En Supabase: **Table Editor** → tabla **`users`** (schema **public**).
2. Si **no hay fila** con tu email después del registro, tu proyecto puede no tener aplicadas las migraciones (trigger `auth` → `public.users`). En ese caso: ejecutá las migraciones del repo en este proyecto, o insertá a mano una fila en `users` con `id` = el UUID del usuario en **Authentication → Users** y tu `email`.
3. En la fila de tu usuario, editá **`role`**: debe quedar exactamente **`licenciatario`** (minúsculas).
4. Guardá.

**Listo cuando:** la fila muestra `role = licenciatario`.

---

## Paso 5 — Crear al menos una licencia

1. **Table Editor** → tabla **`licenses`** → **Insert row**.
2. **`licenciatario_id`**: el mismo **UUID** que **`id`** de tu usuario en `users` (copiar/pegar).
3. **`category`**: texto libre, por ejemplo `marroquinería`.
4. **`status`**: `active`.
5. Completá otros campos obligatorios si la tabla los pide y guardá.

**Listo cuando:** aparece una fila en `licenses` con tu `licenciatario_id`.

---

## Paso 6 — Iniciar sesión en la app

1. En **http://localhost:777** → **Iniciar sesión**.
2. Usá el **mismo email y contraseña** del Paso 3.

**Listo cuando:** entrás sin el mensaje *Invalid login credentials*.

---

## Paso 7 — Entrar al portal

1. Abrí **http://localhost:777/licenciatario/dashboard** o usá **Portal licenciatarios** en el menú superior.

**Listo cuando:** ves el dashboard del portal (con licencias o vacío si solo creaste la fila mínima).

---

## Paso 8 — URLs de Auth (solo si falla el callback o redirecciones)

1. En Supabase: **Authentication** → **URL configuration**.
2. Agregá en **Redirect URLs** (o equivalente):
   - `http://localhost:777/**`
   - `http://localhost:777/api/auth/callback`
3. **Site URL** de desarrollo puede ser `http://localhost:777`.

**Listo cuando:** después de iniciar sesión no ves pantalla en blanco ni error de redirect.

---

## Si algo falla

| Síntoma | Revisar |
|--------|---------|
| *Invalid login credentials* | ¿El usuario existe en **Authentication → Users**? ¿El `.env.local` apunta a **este** proyecto? Probabá también la clave **anon** JWT (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) y comentá la publishable. |
| Portal “acceso denegado” | Paso 4: **`role`** = `licenciatario`. |
| Dashboard sin licencias | Paso 5: **`licenses.licenciatario_id`** = tu **`users.id`**. |
| No aparece fila en `public.users` tras registrarte | Migraciones del repo no aplicadas en Supabase; aplicar migraciones o insert manual alineado con `auth.users.id`. |

---

## Notas

- Las variables públicas de Supabase están documentadas en [`.env.example`](../.env.example); el cliente usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` ([`lib/supabase/env.ts`](../lib/supabase/env.ts)).
- Mercado Pago en front: `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` (no solo `MERCADO_PAGO_PUBLIC_KEY`).
