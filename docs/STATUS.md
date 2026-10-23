# Status & Open Items

_Last updated: 2026-10-23_

## Fixed in this round: deploys, data loss, security

**Why deploys failed and data kept resetting**
- The live API was 10 separate Vercel functions that stored accounts, visas
  and inquiries in `/tmp` files. Vercel wipes `/tmp` on every deploy and every
  cold start, so everything reverted to the built-in defaults.
- `/api/construction`, `/api/tourism` and `/api/payments` didn't exist on
  Vercel at all. Staff edits never saved, and the public pages always showed
  the built-in sample projects and tours.
- The frontend hid failures: it showed "saved" or "created" even when the
  server rejected a change, and kept the change only in that one browser.
- The earlier Render setup used Render's free plan. Its web service sleeps
  after 15 min idle (about 1 min to wake up), and its free database is deleted
  30 days after it is created.
- The database migrations never created `ConstructionProject.featured`,
  `coverImageUrl` and `projectType`, so the projects API would crash on a
  fresh database.

**Now**
- One Vercel function (`api/index.js`) runs the real Express + Prisma API.
  All data is in Postgres (Neon free, which doesn't expire).
- Deploys run `prisma migrate deploy` (adds new migrations only) and an
  insert-only seed. Neither overwrites nor deletes data.
- The frontend is server-authoritative. Errors are shown, never faked.

**Security holes closed** (each one verified by `npm run test:security`)
1. Hard-coded "master passwords" (`Admin@123`, `ChangeMe123!` …) logged into any staff account.
2. Any listed staff email plus **any** 8+ character password logged in.
3. The owner email logged in with **any** password (backend and frontend fallbacks).
4. The token check accepted unsigned tokens and tokens signed with public, hard-coded secrets.
5. `/api/auth/me` accepted any token starting with `live_jwt_token_` or `bg_token_` as OWNER.
6. `/api/users` had no login check: anyone could list, create (including OWNER), reset passwords, or delete.
7. `forgot-password` returned the reset token in its response, so anyone could reset anyone's password.
8. `reset-password` accepted `verified_session` and `…:local_fallback` as valid tokens.
9. Any email containing "balasuriya" or "clemon" was treated as OWNER on reset or login.
10. "Sign in with Google" let anyone type any email and be logged in as that person.
11. `/api/auth/demo-login` gave anyone an OWNER session.
12. Visa applications (with passport numbers) were publicly readable and editable.
13. Plain-text passwords were saved in browser `localStorage`. They are now purged on the next visit.
14. Visitor-typed text was inserted unescaped into staff notification emails.
15. OTP codes were written to the server logs and kept in memory (unreliable on serverless).
    They are now stored hashed in the database, single use, and rate-limited.

## Content accuracy: needs the owner's decision
These are on the live site. Keep each one only if it is true:
- **Testimonials** (`frontend/src/data/companyProfile.ts`): three named people
  and companies. If they aren't real customers who agreed to be quoted, remove
  them. Invented testimonials can mislead customers.
- **Accreditations** (Navbar, Footer, Home, Air Ticketing, Software pages):
  "CIDA Certified", "CIDA & ISO Compliant", "ISO 27001", IATA wording, "150+ airlines".
  Keep only the ones the company actually holds (state the CIDA grade or IATA number if you can).
- **Sample construction projects and tour packages** (`FALLBACK_PROJECTS` in
  `ConstructionPublic.tsx`, `FALLBACK_PACKAGES` in `TourismPublic.tsx`).
  These are shown when the database has none, e.g. "Kandy–Mahiyangana Highway
  Extension, 78% complete". Add real ones in the staff portal (they replace the
  samples automatically), or remove the samples.
- **Staff roster** (`backend/src/scripts/seed.ts`): 16 people. The non-family
  entries had sequential placeholder phone numbers. Delete anyone who isn't real
  from Staff Users after the first deploy.
- **Careers** job openings and **Sustainability** claims: confirm they are current.
- `companyStats` (2 years, 15 projects, 98%) and some pages say "3+ Years" or "4+ Years". Make them consistent.

## Not yet done
- Staff page to review visa applications. The API supports it (`GET /api/visas`
  returns every application for visa staff), but there's no screen yet.
- Linking a construction project to its customer, so the customer portal can show it.
- Card / Google Pay gateway (needs a merchant account). Bank deposit and Koko
  reference + approval work end to end.
- Photo upload for progress updates (currently image URLs).
- The staff dashboard "activity feed" is stored per browser. Move it to the database if needed.
