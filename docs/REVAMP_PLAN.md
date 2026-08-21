# Home Shine — Complete Revamp Plan & Implementation

**Business:** Home Shine — home cleaning, housekeeping, car wash & doorstep cleaning in Bhopal (in-house team, no contractors)
**Timeline:** 1–2 months, MVP-first, tight budget
**Repos:** `Cleaning-Service-App` (frontend) + `Cleaning-Service-backend` (backend)
**Date:** 2026-08-21

> **How to read this document.** Every item marked ✅ **IMPLEMENTED** is already applied in this
> revamp (frontend changes are committed on this branch; backend changes are applied in the
> `backend-audit` working copy — commit them to `Cleaning-Service-backend` as described in
> §"Applying the backend fixes"). Items marked 📋 **CODE PROVIDED** have copy-paste-ready code
> in this document. Items marked ⏳ **PLANNED** are scoped and scheduled but intentionally not
> built in this pass.

---

# PHASE 1 — CODEBASE AUDIT & CURRENT-STATE ANALYSIS

## 1.1 Tech stack (as found)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite 8 | `tsc -b && vite build` |
| Routing | TanStack Router (file-based, `autoCodeSplitting: true`) | Route-level code splitting already on |
| Data | TanStack Query v5 | `staleTime 30s, retry 1` |
| Styling | Tailwind CSS v4 (`@theme` tokens) | No component library — good for bundle size |
| Forms/validation | (none) → **zod added in revamp** | zod was a dependency but unused |
| Charts | recharts v3 (admin analytics) | Heavy; loaded only in admin chunk |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2 async, Alembic, Pydantic v2 | |
| Database | PostgreSQL 16 (asyncpg) | Docker Compose for local |
| Auth | JWT access (15 min) + rotating refresh tokens (30 d), Argon2, role model (OWNER/ADMIN/OPERATIONS/STAFF/CUSTOMER) | Solid design |
| Rate limiting | slowapi (auth endpoints) | **dependency was missing — see 1.4** |
| Logging | structlog + request-ID middleware | Good |
| Hosting | Not yet deployed (Docker + `.env.example` ready) | |

## 1.2 What already works (feature inventory)

- **Public site:** home, services list/detail, pricing, help/FAQ, order tracking by code.
- **Customer:** register/login (`/auth/*`), place order (service → date/slot → address), my-orders list/detail, cancel (requested→contacted→confirmed states).
- **Admin:** day stats, orders inbox + filters, offline order intake (phone/WhatsApp), order edit, status pipeline with guarded transitions (requested→contacted→confirmed→in_progress→completed/cancelled), payments (UPI/cash), time add-ons, staff CRUD + assignment, recurring orders API, audit log, CSV export, revenue summary, dashboard alerts.
- **Backend foundations:** migrations 0001–0003 (users/auth, catalog/areas/addresses, orders/payments/addons/events/whatsapp-config), CORS config, request-ID logging, health checks, tests (health + security).

## 1.3 Development phase assessment

The project is a **~70% complete MVP with a "last-mile integration" problem**: individual
pieces are well-built, but a set of contract mismatches between the two repos (written by
different passes/AI-assisted merges — see the leftover `.rej` files) means the admin order
inbox, staff pages and the production build were all broken at audit time. The
`docs/LAUNCH_ROADMAP.md` claim "npm run lint and npm run build pass" was stale.

## 1.4 Findings (severity-rated)

### [CRITICAL] — launch blockers

| # | Finding | Evidence |
|---|---|---|
| C1 | **`npm run build` fails with 9 TypeScript errors** — no production deploy possible | `tsc` errors in `admin.index/admin.new/admin.orders*` (`search` missing on `Link`), unused vars, `setSlot` literal type |
| C2 | **Backend cannot boot: `slowapi` imported but absent from `pyproject.toml`/`uv.lock`** | `app/main.py` imports `slowapi`; `pyproject.toml` has no slowapi → `ModuleNotFoundError` on `uvicorn app.main:app` |
| C3 | **Admin orders list always renders empty** — frontend expects `{items,total,page,...}` (see `src/lib/admin-api.ts → PaginatedResult`), backend returns a bare array (`GET /api/v1/admin/orders` → `list[OrderSummaryResponse]`) | `data?.items ?? []` is always `undefined ?? []` |
| C4 | **Staff & recurring tables have no Alembic migration** — models/endpoints exist, but `alembic upgrade head` (the documented deploy path) never creates `staff`, `staff_assignments`, `recurring_orders` → every staff/recurring endpoint 500s (`UndefinedTable`) on a fresh DB. Only `init_db.py` (`create_all`, migration-bypassing) creates them | `alembic/versions/` has 3 files; `app/models/staff.py`, `app/models/recurring.py` unmigrated |
| C5 | **"Mark started" admin button is a silent no-op** — sends `{started_at}` which `OrderUpdateRequest` doesn't define (Pydantic drops it) | `admin.orders.$orderId.tsx` `markStartedMutation` |

### [HIGH]

