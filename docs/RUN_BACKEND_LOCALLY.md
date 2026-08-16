# Run the Backend Locally (Home Shine — FastAPI)

Step-by-step guide to get the Phase-1 backend (orders, payments, add-ons, timeline,
WhatsApp config, time-based service pricing) running on your own computer.

---

## 1. Get the code into your backend repo

The changes are complete in the working copy. Three ways to bring them in:

### Option A — Apply the patch (no manual copy)
Download/use the patch file and run, inside your `Cleaning-Service-backend` folder:

```bash
git apply /path/to/backend_phase1.patch
git add -A
git commit -m "Phase 1: orders, payments, add-ons, timeline, WhatsApp config"
git push origin main
```

### Option B — Copy the new/modified files
Copy these **new files** into the matching paths in your repo:

```
alembic/versions/0003_orders_payments_whatsapp.py
app/models/order.py
app/schemas/order.py
app/services/orders.py
app/api/v1/endpoints/orders.py
tests/conftest.py
tests/test_orders.py
tests/test_orders_integration.py
```

And **overwrite** these existing files with the updated versions:

```
app/models/__init__.py
app/models/business.py
app/schemas/business.py
app/api/v1/endpoints/business.py
app/api/v1/router.py
README.md
```

> The complete file set is also open in your viewer so you can read/review every line.

---

## 2. Prerequisites

- **Python 3.12+** (required by `pyproject.toml`)
- **Docker + Docker Compose** (for PostgreSQL + the API) — recommended and easiest
- `uv` is used by the project for dependency management, but you can also use `pip`

Check versions:
```bash
python3 --version   # must be 3.12+
docker --version
docker compose version
```

---

## 3. Setup environment

Create `.env` from the example and set strong secrets:

```bash
cp .env.example .env
```

Edit `.env` — replace these (they **must** be ≥32 chars):

```dotenv
DATABASE_URL=postgresql+asyncpg://home_shine:home_shine@db:5432/home_shine
JWT_SECRET_KEY=change-me-to-a-long-random-secret-32chars
JWT_REFRESH_SECRET_KEY=change-me-to-a-different-long-random-secret
CORS_ORIGINS=["http://localhost:5173"]
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
```

> Keep `DATABASE_URL` host as `db` (that's the Docker network name). If you run the
> API outside Docker (step 5B) change it to `localhost`.

---

## 4. Start everything with Docker (easiest)

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port `5432`
- **API** on port `8000` (with auto-reload)

Then, in a second terminal, run the migrations:

```bash
docker compose exec api alembic upgrade head
```

### Create the first owner (admin) account

Add these to `.env` **temporarily**, run once, then remove them:

```dotenv
BOOTSTRAP_OWNER_NAME=Your Name
BOOTSTRAP_OWNER_PHONE=919876543210
BOOTSTRAP_OWNER_EMAIL=you@example.com
BOOTSTRAP_OWNER_PASSWORD=A-strong-password-12345
```

```bash
docker compose exec api python scripts/bootstrap_owner.py
```

Then delete those four `BOOTSTRAP_OWNER_*` lines from `.env`.

---

## 5. Verify it's working

- **Health checks:**
  - `http://localhost:8000/health` → `{"status":"ok"}`
  - `http://localhost:8000/health/ready` → `{"status":"ready"}` (checks DB)
- **Interactive API docs:** open `http://localhost:8000/docs` in your browser.

### Smoke-test the flow (register → login → order)

Use `/docs` (Swagger UI) or any REST client. Steps:

1. **Register a customer**
   `POST /api/v1/auth/register`
   ```json
   { "full_name": "Test User", "phone": "9876543210", "password": "A-long-password-123" }
   ```

2. **Login** → `POST /api/v1/auth/login` with `{"identifier":"9876543210","password":"..."}`
   Copy the returned `access_token`.

3. **Create a service (admin)** — login as the owner from step 4, then
   `POST /api/v1/admin/services` with the access token in the `Authorization: Bearer ...` header:
   ```json
   {
     "name": "Basic Housekeeping",
     "category": "express",
     "base_price": "199.00",
     "duration_minutes": 120,
     "addon_price_30min": "50.00",
     "addon_price_60min": "80.00",
     "overtime_grace_minutes": 15,
     "includes": ["Sweeping", "Mopping"]
   }
   ```

4. **Place an order (customer)** → `POST /api/v1/orders` (use the customer token):
   ```json
   {
     "service_id": "<id from step 3>",
     "scheduled_date": "2026-08-20",
     "scheduled_slot": "10:00 AM - 12:00 PM",
     "street": "Plot 12, MP Nagar",
     "area": "MP Nagar",
     "pincode": "462011"
   }
   ```

5. **Edit order (admin)** → `PATCH /api/v1/admin/orders/{order_id}`
   ```json
   { "estimated_hours": "3.00", "amount": "1200.00", "description": "2BHK deep work agreed at 1200" }
   ```

6. **Advance status** → `POST /api/v1/admin/orders/{order_id}/status`
   `{"status":"contacted"}` then `confirmed` → `in_progress` → `completed`

7. **Record payment** → `POST /api/v1/admin/orders/{order_id}/payments`
   ```json
   { "amount": "1200.00", "method": "CASH", "status": "received", "reference": "cash-on-site" }
   ```
   The order now shows `payment_status: "paid"`.

8. **Track publicly** → `GET /api/v1/orders/track/{order_code}` (the `SH-XXXXXX` code).

---

## 5B. Alternative: run without Docker (manual Postgres)

If you'd rather not use Docker:

1. Install PostgreSQL locally, create the DB and user:
   ```sql
   CREATE USER home_shine WITH PASSWORD 'home_shine';
   CREATE DATABASE home_shine OWNER home_shine;
   ```
2. In `.env`, set `DATABASE_URL=postgresql+asyncpg://home_shine:home_shine@localhost:5432/home_shine`.
3. Install deps and run:
   ```bash
   pip install -e .
   pip install "pytest>=8.3,<9" "pytest-asyncio>=0.24,<1" "httpx>=0.28,<1" "ruff>=0.8,<1"
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

---

## 6. Run the tests

```bash
# Unit tests (auth, status machine, payment derivation) — no DB needed
pytest tests/ -q
```

The DB integration tests (`test_orders_integration.py`) run automatically when
PostgreSQL is reachable, and skip if not.

---

## Project structure (Phase 1)

```
app/
  api/v1/endpoints/orders.py   # public + customer + admin order endpoints
  api/v1/router.py             # registers all routers
  models/order.py              # Order, Payment, OrderAddon, OrderEvent, WhatsAppConfig
  models/business.py           # Service (extended with time-based pricing)
  schemas/order.py             # request/response models
  services/orders.py           # status machine + payment derivation
alembic/versions/0003_...py    # DB migration
tests/                         # unit + DB integration tests
```
