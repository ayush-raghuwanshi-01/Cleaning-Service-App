# API Testing Guide — Home Shine Cleaning Service

A complete, copy-paste guide to testing every backend API endpoint, including the
**"401 Authentication required"** issue and how to avoid it.

---

## 1. Why do I get `401 Authentication required` even after login?

The backend uses **two different tokens**. This is the #1 cause of confusion:

| Token | What it is for | Where it goes |
|-------|---------------|---------------|
| `access_token` | Authenticates every API request | `Authorization: Bearer <access_token>` header |
| `refresh_token` | Gets you a *new* access token when the old one expires | JSON body of `POST /api/v1/auth/refresh` **only** |

The access token **expires after 15 minutes** by default (`ACCESS_TOKEN_EXPIRE_MINUTES=15`).

So `401 Authentication required` appears when:

| Scenario | What you did | Fix |
|----------|--------------|-----|
| **1. Missing header** | Called `GET /api/v1/admin/orders` with no `Authorization` header | Add `-H "Authorization: Bearer $TOKEN"` |
| **2. Used the refresh token** | `-H "Authorization: Bearer $REFRESH"` — the refresh token is **not** an access token | Use the `access_token`, not the `refresh_token`, in the Bearer header |
| **3. Token expired** | Logged in more than 15 minutes ago, then tested again | Call `POST /api/v1/auth/refresh` with your refresh token to get a fresh pair, or log in again |
| **4. Typos / truncated token** | Copy-pasted only part of the token | Copy the full JWT (starts with `eyJ...`) |
| **5. Wrong secret key** | Server restarted with a different `JWT_SECRET_KEY` | Tokens are invalid after secret change — log in again |

> **Rule of thumb:** `access_token` → header. `refresh_token` → `/auth/refresh` body. Never mix them up.

---

## 2. Step-by-step: login and use the access token

```bash
BASE="http://localhost:8000/api/v1"

# 1) Log in
LOGIN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier": "9999999999", "password": "AdminPassword123!"}')

# 2) Extract the ACCESS token (NOT the refresh token!)
TOKEN=$(echo "$LOGIN" | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')
REFRESH=$(echo "$LOGIN" | python3 -c 'import sys,json; print(json.load(sys.stdin)["refresh_token"])')

# 3) Verify who you are
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/auth/me"
# → {"id":"...","full_name":"Admin","role":"OWNER","is_active":true}
```

### Refresh your session when the token expires (after 15 min)

```bash
curl -s -X POST "$BASE/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH\"}"
# → new { access_token, refresh_token } pair. Use the new access_token.
```

> The frontend does this automatically: `api.ts` refreshes the token on any 401
> and retries the request, so the web app never silently logs you out.

---

## 3. Complete endpoint reference

All endpoints below use `TOKEN` from step 2 unless noted.

### 3.1 Public endpoints (no auth needed)

```bash
# Health checks
curl -s http://localhost:8000/health
curl -s http://localhost:8000/health/ready

# Catalog
curl -s "$BASE/services"                 # list services
curl -s "$BASE/service-areas"            # list service areas

# Track an order by its public code (no login)
curl -s "$BASE/orders/track/SH-FC8B30"
```

### 3.2 Authentication

```bash
# Register a customer (rate limited: 5/min per IP)
curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Riya Customer","phone":"9876543322","password":"CustomerPass123!"}'

# Login (rate limited: 10/min per IP → 429 after that)
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"9876543322","password":"CustomerPass123!"}'

# Refresh (rate limited: 10/min)
curl -s -X POST "$BASE/auth/refresh" -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH\"}"

# Who am I? (needs ACCESS token)
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/auth/me"

# Logout — revokes the refresh token (needs the refresh token in body)
curl -s -X POST "$BASE/auth/logout" -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH\"}" -o /dev/null -w "HTTP %{http_code}\n"
```

### 3.3 Customer order endpoints (any logged-in user)

```bash
# My orders
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/orders"

# Place an order
curl -s -X POST "$BASE/orders" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "service_id": "<SERVICE_ID from /services>",
    "scheduled_date": "2026-08-25",
    "scheduled_slot": "10:00 AM - 12:00 PM",
    "street": "12, MP Nagar",
    "area": "MP Nagar",
    "pincode": "462011"
  }'

# Order detail  (replace <ORDER_ID>)
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/orders/<ORDER_ID>"

# Cancel my order
curl -s -X POST -H "Authorization: Bearer $TOKEN" "$BASE/orders/<ORDER_ID>/cancel"
```

### 3.4 Admin endpoints (OWNER / ADMIN / OPERATIONS roles)

> If a role check fails you get **403 Insufficient permissions**, not 401.
> 401 = authentication problem; 403 = you're logged in but not admin.

