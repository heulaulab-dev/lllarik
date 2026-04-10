# Dashboard onboarding tour implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship server-persisted dashboard menu onboarding (full tour, “what’s new” mini-tour, skip, Settings replay) per [2026-04-10-dashboard-onboarding-tour-design.md](../specs/2026-04-10-dashboard-onboarding-tour-design.md).

**Architecture:** Store per-user `dashboardTourStepAcks` on `users` as JSON. Extend `GET /auth/me` and add `PATCH /me/dashboard-tour-acks` with max-merge. The Next app holds a versioned manifest (`lib/dashboardTour.ts`), computes pending steps vs acks and role, runs **react-joyride** in `dashboard/layout.tsx`, and PATCHes acks on Done/Skip. Settings sets `sessionStorage` to force a full applicable replay without wiping the server.

**Tech stack:** Go 1.25 + Gin + GORM + Postgres (SQLite in tests); Next.js 16 + React 19 + TanStack Query + react-joyride + Vitest + Testing Library.

---

## File map

| Area | Create | Modify |
|------|--------|--------|
| API | — | `internal/models/models.go`, `internal/app/server.go`, `docs/API.md`, `docs/FRONTEND-INTEGRATION.md` |
| API tests | `internal/app/dashboard_tour_test.go` (or extend `user_admin_test.go` patterns) | — |
| Web | `src/lib/dashboardTour.ts`, `src/lib/dashboardTour.test.ts`, `src/components/DashboardTourJoyride.tsx` (name flexible) | `src/lib/dashboardService.ts`, `src/app/(app)/dashboard/layout.tsx`, `src/app/(app)/dashboard/settings/page.tsx`, `package.json`, `layout.sidebar.test.tsx` |

---

## Part A — Backend (`lllarik-api`)

### Task A1: User model + migration

**Files:**

- Modify: `internal/models/models.go`
- Modify: `internal/db/db.go` (only if `AutoMigrate` list must change — it already includes `User`, so usually **no change** once `User` gains a field)

- [ ] **Step 1: Add JSON field on `User`**

Add a nullable JSON map column. GORM + Postgres use `jsonb`; tests use SQLite with JSON serialization.

```go
// On models.User — field name matches DB snake_case
DashboardTourStepAcks map[string]int `gorm:"type:jsonb;serializer:json" json:"-"`
```

If SQLite tests fail on `jsonb`, switch tag to:

```go
`gorm:"serializer:json" json:"-"`
```

and rely on dialect-specific defaults.

- [ ] **Step 2: Run migrate in dev**

```bash
cd /path/to/lllarik-api && go run ./cmd/api
```

Expected: startup runs `db.Migrate` without error; Postgres has new column (verify with `\d users` if needed).

- [ ] **Step 3: Commit (lllarik-api repo)**

```bash
git add internal/models/models.go
git commit -m "feat: store dashboard tour step acks on user"
```

---

### Task A2: Merge helper + PATCH handler + extend `me`

**Files:**

- Modify: `internal/app/server.go`

- [ ] **Step 1: Add pure merge function (same package, top of file or small internal helper)**

```go
func mergeTourAcks(existing map[string]int, incoming map[string]int) map[string]int {
	out := map[string]int{}
	for k, v := range existing {
		out[k] = v
	}
	if incoming == nil {
		return out
	}
	for k, v := range incoming {
		prev, ok := out[k]
		if !ok || v > prev {
			out[k] = v
		}
	}
	return out
}
```

- [ ] **Step 2: Register route** in `routes()` inside the `authed` group (same JWT middleware as `/auth/me`):

```go
authed.PATCH("/me/dashboard-tour-acks", s.patchDashboardTourAcks)
```

- [ ] **Step 3: Implement `patchDashboardTourAcks`**

