# Jean Cartier – Plataforma de Licencias & Marketplace

Plataforma oficial de licencias y marketplace de **Jean Cartier Herencia SRL**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, TypeScript) |
| Database / Auth | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Realtime) |
| Payments | [Mercado Pago](https://www.mercadopago.com.ar/developers) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Linting / Formatting | [Biome](https://biomejs.dev/) |
| Testing | [Vitest](https://vitest.dev/) |
| Package Manager | [pnpm](https://pnpm.io/) |

---

## Project Structure

```
jean-cartier/
├── app/
│   ├── layout.tsx
│   ├── page.tsx            # Hello world landing page
│   ├── globals.css
│   └── api/
│       └── health/
│           └── route.ts    # GET /api/health
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   └── server.ts       # Server Component Supabase client
│   └── mercadopago/
│       └── client.ts
├── types/
│   └── database.ts         # Generated DB types
├── supabase/
│   └── migrations/         # SQL migrations
├── middleware.ts            # Auth session refresh
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
- [Supabase CLI](https://supabase.com/docs/guides/cli)

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

Edit `.env.local` and fill in your Supabase project URL, keys, and Mercado Pago credentials.

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

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome lint & format check |
| `pnpm lint:fix` | Auto-fix lint & format issues |
| `pnpm test` | Run Vitest tests |
| `pnpm test:watch` | Run Vitest in watch mode |

---

## API Reference

### `GET /api/health`

Returns the health status of all platform components.

**Response (200 – healthy):**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "components": {
    "database": { "status": "healthy", "latency_ms": 42 },
    "mercado_pago": { "status": "healthy", "latency_ms": 150 }
  }
}
```

**Response (503 – degraded):**

```json
{
  "status": "degraded",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "components": {
    "database": { "status": "error", "latency_ms": 5001, "error": "timeout" },
    "mercado_pago": { "status": "healthy", "latency_ms": 120 }
  }
}
```

---

## Database Schema

See [`supabase/migrations/20240101000000_initial_schema.sql`](supabase/migrations/20240101000000_initial_schema.sql) for the full schema with RLS policies.

---

## Deployment

### Vercel

1. Import the repository in [Vercel](https://vercel.com/).
2. Set the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `NEXT_PUBLIC_APP_ENV` → `production`
   - `NEXT_PUBLIC_APP_URL` → your production URL
3. Deploy. The CI workflow also automatically deploys on every push to `main`.

---

## License

Proprietary – Jean Cartier Herencia SRL. All rights reserved.
