# Apply the Backend Patch — Step-by-Step Guide

The backend upgrade is packaged as a single patch file:

```
backend-upgrade.patch      (22 files, includes 2 new Alembic migrations)
```

It was generated from your `main` branch and verified to apply cleanly to a
fresh clone. This guide covers **how to apply it**, whatever your setup.

---

## 0. Before you start

- You need the backend repo cloned locally:
  ```bash
  git clone https://github.com/ayush-raghuwanshi-01/Cleaning-Service-backend.git
  cd Cleaning-Service-backend
  ```
- Make sure you're on a clean `main`:
  ```bash
  git status          # should show "nothing to commit, working tree clean"
  git checkout main
  git pull            # optional but recommended
  ```
- Put `backend-upgrade.patch` inside the repo folder (or note its full path).

---

## 1. Apply the patch (pick one method)

### Method A — `git apply` (recommended)

```bash
cd Cleaning-Service-backend

# 1) Dry-run first — should print NOTHING if it will apply cleanly
git apply --check backend-upgrade.patch

# 2) Apply for real
git apply backend-upgrade.patch
```

If the dry-run prints errors like `patch does not apply`, your local files differ
from `main` (e.g. you edited something). See the troubleshooting section at the
bottom.

### Method B — `git am` (same result, also records a commit message)

```bash
git am backend-upgrade.patch
```

### Method C — raw `patch` (if `git apply` complains)

```bash
patch -p1 < backend-upgrade.patch
```

---

## 2. Verify the files landed

```bash
git status
```

You should see **22 files** — a mix of new (`??`) and modified (`M`). Key ones:

```
alembic/versions/0004_staff_assignment.py   (new)
alembic/versions/0005_google_auth.py        (new)
app/models/staff.py                         (new)
app/schemas/staff.py                        (new)
app/schemas/admin.py                        (new)
app/services/staff.py                       (new)
app/services/notifications.py               (new)
app/api/v1/endpoints/staff.py               (new)
app/api/v1/endpoints/users.py               (new)
... plus modified: config.py, models/*, schemas/*, services/auth.py,
    endpoints/{auth,business,orders}.py, router.py, .env.example, pyproject.toml
```

---

## 3. Commit it (on a branch)

```bash
git checkout -b feature/staff-google-notifications
git add -A
git commit -m "feat: staff + assignment, Google auth, WhatsApp notifications, reschedule, admin users/reports"
git push -u origin feature/staff-google-notifications
```

---

## 4. Configure `.env`

Add these lines to `Cleaning-Service-backend/.env` (there's a matching commented
block in `.env.example`):

```dotenv
# Google OAuth (Sign in with Google)
GOOGLE_CLIENT_ID=

# WhatsApp Business Cloud API (Meta Graph API)
NOTIFICATIONS_ENABLED=false
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ADMIN_NUMBER=
```

- `GOOGLE_CLIENT_ID` — leave empty until you set up Google Cloud credentials.
- `NOTIFICATIONS_ENABLED=false` — keeps all sends as safe log lines until
  WhatsApp is configured.

---

## 5. Run the migrations

```bash
docker compose up --build
docker compose exec api alembic upgrade head
```

This applies:
- `0004_staff_assignment` → creates `staff` + `order_assignments` tables
- `0005_google_auth` → makes `users.phone` nullable (email-only Google users)

---

## 6. Verify everything works

Open `http://localhost:8000/docs` and confirm the new endpoints appear:

- `POST /api/v1/auth/google`
- `PATCH /api/v1/auth/me`
- `GET/POST/PATCH/DELETE /api/v1/admin/staff`
- `POST/DELETE /api/v1/admin/orders/{order_id}/staff…`
- `GET /api/v1/admin/users` + `POST /api/v1/admin/users/{id}/reset-password`
- `GET /api/v1/admin/reports`
- `POST /api/v1/orders/{order_id}/reschedule`

### Quick smoke test
1. Login as owner (from `scripts/bootstrap_owner.py`).
2. `POST /api/v1/admin/staff` → create a cleaner.
3. Place a customer order, then `POST /admin/orders/{id}/staff` to assign them.
4. Assign the same staff to a second order in the **same slot** → expect
   `409 Conflict` ("already assigned to another job at the same time").

---

## 7. (Optional) Enable Google + WhatsApp later

- **Google:** Cloud Console → Credentials → OAuth 2.0 Client ID (Web app).
  Put the Client ID in backend `GOOGLE_CLIENT_ID` **and** frontend
  `VITE_GOOGLE_CLIENT_ID` (must match). No client secret needed for the
  frontend flow.
- **WhatsApp:** Meta Business → WhatsApp Business Platform → access token +
  phone number ID → set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_ADMIN_NUMBER` (E.164, e.g. `919876543210`), then
  `NOTIFICATIONS_ENABLED=true`.

---

## Troubleshooting

**`git apply --check` says "patch does not apply"**
Your working tree differs from `main`. Options:
1. Stash/discard local changes: `git stash` then retry.
2. Reset to a clean main: `git checkout main && git reset --hard origin/main`
   (⚠️ discards local changes), then retry.
3. Apply with fuzz tolerance: `patch -p1 --forward < backend-upgrade.patch`
   (will create `.rej` files for hunks it couldn't place — review those manually).

**"already exists" / migration conflicts**
If you'd already created `0004_*` yourself, the new migration numbering may
clash. Delete any duplicate file or rename the `down_revision` chain, then
`alembic upgrade head`.

**`alembic upgrade head` fails**
Run `docker compose exec api alembic current` to see where it is, and
`alembic history` to see the chain. Migrations must apply in order
0001 → 0002 → 0003 → 0004 → 0005.

---

## Already verified on this exact patch

- ✅ `git apply --check` passes against a fresh clone of `main`
- ✅ `python -m compileall` passes
- ✅ App imports and registers **38 routes** with valid schemas
- ✅ `ruff check --select F,E9` passes
