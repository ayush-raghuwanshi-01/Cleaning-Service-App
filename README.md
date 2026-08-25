# Home Shine — Frontend

Customer-facing web app for **Home Shine**, a Bhopal housekeeping and home-cleaning service. Built with
React 19, TypeScript, TanStack Router (file-based routing), TanStack Query, and Tailwind CSS v4.

It talks to the FastAPI backend (`Cleaning-Service-backend`), which handles auth, the service
catalog, and the order lifecycle.

## Features

- **Public marketing pages** — home, services, service detail, pricing, help.
- **Customer accounts** — register/login (required to place an order), view & track your orders.
- **Booking flow** — pick a service, choose date/slot, enter the address, place the order.
- **Order tracking** — public tracking by booking code + a personal order dashboard.
- **Admin dashboard** — order inbox with filters, add orders (from calls/WhatsApp), edit order
  details, record payments (UPI/cash), add-ons, WhatsApp settings, and day stats.
  (Requires an OWNER/ADMIN/OPERATIONS account.)

## Tech stack

- [Vite](https://vite.dev) + [React 19](https://react.dev)
- [TanStack Router](https://tanstack.com/router) — file-based routes in `src/routes/`
- [TanStack Query](https://tanstack.com/query) — server-state/data fetching
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript (strict)

## Project structure

```
src/
  components/
    admin/       # Admin layout & nav
    auth/        # Auth page shell
    booking/     # Booking widget (order placement)
    layout/      # Header (with mobile menu), Footer, page shells
    marketing/   # Home page sections
    system/      # Global chrome (offline banner)
    track/       # Public order tracking
    ui/          # UI primitives (Button, Card, Input, Toast, ErrorState, StatusBadge, Skeleton…)
  lib/
    api.ts       # Typed HTTP client: timeouts, offline detection, token refresh, friendly errors
    auth.tsx     # Auth provider/hook (session restore survives brief backend outages)
    *-api.ts     # Endpoint modules (catalog, orders, admin)
    config.ts    # App config & brand constants (env-driven)
    contact.ts   # tel:/wa.me link helpers
    format.ts    # INR, duration, date helpers
    logger.ts    # Leveled frontend logger (single transport hookup point)
    status.ts    # Order-status → label/colour maps
    validation.ts# Zod schemas shared by customer + admin forms
  routes/        # File-based routes (TanStack Router)
  types/         # Shared domain types (mirror the backend)
```

## Reliability & UX architecture

- **Resilient API client** (`lib/api.ts`): every request has a 20 s abort timeout,
  offline detection, a single automatic token-refresh retry on 401, and status-aware
  error messages (`ApiError` with machine-readable `code` + human copy — including
  FastAPI 422 validation payloads flattened into readable sentences).
- **Global error handling** (`main.tsx`): query and mutation caches log every failure
  (`lib/logger.ts`) and surface systemic failures (offline / backend unreachable /
  5xx) as toasts. Mutations that handle their own errors opt out via
  `meta: { silent: true }` — so nothing ever fails silently, and nothing
  double-notifies.
- **Per-page states**: every data view renders dedicated **loading skeletons**,
  **error states with retry** (`ErrorState`), and **empty states with a next action** —
  network failures are never mistaken for "no data" or "not found".
- **Validation** (`lib/validation.ts`): zod schemas on both customer and admin forms
  (Indian mobile, Bhopal pincode, booking date window, money/quantity parsing) with
  inline field errors, mirroring the backend's Pydantic rules. Phone numbers are
  normalized to `91XXXXXXXXXX` before submission.
- **Session robustness**: session restore only clears tokens on real auth failures —
  a brief backend outage never logs users out. Registration and auto-login are
  separate steps so a login hiccup can't masquerade as "registration failed".
- **Design system**: one Tailwind v4 `@theme` (brand blue / fresh green / sun amber /
  ink neutrals), Inter + Plus Jakarta Sans typography, focus-visible rings on all
  interactive elements, `prefers-reduced-motion` support, and consistent hover /
  active / disabled / loading states everywhere.

## Getting started

Prerequisites: Node 20+, and the FastAPI backend running on `http://localhost:8000`.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. During development, Vite proxies `/api/*` to the backend
(configurable via `VITE_API_PROXY_TARGET`, default `http://localhost:8000`).

### Environment

Copy `.env.example` to `.env` if you need to change the API target:

```dotenv
VITE_API_URL=
VITE_API_PROXY_TARGET=http://localhost:8000
```

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # eslint
npm run preview  # preview the production build
```

> The type-safe route tree (`src/routeTree.gen.ts`) is generated automatically by the
> TanStack Router Vite plugin when you run `npm run dev` or `npm run build`.