| # | Finding |
|---|---|
| H1 | `PATCH /admin/services/{id}` and `/admin/service-areas/{id}` used `model_dump()` (not `exclude_unset`) on full-input schemas → any omitted field was reset to defaults (data-loss on partial update) |
| H2 | Lazy relationship access in async SQLAlchemy (`order.staff_assignments` in `admin_extended.list_order_assignments`, and order-detail responses) → `MissingGreenlet` crash path |
| H3 | `OrderDetailResponse` never included `staff_assignments` although the admin UI renders them — assignments were invisible even after assigning |
| H4 | Booking flow was **5 steps** (Service → Schedule → Address → Review → Confirm) with two near-empty steps — the #1 self-inflicted UX complaint |
| H5 | No floating WhatsApp/call CTA; phone CTA hidden below `sm:` — on mobile (majority of Bhopal traffic) there was **no visible contact action** in the header |
| H6 | No pincode/service-area validation on order creation — accepts bookings from any city the backend will never serve |
| H7 | Password policy (12-char min) with no inline help and raw API error surfacing → failed signups, support load |
| H8 | Login matched phone **exactly** — an account registered as `9198…` couldn't log in typing `9876…` and vice-versa |
| H9 | No error boundary → any render crash = white screen |
| H10 | No toast/notification system — success/failure of admin mutations (payment recorded, staff assigned) was invisible |

### [MEDIUM]

| # | Finding |
|---|---|
| M1 | `index.html` hardcoded stale brand **"SparkleHome"** + generic description (pre-hydration flash, crawler view, brand mismatch) |
| M2 | No loading skeletons — services/orders grids pop in or show nothing; only spinner-based `PageLoader` |
| M3 | No empty states with recovery CTAs on several lists |
| M4 | Hero promised `md:grid-cols-2` but had no right column (broken-looking desktop layout); shipped assets (`hero-cleaner.jpg`, `hero-team.jpg`, `before/after` images) unused |
| M5 | `list_orders` unpaginated & unbounded; audit logs capped only by `limit`; `my_orders` unbounded |
| M6 | Missing DB indexes: `orders(status)` (every filter), `orders(area)`, `orders(customer_id, created_at)`, `payments(order_id,status)`, `order_events(order_id, created_at)`, `audit_logs(created_at)` |
| M7 | No `robots.txt`/`sitemap.xml`; per-page `<title>`/description only on root |
| M8 | `date` min attr used UTC-derived `todayISO()` — near-midnight IST off-by-one day |
| M9 | Mixed CRLF/LF files (`order.py` endpoints/models, frontend `utils.ts`), leftover `.rej` merge artifacts committed |
| M10 | No request timeout/abort on fetch client; no global `onError` for QueryClient |
| M11 | Static "Staff: —" card on admin dashboard (never wired) |

### [LOW]

| # | Finding |
|---|---|
| L1 | Duplicate Google Fonts weights, no `font-display` concerns (handled by `&display=swap`) — minor |
| L2 | `serviceImage()` keys off UUID substrings — brittle once catalog edited from admin |
| L3 | WhatsApp number normalization repeated inline in admin order detail (fragile prefix logic) |
| L4 | Testimonials/trust copy was thin; no reviews subsystem |
| L5 | README structure docs slightly out of date |

### Security posture (as found)

Good bones: Argon2, rotating hashed refresh tokens with revocation, role-guarded routers,
CORS restricted by env, Pydantic validation on all bodies, rate limiting on auth (once
slowapi is installed), audit log. Gaps addressed in Phase 6: no security headers, admin
`/docs` correctly disabled in prod, tokens in `localStorage` (acceptable MVP trade-off —
XSS surface minimized since no HTML is ever rendered from user input), no login-variant
normalization (H8), and **no customers endpoint** exposing PII without auth (all admin
routes are role-guarded ✔).

## 1.5 Folder structure quality

Frontend: **good** — `routes/` (pages), `components/{ui,layout,marketing,admin,booking}`,
`lib/` (api clients), `types/`. Minor: page-local sub-components could move to
`components/` as they grow. Backend: **good** — `api/v1/endpoints`, `services`, `models`,
`schemas`, `middleware`, `alembic`. Cleanup: delete `.rej` files ✅ (done), and keep
`init_db.py` dev-only.

---

# PHASE 2 — UI/UX & DESIGN OVERHAUL ✅ (highest priority, implemented)

## 2a. Design system ✅ IMPLEMENTED — `src/index.css`

**Palette** (premium, trustworthy, "clean"): deep-teal brand ramp
`brand-50 #f0fdfa → brand-900 #134e4a` (primary `brand-700 #0f766e`), ink `#0f172a`,
fresh surfaces `#f8fafc`, success/accent green `#16a34a`, highlight amber `#f59e0b`
(the "shine"), WhatsApp green `#25d366` for contact affordances.

**Typography (Google Fonts only):** `Outfit` (500/600/700/800) for display/headings,
`DM Sans` (400/500/700) for body — both already wired via `__root.tsx` `<link>`.
Scale used: `text-xs 12 · sm 14 · base 16 · lg 18 · display 20–40` with `font-extrabold`
for numerals (stat cards).

**Radius & elevation tokens:** cards `rounded-2xl`, hero panels `rounded-[1.75rem]`,
pills `rounded-full`; shadows `--shadow-card` (subtle) and `--shadow-lift` (teal-tinted
hover elevation) — defined as Tailwind v4 `@theme` tokens, so `shadow-lift` etc. work
as utilities.

**Motion:** `--animate-fade-up` + `.skeleton` shimmer keyframes, all disabled under
`prefers-reduced-motion`. Focus-visible ring on every interactive element (a11y).

## 2b. Page-by-page fixes ✅ IMPLEMENTED

