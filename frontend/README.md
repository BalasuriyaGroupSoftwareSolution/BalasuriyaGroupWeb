# Balasuriya Group — Frontend

React + TypeScript + Vite + Tailwind CSS, talking to the `../backend` API.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # set VITE_API_URL (and VITE_GOOGLE_CLIENT_ID if using Google sign-in)
npm run dev                   # http://localhost:5173
```

## Pages

- **Public**: Home, Construction (project portfolio), Tourism (browse
  packages by category, book, pay), About, Login/Register.
- **Staff portal** (`/staff`, role-gated): Construction progress updates,
  Tourism package & promotion management, Payment approvals, Staff account
  management (admin only).

## Notes

- Payment methods: Bank Deposit and Koko just collect a reference and go to
  the finance approval queue. Card and Google Pay call the backend, which
  currently returns "not configured" until a real payment gateway account
  is connected — see `backend/src/services/paymentProviders.ts`.
- Google sign-in needs `VITE_GOOGLE_CLIENT_ID` (frontend) and
  `GOOGLE_CLIENT_ID` (backend) set to the same OAuth Client ID, or the
  button won't render.
