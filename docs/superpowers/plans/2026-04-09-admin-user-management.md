# Admin User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship admin-only REST endpoints for listing users, creating additional admin accounts, and toggling `is_active`, plus a gated `/dashboard/users` UI that matches the existing dashboard patterns.

**Architecture:** Keep HTTP handlers on `*Server` in a new `internal/app/user_admin.go` file; register routes on the existing Gin `admin` group in `server.go`. Integration-test the HTTP surface with `httptest`, an in-memory SQLite database (via `github.com/glebarez/sqlite` — pure Go, no CGO), and JWTs from `internal/auth`. Extend `dashboardService.ts` with React Query hooks; gate the sidebar and page using `GET /api/v1/auth/me`.

**Tech Stack:** Go 1.25+, Gin, GORM, bcrypt, JWT; Next.js App Router, TanStack Query, Axios `apiRequest`, shadcn/ui (Card, Table, Button, Input).

---

## File map

| File | Action | Responsibility |
|------|--------|----------------|
| `lllarik-api/go.mod` | Modify | Add SQLite test driver `github.com/glebarez/sqlite`. |
| `lllarik-api/internal/app/user_admin.go` | Create | `listUsers`, `createAdminUser`, `patchUserActive` + small DTOs. |
| `lllarik-api/internal/app/server.go` | Modify | Register `GET/POST /users`, `PATCH /users/:id` on `admin` group. |
| `lllarik-api/internal/app/user_admin_test.go` | Create | `httptest` coverage for happy path + error cases. |
| `lllarik-api/docs/API.md` | Modify | Document user admin endpoints. |
| `lllarik/src/lib/dashboardService.ts` | Modify | `useDashboardMe`, `useDashboardUsers`. |
| `lllarik/src/app/(app)/dashboard/layout.tsx` | Modify | `Users` nav item (admin only), breadcrumb label for `/dashboard/users`. |
| `lllarik/src/app/(app)/dashboard/users/page.tsx` | Create | Form + table UI. |
| `lllarik/src/app/(app)/dashboard/layout.sidebar.test.tsx` | Modify | Mock `useDashboardMe`, assert Users link when `role === "admin"`. |

---

### Task 1: Add SQLite driver for integration tests

**Files:**

- Modify: `lllarik-api/go.mod` (and `go.sum` via `go get`)

- [ ] **Step 1: Add the dependency**

Run from `lllarik-api/`:

```bash
go get github.com/glebarez/sqlite@v1.11.0
```

Expected: `go.mod` gains a `require github.com/glebarez/sqlite ...` line; `go.sum` updates.

- [ ] **Step 2: Commit**

```bash
git add go.mod go.sum
git commit -m "chore: add glebarez sqlite for api integration tests"
```

---

### Task 2: Implement user admin handlers

**Files:**

- Create: `lllarik-api/internal/app/user_admin.go`

- [ ] **Step 1: Create `user_admin.go`**

Use the following implementation (adjust imports if your IDE orders them differently):

```go
package app

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kiyaya/lllarik-api/internal/auth"
	"github.com/kiyaya/lllarik-api/internal/httpx"
	"github.com/kiyaya/lllarik-api/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type userPublic struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
}

func userToPublic(u models.User) userPublic {
	return userPublic{
		ID:        u.ID.String(),
		Email:     u.Email,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
	}
}

type createUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type patchUserRequest struct {
	IsActive *bool `json:"isActive"`
}

func (s *Server) listUsers(c *gin.Context) {
	var users []models.User
	if err := s.db.Order("email asc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query users"})
		return
	}
	items := make([]userPublic, 0, len(users))
	for _, u := range users {
		items = append(items, userToPublic(u))
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (s *Server) createAdminUser(c *gin.Context) {
	var req createUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := req.Password
	if email == "" || strings.TrimSpace(password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}
	if len(password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
		return
	}

	var existing int64
	if err := s.db.Model(&models.User{}).Where("email = ?", email).Count(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check email"})
		return
	}
	if existing > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := models.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hash),
		Role:         models.RoleAdmin,
		IsActive:     true,
	}
	if err := s.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, userToPublic(user))
}

func (s *Server) patchUserActive(c *gin.Context) {
	idStr := c.Param("id")
	targetID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req patchUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if req.IsActive == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "isActive is required"})
		return
	}

	claims, ok := httpx.GetClaims(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	actorID, err := uuid.Parse(claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user models.User
	if err := s.db.Where("id = ?", targetID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}

	newActive := *req.IsActive
	if !newActive && actorID == targetID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot deactivate yourself"})
		return
	}

	if !newActive && user.Role == models.RoleAdmin && user.IsActive {
		var otherActive int64
		if err := s.db.Model(&models.User{}).
			Where("role = ? AND is_active = ? AND id <> ?", models.RoleAdmin, true, targetID).
			Count(&otherActive).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate admin count"})
			return
		}
		if otherActive == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "cannot deactivate last admin"})
			return
		}
	}

	if err := s.db.Model(&user).Update("is_active", newActive).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
		return
	}
	user.IsActive = newActive

	c.JSON(http.StatusOK, userToPublic(user))
}
```