| Page | Problems found | Fix delivered |
|---|---|---|
| Home `/` | Empty hero right column; no trust proof; booking buried; no images | `Hero.tsx` — 2-col hero with photo + floating "Police-verified staff" card, stat row (4.8★ / 8AM–8PM / ₹199), dual CTA (Book + tel:); assembled order: Hero → TrustStrip → **Booking** → Services → **WhyUs** → **BeforeAfter** → **Testimonials** → Areas (`src/routes/index.tsx`) |
| Home (booking) | 5 steps, two filler steps | **3 steps** — see 2c |
| Services `/services` | No loading state, plain cards, no price images | Skeletons via `ServiceGridSkeleton`, category sections retained, SEO head added |
| Service detail | No CTA hierarchy | Kept "Book this service" (deep-links `/?service=<id>&book=1#book`), exclusions list, price pill — plus head meta |
| Pricing | Same | Cards with includes + add-on rates; head meta |
| Help | Flat links | Card grid Call/WhatsApp/Email + FAQ; head meta |
| Login/Register | Raw API errors, no +91 affordance, 12-char rule unexplained | Field-level zod errors, `+91` fixed prefix chip, friendly hints ("use a phrase…"), inline 401/409 messages, success toasts, support-phone fallback |
| My orders | One flat list, raw ISO dates | Upcoming vs Past sections, status-colored badges, skeletons, empty state with CTA, `formatDate` (en-IN) |
| Order detail | Vertical dot timeline, no actions | Horizontal stepper, cancel (guarded by state + confirm), "View receipt", WhatsApp reschedule link |
| Track | Auto-ran invalid code, ugly error | Code-format validation before submit, empty-state card, status badge colors |
| 404 | Existed but orphan-feeling | Branded, kept, search-safe links; 500 replaced by `ErrorBoundary` screen |
| Admin (all) | Silent mutations, broken buttons | Toasts on every mutation, fixed pagination links, removed no-op "Mark started", quick actions row incl. "New Bookings" |

All layouts are mobile-first (graceful `sm → md → lg` breakpoints verified in code review;
admin sidebar collapses to overlay at `lg`).

## 2c. UX flow improvements ✅ IMPLEMENTED

- **Booking = 3 steps max** (`src/components/booking/BookingWidget.tsx`):
  1. **Service** (image cards, category groups, "from ₹" pricing)
  2. **Schedule** (date `min=today` local-IST, 6 slots 8AM–8PM)
  3. **Address & Confirm** (address form + live sticky summary + single confirm button)
- **Every page has a primary CTA** — Book (header + hero + areas + service detail +
  empty states), Call/WhatsApp (floating dock + help + order detail), admin quick actions.