Bind JSON `{"acks":{"stepId":1}}`. Load `models.User` by `claims.UserID`. Read `user.DashboardTourStepAcks` (nil → empty map). `merged := mergeTourAcks(existing, body.Acks)`. Save `DashboardTourStepAcks: merged`. Respond `200` with `{"dashboardTourStepAcks": merged}` (or full `me`-shaped object — **pick one and use consistently**; recommended: return only `dashboardTourStepAcks` to keep payload small).

- [ ] **Step 4: Extend `me`**

Change `Select` to include `dashboard_tour_step_acks` (or omit `Select` narrow list and explicitly add the new column — GORM column name is snake_case of field). Build JSON:

```go
acks := user.DashboardTourStepAcks
if acks == nil {
  acks = map[string]int{}
}
c.JSON(http.StatusOK, gin.H{
  "userId": user.ID.String(),
  "email":  user.Email,
  "name":   user.Name,
  "role":   user.Role,
  "dashboardTourStepAcks": acks,
})
```

- [ ] **Step 5: Commit**

```bash
git add internal/app/server.go
git commit -m "feat: PATCH dashboard tour acks and expose on auth me"
```

---

### Task A3: Tests (SQLite)

**Files:**

- Create: `internal/app/dashboard_tour_test.go`

- [ ] **Step 1: Test `mergeTourAcks`** (table-driven)

```go
func TestMergeTourAcks(t *testing.T) {
  cases := []struct {
    name     string
    existing map[string]int
    incoming map[string]int
    want     map[string]int
  }{
    {"nil existing", nil, map[string]int{"a": 2}, map[string]int{"a": 2}},
    {"no downgrade", map[string]int{"a": 3}, map[string]int{"a": 1}, map[string]int{"a": 3}},
    {"upgrade", map[string]int{"a": 1}, map[string]int{"a": 2}, map[string]int{"a": 2}},
    {"merge keys", map[string]int{"a": 1}, map[string]int{"b": 1}, map[string]int{"a": 1, "b": 1}},
  }
  // assert equality with testify require
}
```

- [ ] **Step 2: Integration test PATCH + GET me** using `testDB`, `testRouter`, `seedUser`, `authHeader` from `user_admin_test.go` patterns

1. `PATCH` with `{"acks":{"sidebar.workspace":1}}` → `200`, body contains `dashboardTourStepAcks.sidebar.workspace == 1`.
2. `GET /api/v1/auth/me` with same token → response includes `dashboardTourStepAcks` with that key.

- [ ] **Step 3: Run tests**

```bash
cd lllarik-api && go test ./internal/app/... -count=1 -v
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git commit -am "test: dashboard tour acks merge and endpoints"
```

---

### Task A4: API documentation

**Files:**

- Modify: `docs/API.md`
- Modify: `docs/FRONTEND-INTEGRATION.md`

- [ ] **Step 1: Document `GET /auth/me`** — add `dashboardTourStepAcks` object (string → int).

- [ ] **Step 2: Document `PATCH /me/dashboard-tour-acks`** — request body, merge semantics, response.

- [ ] **Step 3: Commit**

```bash
git commit -am "docs: dashboard tour acks API"
```

---

## Part B — Frontend (`lllarik`)

### Task B1: Dependency and types

**Files:**

- Modify: `package.json`
- Modify: `src/lib/dashboardService.ts`

- [ ] **Step 1: Install react-joyride**

```bash
cd lllarik && npm install react-joyride
```

- [ ] **Step 2: Extend `DashboardMe`**

```ts
export type DashboardMe = {
  userId: string;
  email: string;
  name: string;
  role: string;
  dashboardTourStepAcks?: Record<string, number>;
};
```

Normalize in query if needed: `dashboardTourStepAcks: data.dashboardTourStepAcks ?? {}`.

- [ ] **Step 3: Add mutation `usePatchDashboardTourAcks`**

