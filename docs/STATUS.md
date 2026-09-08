# Status & Open Items

_Both frontend and backend are now fresh rebuilds — none of the old code was kept
(only the logo image and the palette sampled from it). History of how we got here
is in the git log if it's ever useful._

## What's built (5 commits so far)
1. Imported the old code as-is (for reference / history).
2. Fixed 2 real security holes in the old .NET backend (CORS wide open +
   credentialed; Google login not checking token audience) — moot now since that
   backend was replaced, but documents what was wrong with it.
3. Removed the old .NET backend.
4. Built a new **Node.js + TypeScript + Express + Prisma + PostgreSQL** backend:
   auth (password, OTP, Google — with the audience check carried forward), RBAC,
   construction projects + progress updates, tourism packages + promotions +
   bookings, payments (bank deposit/Koko → approval queue; card/Google Pay
   scaffolded pending a merchant account), staff account management.
5. Built a new **React + TypeScript + Vite + Tailwind** frontend: public site
   (Home, Construction portfolio, Tourism browse/book/pay, About, Login/Register),
   and a role-gated staff portal (progress updates, package/promotion manager,
   payment approvals, staff account admin) wired to the new backend.

## Can't run/verify in this sandbox
This sandbox has no .NET SDK and, more importantly, **no access to the npm
package registry or dot.net** (confirmed via direct `curl` — both blocked by org
egress policy, not a transient issue). So neither `npm install` nor a real build
could be run here. Everything was hand-written carefully and type-checked with
the local TypeScript compiler against hand-written stand-ins for the dependencies'
types (documented in commit messages) — that catches typos and logic errors but
is not the same as actually running it. **You'll need to `npm install` in both
`backend/` and `frontend/` on your own machine (or wherever this deploys) and
report back anything that breaks.**

## Git: can't push directly from this session
Tried pushing to `git@github.com:ClemonBalasuriya/BalasuriyaGroup.git` — the
session's git proxy refused with:
> access denied by the git proxy: ClemonBalasuriya/BalasuriyaGroup is not in
> this session's authorized repository set

So this session *can* push to GitHub through an injected credential, but only for
repos explicitly authorized for it — which happens outside this chat (likely
wherever this Claude environment/session's connected repositories are configured).
Until that's sorted out, work is delivered as a **git bundle** (preserves full
commit history) after each milestone — clone it, add your real remote, push.

## Resolved
- No payment gateway account yet — Card/Google Pay stay as explicit "not
  configured" placeholders; Bank Deposit and Koko (reference + approval queue)
  work end to end already.
- Repo access: continuing with git bundle handoffs rather than session repo
  authorization for now.

## Brand
Logo kept as-is — professional navy monogram + serif wordmark. Palette sampled
from it: primary navy `#0B1E3F`, secondary steel blue `#1E3A6E`, accent `#4A6FA5`,
neutral surface `#F4F6F9`.

## Staff roles
`OWNER`, `ADMIN`, `CONSTRUCTION_MANAGER`, `TOURISM_AGENT`, `FINANCE_APPROVER`,
`TICKET_AGENT`, `SOFTWARE_ENGINEER`, `CHARTERED_ACCOUNTANT`, `CUSTOMER`.

## Local dev & deployment scaffolding added
- `docker-compose.yml` — local Postgres for development.
- `backend/Dockerfile` — production image (Render/Railway/Fly/AWS-friendly).
- `frontend/vercel.json` — SPA routing for a Vercel static deploy.
- `.github/workflows/ci.yml` — builds both apps on every push. **Check this is
  green after your first push** — it's the first real build/install this code
  will get, since the sandbox that wrote it couldn't run `npm install`.

## Not yet done
- Real email/SMS delivery for OTP (console-logged only right now).
- Card/Google Pay gateway integration (needs merchant credentials — see above).
- Construction progress photo upload (API takes URLs; needs an upload endpoint +
  storage, e.g. S3-compatible).
- Multi-language (i18n) — the old app had it; dropped for this rebuild's first
  pass to keep scope manageable. Can be added back if wanted.
- Deploying to actual cloud hosting (AWS/Vercel/Azure).