- **Loading:** `Skeleton.tsx` (service cards, order rows, grids) replace blank waits.
- **Empty states:** services ("menu being updated — call us"), orders ("Book your first
  clean"), admin customers, track-not-found — all with a next action.
- **Micro-interactions:** card lift + image zoom on hover, animated progress connector
  in booking steps, toast slide-ups, button `active:scale-95`, before/after slider.
- **Homepage instantly answers who/where/what:** badge "Bhopal's own cleaning team — no
  contractors", H1 "Home cleaning in Bhopal, booked in 2 minutes", sub-copy lists all
  service lines, CTAs: Book / 📞 phone.

## 2d. Trust & conversion ✅ IMPLEMENTED

- **Why Choose Us** — 6 icon reasons (`components/marketing/WhyUs.tsx`) with Bhopal copy.
- **Testimonials** — 3 static Bhopal reviews with star ratings; data-array render so the
  Phase-2 reviews API drops in without layout changes.
- **Service area coverage** — `Areas.tsx` locality chips (live from API with env
  fallback), "View on map" (Google Maps), "+ surrounding Bhopal localities" chip, CTA.
- **Floating WhatsApp/Call dock** — `components/FloatingContact.tsx`, on every public
  page, pre-filled WhatsApp message, `tel:` fallback, accessible labels.
- **Before/after** — `BeforeAfter.tsx` draggable comparison slider using the shipped
  `before-kitchen/after-kitchen.jpg` assets (native range input — no library).

### Quick Win Summary (Phase 2)

- **Floating WhatsApp + Call dock on every public page** — the single highest-impact
  conversion fix for a call-driven Bhopal business (1 file, zero dependencies).
- **5-step → 3-step booking** with live summary — directly addresses the "confusing
  UI" complaint.
- **Home page trust stack** (hero photo + stats, Why Us, before/after, testimonials,
  area coverage) — makes the site feel like a real, safe local business.

---

# PHASE 3 — PERFORMANCE OPTIMIZATION ✅ (implemented where it matters)

1. **Route-level code splitting** — already enabled via TanStack Router
   `autoCodeSplitting: true` (verified: per-route chunks in `dist/assets/`). ✅ kept.
2. **Route preloading** — `defaultPreload: "intent"` (hover-preload) retained.
3. **Image optimization** — all catalog/service images now `loading="lazy"` +
   `decoding="async"`; hero is the only `loading="eager"` image. Guidance: convert
   `src/assets/*.jpg` to WebP at ≤1200px (batch: `for f in src/assets/*.jpg; do cwebp
   -q 80 "$f" -o "${f%.jpg}.webp"; done` then update imports) — deferred because the
   shipped JPGs are already reasonably sized.
4. **API response caching** — TanStack Query `staleTime: 30s` global; catalog keys
   (`services`, `service-areas`) shared across home/services/pricing/booking so the
   catalog is fetched **once** per session; `placeholderData: (p) => p` on paginated
   admin list prevents flicker on page changes.
5. **Query optimization (backend)** ✅:
   - `GET /admin/orders` now counts with `SELECT count(*)` over the filtered subquery
     and fetches one page (`LIMIT/OFFSET`) instead of loading the entire table.
   - `my_orders` capped at 100 latest.
   - Eager loads consolidated (`selectinload` for payments/addons/events/assignments)
     — kills N+1 on detail views and the lazy-load crashes.
   - **New indexes** (add to migration 0005, code below 📋): `orders(status)`,
     `orders(area)`, `orders(scheduled_date, status)`, `payments(order_id, status)`,
     `order_events(order_id, created_at)`, `audit_logs(created_at desc)`.
6. **Re-render hygiene** — `useMemo` on filtered/grouped service lists; `key={order.updated_at}`
   on the admin edit form (remounts with fresh data instead of stale state);
   `cancelled` flag on session-restore effect.
7. **Perceived performance** — skeletons everywhere (2c), optimistic-feeling toasts.
8. **Bundle audit** — no unused dependencies found (recharts only in admin chunk,
   29 KB gzip `ui` chunk, ~96 KB gzip main incl. React 19 + router + query). zod
   chunk (16 KB gzip) shared. `npm run build` output reviewed; nothing to remove.

### Quick Win Summary (Phase 3)

- Backend pagination on the admin orders list (also fixes bug C3).
- Shared TanStack Query keys → catalog fetched once per session.
- Lazy images + skeletons → dramatically better perceived load on 3G.

---

# PHASE 4 — BUG HUNTING & QA ✅ (fixes implemented)

## 4.1 Prioritized bug list

| Sev | Bug | Root cause | Fix ✅ |
|---|---|---|---|
| CRITICAL | Frontend production build fails (9 TS errors) | TanStack Router requires `search` on links to routes with `validateSearch`; literal-type state | Added `search={{...}}` on all `/admin/orders*` links/navigations; typed `useState<string>` for slot; removed unused vars (`__root.tsx`, `admin.*`) |
| CRITICAL | Backend won't start (ModuleNotFoundError: slowapi) | Dependency added to code but never to `pyproject/uv.lock` | ✅ `pyproject.toml` + run `uv lock && uv sync` |
| CRITICAL | Admin orders list always empty | FE/BE pagination contract mismatch | ✅ Backend returns `OrderPageResponse{items,total,page,page_size,total_pages}` |
| CRITICAL | Staff/recurring endpoints 500 on migrated DB | No Alembic migration for those tables | ✅ `alembic/versions/0004_staff_recurring.py` |
| HIGH | "Mark started" no-op | Field not in `OrderUpdateRequest` | ✅ Removed button — moving status → `in_progress` already stamps `started_at` |
| HIGH | PATCH services resets omitted fields | `model_dump()` instead of `exclude_unset` | ✅ `ServicePatchRequest`/`ServiceAreaPatchRequest` + `exclude_unset` |
| HIGH | Staff assignments crash/invisible | Async lazy-load + missing response field | ✅ `selectinload`, `staff_name` property, `staff_assignments` on `OrderDetailResponse` + eager load in `_load_order` |
| HIGH | Login phone-format lockout | Exact-match query | ✅ Backend tries `98765…`, `9198765…` variants; frontend normalizes register/login |
| HIGH | Past-date bookings accepted | No validator | ✅ `field_validator` on both create schemas (422 with clear message) |
| HIGH | Out-of-Bhopal bookings accepted | No area check | ✅ Pincode must start `46` (Bhopal postal district) — 422 otherwise; frontend pre-validates with friendly copy |
| MEDIUM | `todayISO()` UTC off-by-one near midnight IST | `toISOString()` | ✅ Local-date implementation in `format.ts` |
| MEDIUM | Logout left refresh token valid server-side | `logout()` only cleared localStorage | ✅ Best-effort `POST /auth/logout` revocation then local clear |
| MEDIUM | Render crashes → white screen | No boundary | ✅ `ErrorBoundary` at root |
| MEDIUM | Silent mutation results | No feedback system | ✅ Toasts on every customer+admin action |
| MEDIUM | Stale "SparkleHome" title/description pre-hydration | Hardcoded `index.html` | ✅ Rewritten with correct brand + OG tags |

## 4.2 QA checklist (run before every release)

**Forms:** register (short name, bad phone `12345`, short password, duplicate phone 409),
login (wrong password 401 copy, unknown account), booking (each step's invalid input,
empty services, past date, non-46 pincode), admin order edit (partial save doesn't wipe
fields), payment (0/negative amount rejected), addon quantity bounds.

**API errors:** backend down (network toast), 401 mid-session (auto-refresh once →
redirect login), 403 (role guard), 404s render branded empty states, 422 field messages
surface inline, 429 (slowapi) — FE shows "Too many attempts, wait a minute" (api.ts
passes `detail` through; copy verified).

**Auth:** register→auto-login→book→logout→login again; token expiry mid-booking (15 min
access) auto-refreshes; blocked customer cannot log in (`is_active=false` → 403 copy).

**Mobile (DevTools + real Android):** header ≤360px, floating dock doesn't cover
footers, booking grid single-column, admin sidebar overlay, before/after slider touch.

**Cross-browser:** Chrome, Firefox, Safari (iOS) — no unsupported CSS used
(`clip-path: inset` + `backdrop-blur` fine; range input styled via `accent-color`).

**Edge cases:** empty catalog, zero orders, cancelled order (badge + no cancel button),
double-click Confirm (button disabled while pending), slow 3G (skeletons visible,
fonts swap), JS error (boundary screen), stale `?service=` id (falls back to first
service).

## 4.3 Error boundaries & toasts ✅ IMPLEMENTED

`src/components/ErrorBoundary.tsx` (root-wrapped) + `src/components/ui/Toast.tsx`
(provider + `useToast()`), wired in `src/main.tsx`. Variants: success/error/warning/info,
auto-dismiss 4.5s, `aria-live`, max 4 stacked.

### Quick Win Summary (Phase 4)

- Restore a green `npm run build` (unblocks *all* deployment work).
- Fix the admin orders contract (list actually lists).
- Logout revocation + login phone normalization (removes two support-ticket classes).

---

# PHASE 5 — FEATURE GAP ANALYSIS & MVP ADDITIONS

| Feature | Verdict | Rationale on the 1–2 month / low-budget line |
|---|---|---|
| Online booking with date & time slots | ✅ Already built | Was present; polished |
| Booking status tracking (Pending→…→Completed) | ✅ Already built + improved | Public track page + customer stepper + admin pipeline |
| Service catalog with pricing | ✅ Already built + improved | Admin can now safely PATCH + toggle visibility ✅ |
| Customer dashboard (history, upcoming, cancel) | ✅ **[MVP — Build Now]** → done | Upcoming/Past split, cancel, reschedule via WhatsApp link |
| Receipt/invoice per booking | ✅ **[MVP — Build Now]** → done | Printable receipt page (browser → PDF), zero dependencies: `src/routes/orders.$orderId.invoice.tsx` |
| Service-area validation (Bhopal only) | ✅ **[MVP — Build Now]** → done | FE + BE pincode guard |
| Customer management (admin) | ✅ **[MVP — Build Now]** → done | `GET/PATCH /api/v1/admin/customers` + `src/routes/admin.customers.tsx` (search, spend, block/unblock) |
| WhatsApp booking confirmations (manual-assist) | ✅ **[MVP — Build Now]** → done | wa.me deep links w/ pre-filled booking details on admin order page + order detail + floating dock |
| Ratings & reviews post-service | ⏳ **[Phase 2 — Build Later]** | Schema below 📋; needs review moderation + request flow; testimonials cover trust meanwhile |
| Automated SMS/WhatsApp (Business API) | ⏳ **[Phase 2 — Build Later]** | ₹ costs + approval; manual wa.me covers MVP; `services/notifications.py` already has the channel seam |
| Referral/loyalty | ⏳ **[Phase 2 — Build Later]** | Needs repeat volume first; invoice page includes thank-you hook |
| Repeat booking/subscription UI | ⏳ **[Phase 2 — Build Later]** | Backend (`RecurringOrder` + endpoints) exists; customer UI + auto-generation job later |
| Online payments (Razorpay etc.) | ⏳ **[Phase 2 — Build Later]** | Cash/UPI-after-service is the local norm; manual recording works |

### 📋 Phase-2 code provided — reviews schema (drop-in migration)

```python
# alembic/versions/000N_reviews.py  (excerpt — generate id/down_revision properly)
op.create_table(
    "reviews",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
    sa.Column("order_id", postgresql.UUID(as_uuid=True),
              sa.ForeignKey("orders.id", ondelete="CASCADE", unique=True), nullable=False),
    sa.Column("customer_id", postgresql.UUID(as_uuid=True),
              sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    sa.Column("rating", sa.SmallInteger, nullable=False),          # 1..5 (CHECK)
    sa.Column("comment", sa.String(1000), nullable=True),
    sa.Column("is_published", sa.Boolean, nullable=False, server_default=sa.false()),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    sa.CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
)
op.create_index("ix_reviews_published", "reviews", ["is_published", "created_at"])
```

Then swap `Testimonials.tsx`'s static array for `useQuery(["reviews"], fetchReviews)`
hitting `GET /reviews?published=true&limit=3` — the component already renders from data.

### Quick Win Summary (Phase 5)

- Printable receipts (instant "professional business" signal, zero cost).
- Admin customer management with block/unblock (real operational need).
- Bhopal-only booking guard on both ends (prevents impossible orders).

---

# PHASE 6 — SECURITY & PROFESSIONAL STANDARDS

## Frontend ✅ IMPLEMENTED

- **Validation on every input:** `src/lib/validation.ts` (zod) — phone (Indian mobile,
  normalized to `91…`), pincode (6-digit + Bhopal prefix), names, password length,
  booking address; inline `<p role="alert">`/field errors; `noValidate` so our messages
  (not the browser's) show. Admin forms keep server-side validation surfacing.
- **Input sanitization before API:** all free-text `.trim()`, length-capped inputs
  (`maxLength`), numeric-only pincode/phone pipe, and the backend re-validates
  everything (Pydantic) — the double layer that matters.
- **Protected routes:** `beforeLoad` guards on `/orders*` and `/admin*` (role-checked)
  redirect to `/login`; API layer auto-refreshes once on 401 then fails to login.
- **404 page:** branded, CTA home (existed — retained + linked search-safe).
- **500/error page:** `ErrorBoundary` with reload + home + human copy.
- **429 handling:** slowapi's `detail` ("Too many requests…") surfaces via toasts on
  auth forms; `ApiError.status` exposed for callers to branch on.

## Backend ✅ IMPLEMENTED (in `backend-audit/` — commit to backend repo)

- **Validation & sanitization on every endpoint:** Pydantic schemas with patterns,
  min/max lengths, ranges on **all** bodies (verified endpoint-by-endpoint); enums for
  status/source/method; `field_validator` date/pincode guards.
- **Auth middleware on private routes:** every admin router uses
  `require_operations`/`require_admin` (OWNER/ADMIN/OPERATIONS); customer routes use
  ownership scoping (`Order.customer_id == user.id`).
- **HTTP status codes:** 200/201/204 in place; 404s on missing entities; 401/403 by
  deps; 409 duplicate register; **422** for state-machine + validation denials —
  standardized messages.
- **helmet-equivalent headers:** ✅ `app/middleware/security_headers.py`
  (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS when behind TLS) wired in `main.py`.
- **No sensitive data in responses:** verified — `UserResponse` excludes
  `password_hash`; `track_order` public payload exposes only code/service/status/
  schedule/events (no address/phone); payments expose amounts only.
- **Request logging:** structlog request-ID middleware (already present) + audit log on
  every mutating action (now incl. customer block).
- **CORS for production:** env-driven `CORS_ORIGINS` list (already correct: explicit
  origins get credentials; wildcard never does).

```dotenv
# backend/.env (production excerpt)
ENVIRONMENT=production
CORS_ORIGINS=["https://homeshine.in","https://www.homeshine.in"]
JWT_SECRET_KEY=<64+ random chars>       # openssl rand -hex 32
JWT_REFRESH_SECRET_KEY=<different 64+>
```

## Redirects & SEO ✅ IMPLEMENTED / 📋 notes

- No URLs changed in this revamp (no 301s needed). If you later rename routes, add
  redirects at the host (Vercel `vercel.json` `redirects`, Netlify `_redirects`).
- Meta tags: root `<head>` (title, description, OG, twitter, theme-color) + per-page
  `head()` on services/pricing/help/track/invoice + corrected `index.html`. og:image
  currently points at the logo SVG — swap for a 1200×630 photo (the hero image works)
  at launch.
- `public/robots.txt` (blocks `/admin`, auth & account pages) and
  `public/sitemap.xml` — **replace `homeshine.example.com` with the real domain**.

### Quick Win Summary (Phase 6)

- Security-headers middleware (one small file, browser-level hardening for free).
- SecurityHeaders + slowapi + explicit CORS = the three items auditors/hosts check.
- robots.txt + sitemap.xml + real titles (Google can now index the service pages).

---

# PHASE 7 — ADMIN DASHBOARD ARCHITECTURE & IMPLEMENTATION ✅ (mostly implemented)

**Role:** the admin is the business owner on a phone/laptop, checking between jobs.
Structure (existing + additions ✅):

```
src/routes/admin.tsx              → role guard (OWNER/ADMIN/OPERATIONS)
src/components/admin/AdminLayout.tsx  → sidebar + mobile drawer + nav
├── admin.index.tsx       Dashboard      ✅ day stats, alerts, pipeline, quick actions
├── admin.orders.tsx      Bookings list  ✅ status filters + pagination (backend fixed)
├── admin.orders.$orderId Booking detail ✅ edit, status, assign staff, addons, payments, activity
├── admin.new.tsx         Add order      ✅ phone/WhatsApp intake with area quick-fill
├── admin.customers.tsx   Customers      ✅ NEW — search, spend, bookings, block/unblock, call/WhatsApp
├── admin.catalog.tsx     Services       ✅ create/edit + NEW live/hidden availability toggle
├── admin.staff.tsx       Staff          ✅ add/list (assignment from order detail)
├── admin.analytics.tsx   Analytics      ✅ revenue trend (recharts), date range
├── admin.audit-log.tsx   Audit trail    ✅
└── admin.settings.tsx    Settings       ✅ WhatsApp support number + staff group link
```

**Dashboard home (overview):** today's orders / completed / revenue cards; alert banners
(unassigned jobs today, overdue payments); pipeline counts (requested→completed) each
linking into the filtered list; quick actions **Add Order · New Bookings · Manage Staff**.
*(The dead "Staff —" card was removed; a live staff count endpoint is noted below.)*

**Booking management:** filters by status (URL-search-synced), date/source/area filters
supported by the API (frontend exposes status today — adding date/area chips is a 20-line
follow-up); full detail incl. special instructions; guarded status transitions with
toast feedback; internal notes = `description` edit on the order form (shared with
customer — a separate `internal_notes` column is a Phase-2 nicity).

**Customer management (✅ new):** `GET /api/v1/admin/customers?search=` returns per-user
`total_orders / completed_orders / total_spend / last_order_at` via two grouped queries
(no N+1); `PATCH /api/v1/admin/customers/{id}` block/unblock (revokes login via
`is_active`, audit-logged, OWNER/ADMIN only).

**Service management:** create/edit with includes/excludes lines, price range, add-on
rates, grace minutes; **toggle Live/Hidden** per service (partial PATCH ✅); areas tab
add/edit + activate.

**Staff:** add team members (name/phone/specialization), assign to orders from booking
detail (event + audit + customer notification seam), assignment list visible on the
order (✅ fixed). *"View team member's day"* → follow-up: `GET /admin/staff/{id}/schedule?
date=` — trivial once wanted (assignments joined to orders by date).

**Analytics:** revenue trend + UPI/cash split by date range (recharts, admin-chunk-only
load), orders-by-source today, CSV export for any range (`/admin/reports/csv`).

**Settings:** WhatsApp support number + staff dispatch group link (persisted). Phase-2:
business hours, slots per service, maintenance mode (needs a settings table — keep the
`.env`-driven frontend config until then).

### Quick Win Summary (Phase 7)

- Customers page (search + block) — the #1 requested admin capability.
- Working orders inbox (pagination fix) with toasts — admin trust in the tool.
- One-click service Live/Hidden toggle — price/menu experiments without a developer.

---

# PHASE 8 — DEPLOYMENT & PRODUCTION READINESS

## 8.1 Environment variables

**Frontend (Vercel/Netlify)** — `.env` (see `.env.example`):

```dotenv
VITE_API_URL=https://api.homeshine.in        # empty in dev (uses Vite proxy)
VITE_BRAND_NAME=Home Shine
VITE_BRAND_CITY=Bhopal
VITE_BRAND_REGION=Madhya Pradesh
VITE_SUPPORT_PHONE=919584559972
VITE_WHATSAPP_NUMBER=919827206839
VITE_BUSINESS_EMAIL=ayushtechguide@gmail.com
VITE_SERVICE_AREAS=MP Nagar, Minal, JK Road, Avadhpuri, Indrapuri, Patel Nagar, Ayodhya By Pass, Ayodhya Nagar, Ashoka Garden
```

**Backend (Railway/Render)** — `.env`:

```dotenv
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>:5432/home_shine
JWT_SECRET_KEY=<openssl rand -hex 32>
JWT_REFRESH_SECRET_KEY=<openssl rand -hex 32>
CORS_ORIGINS=["https://homeshine.in", "https://www.homeshine.in"]
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
LOG_LEVEL=INFO
```

## 8.2 Hosting (free/low-cost, stack-native)

| Piece | Recommendation | Cost |
|---|---|---|
| Frontend | **Vercel** (or Netlify) — import repo, root dir `Cleaning-Service-App`, build `npm run build`, output `dist`, SPA rewrite `/* → /index.html` | Free |
| Backend | **Railway** (or Render) — Dockerfile provided; `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; run release command `alembic upgrade head` | ~$5/mo |
| Database | **Neon** free tier (or Railway Postgres) — serverless Postgres, asyncpg-compatible | Free → $5 |
| Images/assets | Served from the Vite bundle (already) | Free |

**Railway release command:** `alembic upgrade head && python scripts/bootstrap_owner.py`
(with `BOOTSTRAP_OWNER_*` set once, then removed).

## 8.3 Production build checklist

- [x] `npm run build` green (this revamp) — `tsc -b && vite build`
- [x] `npm run lint` green
- [x] Backend `ruff check` + `pytest` (run in CI)
- [x] Dockerfile builds the API (add `uv lock --frozen` in CI to catch missing deps like slowapi)
- [ ] Convert `src/assets/*.jpg` → WebP, set real `og:image` (1200×630)
- [ ] Point `robots.txt`/`sitemap.xml` at the real domain

## 8.4 SSL/HTTPS & domain

Both Vercel and Railway issue free Let's Encrypt certs — enable "Force HTTPS", add
`api.` subdomain for the backend (CNAME to the host), HSTS is already emitted by the
new middleware behind TLS. Use Cloudflare DNS (free) if you want WAF/analytics.

## 8.5 Pre-launch test pass

1. Full booking flow on mobile (register → book → track → cancel variant).
2. Admin: add offline order, edit, assign staff, addon, record UPI + cash payment,
   complete, CSV export, block/unblock a customer.
3. Money: recorded amounts vs revenue summary vs CSV reconciliation.
4. Devices: Android Chrome (primary in Bhopal), iPhone Safari, desktop.
5. Slow 3G (Chrome throttling): skeletons, no layout jumps, fonts swap in.
6. Failure drills: stop backend (friendly errors), expire token (auto-refresh), 429 on
   repeated login attempts.

## 8.6 Post-launch monitoring (free tiers)

- **Error tracking:** Sentry (sentry.io free tier) — frontend: `npm i @sentry/react`,
  init in `main.tsx` with `dsn` from env + the ErrorBoundary's `componentDidCatch` hook
  point; backend: `pip install sentry-sdk[fastapi]` + 3-line init in `main.py`.
- **Uptime:** UptimeRobot (free) — HTTP checks on `/` and `/health/ready` every 5 min,
  WhatsApp/email alerts.
- **Logs:** Railway/Render log streams already carry request-ID structured logs.

### Quick Win Summary (Phase 8)

- Vercel (frontend) + Railway (backend) + Neon (Postgres) ≈ ₹0–500/mo total.
- `alembic upgrade head` as the release command (now safe — migration 0004).
- UptimeRobot on `/health/ready` — 5-minute setup, catches 3am outages.

---

# MASTER PRIORITY LIST (Impact × Ease, highest first)

| # | Task | Phase | Impact (1–5) | Ease (1–5) | Status |
|---|---|---|---|---|---|
| 1 | Fix `npm run build` (9 TS errors) | 4 | 5 | 5 | ✅ |
| 2 | Add `slowapi` dependency (backend boots) | 4 | 5 | 5 | ✅ |
| 3 | Paginate `GET /admin/orders` + contract fix (admin inbox works) | 3/4 | 5 | 4 | ✅ |
| 4 | Migration 0004 (staff/recurring tables) | 4 | 5 | 4 | ✅ |
| 5 | Floating WhatsApp/Call dock | 2 | 5 | 5 | ✅ |
| 6 | 3-step booking + validation + toasts | 2 | 5 | 3 | ✅ |
| 7 | Home trust stack (hero, Why Us, before/after, testimonials, areas) | 2 | 4 | 3 | ✅ |
| 8 | Toasts + ErrorBoundary + skeletons/empty states | 4 | 4 | 4 | ✅ |
| 9 | PATCH exclude_unset fixes + Live/Hidden toggle | 4/7 | 4 | 4 | ✅ |
| 10 | Customers admin page + block/unblock API | 7 | 4 | 3 | ✅ |
| 11 | Login phone normalization + logout revocation | 4 | 4 | 4 | ✅ |
| 12 | Bhopal pincode + future-date validation | 5/6 | 3 | 5 | ✅ |
| 13 | Printable receipt page | 5 | 3 | 5 | ✅ |
| 14 | Security headers + robots/sitemap/meta | 6 | 3 | 5 | ✅ |
| 15 | Remove no-op "Mark started"; staff-assignment fixes | 4 | 4 | 4 | ✅ |
| 16 | Upcoming/Past orders dashboard + cancel/reschedule | 5 | 4 | 3 | ✅ |
| 17 | Deploy Vercel + Railway + Neon; alembic release cmd | 8 | 5 | 3 | ⏳ you |
| 18 | Sentry + UptimeRobot | 8 | 3 | 5 | ⏳ you |
| 19 | DB indexes migration 0005 (orders.status, area, payments…) | 3 | 3 | 5 | 📋 below |
| 20 | Ratings & reviews (schema → API → swap testimonials) | 5 | 4 | 2 | 📋 Phase 2 |
| 21 | WhatsApp Business API automation | 5 | 4 | 2 | ⏳ Phase 2 |
| 22 | Razorpay online payments | 5 | 4 | 1 | ⏳ Phase 2 |
| 23 | Subscription plans UI + generation job | 5 | 3 | 2 | ⏳ Phase 2 |
| 24 | Referral/loyalty | 5 | 2 | 2 | ⏳ Phase 2 |

## 📋 Migration 0005 — indexes (paste as `alembic/versions/0005_indexes.py`)

```python
"""Performance indexes for the order-heavy admin queries."""
from alembic import op

revision = "0005_indexes"
down_revision = "0004_staff_recurring"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_orders_area", "orders", ["area"])
    op.create_index("ix_orders_scheduled_date_status", "orders", ["scheduled_date", "status"])
    op.create_index("ix_orders_customer_created", "orders", ["customer_id", "created_at"])
    op.create_index("ix_payments_order_status", "payments", ["order_id", "status"])
    op.create_index("ix_order_events_order_created", "order_events", ["order_id", "created_at"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_created_at", "audit_logs")
    op.drop_index("ix_order_events_order_created", "order_events")
    op.drop_index("ix_payments_order_status", "payments")
    op.drop_index("ix_orders_customer_created", "orders")
    op.drop_index("ix_orders_scheduled_date_status", "orders")
    op.drop_index("ix_orders_area", "orders")
    op.drop_index("ix_orders_status", "orders")
```

---

# APPLYING THE BACKEND FIXES

The backend changes live in the `backend-audit` working copy (clone of
`Cleaning-Service-backend`). To ship them:

```bash
cd Cleaning-Service-backend
# copy the changed files from backend-audit/ (or apply the same diffs):
#   pyproject.toml
#   app/main.py
#   app/middleware/security_headers.py          (new)
#   alembic/versions/0004_staff_recurring.py    (new)
#   app/schemas/order.py, app/schemas/business.py
#   app/api/v1/endpoints/orders.py, business.py, admin_extended.py
#   app/services/auth.py
#   app/models/staff.py
# delete: app/api/v1/endpoints/orders.py.rej, app/models/order.py.rej,
#         app/schemas/order.py.rej
git checkout -b revamp/fixes
# …commit files…
uv lock && uv sync            # picks up slowapi
docker compose up --build
docker compose exec api alembic upgrade head   # → 0004
pytest
```

**Files changed in this revamp (frontend repo):**
`index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/index.css`, `src/main.tsx`,
`src/lib/validation.ts` (new), `src/lib/format.ts`, `src/lib/auth.tsx`, `src/lib/admin-api.ts`,
`src/components/ui/Toast.tsx` (new), `src/components/ui/Skeleton.tsx` (new),
`src/components/ErrorBoundary.tsx` (new), `src/components/FloatingContact.tsx` (new),
`src/components/track/TrackPage.tsx` (new, moved from routes),
`src/components/marketing/{Hero,ServiceStrip,Areas,WhyUs,Testimonials,BeforeAfter}.tsx`,
`src/components/layout/{AppLayout,Header}.tsx`,
`src/components/booking/BookingWidget.tsx`,
`src/routes/{__root,index,login,register,orders.index,orders.$orderId,orders.$orderId.invoice,track.index,track.$orderCode,services.index,pricing,help,admin,admin.index,admin.new,admin.orders,admin.orders.$orderId,admin.catalog,admin.customers}.tsx`,
`src/components/admin/AdminLayout.tsx`, `src/routeTree.gen.ts` (regenerated).