- [ ] **Step 2: Run `go build`**

```bash
cd lllarik-api && go build ./...
```

Expected: success (handlers not wired yet — build still passes).

- [ ] **Step 3: Commit**

```bash
git add internal/app/user_admin.go
git commit -m "feat(api): add admin user management handlers"
```

---

### Task 3: Wire routes on the admin group

**Files:**

- Modify: `lllarik-api/internal/app/server.go` (inside `routes()`, `admin` group)

- [ ] **Step 1: Register three routes**

In the `admin` group next to `admin.POST("/publish", s.publish)`, add:

```go
			admin.GET("/users", s.listUsers)
			admin.POST("/users", s.createAdminUser)
			admin.PATCH("/users/:id", s.patchUserActive)
```

Full block should look like:

```go
		admin := authed.Group("")
		admin.Use(httpx.RoleMiddleware(models.RoleAdmin))
		{
			admin.POST("/publish", s.publish)
			admin.GET("/users", s.listUsers)
			admin.POST("/users", s.createAdminUser)
			admin.PATCH("/users/:id", s.patchUserActive)
		}
```

- [ ] **Step 2: Verify build**

```bash
cd lllarik-api && go build ./...
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add internal/app/server.go
git commit -m "feat(api): register admin user routes"
```

---

### Task 4: Integration tests (`user_admin_test.go`)

**Files:**

- Create: `lllarik-api/internal/app/user_admin_test.go`

- [ ] **Step 1: Add the test file**

```go
package app

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/kiyaya/lllarik-api/internal/auth"
	"github.com/kiyaya/lllarik-api/internal/config"
	"github.com/kiyaya/lllarik-api/internal/db"
	"github.com/kiyaya/lllarik-api/internal/models"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
	gormdb "gorm.io/gorm"
)

func testDB(t *testing.T) *gormdb.DB {
	t.Helper()
	gdb, err := gormdb.Open(sqlite.Open("file::memory:?cache=shared"), &gormdb.Config{})
	require.NoError(t, err)
	require.NoError(t, db.Migrate(gdb))
	return gdb
}

func testRouter(t *testing.T, gdb *gormdb.DB) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	s := &Server{
		cfg: config.Config{
			JWTSecret:       "test-secret-key-for-jwt-testing-32b!",
			AccessTokenTTL:  15 * time.Minute,
			RefreshTokenTTL: 24 * time.Hour,
		},
		db:      gdb,
		storage: nil,
	}
	return s.routes()
}

func authHeader(t *testing.T, secret string, userID uuid.UUID, email, role string) string {
	t.Helper()
	tok, err := auth.GenerateAccessToken(secret, userID, email, role, time.Hour)
	require.NoError(t, err)
	return "Bearer " + tok
}

func seedUser(t *testing.T, gdb *gormdb.DB, email, role string, active bool) models.User {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte("any-pass-ok"), bcrypt.DefaultCost)
	require.NoError(t, err)
	u := models.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
		IsActive:     active,
	}
	require.NoError(t, gdb.Create(&u).Error)
	return u
}

func TestAdminUsers_listAndCreate(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	admin := seedUser(t, gdb, "admin@example.com", models.RoleAdmin, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", admin.ID, admin.Email, models.RoleAdmin)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
	req.Header.Set("Authorization", h)
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusOK, w.Code)

	w = httptest.NewRecorder()
	body := `{"email":"NEW@Example.com","password":"hello12345"}`
	req = httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)
	var created userPublic
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &created))
	require.Equal(t, "new@example.com", created.Email)
	require.Equal(t, models.RoleAdmin, created.Role)
	require.True(t, created.IsActive)
	require.NotContains(t, w.Body.String(), "password")
}

func TestAdminUsers_createDuplicateEmail(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	_ = seedUser(t, gdb, "exists@example.com", models.RoleAdmin, true)
	admin := seedUser(t, gdb, "admin@example.com", models.RoleAdmin, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", admin.ID, admin.Email, models.RoleAdmin)

	w := httptest.NewRecorder()
	body := `{"email":"exists@example.com","password":"hello12345"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusConflict, w.Code)
}

