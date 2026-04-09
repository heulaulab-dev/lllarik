# Admin User Management (Create / List / Deactivate)

## Overview

Add **admin-only** flows so an existing CMS admin can create **additional admin accounts**, **list all CMS users** (all roles), and **toggle `is_active`** (soft disable or re-enable) without deleting rows. New admins sign in with the same email/password login as today (bcrypt-hashed passwords, JWT sessions).

This extends the existing `users` table and RBAC in `lllarik-api`; the Next.js dashboard gains a **`/dashboard/users`** area gated to `role === "admin"`.

## Goals

- Dashboard UI for: create admin (email + password), list users, activate/deactivate.
- REST API under `/api/v1/users` callable only by **`admin`** (same middleware group as `POST /publish`).
- Preserve **at least one active admin**; prevent **self-deactivation**.

## Non-Goals

- Invite email, magic links, or forced password change on first login.
- Hard-deleting user rows.
- Creating or editing **editor** / **viewer** accounts in v1 (creation is **admin role only**).
- Audit log of who changed whom (future enhancement).

## Architecture

### Backend (`lllarik-api`)

- Register routes on the existing Gin **`admin`** group (`httpx.RoleMiddleware(models.RoleAdmin)`).
- Implement handlers in a dedicated file (e.g. `internal/app/user_admin.go`) with methods on `*Server`, keeping `server.go` as wiring only.
- Reuse: GORM `models.User`, `golang.org/x/crypto/bcrypt`, email normalization consistent with `login` (`strings.ToLower`, `TrimSpace`).

### Frontend (`lllarik`)

- New route **`/dashboard/users`**: form + table.
- **Navigation:** sidebar item (e.g. “Users”) visible only when `GET /api/v1/auth/me` returns `role: "admin"`. Non-admins hitting the URL get a redirect or clear “not allowed” state (no new server middleware required if client gate is sufficient; API remains authoritative).
- **API client:** extend existing `apiRequest` / dashboard hooks (e.g. `dashboardService.ts`) for list, create, patch.

### Data Flow

1. Admin opens Users page → `GET /users` populates table.
2. Admin submits form → `POST /users` → new row `role: admin`, `is_active: true`.
3. Admin toggles status → `PATCH /users/:id` with `{ "isActive": false | true }` → updates `is_active` after rule checks.

## API

Base path: `/api/v1/users`. All endpoints require `Authorization: Bearer <access_token>` and **admin** role.

### `GET /users`

**Response:** `200` with `{ "items": [ ... ] }` where each item includes:

- `id` (uuid string)
- `email`
- `role` (`admin` | `editor` | `viewer`)
- `isActive` (boolean)
- `createdAt` (ISO 8601)

Must **not** expose `passwordHash` or refresh session data.

### `POST /users`

**Body:**

```json
{
  "email": "new-admin@example.com",
  "password": "..."
}
```

**Behavior:**

- Normalize email like login.
- Reject if email already exists → **`409`** with a stable error shape (e.g. `{ "error": "email already exists" }`).
- Reject invalid body (missing/empty email or password) → **`400`**.
- Password: **non-empty**; enforce a **minimum length of 8 characters** on create (login unchanged)—reduces trivial passwords for new accounts only.
- Hash with bcrypt (same cost as `seedAdmin` / existing patterns).
- Set `role` to **`admin`**, `is_active` **`true`**.

**Response:** `201` with created user DTO (same fields as list items, no secret fields).

### `PATCH /users/:id`

**Body:**

```json
{
  "isActive": false
}
```

**Rules:**

- **`404`** if user id not found.
- **Cannot deactivate self:** if `id` matches JWT subject / `claims.UserID` and `isActive` is `false` → **`400`**.
- **Last admin guard:** if the target user has `role == admin`, is currently `is_active == true`, and `isActive` is `false`, then after the update there must still be **at least one** admin with `is_active == true`. Otherwise **`400`** (e.g. `cannot deactivate last admin`).
- Setting `isActive: true` has no last-admin constraint.

**Response:** `200` with updated user DTO.

## Error Handling (Summary)

| Situation | HTTP |
|-----------|------|
| Not authenticated | 401 |
| Authenticated, not admin | 403 |
| Invalid JSON / missing fields | 400 |
| Duplicate email on create | 409 |
| Unknown user id | 404 |
| Self-deactivate | 400 |
| Deactivate would leave zero active admins | 400 |

## Security Notes

- Only admins can enumerate or mutate users via these endpoints.
- Deactivated users already fail login and refresh (`is_active = true` checks in existing auth handlers).
- JWT role is fixed at issue time; disabling a user does not revoke outstanding tokens until expiry—acceptable for v1; document as known limitation (optional future: refresh revocation sweep).

## Testing

**Go (recommended):**

- `POST /users` success; duplicate email → 409.
- `PATCH` self-deactivate → 400.
- `PATCH` last active admin → 400.
- `PATCH` deactivate non-admin or non-last-admin → 200.
- `GET /users` returns expected shape, no password field.

**Frontend (optional v1):** smoke or component test for sidebar visibility by role if patterns exist.

## Documentation

- Update `lllarik-api/docs/API.md` with the three endpoints, auth requirement, and error cases.

## References

- Existing roles and `User` model: `lllarik-api/internal/models/models.go`
- Admin route group: `lllarik-api/internal/app/server.go` (`admin.POST("/publish", ...)`)
- Auth middleware: `lllarik-api/internal/httpx/middleware.go`
- Prior CMS spec: `2026-04-08-dashboard-cms-design.md`
