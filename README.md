# Jean Cartier – Plataforma de Licencias & Marketplace

Plataforma oficial de licencias y marketplace de **Jean Cartier Herencia SRL**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| Database / Auth | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Realtime) |
| Payments | [Mercado Pago](https://www.mercadopago.com.ar/developers) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Linting / Formatting | [Biome](https://biomejs.dev/) |
| Testing | [Vitest](https://vitest.dev/) |
| Package Manager | [pnpm](https://pnpm.io/) |

---

## Git branches

- **`main`** — integration branch; pushes trigger CI and production deploy when Vercel secrets are set.
- **`develop`** (recommended) — integration for ongoing work; open PRs into `main` for release. Create `develop` on the remote if it does not exist yet.

---

## Project Structure

```
jean-cartier/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing + menú de acceso
│   ├── media-kit/                  # Manual de marca (UI kit)
│   ├── auth/login|signup/
│   ├── dashboard/                  # Panel genérico protegido
│   ├── licenciatario/            # Portal licenciatario (REQ-2)
│   ├── api/health/
│   ├── api/auth/callback/
│   └── api/licenciatario/        # APIs portal (licencias + productos)
├── components/
│   ├── site/site-access-nav.tsx
│   ├── auth/
│   ├── licenciatario/
│   └── media-kit/
├── lib/
│   ├── supabase/
│   ├── health/
│   └── licenciatario/            # auth helpers, validación, serializers
├── types/database.ts
├── supabase/migrations/
├── supabase/seed.sql             # Datos de desarrollo local (tras db reset)
├── proxy.ts                      # Next.js 16: sesión + rutas protegidas
├── .env.example
├── biome.json
├── docs/
│   └── guia-licenciatario-supabase.md  # Login + portal (Supabase cloud, paso a paso)
├── vitest.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.17
- pnpm ≥ 9
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB)

### 1. Clone the repository

```bash
git clone https://github.com/lairadelcordero/jean-cartier.git
cd jean-cartier
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`. See comments in [`.env.example`](.env.example) for where each value comes from (Supabase dashboard, Mercado Pago panel).

### 4. Start local Supabase (optional)

```bash
supabase start
```

Apply migrations:

```bash
supabase db push
```

### 5. Run development server

```bash
pnpm dev
```

Open [http://localhost:777](http://localhost:777) (dev script uses port **777**).

### 6. Login y portal licenciatario (Supabase cloud)

Guía paso a paso: **[docs/guia-licenciatario-supabase.md](docs/guia-licenciatario-supabase.md)**.

**Atajo:** con `SUPABASE_SERVICE_ROLE_KEY` real en `.env.local` y la cuenta ya creada en Auth:

`pnpm promote:licenciatario tu-email@ejemplo.com`

---

## Contributing (short)

1. Branch from `develop` or `main` (team convention).
2. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before pushing.
3. Open a PR; CI runs Biome, Vitest, TypeScript check, and `next build`.

---

## QA y cobertura de tests

- **Automatizado hoy:** contrato de `/api/health`, validación de productos (`lib/licenciatario/product-validation.test.ts`), referencias de licencia / serializers (`lib/licenciatario/serializers.test.ts`). **CI verde no cubre** flujos E2E del portal ni todas las rutas `/api/licenciatario`.
- **Manual recomendado:** login licenciatario → dashboard → detalle de licencia → CRUD productos (incl. SKU duplicado y desactivar). **RLS:** validar en un proyecto Supabase real con migraciones + `seed.sql` (local) o datos propios.
- **Deploy / GitHub Actions:** el job que despliega depende de secretos `VERCEL_*`; sin ellos el workflow puede fallar aunque el build local pase con `.env.local`.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server (port 777) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome lint & format check |
| `pnpm lint:fix` | Auto-fix lint & format issues |
| `pnpm typecheck` | TypeScript `tsc --noEmit` |
| `pnpm test` | Run Vitest tests |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm promote:licenciatario <email>` | (Dev) Promueve usuario a `licenciatario` + licencia ejemplo vía service role |

---

## API Reference

### `GET /api/health`

REQ-1 JSON contract:

**200 — all operational**

```json
{
  "status": "ok",
  "database": "connected",
  "mercadopago": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**503 — one or both dependencies failed**

```json
{
  "status": "error",
  "database": "connected",
  "mercadopago": "disconnected",
  "error": "Mercado Pago API unreachable",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Possible error messages: `Database connection failed`, `Mercado Pago API unreachable`, `Multiple system failures`.

The database check calls the Supabase RPC `health_check` (see migrations); Mercado Pago calls the public payment methods API with `MERCADO_PAGO_ACCESS_TOKEN`.

---

## Database schema (REQ-1 / REQ-2)

1. Baseline: [`supabase/migrations/20240101000000_initial_schema.sql`](supabase/migrations/20240101000000_initial_schema.sql)
2. REQ-1 (RLS, `health_check`, roles, columnas orders/users, etc.): [`supabase/migrations/20260203120000_req1_health_rls_schema.sql`](supabase/migrations/20260203120000_req1_health_rls_schema.sql)
3. REQ-2 (portal): SKU, `updated_at`, RLS de catálogo, trigger `auth.users` → `public.users`: [`supabase/migrations/20260403120000_req2_licenciatario_portal.sql`](supabase/migrations/20260403120000_req2_licenciatario_portal.sql)

Desarrollo local: [`supabase/seed.sql`](supabase/seed.sql) (usuario de prueba licenciatario; requiere Docker + `supabase db reset` o equivalente).

Types in [`types/database.ts`](types/database.ts) should match the DB **after** migrations are applied.

---

## Deployment

### Vercel

1. Import the repository in [Vercel](https://vercel.com/).
2. Set environment variables (mirror `.env.example`): Supabase URL/keys, `MERCADO_PAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`, `NEXT_PUBLIC_ENVIRONMENT=production`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`.
3. Add Supabase redirect URL: `https://<your-domain>/api/auth/callback`.
4. CI: on push to `main`, the [GitHub Actions workflow](.github/workflows/ci.yml) runs checks and deploys with `vercel` when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are configured. Pushes con HTTPS y OAuth sin scope **`workflow`** pueden rechazar cambios en `.github/workflows/`; usá un token con ese permiso o SSH.

---

## License

Proprietary – Jean Cartier Herencia SRL. All rights reserved.
