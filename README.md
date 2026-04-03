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
│   ├── page.tsx              # Hello world landing page
│   ├── auth/login|signup/    # REQ-1 auth scaffold (basic UI)
│   ├── dashboard/            # Protected example route
│   ├── api/health/           # GET /api/health (REQ-1 contract)
│   └── api/auth/callback/    # Supabase OAuth / email link callback
├── components/
├── lib/
│   ├── supabase/
│   └── health/               # REQ-1 health payload helpers
├── types/
│   └── database.ts           # Hand-maintained DB types (align with migrations)
├── supabase/migrations/
├── middleware.ts             # Session refresh + /dashboard protection
├── .env.example
├── biome.json
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

---

## Contributing (short)

1. Branch from `develop` or `main` (team convention).
2. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before pushing.
3. Open a PR; CI runs Biome, Vitest, TypeScript check, and `next build`.

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

## Database schema (REQ-1)

1. Baseline: [`supabase/migrations/20240101000000_initial_schema.sql`](supabase/migrations/20240101000000_initial_schema.sql)
2. Alignment (REQ-1 naming, RLS admin on `users`, `health_check`, orders/user columns, `licenciatario` role, etc.): [`supabase/migrations/20260203120000_req1_health_rls_schema.sql`](supabase/migrations/20260203120000_req1_health_rls_schema.sql)

Types in [`types/database.ts`](types/database.ts) should match the DB **after** both migrations are applied.

---

## Deployment

### Vercel

1. Import the repository in [Vercel](https://vercel.com/).
2. Set environment variables (mirror `.env.example`): Supabase URL/keys, `MERCADO_PAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`, `NEXT_PUBLIC_ENVIRONMENT=production`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`.
3. Add Supabase redirect URL: `https://<your-domain>/api/auth/callback`.
4. CI: on push to `main`, the [GitHub Actions workflow](.github/workflows/ci.yml) runs checks and deploys with `vercel` when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are configured.

---

## License

Proprietary – Jean Cartier Herencia SRL. All rights reserved.