```bash
# --- Orders (paginated!) ---
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/orders"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/orders?page=2&page_size=50"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/orders?status=requested"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/orders?area=MP+Nagar"

# Create an offline order (phone/WhatsApp intake)
curl -s -X POST "$BASE/admin/orders" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "source": "phone",
    "customer_name": "Walk-in Client",
    "customer_phone": "9876500011",
    "service_id": "<SERVICE_ID>",
    "scheduled_date": "2026-08-25",
    "scheduled_slot": "02:00 PM - 04:00 PM",
    "street": "B-4, Arera Colony",
    "area": "Arera Colony",
    "pincode": "462016",
    "amount": "899.00"
  }'

# Order detail / update / status
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/orders/<ORDER_ID>"
curl -s -X PATCH "$BASE/admin/orders/<ORDER_ID>" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"amount":"1200.00","estimated_hours":"3.00"}'
curl -s -X POST "$BASE/admin/orders/<ORDER_ID>/status" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
# valid statuses: requested → contacted → confirmed → in_progress → completed | cancelled

# Payments & add-ons
curl -s -X POST "$BASE/admin/orders/<ORDER_ID>/payments" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"amount":"1200.00","method":"UPI","status":"received","reference":"test@upi"}'
curl -s -X POST "$BASE/admin/orders/<ORDER_ID>/addons" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"addon_type":"60min","price":"80.00","quantity":1}'

# --- Dashboard ---
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/stats"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/dashboard-alerts"

# --- Staff management ---
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/staff"
curl -s -X POST "$BASE/admin/staff" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"full_name":"Ramesh","phone":"9876500001","specializations":"Deep cleaning"}'
curl -s -X PATCH "$BASE/admin/staff/<STAFF_ID>" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"on_leave"}'

# --- Dispatch: assign staff to an order ---
curl -s -X POST "$BASE/admin/orders/<ORDER_ID>/assign" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"staff_id":"<STAFF_ID>","role":"cleaner"}'
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/orders/<ORDER_ID>/assignments"
curl -s -X POST "$BASE/admin/orders/<ORDER_ID>/assignments/<ASSIGNMENT_ID>/complete" \
  -H "Authorization: Bearer $TOKEN"

# --- Recurring subscriptions ---
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/recurring-orders"
curl -s -X POST "$BASE/admin/recurring-orders" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "customer_id":"<USER_ID>",
    "service_id":"<SERVICE_ID>",
    "frequency":"weekly",
    "preferred_day":"Monday",
    "preferred_slot":"10:00 AM - 12:00 PM",
    "street":"12, MP Nagar",
    "area":"MP Nagar",
    "pincode":"462011"
  }'

# --- Reports & exports ---
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE/admin/reports/revenue-summary?start_date=2026-08-01&end_date=2026-08-31"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE/admin/reports/csv?start_date=2026-08-01&end_date=2026-08-31" -o report.csv

# --- Audit log (who did what) ---
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/audit-logs"

# --- Catalog & WhatsApp config ---
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/services"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/service-areas"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/whatsapp-config"
```

---

## 4. Status code cheat sheet

| Code | Meaning | What to check |
|------|---------|---------------|
| `200` | OK | — |
| `201` | Created | — |
| `204` | No content (logout, delete) | — |
| `401` | **Not authenticated** | Bearer header missing / refresh token used / token expired |
| `403` | **Authenticated but not allowed** | Your role isn't OWNER/ADMIN/OPERATIONS for admin routes |
| `404` | Not found | Wrong ID, wrong order code |
| `409` | Already exists | Phone/email already registered |
| `422` | Validation error | Bad body, bad date/slot/status transition |
| `429` | **Rate limited** | Login/register: 10/min & 5/min per IP — slow down |
| `500` | Server error | Check backend logs |

---

## 5. One-shot test script

Save as `test_api.sh` and run — it logs in, exercises every endpoint, and prints
the HTTP status for each:

```bash
#!/bin/bash
BASE="http://localhost:8000/api/v1"
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"identifier":"9999999999","password":"AdminPassword123!"}')
TOKEN=$(echo "$LOGIN" | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
AUTH="Authorization: Bearer $TOKEN"

check() { code=$(curl -s -o /dev/null -w "%{http_code}" $@); echo "[$code] $1"; }

check -H "$AUTH" "$BASE/auth/me"
check -H "$AUTH" "$BASE/admin/orders"
check -H "$AUTH" "$BASE/admin/stats"
check -H "$AUTH" "$BASE/admin/staff"
check -H "$AUTH" "$BASE/admin/audit-logs"
check -H "$AUTH" "$BASE/admin/dashboard-alerts"
check -H "$AUTH" "$BASE/admin/recurring-orders"
check -H "$AUTH" "$BASE/admin/reports/revenue-summary?start_date=2026-01-01&end_date=2026-12-31"
```

---

## 6. Demo login credentials

| Role | Phone | Password |
|------|-------|----------|
| Owner/Admin | `9999999999` | `AdminPassword123!` |

Customers register themselves through `POST /auth/register` (or the website's
**Create account** page).

---

## 7. Where to find API docs

- Interactive Swagger UI: **http://localhost:8000/docs**
- OpenAPI JSON: **http://localhost:8000/openapi.json**

Swagger UI is only enabled when `ENVIRONMENT=development` in the backend `.env`.
