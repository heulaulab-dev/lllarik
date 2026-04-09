# Axios Migration + Auth Refresh + Error Handling Design

## Overview

Migrate frontend dashboard HTTP calls from `fetch` to `axios` while preserving current dashboard behavior. At the same time, standardize authentication token handling (including refresh) and API error UX using shadcn Sonner toasts.

This design targets `lllarik` (frontend) first and introduces required auth refresh support in `lllarik-api` to satisfy refresh-on-401 behavior.

Reference for toast component: [shadcn Sonner docs](https://ui.shadcn.com/docs/components/radix/sonner).

## Goals

- Replace dashboard API-layer `fetch` usage with a shared `axios` client.
- Centralize auth header injection and token refresh/retry flow.
- Normalize API errors and route them consistently to inline form errors and Sonner toasts.
- Keep existing React Query hook contracts stable to avoid component-level churn.

## Non-Goals

- Redesign dashboard UI/flows.
- Replace React Query.
- Introduce broad backend auth model changes beyond refresh/logout support.
- Migrate non-dashboard frontend network logic in this phase.

## Scope

In scope:
- `lllarik` dashboard API layer (`src/lib/dashboardService.ts`) and shared HTTP utilities.
- `lllarik` toast wiring with shadcn Sonner.
- `lllarik-api` refresh endpoint and refresh token lifecycle support.

Out of scope:
- Full cross-app migration of all `fetch` calls outside dashboard workflows.
- Social/OAuth auth providers.

## Architecture

### Frontend

Introduce a shared HTTP layer:

- `src/lib/http/client.ts`
  - Single `axios` instance (`baseURL` from `NEXT_PUBLIC_CONTENT_API_URL`, JSON defaults, timeout).
  - Request interceptor: inject access token from auth store.
  - Response interceptor: handle `401`, perform one refresh cycle, retry queued requests.
- `src/lib/http/errors.ts`
  - `normalizeApiError()` produces a consistent error shape.
- `src/lib/http/notify.ts`
  - `notifyApiError()` maps normalized errors to Sonner toast behavior.

Keep `src/lib/dashboardService.ts` public hook API intact. Only internal request calls change from `fetch` helper to axios-based helper.

### Backend

Add refresh support to `lllarik-api`:

- `POST /api/v1/auth/refresh`
  - Validates refresh token.
  - Issues new access token and rotated refresh token.
- Optional but recommended: `POST /api/v1/auth/logout`
  - Revokes current refresh token session.

Persist refresh tokens server-side in revocable form (hashed token + metadata).

## Token Strategy

- Access token: short TTL (target 10-15 minutes).
- Refresh token: longer TTL (target 7-30 days), rotation on use.
- Storage preference:
  - Preferred: refresh token in secure `httpOnly` cookie set by backend.
  - Access token remains in frontend auth state for request attachment.

## Request and Refresh Flow

1. User logs in and receives access + refresh token material.
2. Authenticated requests pass through axios client and attach bearer token automatically.
3. On `401`:
   - If request is not already retried, trigger refresh once.
   - Queue concurrent protected requests while refresh is in flight.
4. If refresh succeeds:
   - Update access token in auth store.
   - Replay queued requests once.
5. If refresh fails:
   - Clear auth state.
   - Redirect to `/dashboard/login`.
   - Show Sonner toast: session expired.

Loop protection: each failed request can be retried at most once after refresh.

## Error Normalization and UX

Define normalized error shape:

- `status: number | null`
- `code?: string`
- `message: string`
- `details?: unknown`
- `fieldErrors?: Record<string, string[]>`
- `requestId?: string`

Error display policy (severity-split):

- `422` validation:
  - Primary: inline field errors in forms.
  - Optional toast: brief instruction to check highlighted fields.
- `403` authorization:
  - Sonner warning/error toast with permission message.
- `401` after failed refresh:
  - Sonner error toast + forced login redirect.
- `5xx` and network failures:
  - Sonner error toast with retry-oriented copy.

Add lightweight dedupe in notification utility to avoid repeated identical toasts during retries/refetch bursts.

## Sonner Integration

- Install/add Sonner using shadcn guidance.
- Add global `<Toaster />` once at app root layout.
- Route mutation/query API errors through `notifyApiError()` from React Query `onError`.

## Incremental Rollout Plan

1. Backend auth refresh capability (`/auth/refresh`, token storage/rotation).
2. Frontend shared axios client and interceptors.
3. Frontend error normalization + Sonner notification utility.
4. Migrate `dashboardService` request calls from fetch helper to axios helper.
5. End-to-end verification: login, edit drafts, publish, expiry/refresh behavior.

## Testing Plan

### Frontend

- Unit tests for interceptors:
  - auth header injection,
  - refresh-once logic,
  - queued request replay,
  - logout redirect path on refresh failure.
- Unit tests for `normalizeApiError()` and `notifyApiError()`.
- Integration checks for core hooks in `dashboardService`.

### Backend

- Refresh endpoint happy path.
- Expired/invalid/reused refresh token rejection.
- Token rotation correctness.
- Logout revocation behavior (if included in sprint).

### End-to-End

- Login and perform dashboard reads/writes.
- Simulate expired access token:
  - verify silent refresh and request replay.
- Simulate invalid refresh token:
  - verify logout + redirect + toast.

## Risks and Mitigations

- Risk: refresh retry loops.
  - Mitigation: single retry marker and centralized interceptor guard.
- Risk: toast spam from repeated failing queries.
  - Mitigation: dedupe window in `notifyApiError()`.
- Risk: behavior regression from broad refactor.
  - Mitigation: keep existing hook contracts and migrate internal transport only.
- Risk: token theft/replay.
  - Mitigation: refresh token rotation, server-side hashing, revocation support.

## Acceptance Criteria

- Dashboard API layer no longer uses direct `fetch` for protected content operations.
- Access token is attached centrally via interceptor.
- `401` triggers refresh once and replays queued requests.
- Failed refresh clears session, redirects to login, and shows Sonner toast.
- Validation vs system errors are consistently displayed (inline + toast policy).
- Existing dashboard pages keep current functional behavior after migration.