```ts
export function usePatchDashboardTourAcks() {
  const queryClient = useQueryClient();
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  return useMutation({
    mutationFn: (acks: Record<string, number>) =>
      apiRequest<{ dashboardTourStepAcks: Record<string, number> }>({
        url: "/api/v1/me/dashboard-tour-acks",
        method: "PATCH",
        data: { acks },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["dashboard-me", accessToken], (prev: DashboardMe | undefined) =>
        prev ? { ...prev, dashboardTourStepAcks: data.dashboardTourStepAcks } : prev,
      );
    },
    onError: (e) => notifyApiError(normalizeApiError(e)),
  });
}
```

Adjust if API returns only `dashboardTourStepAcks` — types must match.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/dashboardService.ts
git commit -m "feat: API types and PATCH for dashboard tour acks"
```

---

### Task B2: Tour manifest + pure functions + unit tests

**Files:**

- Create: `src/lib/dashboardTour.ts`
- Create: `src/lib/dashboardTour.test.ts`

- [ ] **Step 1: Define step type and manifest**

```ts
export type TourRole = "admin" | "editor" | "viewer";

export type DashboardTourStep = {
  stepId: string;
  contentVersion: number;
  target: string; // [data-tour-id="..."]
  title: string;
  body: string;
  roles?: TourRole[]; // omit = all roles
};

export const DASHBOARD_TOUR_STEPS: DashboardTourStep[] = [
  // concrete entries: workspace, search, main nav, secondary nav, users (admin), account, sidebar trigger
];
```

Use **stable `data-tour-id` values** you will place in layout (e.g. `tour-workspace`, `tour-search`, `tour-nav-main`, `tour-nav-secondary`, `tour-users`, `tour-account`, `tour-sidebar-trigger`). Start `contentVersion` at `1` for each.

- [ ] **Step 2: Implement `filterStepsByRole` and `getPendingSteps`**

```ts
export function filterStepsByRole(steps: DashboardTourStep[], role: string): DashboardTourStep[] {
  return steps.filter((s) => {
    if (!s.roles?.length) return true;
    return s.roles.includes(role as TourRole);
  });
}

export function getPendingSteps(
  steps: DashboardTourStep[],
  acks: Record<string, number>,
  opts: { forceFullReplay: boolean },
): DashboardTourStep[] {
  const applicable = steps;
  if (opts.forceFullReplay) return applicable;
  return applicable.filter((s) => (acks[s.stepId] ?? 0) < s.contentVersion);
}
```

- [ ] **Step 3: Vitest tests**

Cover: non-admin excludes `roles: ['admin']` step; pending with empty acks returns all; pending with matching ack returns empty; `forceFullReplay` returns all applicable.

```bash
cd lllarik && npm test -- src/lib/dashboardTour.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dashboardTour.ts src/lib/dashboardTour.test.ts
git commit -m "feat: dashboard tour manifest and pending-step helpers"
```

---

### Task B3: Layout anchors (`data-tour-id`)

**Files:**

- Modify: `src/app/(app)/dashboard/layout.tsx`

- [ ] **Step 1: Add `data-tour-id` attributes** matching `DASHBOARD_TOUR_STEPS` `target` selectors:

Examples (adjust to your JSX):

- Workspace `<Link …>` wrapper: `data-tour-id="tour-workspace"`
- Search `<Input …>`: add `data-tour-id="tour-search"` (keep `data-testid` if present)
- First **Main** group: `SidebarGroupLabel` or container `data-tour-id="tour-nav-main"`
- **Secondary** group label or container: `data-tour-id="tour-nav-secondary"`
- **Users** `SidebarMenuButton` or `SidebarMenuItem`: `data-tour-id="tour-users"` (only rendered for admin — Joyride must not reference a missing step for non-admin; manifest already omits or filters Users step)
- Account footer div: `data-tour-id="tour-account"`
- Top `SidebarTrigger` wrapper: `data-tour-id="tour-sidebar-trigger"`

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: data-tour-id anchors for dashboard tour"
```

---

### Task B4: Joyride wrapper + layout wiring

**Files:**

- Create: `src/components/DashboardTourJoyride.tsx` (or `dashboard/DashboardTour.tsx`)
- Modify: `src/app/(app)/dashboard/layout.tsx`

