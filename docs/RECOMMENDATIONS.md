# Home Shine — What To Build Next (Prioritized)

This is an independent, code-grounded gap analysis of the **frontend** (`Cleaning-Service-App`)
and the **backend** (`Cleaning-Service-backend`). It assumes you want to go live with real
customers **and** a daily business/admin workflow. It is ordered by business impact, not by
effort — the first section is "do this before you take real traffic."

> A higher-level roadmap already exists in `docs/LAUNCH_ROADMAP.md`. This document is the
> sharper, implementation-first version: each item names the exact files/endpoints that need to
> change and the missing piece it closes.

---

## What's already solid (don't rebuild these)

**Backend** — FastAPI + PostgreSQL + async SQLAlchemy + Alembic (3 migrations), JWT auth with
refresh-token rotation/revocation, Argon2 hashing, RBAC roles (`OWNER/ADMIN/OPERATIONS/STAFF/CUSTOMER`),
audit logs, request-ID middleware, structlog, health checks, CORS, Docker.
Order state machine (`requested → contacted → confirmed → in_progress → completed`, cancel from any
non-terminal state), payments (UPI/CASH, pending/received), order add-ons (30/60 min), event
timeline, WhatsApp config, day stats, service catalog + service areas + saved addresses.

**Frontend** — marketing pages, multi-step booking widget, auth, public order tracking by code,
personal order dashboard, and an admin area (dashboard stats, order inbox with filters, add order
from phone/WhatsApp, order detail with status/payments/add-ons, catalog editor, WhatsApp settings).

The gaps below are all *net-new*, not rewrites.

---

## Tier 0 — Fixes that are silently breaking real users right now

### 1. The frontend throws away the refresh token (15-minute forced logouts)
`src/lib/api.ts` stores only `sparklehome.access_token` and ignores the `refresh_token` returned by
`/auth/login`. The backend issues a **15-minute** access token (`ACCESS_TOKEN_EXPIRE_MINUTES=15`),
so every real customer/admin is kicked out every 15 minutes with no automatic recovery.

**Fix:**
- Persist the refresh token, auto-call `POST /api/v1/auth/refresh` on 401, then retry the failed
  request exactly once.
- Call `POST /api/v1/auth/logout` on logout (revokes the server-side session) instead of only
  clearing localStorage (`src/lib/auth.tsx` `logout()`).
- Add a global 401 → clear session → redirect to `/login` handler (currently `isUnauthorized()` is
  defined but never wired into a global path).

### 2. Account recovery / verification (currently impossible to reset a password)
Registration accepts a raw password with **no** OTP, no phone/email verification, and there is **no
password-reset endpoint at all**. One forgotten password = permanently locked-out customer.

**Fix:** add phone-OTP (and optional email) verification on register, plus a password-reset flow.
This is also a prerequisite for sending any transactional messages (see Tier 1, item 5).

### 3. Admin user & role management does not exist
`UserRole.STAFF` and `require_*` guards exist in `app/api/deps.py`, but there is **no endpoint or UI**
to create a staff/admin account, assign a role, deactivate a user, or reset an admin password. Today
the only way to get an admin is the one-shot `bootstrap_owner.py` script.

**Fix:** an OWNER-only "Team / Users" screen: list users, invite/create staff, change role, enable/disable.

### 4. Legal pages are missing
There are no Terms of Service, Privacy Policy, or Cancellation/Refund policy routes. These are
required for real customers and *mandatory* once you add online payments (Tier 1, item 6).

**Fix:** three static routes + footer links (`src/routes/` + `src/components/layout/Footer.tsx`).

---

## Tier 1 — Core operations: what a cleaning business runs on daily

### 5. Staff/teams + order assignment (the biggest single gap)
There is **no staff, cleaner, or team model anywhere** in the backend or frontend. An order can be
booked and completed but never assigned to the person doing the job. For a housekeeping business
this is the heart of the admin workflow.

**Build:**
- Backend: `StaffMember` model (name, phone, skills/service categories, active), `Order.assigned_staff_id`,
  assignment + unassignment endpoints, `GET /admin/staff`, and a daily "who's doing what" list.
- Frontend: a **Staff** admin screen + an **Assign staff** dropdown on the order-detail page, and an
  "Assigned to" chip on the order list.

### 6. Scheduling & capacity (prevent double-booking)
Time slots are hardcoded in `src/lib/config.ts` (`TIME_SLOTS`), and nothing checks whether a
date/slot/area is already full or whether a staff member is already booked. Nothing stops two jobs
from landing in the same 2-hour window.

**Build:**
- Backend: capacity limit per slot/area (e.g. max concurrent jobs), a conflict check on
  `POST /orders` and on staff assignment, and a slot-availability endpoint the booking widget can call.
