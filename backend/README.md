# Backend (Express + Prisma)

Installed and built from the **repo root** (`npm install`, `npm run build:backend`).
On Vercel it runs inside `api/index.js`; locally `npm run dev:api` runs `src/server.ts`.

- `src/routes/` — API routes (`/api/auth`, `/api/users`, `/api/construction`,
  `/api/tourism`, `/api/payments`, `/api/inquiries`, `/api/visas`)
- `src/middleware/auth.ts` — token check; role and active status are re-read
  from the database on every request
- `src/scripts/seed.ts` — insert-only seed (safe on every deploy)
- `prisma/schema.prisma` + `prisma/migrations/` — never edit an applied
  migration; add a new one with `npm run db:migrate:dev`