- [ ] **Step 1: Implement client component** that:

1. Accepts `steps: Step[]` for react-joyride (`target` as `[data-tour-id="x"]`).
2. Uses `run` state; starts `true` when `steps.length > 0` and `me` loaded.
3. On **Skip** or **last step complete**: build ack map `{ [stepId]: contentVersion }` for **every step in the current run**, call `usePatchDashboardTourAcks().mutateAsync`.
4. Reads `sessionStorage` key e.g. `lllarik:dashboard:force-tour` — if `"1"`, pass `forceFullReplay: true` into `getPendingSteps`, then remove key when the tour **starts** or after ack (choose one; removing after start avoids double-run on Strict Mode remount — document in code comment).
5. `prefers-reduced-motion`: pass `disableScrolling` / `spotlightPadding` / Joyride `styles` options per library docs to reduce motion.

Example callback shape (verify against installed `react-joyride` types):

```tsx
import Joyride, { type CallBackProps, STATUS } from "react-joyride";

function onCallback(data: CallBackProps) {
  const { status } = data;
  if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
    // patch acks for stepsRun
  }
}
```

- [ ] **Step 2: Render `<DashboardTourJoyride />` inside `DashboardAppLayout`** after `me` is available (`!meLoading && me`).

Pass `acks={me.dashboardTourStepAcks ?? {}}`, `role={me.role}`.

- [ ] **Step 3: Manual smoke**

```bash
npm run dev
```

Log in, empty DB acks → tour runs. Skip → no immediate repeat after refresh (acks saved).

- [ ] **Step 4: Commit**

```bash
git add src/components/DashboardTourJoyride.tsx src/app/\(app\)/dashboard/layout.tsx
git commit -m "feat: Joyride dashboard tour and layout integration"
```

---

### Task B5: Settings — replay

**Files:**

- Modify: `src/app/(app)/dashboard/settings/page.tsx`

- [ ] **Step 1: Add card section** “Dashboard tour” with text: explains replay; button **Replay tour** sets `sessionStorage.setItem('lllarik:dashboard:force-tour','1')` and `router.push('/dashboard/overview')` (use `useRouter` from `next/navigation`).

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: replay dashboard tour from settings"
```

---

### Task B6: Tests — layout + mocks

**Files:**

- Modify: `src/app/(app)/dashboard/layout.sidebar.test.tsx`

- [ ] **Step 1: Mock `usePatchDashboardTourAcks`** if Joyride renders in tests (or mock `DashboardTourJoyride` as `null` for sidebar regression test to stay focused).

- [ ] **Step 2: Extend mock `useDashboardMe`** to include `dashboardTourStepAcks: {}`.

- [ ] **Step 3: Run**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git commit -am "test: adjust dashboard layout tests for tour mocks"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| JSON column on user | A1 |
| max-merge PATCH | A2, A3 |
| `dashboardTourStepAcks` on `me` | A2, A3, B1 |
| Manifest + versions + roles | B2 |
| First-time full / mini on bump | B2 `getPendingSteps` |
| Skip/Done PATCH all shown steps | B4 |
| Replay via Settings + `forceTour` | B4, B5 |
| `data-tour-id` anchors | B3 |
| PATCH error toast | B1 mutation `onError` |
| Docs | A4 |

**Placeholder scan:** None intentional — all file paths and behaviors are concrete.

**Cross-repo:** Deploy or run API before manual E2E of PATCH; frontend points at `NEXT_PUBLIC_CONTENT_API_URL`.

---

## Execution handoff

Plan complete and saved to `lllarik/docs/superpowers/plans/2026-04-10-dashboard-onboarding-tour-implementation.md`. Two execution options:

**1. Subagent-driven (recommended)** — Dispatch a fresh subagent per task; review between tasks.

**2. Inline execution** — Run tasks in this session with checkpoints between parts (API first, then web).

Which approach do you want?
