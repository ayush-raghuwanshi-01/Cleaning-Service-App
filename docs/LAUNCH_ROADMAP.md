# Home Shine Launch Roadmap

This document turns the current Cleaning Service App + FastAPI backend into a launchable business system that can accept real customers, manage real orders, and support daily operations.

## Current status

### Already in place

- Public marketing pages: home, services, pricing, service detail, help/FAQ.
- Customer authentication: register, login, `/auth/me` session restore.
- Customer ordering: choose service, schedule date/slot, enter address, create order.
- Customer order views: personal order list/detail and public tracking by order code.
- Admin operations: dashboard stats, order inbox, create offline phone/WhatsApp orders, order detail updates, status movement, payments, add-ons, WhatsApp config.
- Backend foundations: FastAPI, PostgreSQL migrations, JWT auth, role-based admin access, service catalog, service areas, orders, payments, audit logs, Docker setup.
- Frontend quality gates now pass: `npm run lint` and `npm run build`.

### Important launch gaps

These are the areas that need to be completed before taking real paid traffic:

1. **Production authentication hardening**
   - Use refresh tokens on the frontend instead of access-token-only persistence.
   - Add logout/session revocation endpoint use.
   - Add password reset / OTP verification for customers.
   - Add admin user management and role assignment.

2. **Payments**
   - Current system records UPI/CASH manually; it does not collect online payments.
   - Add Razorpay/PhonePe/Cashfree payment order creation, webhook verification, payment reconciliation, refund/cancel flows.

3. **Operational dispatch**
   - Add staff/team profiles, assignment, availability calendar, attendance/status.
   - Prevent double-booking by slot/service area/team capacity.
   - Add internal job checklist and before/after photos.

4. **Customer communication**
   - WhatsApp/SMS confirmations for booking requested, confirmed, staff on the way, completed, payment received.
   - Admin notification when new website order is placed.
   - Customer-facing reschedule/cancel request flow.

5. **Admin catalog management UI**
   - Backend supports catalog/areas, but frontend admin currently does not include a full services/areas editor.
   - Add create/edit/archive services, prices, inclusions/exclusions, service areas and pincodes.

6. **Production deployment readiness**
   - Separate staging and production environments.
   - Real environment variables/secrets, HTTPS domain, CORS origins, DB backups.
   - Error monitoring, analytics, uptime checks, structured logs.
   - CI checks for frontend lint/build and backend tests/migrations.

7. **Legal/business content**
   - Terms of service, privacy policy, cancellation/refund policy.
   - Real company name, address, GST details if applicable.
   - Final service copy, photos, trust badges, testimonials.

## Recommended MVP launch scope

Launch only when these minimum flows work end-to-end in production:

### Customer flow

1. Customer opens website.
2. Customer sees real services, areas, prices and FAQs.
3. Customer registers/logs in.
4. Customer places booking request.
5. Customer receives WhatsApp/SMS confirmation.
6. Admin confirms booking, time, final amount and assigned staff.
7. Customer tracks status by account or order code.
8. Payment is collected/recorded and customer receives completion confirmation.

### Admin flow

1. Owner/admin logs in securely.
2. Admin sees new order immediately.
3. Admin contacts customer and confirms amount/time.
4. Admin assigns staff/team and avoids schedule conflicts.
5. Admin moves order through statuses.
6. Admin records payment or receives online payment webhook.
7. Dashboard shows day revenue, completed jobs and pending work.

## Phase plan

### Phase 1 — Make current build production-safe

- [x] Frontend lint/build baseline fixed.
- [ ] Add CI workflow for frontend lint/build.
- [ ] Add backend CI workflow for ruff + tests + migration check.
- [ ] Replace frontend access-token-only storage with refresh-token flow.
- [ ] Add global unauthorized handling: clear token and redirect to login.
- [ ] Add user-visible API error messages in every form.
- [ ] Add empty/loading/error states across service/order/admin pages.
- [ ] Add production `.env.example` values and deploy documentation.

### Phase 2 — Real operations

- [ ] Staff/team model and admin UI.
- [ ] Order assignment model and endpoints.
- [ ] Slot capacity and conflict checks by service area/date/time.
- [ ] Reschedule/cancel request flow.
- [ ] Internal order checklist and job notes.
- [ ] Customer notification templates.

### Phase 3 — Payments and communication

- [ ] Payment provider integration.
- [ ] Signed webhook endpoint and idempotent payment updates.
- [ ] Customer payment link from order detail.
- [ ] Refund/cancellation handling.
- [ ] WhatsApp/SMS provider integration.
- [ ] Admin notification on new order.

### Phase 4 — Business polish and SEO

- [ ] Add real brand assets, photos and service-area landing copy.
- [ ] Add testimonials/reviews.
- [ ] Add legal pages.
- [ ] Add sitemap/robots and structured data.
- [ ] Add analytics conversion events.
- [ ] Add performance/accessibility pass.

## Suggested deployment architecture

- **Frontend:** Vercel/Netlify/Cloudflare Pages, built from this repo.
- **Backend:** Render/Fly.io/Railway/AWS/GCP container running FastAPI.
- **Database:** Managed PostgreSQL with daily backups.
- **Media:** S3-compatible object storage for job photos if added.
- **Payments:** Razorpay/PhonePe/Cashfree.
- **Messaging:** WhatsApp Business API provider or SMS provider.
- **Monitoring:** Sentry for frontend/backend errors, uptime monitor for `/health/ready`.

## Environment checklist

Frontend:

```dotenv
VITE_API_URL=https://api.your-domain.com
```

Backend:

```dotenv
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET_KEY=<strong 32+ char secret>
JWT_REFRESH_SECRET_KEY=<different strong 32+ char secret>
CORS_ORIGINS=["https://your-domain.com"]
ENVIRONMENT=production
```

Before launch, never use default secrets, localhost URLs, or development CORS in production.

## Immediate next coding tasks

1. Add refresh-token usage to the frontend API client.
2. Add full admin catalog/area management UI.
3. Add order capacity validation before booking.
4. Add notification abstraction on backend with a mock provider first, then WhatsApp/SMS provider.
5. Add payment provider abstraction and webhook tests.

## Manual launch smoke test

Run this on staging before production:

1. Create owner account.
2. Create service areas and services.
3. Register a customer.
4. Place customer booking.
5. Confirm order as admin.
6. Update order amount.
7. Add payment.
8. Complete order.
9. Track order publicly.
10. Confirm notifications/logs/metrics are correct.
