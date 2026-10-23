# Deploying for free (Vercel + Neon)

The whole site — pages **and** API — runs as **one Vercel project**, with its
data in a **free Neon Postgres database**. Nothing is stored in temporary
files any more, so deploys and server restarts can't wipe data.

| Piece | Service | Free plan |
|---|---|---|
| Website + API (1 serverless function) | Vercel Hobby | yes* |
| Database | Neon | 1 GB, never expires; sleeps after 5 min idle and wakes in about a second |
| Email (reset links, codes, notifications) | Resend | 3,000 emails/month |

\* **Vercel's Hobby plan is for non-commercial use only.** A company site that
advertises services and takes payment references counts as commercial under
Vercel's terms. Hobby is fine for building and testing now. Move the project
to Vercel Pro before you rely on it as the live business site.

---

## One-time setup (about 15 minutes)

### 1. Push this code to GitHub
```bash
git push origin main
```

### 2. Vercel project settings
In Vercel → your project → **Settings → Build and Deployment**:

* **Root Directory**: leave **empty** (the repo root). *If this was set to
  `frontend`, that alone breaks every deploy, because the API and
  `vercel.json` live at the root.*
* **Framework Preset**: Other
* Build / Output / Install commands: leave **default (off)**. `vercel.json` sets them.
* **Node.js Version**: 22.x

### 3. Add the free database (Neon)
Vercel → project → **Storage → Create Database → Neon (Serverless Postgres)** →
Free plan → region **Singapore** (closest to Sri Lanka) → connect it to
**Production, Preview and Development**.

This creates `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
Check they appear under **Settings → Environment Variables**.

### 4. Add the other environment variables
**Settings → Environment Variables** (tick Production + Preview):

| Name | Value |
|---|---|
| `JWT_SECRET` | A long random string. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `SEED_OWNER_EMAIL` | `clemonbalasuriyagroup@gmail.com` |
| `SEED_OWNER_PASSWORD` | A strong password for your first login (used **once**, on an empty database). Change it after signing in. |
| `RESEND_API_KEY` | From resend.com (free). Needed for "Forgot password", email sign-in codes and inquiry notifications. |
| `FROM_EMAIL` | `Balasuriya Group <security@balasuriyagroup.tech>` (the domain must be verified in Resend) |
| `SITE_URL` | `https://www.balasuriyagroup.tech` |

Optional: `GOOGLE_CLIENT_ID` (server) **and** `VITE_GOOGLE_CLIENT_ID` (same
value) to show "Sign in with Google". Without them the button is hidden.

### 5. Deploy
Vercel → **Deployments → Redeploy**. The build does this, in order:

1. Builds the API (TypeScript to JavaScript, plus the Prisma client).
2. `prisma migrate deploy` applies **only new** database migrations. It never resets or drops data.
3. Seed: creates the owner account **only if no owner exists yet**, and adds the staff
   roster **only on a brand-new empty database**. It never overwrites or deletes anything.
4. Builds the website.

### 6. Check it works
Open `https://www.balasuriyagroup.tech/api/health`. You should see:
```json
{ "status": "ok", "databaseReachable": true, "config": { "database": true, "jwtSecret": true, "email": true, ... } }
```
If anything shows `false`, fix that environment variable and redeploy.

Then sign in at `/login` with `SEED_OWNER_EMAIL` + `SEED_OWNER_PASSWORD`, and
change your password.

---

## Staff accounts
The roster in `backend/src/scripts/seed.ts` is added once, **without passwords**.
To give someone access, go to **Staff Portal → Staff Users → Reset password**.
That sets a temporary password and emails it (or shows it to you to pass on).
Remove or correct any entries that aren't real people. Removed people stay removed.

## If a deploy fails
Vercel → the failed deployment → **Build Logs**. Common causes:

| Log says | Fix |
|---|---|
| `Environment variable not found: DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Step 3: connect Neon to this environment |
| `P1001: Can't reach database server` | Neon project is suspended or deleted. Check the Neon dashboard |
| `JWT_SECRET is missing` (at runtime, in `/api/health`) | Step 4 |
| `No Output Directory named "dist"` / API returns 404 | Root Directory must be empty (step 2) |

## Backups
Neon offers point-in-time restore (how far back depends on the plan) under
**Neon → project → Backup & Restore**. For your own copy at any time:
`pg_dump "$DATABASE_URL_UNPOOLED" > backup.sql`.

## Local development
```bash
docker compose up -d                 # local Postgres
cp .env.example .env                 # then edit values
npm install
npm run db:migrate:dev               # create tables
npm run build:backend && npm run db:seed
npm run dev:api                      # API on :4000
npm run dev:web                      # site on :5173 (separate terminal)
```