func TestAdminUsers_editorForbidden(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	editor := seedUser(t, gdb, "ed@example.com", models.RoleEditor, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", editor.ID, editor.Email, models.RoleEditor)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
	req.Header.Set("Authorization", h)
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusForbidden, w.Code)
}

func TestAdminUsers_patchSelfDeactivate(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	admin := seedUser(t, gdb, "admin@example.com", models.RoleAdmin, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", admin.ID, admin.Email, models.RoleAdmin)

	w := httptest.NewRecorder()
	body := `{"isActive":false}`
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/users/"+admin.ID.String(), bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAdminUsers_patchLastAdmin(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	sole := seedUser(t, gdb, "sole@example.com", models.RoleAdmin, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", sole.ID, sole.Email, models.RoleAdmin)

	w := httptest.NewRecorder()
	body := `{"isActive":false}`
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/users/"+sole.ID.String(), bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAdminUsers_patchForbiddenWhenNotAdmin(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	_ = seedUser(t, gdb, "admin@example.com", models.RoleAdmin, true)
	editor := seedUser(t, gdb, "ed@example.com", models.RoleEditor, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", editor.ID, editor.Email, models.RoleEditor)

	w := httptest.NewRecorder()
	body := `{"isActive":false}`
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/users/"+editor.ID.String(), bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusForbidden, w.Code)
}

func TestAdminUsers_patchDeactivateEditorOk(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	admin := seedUser(t, gdb, "admin@example.com", models.RoleAdmin, true)
	editor := seedUser(t, gdb, "ed@example.com", models.RoleEditor, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", admin.ID, admin.Email, models.RoleAdmin)

	w := httptest.NewRecorder()
	body := `{"isActive":false}`
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/users/"+editor.ID.String(), bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusOK, w.Code)
}
```

- [ ] **Step 2: Add testify if missing**

If `go test` complains about testify:

```bash
go get github.com/stretchr/testify@v1.11.1
```

- [ ] **Step 3: Run tests**

```bash
cd lllarik-api && go test ./internal/app/ -count=1 -v
```

Expected: all tests **PASS**.

- [ ] **Step 4: Commit**

```bash
git add internal/app/user_admin_test.go go.mod go.sum
git commit -m "test(api): cover admin user routes"
```

---

### Task 5: Update API reference

**Files:**

- Modify: `lllarik-api/docs/API.md`

- [ ] **Step 1: Add a “User administration (admin only)” section** after the Auth section documenting:

  - `GET /users` → `{ "items": [ { "id", "email", "role", "isActive", "createdAt" } ] }`
  - `POST /users` body `{ "email", "password" }` (password min 8 chars); `201` user object; `409` on duplicate email
  - `PATCH /users/:id` body `{ "isActive": boolean }`; errors: `400` self-deactivate, `400` last admin, `404` unknown id

- [ ] **Step 2: Commit**

```bash
git add docs/API.md
git commit -m "docs(api): document admin user endpoints"
```

---

### Task 6: Dashboard hooks (`useDashboardMe`, `useDashboardUsers`)

**Files:**

- Modify: `lllarik/src/lib/dashboardService.ts`

- [ ] **Step 1: Add types and hooks**

Append (or integrate) the following, matching existing `apiRequest` / `notifyApiError` patterns:

```ts
export type DashboardMe = {
  userId: string;
  email: string;
  role: string;
};

export type DashboardUserRow = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export function useDashboardMe() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard-me", accessToken],
    queryFn: () => apiRequest<DashboardMe>({ url: "/api/v1/auth/me" }),
    enabled: !!accessToken,
  });
}

