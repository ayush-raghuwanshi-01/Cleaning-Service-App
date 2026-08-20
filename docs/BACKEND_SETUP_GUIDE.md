# Backend Upgrade — Setup Guide

This guide adds the new backend capabilities to your `Cleaning-Service-backend`
repo, then gets it running locally. Do this **first**, then apply the frontend
changes (they call these new endpoints).

The complete change set is packaged as one patch file:
**`backend-upgrade.patch`** (in this repo's root, or at `~/backend-upgrade.patch`).

---

## What the patch adds

| Area | New/changed |
|------|-------------|
| Staff | `app/models/staff.py` (StaffMember + OrderAssignment), `app/schemas/staff.py`, `app/services/staff.py`, `app/api/v1/endpoints/staff.py` |
| Assignment | order endpoints `POST/DELETE /admin/orders/{id}/staff…` with double-booking conflict checks |
| Google auth | `POST /auth/google`, `PATCH /auth/me`, nullable `users.phone` |
| Notifications | `app/services/notifications.py` (WhatsApp Cloud API abstraction) |
| Admin users | `app/api/v1/endpoints/users.py`, `app/schemas/admin.py` (list/create/update/role/reset-password) |
| Reports | `GET /admin/reports` (date-range revenue/orders) |
| Catalog | delete service/area, add-on list/update/delete |
| Customer reschedule | `POST /orders/{id}/reschedule` |
| Migrations | `alembic/versions/0004_staff_assignment.py`, `0005_google_auth.py` |
| Config | `app/core/config.py` + `.env.example` (Google + WhatsApp settings) |

**Net result: 38 API routes** (was 30), all verified to compile and register.

---

## Step 1 — Get the patch into your repo

Pick **one** of the three methods.

### Method A — `git apply` (recommended, keeps history clean)
```bash
cd Cleaning-Service-backend
git apply --check backend-upgrade.patch   # sanity check (should print nothing)
git apply backend-upgrade.patch
git status                                # shows ~22 files added/modified
```
Then commit on a branch and push:
```bash
git checkout -b feature/staff-google-notifications
git add -A
git commit -m "feat: staff + assignment, Google auth, WhatsApp notifications, reschedule, admin users/reports"
git push -u origin feature/staff-google-notifications
```

### Method B — Copy files manually
Copy these **new files** into the matching paths:
```
alembic/versions/0004_staff_assignment.py
alembic/versions/0005_google_auth.py
app/models/staff.py
app/schemas/admin.py
app/schemas/staff.py
app/services/notifications.py
app/services/staff.py
app/api/v1/endpoints/staff.py
app/api/v1/endpoints/users.py
```
And **overwrite** these existing files with the patched versions:
```
.env.example
pyproject.toml
app/core/config.py
app/models/__init__.py
app/models/order.py
app/models/user.py
app/schemas/auth.py
app/schemas/order.py
app/services/auth.py
app/api/v1/endpoints/auth.py
app/api/v1/endpoints/business.py
app/api/v1/endpoints/orders.py
app/api/v1/router.py
```

### Method C — Pull my branch directly (if you want me to push)
The changes are already committed on branch `feature/staff-google-notifications`
in the working copy. If you grant the `arena-ai-coding-agent` bot write access to
`Cleaning-Service-backend` (Settings → Collaborators), I can push it and you can
just `git pull`.

---

## Step 2 — Configure `.env`

Add these to `Cleaning-Service-backend/.env` (copy the commented block from
`.env.example`):

```dotenv
# Google OAuth (Sign in with Google)
GOOGLE_CLIENT_ID=

# WhatsApp Business Cloud API (Meta Graph API)
NOTIFICATIONS_ENABLED=false
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ADMIN_NUMBER=
```

- Leave `GOOGLE_CLIENT_ID` empty for now if you're testing without Google (the
  endpoint will return a clear "not configured" message instead of crashing).
- Keep `NOTIFICATIONS_ENABLED=false` until WhatsApp is configured — all sends
  become safe log lines.

---

## Step 3 — Run migrations

```bash
docker compose up --build
docker compose exec api alembic upgrade head
```

This applies `0004_staff_assignment` (creates `staff` + `order_assignments`
tables) and `0005_google_auth` (makes `users.phone` nullable).

---

## Step 4 — Verify it works

Open `http://localhost:8000/docs` and confirm these new endpoints exist:

- `POST /api/v1/auth/google`
- `PATCH /api/v1/auth/me`
- `GET/POST /api/v1/admin/staff`
- `POST/DELETE /api/v1/admin/orders/{order_id}/staff…`
- `GET /api/v1/admin/users`, `POST /api/v1/admin/users/{id}/reset-password`
- `GET /api/v1/admin/reports`
- `POST /api/v1/orders/{order_id}/reschedule`

### Quick smoke test (register → book → assign → complete)

1. **Register + login a customer** (get `access_token`).
2. **Create a staff member** (admin token):
   ```json
   POST /api/v1/admin/staff
   { "full_name": "Ramesh Kumar", "phone": "919812345678", "skills": ["express"] }
   ```
3. **Place an order** (customer token).
4. **Assign staff** (admin token):
   ```json
   POST /api/v1/admin/orders/{order_id}/staff
   { "staff_ids": ["<staff id>"] }
   ```
5. Assign the same staff to a second order in the **same slot** → you should get a
   **409 Conflict** ("already assigned to another job at the same time").
6. **Reschedule** the order (customer token) via `POST /orders/{id}/reschedule`.

---

## Step 5 — (Optional) Wire Google + WhatsApp later

- **Google:** Google Cloud Console → Credentials → OAuth 2.0 Client ID (Web
  application). Put the Client ID in backend `GOOGLE_CLIENT_ID` **and** frontend
  `VITE_GOOGLE_CLIENT_ID` (must match). No client secret is needed for the
  frontend flow.
- **WhatsApp:** Meta Business → WhatsApp Business Platform → get an access token +
  phone number ID, set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_ADMIN_NUMBER` (your number in E.164, e.g. `919876543210`), and flip
  `NOTIFICATIONS_ENABLED=true`.

---

## Checks already run on this patch

- ✅ Applies cleanly to `main` (`git apply --check` passes)
- ✅ `python -m compileall` passes
- ✅ App imports + all 38 routes register with valid schemas
- ✅ `ruff check --select F,E9` passes (no undefined names / fatal errors)

Once this is running on your machine, tell me and we'll move to the frontend
changes (they consume all these endpoints).
