# What changed (frontend + backend)

A big operational upgrade to take Home Shine from "demo" to "daily business tool".

## Frontend (`Cleaning-Service-App`)

- **Refresh-token auth** — access token auto-refreshes silently on 401; a single
  global "session expired" handler clears state and returns you to login. Logout now
  revokes the server-side session.
- **Sign in / sign up with Google** — via Google Identity Services. Auto-creates an
  account on first sign-in. (Requires `VITE_GOOGLE_CLIENT_ID` + backend `GOOGLE_CLIENT_ID`.)
- **Redirect after login** — customers land on the home page (admins → `/admin`), and
  a `?redirect=` param is honored so you return to where you were headed.
- **Toasts + error handling** — every mutation surfaces a clear success/error toast;
  forms show inline validation errors. Network/API errors show readable messages.
- **Saved addresses** — new `/addresses` page (add/edit/delete/set-default) plus a
  "Saved addresses" quick-pick inside the booking widget.
- **Reschedule** — customers can reschedule a booking from the order detail page
  (before the job starts), and cancel with confirmation.
- **Staff management** — new admin → Staff screen (add/edit/deactivate/delete cleaners
  with skills).
- **Staff assignment** — assign multiple cleaners to any order from the order detail
  page; conflict-checked (a cleaner can't be double-booked in the same slot).
- **Team & users admin** — create staff/admin accounts, change roles, enable/disable,
  reset passwords.
- **Reports** — admin dashboard shows a 7-day revenue/orders summary.
- **Catalog** — delete services (blocked if they have orders) and service areas.

## Backend (`Cleaning-Service-backend`)

- New migrations: `0004_staff_assignment` (staff + order assignment) and
  `0005_google_auth` (nullable `users.phone` for email-only Google users).
- `POST /auth/google`, `PATCH /auth/me` (update phone/name).
- Staff CRUD + order assignment endpoints with double-booking conflict checks.
- `POST /orders/{id}/reschedule` (customer).
- Admin user management + reset-password + a `/admin/reports` range endpoint.
- Catalog delete + add-on list/update/delete endpoints.
- **Notifications** — WhatsApp Business Cloud API abstraction with customer
  confirmation/completion/payment messages and an admin alert on new website orders.
  Safe no-op (logs only) until configured.

---

## Setup steps to finish wiring it up

### 1. Backend migrations (required)
```bash
cd Cleaning-Service-backend
docker compose exec api alembic upgrade head
```

### 2. Backend `.env` additions
```dotenv
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NOTIFICATIONS_ENABLED=false            # flip to true once WhatsApp creds are set
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ADMIN_NUMBER=919876543210     # your number for new-order alerts
```

### 3. Google OAuth (you said you have credentials)
1. Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID
   (type **Web application**).
2. Under **Authorized JavaScript origins** add your site origin
   (e.g. `http://localhost:5173` for dev).
3. Put the **Client ID** in the frontend `.env` (`VITE_GOOGLE_CLIENT_ID`) **and** the
   backend `.env` (`GOOGLE_CLIENT_ID`). They must be identical.
4. Restart both servers. The "Continue with Google" button activates automatically.

> The backend verifies the ID token via Google's `tokeninfo` endpoint using only the
> client ID (no client secret needed for the frontend flow).

### 4. WhatsApp notifications (optional, but recommended for launch)
1. Meta Business → WhatsApp → WhatsApp Business Platform → create an app + phone number.
2. Copy the **access token** and **phone number ID** into the backend `.env`, and set
   `NOTIFICATIONS_ENABLED=true`.

### 5. Verify
- Register/login (including Google), book a service, then as admin: assign staff,
  move status, record payment — and watch the WhatsApp/log notifications.

---

## Notes
- Backend was lint/compile/route-checked in-sandbox (no Docker/Postgres here), so run
  `alembic upgrade head` and the smoke test in `docs/RUN_BACKEND_LOCALLY.md` locally.
- Frontend `npm run lint` and `npm run build` both pass.
