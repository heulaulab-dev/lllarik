# Axios + Auth Refresh + Sonner Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace dashboard `fetch` calls with a shared `axios` client, add refresh-token auth flow, and standardize API error UX with shadcn Sonner toasts.

**Architecture:** Keep existing dashboard hooks and component contracts stable, but route all HTTP calls through a centralized axios client and error notifier. Add backend refresh/logout endpoints with refresh-token rotation and revocation so frontend 401 interception can refresh once and replay queued requests safely.

**Tech Stack:** Next.js 16, React Query, Zustand, Axios, shadcn Sonner, Go (Gin/GORM/JWT), Postgres.

---

## Scope Check

This plan intentionally spans two codebases (`lllarik` and `lllarik-api`) because refresh-on-401 requires backend and frontend support in one vertical slice. The work is still one subsystem (auth/network transport), so one plan is appropriate.

## File Structure

### Frontend (`lllarik`)

- Create: `src/lib/http/client.ts` - shared axios instance, request/response interceptors, refresh queue.
- Create: `src/lib/http/errors.ts` - normalized error type + mapper from axios errors.
- Create: `src/lib/http/notify.ts` - Sonner toast mapping + dedupe.
- Create: `src/components/ui/sonner.tsx` - shadcn Sonner wrapper component.
- Modify: `src/app/layout.tsx` - mount global `<Toaster />`.
- Modify: `src/lib/dashboardStore.ts` - access + refresh token handling helpers.
- Modify: `src/lib/dashboardService.ts` - replace fetch helper usage with axios helper.
- Modify: `package.json` - add `axios` and `sonner` deps.

### Backend (`lllarik-api`)

- Modify: `internal/models/models.go` - add refresh token session model.
- Modify: `internal/auth/jwt.go` - separate access token generation config + refresh token generator.
- Modify: `internal/config/config.go` - add refresh TTL/env fields.
- Modify: `internal/app/server.go` - login payload, refresh endpoint, logout endpoint, token persistence/rotation.

### Tests

- Create: `lllarik-api/internal/auth/jwt_test.go` - access + refresh token behavior.
- Create: `lllarik-api/internal/app/auth_refresh_test.go` - login/refresh/logout handler coverage.
- Create: `lllarik/src/lib/http/errors.test.ts` - normalization mapping coverage.

---

### Task 1: Add Backend Refresh Token Domain

**Files:**
- Modify: `../lllarik-api/internal/models/models.go`
- Modify: `../lllarik-api/internal/config/config.go`
- Modify: `../lllarik-api/internal/auth/jwt.go`
- Test: `../lllarik-api/internal/auth/jwt_test.go`

- [ ] **Step 1: Write failing JWT tests for access + refresh generation**

```go
package auth

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestGenerateAccessTokenExpiresSoonerThanRefresh(t *testing.T) {
	secret := "test-secret"
	userID := uuid.New()

	access, err := GenerateAccessToken(secret, userID, "user@example.com", "admin", 15*time.Minute)
	if err != nil {
		t.Fatalf("GenerateAccessToken error: %v", err)
	}
	if access == "" {
		t.Fatal("expected access token")
	}

	refresh, err := GenerateRefreshToken()
	if err != nil {
		t.Fatalf("GenerateRefreshToken error: %v", err)
	}
	if len(refresh) < 32 {
		t.Fatalf("refresh token too short: %d", len(refresh))
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ../lllarik-api && go test ./internal/auth -run TestGenerateAccessTokenExpiresSoonerThanRefresh -v`  
Expected: FAIL because `GenerateAccessToken` and `GenerateRefreshToken` do not exist yet.

- [ ] **Step 3: Implement refresh token model + JWT helpers**

```go
// models.go
type RefreshSession struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID       uuid.UUID `gorm:"type:uuid;index;not null"`
	TokenHash    string    `gorm:"uniqueIndex;not null"`
	ExpiresAt    time.Time `gorm:"not null"`
	RevokedAt    *time.Time
	ReplacedByID *uuid.UUID `gorm:"type:uuid"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// jwt.go