export function useDashboardUsers() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["dashboard-users", accessToken],
    queryFn: () => apiRequest<{ items: DashboardUserRow[] }>({ url: "/api/v1/users" }),
    enabled: !!accessToken,
  });

  const createAdmin = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiRequest<DashboardUserRow>({
        url: "/api/v1/users",
        method: "POST",
        data: payload,
      }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
  });

  const setActive = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      apiRequest<DashboardUserRow>({
        url: `/api/v1/users/${payload.id}`,
        method: "PATCH",
        data: { isActive: payload.isActive },
      }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
  });

  return {
    users: usersQuery.data?.items ?? [],
    isLoading: usersQuery.isLoading,
    createAdmin,
    setActive,
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd lllarik && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dashboardService.ts
git commit -m "feat(dashboard): add me + users hooks"
```

---

### Task 7: Users page + layout gating

**Files:**

- Create: `lllarik/src/app/(app)/dashboard/users/page.tsx`
- Modify: `lllarik/src/app/(app)/dashboard/layout.tsx`

- [ ] **Step 1: Create `users/page.tsx`**

Client component with:

- `useDashboardMe()` — if `isLoading` show minimal loading; if `data?.role !== "admin"` show a short message and link back to `/dashboard/overview`
- `useDashboardUsers()` for list + mutations
- Card with form: email `Input`, password `Input` type password, submit calls `createAdmin.mutateAsync`
- Card with `Table`: columns Email, Role, Status (`Active` / `Inactive`), Action button `Deactivate` / `Activate` calling `setActive.mutateAsync`
- Disable activating/deactivating the row that matches `me.userId` when action would deactivate self (optional UX; API still enforces)

Match imports to sibling pages (`@/components/ui/*`, `@/lib/dashboardService`).

- [ ] **Step 2: Update `layout.tsx`**

- Import `Users` icon from `lucide-react` and `useDashboardMe` from `@/lib/dashboardService`.
- Extend `items` array with `{ href: "/dashboard/users", label: "Users", icon: Users, group: "secondary" }`.
- When rendering `itemsByGroup[group].map`, **filter out** the Users item unless `me.data?.role === "admin"` (handle `me.isLoading` by hiding Users until loaded to avoid flicker for editors).
- Extend breadcrumb label lookup: `items.find(...)?.label ?? (pathname === "/dashboard/users" ? "Users" : "Page")` or add static `breadcrumbTitles` map.

- [ ] **Step 3: Lint / typecheck**

```bash
cd lllarik && npx tsc --noEmit && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/dashboard/users/page.tsx src/app/\(app\)/dashboard/layout.tsx
git commit -m "feat(dashboard): admin users page and nav"
```

---

### Task 8: Sidebar regression test update

**Files:**

- Modify: `lllarik/src/app/(app)/dashboard/layout.sidebar.test.tsx`

- [ ] **Step 1: Extend `vi.mock("@/lib/dashboardService", ...)`** to export `useDashboardMe`:

```ts
vi.mock("@/lib/dashboardService", () => ({
  useDashboardLogout: () => ({
    mutate: mockLogoutMutate,
  }),
  useDashboardMe: () => ({
    data: { userId: "u1", email: "a@example.com", role: "admin" },
    isLoading: false,
  }),
}));
```

- [ ] **Step 2: Add assertion** after existing nav checks:

```ts
expect(scoped.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/dashboard/users");
```

- [ ] **Step 3: Run tests**

```bash
cd lllarik && npm test -- --run src/app/\(app\)/dashboard/layout.sidebar.test.tsx
```

Expected: **PASS**.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/dashboard/layout.sidebar.test.tsx
git commit -m "test(dashboard): assert Users nav for admin"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task(s) |
|------------------|---------|
| Admin-only routes on Gin admin group | Task 3 |
| GET list without secrets | Task 2 `userPublic` |
| POST admin only, bcrypt, email normalize, 8-char password, 409 duplicate | Task 2 |
| PATCH isActive, self + last-admin rules | Task 2 |
| Integration tests | Task 4 |
| API.md | Task 5 |
| `/dashboard/users`, admin-gated nav | Task 6–7 |
| **Placeholder scan** | No TBD/TODO in plan |

---

**Plan complete and saved to `lllarik/docs/superpowers/plans/2026-04-09-admin-user-management.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — run tasks in this session with batch checkpoints.

**Which approach do you want?**
