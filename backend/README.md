# Balasuriya Group API

Node.js + TypeScript + Express + Prisma + PostgreSQL.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID
npm run prisma:migrate # creates tables from prisma/schema.prisma
npm run seed            # creates an OWNER login (see console output for the password)
npm run dev              # starts the API on http://localhost:4000
```

## Roles

`OWNER` (full access) · `ADMIN` (manages staff accounts, resolves login
issues) · `CONSTRUCTION_MANAGER` (posts project progress updates) ·
`TOURISM_AGENT` (manages tour packages & promotions) · `FINANCE_APPROVER`
(approves/rejects payments) · `TICKET_AGENT`, `SOFTWARE_ENGINEER`,
`CHARTERED_ACCOUNTANT` (carried over from the previous system) · `CUSTOMER`.

## What's implemented

- Auth: email+password, OTP (email-based, 6-digit code, 5 min expiry),
  Google sign-in (with audience validation), JWT sessions.
- Construction: public project portfolio, staff-only progress updates
  (status + next-period plan + % complete).
- Tourism: public package/promotion browsing, staff-only package &
  promotion management, customer bookings.
- Payments: booking payments with 4 methods (card, Google Pay, bank
  deposit, Koko). Bank deposit / Koko go to a PENDING queue for a
  `FINANCE_APPROVER`/`ADMIN` to approve or reject. Card / Google Pay are
  scaffolded (`src/services/paymentProviders.ts`) but need a real payment
  gateway account before they'll work — see the comments there.
- Staff account management: admins create staff logins, deactivate
  accounts, and reset passwords (covers "solve user login issues").

## Not yet implemented / needs a decision

- Real email/SMS delivery for OTP codes (currently logged to the server
  console only — fine for development, not for production).
- Card and Google Pay gateway integration (needs a merchant account).
- File upload for construction progress photos (the API accepts URLs —
  needs an upload endpoint + storage, e.g. S3-compatible storage).