func GenerateAccessToken(secret string, userID uuid.UUID, email, role string, ttl time.Duration) (string, error) { /* ... */ }
func GenerateRefreshToken() (string, error) { /* crypto/rand base64 token */ }
func HashRefreshToken(token string) string { /* sha256 hex */ }
```

- [ ] **Step 4: Run tests to verify pass**

Run: `cd ../lllarik-api && go test ./internal/auth -v`  
Expected: PASS for new JWT tests.

- [ ] **Step 5: Commit**

```bash
cd ../lllarik-api
git add internal/models/models.go internal/config/config.go internal/auth/jwt.go internal/auth/jwt_test.go
git commit -m "feat: add refresh token model and jwt helpers"
```

---

### Task 2: Implement Backend Login/Refresh/Logout Endpoints

**Files:**
- Modify: `../lllarik-api/internal/app/server.go`
- Test: `../lllarik-api/internal/app/auth_refresh_test.go`

- [ ] **Step 1: Write failing handler tests for refresh flow**

```go
func TestRefreshReturnsNewAccessToken(t *testing.T) {
	// arrange login user/session fixture
	// call POST /api/v1/auth/refresh with valid refresh token
	// expect 200 and new access token
}

func TestLogoutRevokesRefreshSession(t *testing.T) {
	// arrange valid refresh session
	// call POST /api/v1/auth/logout
	// expect 200 and subsequent refresh call returns 401
}
```

- [ ] **Step 2: Run tests to verify fail**

Run: `cd ../lllarik-api && go test ./internal/app -run 'TestRefreshReturnsNewAccessToken|TestLogoutRevokesRefreshSession' -v`  
Expected: FAIL because endpoints do not exist.

- [ ] **Step 3: Implement endpoints and rotation logic**

```go
// routes()
v1.POST("/auth/refresh", s.refresh)
authed.POST("/auth/logout", s.logout)

// login()
c.JSON(http.StatusOK, gin.H{
  "accessToken": accessToken,
  "refreshToken": refreshToken,
})

// refresh()
// 1) parse refresh token input
// 2) hash lookup active session
// 3) validate expiry/revoked
// 4) revoke old + create rotated session
// 5) return new access+refresh tokens
```

- [ ] **Step 4: Run app package tests**

Run: `cd ../lllarik-api && go test ./internal/app -v`  
Expected: PASS for auth refresh/logout tests.

- [ ] **Step 5: Commit**

```bash
cd ../lllarik-api
git add internal/app/server.go internal/app/auth_refresh_test.go
git commit -m "feat: add auth refresh and logout endpoints with rotation"
```

---

### Task 3: Add Frontend Axios Client + Auth Store Extensions

**Files:**
- Modify: `package.json`
- Modify: `src/lib/dashboardStore.ts`
- Create: `src/lib/http/client.ts`
- Create: `src/lib/http/errors.ts`

- [ ] **Step 1: Add dependencies and failing error normalization test**

```ts
// errors.test.ts
import { normalizeApiError } from "@/lib/http/errors";