- Frontend: disable full/blocked slots in the booking widget; show staff availability in the admin
  assignment UI.

### 7. Customer communications (WhatsApp/SMS) — config exists, sending does not
`WhatsAppConfig` (support number + staff group link) is stored and editable, but **nothing ever sends
a message**. A real business needs automatic confirmations or the admin staff drowns in manual calls.

**Build:** a notification abstraction (mock provider first, then a WhatsApp Business API / SMS
provider) triggered by order events: booking received, confirmed (with final amount/time/staff),
staff on the way, completed, payment received. Include an **admin alert on new website order**.

### 8. Reschedule + richer customer self-service
Customers can cancel (`POST /orders/{id}/cancel`) but **cannot reschedule** or change the slot.
Real customers constantly move bookings; without a reschedule flow they'll just abandon.

**Build:** a reschedule endpoint (reuse the existing status rules so it's only allowed before
`in_progress`), plus a customer-facing "Reschedule" action on `src/routes/orders.$orderId.tsx`.

### 9. Saved addresses are built in the backend but unused in the UI
The backend has full address CRUD (`GET/POST/PATCH/DELETE /api/v1/addresses`) with default-address
logic, but the frontend has **no addresses API module and the booking widget never calls it** — every
customer re-types their address on every booking.

**Build:** `src/lib/addresses-api.ts`, an "Addresses" section in the customer account, and a
"choose saved address" step in `BookingWidget.tsx`.

---

## Tier 2 — Revenue & trust (do before you scale)

### 10. Online payments (Razorpay / Cashfree / PhonePe)
Payments are **manual only** — staff record UPI/cash after the fact. No payment link, no webhook, no
reconciliation, no refund.

**Build:** payment-provider abstraction, create-a-payment-link endpoint, a signed + idempotent
webhook that marks the payment `received`, a "Pay online" button on the customer order page, and
refund/cancel handling. Keep the existing `payments`/`payment_status` derivation — it already
supports `partial`/`paid` correctly.

### 11. Reviews, ratings & testimonials
No way to collect or display customer feedback. For a local-services business, reviews are the #1
conversion driver and are currently completely absent.

**Build:** a `Review` model, a post-completion review prompt (email/WhatsApp/site), a moderated
"approve/hide" list in admin, and a testimonials section on the home page.

---

## Tier 3 — Business intelligence & operations hardening

### 12. Real reporting & export
`GET /admin/stats` returns only a single day's counts/revenue. A growing business needs trend data.

**Build:** revenue/orders over a date range, per-service and per-staff performance, CSV export of
orders and payments, and a simple chart on the admin dashboard.

### 13. Order-list pagination (correctness at scale)
`GET /admin/orders` returns **every** order with no pagination, and `GET /orders` (customer) has no
limit either. Fine for 50 orders, not for 5,000.

**Build:** limit/offset (or cursor) pagination on both list endpoints + frontend.

### 14. Job quality proof (before/after photos + checklist)
No internal checklist and no photo capture. These are cheap to add and materially improve quality
control and dispute resolution.

**Build:** an internal per-order checklist (admin-only) and optional before/after photo upload
(S3-compatible storage), shown on the admin order detail.

### 15. Production hardening & CI
- **CI:** the repo has no CI workflow. Add frontend lint/build and backend `ruff` + tests +
  migration-check. (Note: `docs/RUN_BACKEND_LOCALLY.md` references `tests/test_orders.py` and
  `test_orders_integration.py`, but `tests/` only contains `conftest.py`, `test_health.py`,
  `test_security.py` — those order tests are missing and should be written.)
- **Rate limiting** on auth endpoints (login/register/refresh) — currently unprotected.
- **Backups** for PostgreSQL and real secrets/HTTPS/CORS for production.
- **SEO/analytics:** `sitemap.xml`, `robots.txt`, JSON-LD structured data (`LocalBusiness`/`Service`),
  and analytics conversion events on booking/registration.

---

## Suggested first sprint (if you start building today)

1. Refresh-token flow + global 401 handling + real logout. *(Tier 0, unblocks everything else)*
2. Staff model + order assignment + capacity/conflict check. *(Tier 1, the core admin workflow)*
3. Notification abstraction + booking/confirmation messages. *(Tier 1, closes the comms loop)*
4. Saved-address UI + reschedule flow. *(Tier 1, completes the customer experience)*
5. Legal pages + password reset/OTP. *(Tier 0, required for payments & trust)*
6. Online payments + webhook. *(Tier 2)*

Everything above can be built incrementally on the existing, cleanly-layered code — the backend's
service/endpoint separation and the frontend's `lib/*-api.ts` + TanStack Query pattern make each of
these a contained addition.
