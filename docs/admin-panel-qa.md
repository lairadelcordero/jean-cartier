# QA panel admin (SUDO)

Checklist manual para validar que el panel admin funciona de punta a punta.

## Precondiciones

- Migraciones de `supabase/migrations/` aplicadas (incluye `20260407190000_admin_sudo_panel.sql`).
- Usuario `sudo` creado (`pnpm promote:sudo <email>`).
- `SUPABASE_SERVICE_ROLE_KEY` configurada en entorno servidor.

## Smoke por secciones

1. Iniciar sesión con usuario `sudo` y abrir `/admin`.
2. Navegar con el header a:
   - `/admin/users`
   - `/admin/licenses`
   - `/admin/customers`
   - `/admin/documents`
3. Confirmar que cada ruta responde 200 y renderiza tabla/form.

## Flujos críticos

### Usuarios y permisos

1. Crear un usuario nuevo en `/admin/users`.
2. Cambiar rol a `licenciatario`.
3. Cambiar rol a `editor`.
4. Validar que un `admin` no puede asignar `sudo`.

### Licencias

1. En `/admin/licenses`, asignar licencia a un `licenciatario`.
2. Revisar que la licencia aparece en la grilla.
3. Validar que el licenciatario ve su licencia al entrar al portal.

### Clientes y pagos

1. Seleccionar un cliente en `/admin/customers`.
2. Guardar datos fiscales.
3. Ver compras (`orders`) y pagos (`payments`) sin errores.

### Documentación

1. Crear un documento para un licenciatario en `/admin/documents`.
2. Cambiar estado (draft -> published).
3. Confirmar persistencia tras refresh.

## API endpoints a revisar (Network)

- `GET/POST /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `GET/POST /api/admin/licenses`
- `POST /api/admin/licenses/assign`
- `GET /api/admin/customers`
- `GET/PATCH /api/admin/customers/:id/billing`
- `GET/POST /api/admin/documents`
- `PATCH /api/admin/documents/:id`

## Criterio de salida

- No errores 5xx.
- Cambios persistidos en DB.
- Rutas restringidas correctamente por rol.