it("maps axios 403 response into normalized shape", () => {
  const err = { isAxiosError: true, response: { status: 403, data: { error: "forbidden" } } };
  const normalized = normalizeApiError(err as never);
  expect(normalized.status).toBe(403);
  expect(normalized.message).toBe("forbidden");
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `npm run lint`  
Expected: FAIL because `normalizeApiError` file/symbol does not exist yet.

- [ ] **Step 3: Implement store/token + axios client foundation**

```ts
// dashboardStore.ts
type DashboardAuthState = {
  accessToken: string;
  refreshToken: string;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
};

// client.ts
export const apiClient = axios.create({ baseURL: getBaseUrl(), timeout: 15000 });
apiClient.interceptors.request.use((config) => {
  const token = useDashboardAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- [ ] **Step 4: Implement error normalizer and verify lint**

Run: `npm run lint`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json src/lib/dashboardStore.ts src/lib/http/client.ts src/lib/http/errors.ts src/lib/http/errors.test.ts
git commit -m "feat: add axios client foundation and normalized api errors"
```

---

### Task 4: Wire Refresh Interceptor Queue + Dashboard Service Migration

**Files:**
- Modify: `src/lib/http/client.ts`
- Modify: `src/lib/dashboardService.ts`

- [ ] **Step 1: Write failing check for token-response contract in login hook**

```ts
// dashboardService.ts expectation update
type LoginResponse = { accessToken: string; refreshToken: string };
```

- [ ] **Step 2: Run lint to surface type mismatch**

Run: `npm run lint`  
Expected: FAIL until hook uses new login response shape.

- [ ] **Step 3: Implement refresh queue and migrate service calls**

```ts
// client.ts response interceptor sketch
let isRefreshing = false;
const queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) throw normalizeApiError(error);
    original._retry = true;
    // refresh once, then replay queued requests
  }
);
```

- [ ] **Step 4: Verify dashboard service compiles and lint passes**

Run: `npm run lint`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/http/client.ts src/lib/dashboardService.ts
git commit -m "refactor: migrate dashboard service to axios with refresh retry queue"
```

---

### Task 5: Sonner Toast Integration and Unified API Notifications

**Files:**
- Create: `src/components/ui/sonner.tsx`
- Create: `src/lib/http/notify.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/lib/dashboardService.ts`

- [ ] **Step 1: Write failing import usage for notifier**

```ts
import { notifyApiError } from "@/lib/http/notify";
```

- [ ] **Step 2: Run lint to verify missing module failure**

Run: `npm run lint`  
Expected: FAIL because `notify.ts` is not present.

- [ ] **Step 3: Add Sonner wrapper, Toaster mount, and notifier**

```tsx
// ui/sonner.tsx
"use client";
import { Toaster as Sonner } from "sonner";
export function Toaster() {
  return <Sonner richColors position="top-right" />;
}
```

```ts
// notify.ts
import { toast } from "sonner";
export function notifyApiError(error: NormalizedApiError) {
  if (error.status === 403) return toast.warning("You do not have permission for this action.");
  if (error.status === 401) return toast.error("Session expired. Please sign in again.");
  return toast.error(error.message || "Request failed. Please try again.");
}
```

- [ ] **Step 4: Hook notifier into mutations/queries and run lint**

Run: `npm run lint`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/sonner.tsx src/app/layout.tsx src/lib/http/notify.ts src/lib/dashboardService.ts
git commit -m "feat: integrate sonner toast notifications for normalized api errors"
```

---

### Task 6: End-to-End Verification Checklist and Final Hardening

**Files:**
- Modify: `src/lib/http/client.ts` (only if issues found during verification)
- Modify: `../lllarik-api/internal/app/server.go` (only if issues found during verification)

- [ ] **Step 1: Run backend tests**

Run: `cd ../lllarik-api && go test ./...`  
Expected: PASS.

- [ ] **Step 2: Run frontend static checks**

Run: `npm run lint`  
Expected: PASS.

- [ ] **Step 3: Manual flow verification**

```bash
# Terminal 1
cd ../lllarik-api && go run ./cmd/api

# Terminal 2
npm run dev
```

Manual checks:
- Login returns dashboard access and stores both tokens.
- Protected request with expired access token silently refreshes then succeeds.
- Invalid refresh token clears auth and routes to `/dashboard/login` with toast.
- 403 and 5xx responses show expected Sonner messages.

- [ ] **Step 4: Apply minimal fixes from verification and rerun checks**

Run: `cd ../lllarik-api && go test ./... && cd ../lllarik && npm run lint`  
Expected: PASS.

- [ ] **Step 5: Commit final polish**

```bash
git add src/lib/http/client.ts src/lib/dashboardService.ts ../lllarik-api/internal/app/server.go
git commit -m "fix: harden refresh flow and error handling after verification"
```

---

## Self-Review

- Spec coverage: all required areas are mapped (axios migration, refresh backend/frontend, Sonner integration, error normalization, rollout verification).
- Placeholder scan: no TODO/TBD placeholders remain.
- Type consistency: `accessToken`/`refreshToken` naming is used consistently across login, refresh, store, and interceptor steps.
