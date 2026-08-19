# SparkleHome — Frontend

Customer-facing web app for **SparkleHome Bhopal**, a home-cleaning service. Built with
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
    layout/      # Header, Footer, page shells
    marketing/   # Home page sections
    ui/          # Minimal UI primitives (Button, Card, Input, ...)
  lib/
    api.ts       # Typed HTTP client + auth token handling
    auth.tsx     # Auth provider/hook
    *-api.ts     # Endpoint modules (catalog, orders, admin)
    config.ts    # App config & constants
    format.ts    # INR, duration, date helpers
    utils.ts     # cn() helper
  routes/        # File-based routes (TanStack Router)
  types/         # Shared domain types (mirror the backend)
```

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
