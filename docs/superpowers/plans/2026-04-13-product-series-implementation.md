# Product Series (Dashboard + Landing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship first-class **Series** with versioned drafts/publish, **products** scoped under a series, **nested public API** for a series-first landing, and **dashboard** series list → detail + updated releases/publish behavior per `docs/superpowers/specs/2026-04-13-product-series-design.md`.

**Architecture:** Mirror existing **Product + ProductVersion** patterns for **Series + SeriesVersion** in `lllarik-api` (Gin handlers in `internal/app/server.go`, models in `internal/models/models.go`, `db.Migrate`). Extend **publish** to promote series drafts and **reject** publish when any **draft product** has `series_id` null. Replace flat `products` in `GET /api/v1/public/content` with **`series`** arrays containing embedded published children. In `lllarik`, extend **dashboardService**, add **series routes/pages**, refactor **ProductShowcase** + **getLandingContent** for nested data.

**Tech Stack:** Go 1.x, Gin, GORM, SQLite (tests) / Postgres (prod), Next.js 16 App Router, TanStack Query, Vitest, TypeScript.

---

## File map (create / modify)

| Path | Responsibility |
| ---- | ---------------- |
| `lllarik-api/internal/models/models.go` | `Series`, `SeriesVersion`; `Product.SeriesID` |
| `lllarik-api/internal/db/db.go` | `AutoMigrate` new models |
| `lllarik-api/internal/app/server.go` | Routes, handlers: series CRUD draft, unpublish cascade, listProducts filter, createProduct `seriesId`, publish, `publicContent` |
| `lllarik-api/internal/app/*_test.go` | New tests + update existing product tests for `seriesId` |
| `lllarik-api/docs/API.md` | Document new endpoints and `public/content` shape |
| `lllarik/src/lib/dashboardService.ts` | Types, `normalizeProduct` + `seriesId`, hooks: `useDashboardSeries`, mutations, query keys |
| `lllarik/src/app/(app)/(protected)/dashboard/layout.tsx` | Nav: Series (replace or precede Products link—plan: **Series** primary at `/dashboard/series`, keep Products as optional or redirect) |
| `lllarik/src/app/(app)/(protected)/dashboard/series/page.tsx` | Series list (new) |
| `lllarik/src/app/(app)/(protected)/dashboard/series/[id]/page.tsx` | Series detail: draft form + products table + add product (new) |
| `lllarik/src/app/(app)/(protected)/dashboard/products/page.tsx` | Require `seriesId` query param or remove standalone create (plan: **remove standalone**; creation only from series detail) |
| `lllarik/src/lib/landingContent.ts` | Types `LandingSeries`, `LandingProduct`; map `data.series`; lookbook derivation from **flattened child products** or series heroes (spec: derive from children for lookbook—keep mapping children to spreads) |
| `lllarik/src/components/ProductShowcase.tsx` | Series grid, series dialog, child → existing modal |
| `lllarik/src/lib/landingContent.test.ts` | Fixture with `series` key |
| `lllarik/src/components/ProductShowcase.test.tsx` | Series + child open behavior |

---

### Task 1: Add `Series`, `SeriesVersion`, and `Product.SeriesID` models + migration

**Files:**

- Modify: `lllarik-api/internal/models/models.go`
- Modify: `lllarik-api/internal/db/db.go`

- [ ] **Step 1: Append models** — Add after `Product` struct (keep `Product` fields; add `SeriesID`):

```go
type Series struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Slug      string    `gorm:"uniqueIndex;not null"`
	SortOrder int       `gorm:"not null;default:0"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type SeriesVersion struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	SeriesID  uuid.UUID `gorm:"type:uuid;index;not null"`
	VersionNo int       `gorm:"not null"`
	State     string    `gorm:"index;not null"`

	Name     string `gorm:"not null"`
	Category string
	Material string
	Story    string
	Tags     []string `gorm:"serializer:json"`
	Images   []string `gorm:"serializer:json"`
	ImageURL string

	CreatedBy uuid.UUID `gorm:"type:uuid;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (s *Series) BeforeCreate(_ *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (sv *SeriesVersion) BeforeCreate(_ *gorm.DB) error {
	if sv.ID == uuid.Nil {
		sv.ID = uuid.New()
	}
	return nil
}
```

Change `Product` to:

```go
type Product struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey"`
	Slug      string     `gorm:"uniqueIndex;not null"`
	SortOrder int        `gorm:"not null;default:0"`
	SeriesID  *uuid.UUID `gorm:"type:uuid;index"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

- [ ] **Step 2: Register migration** — In `db.go` `Migrate`, add `&models.Series{}`, `&models.SeriesVersion{}` **before** `Product` if you rely on FK order (GORM AutoMigrate order: put `Series` before `Product`).

```go
return gdb.AutoMigrate(
	&models.User{},
	&models.RefreshSession{},
	&models.Series{},
	&models.SeriesVersion{},
	&models.Product{},
	&models.ProductVersion{},
	// ... rest unchanged
)
```

- [ ] **Step 3: Compile**

Run:

```bash
cd /home/kiyaya/kiyadev/lllarik-app/lllarik-api && go build -o /dev/null ./...
```

Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
cd /home/kiyaya/kiyadev/lllarik-app/lllarik-api && git add internal/models/models.go internal/db/db.go && git commit -m "feat(api): add Series, SeriesVersion, Product.SeriesID models"
```

(`lllarik-api` is a **separate** git repository from `lllarik`; commit API changes inside `lllarik-api`.)

---

### Task 2: Series draft create/update + `GET /content/series` + routes

**Files:**

- Modify: `lllarik-api/internal/app/server.go`
- Create: `lllarik-api/internal/app/series_draft_test.go`

- [ ] **Step 1: Add `seriesInput` and helpers** — In `server.go`, next to `productInput`:

```go
type seriesInput struct {
	Slug      string   `json:"slug"`
	SortOrder int      `json:"sortOrder"`
	Name      string   `json:"name"`
	Category  string   `json:"category"`
	Material  string   `json:"material"`
	Story     string   `json:"story"`
	Tags      []string `json:"tags"`
	Images    []string `json:"images"`
	ImageURL  string   `json:"imageUrl"`
}

func resolveSeriesImages(in seriesInput) ([]string, string) {
	if len(in.Images) > 0 {
		return in.Images, in.Images[0]
	}
	return nil, in.ImageURL
}
```

- [ ] **Step 2: Implement `createSeriesDraft`** — Copy the control flow from `createProductDraft` (`server.go` ~380–416): validate `slug` and `name`; create `models.Series{Slug, SortOrder}`; create `models.SeriesVersion` with `State: models.StateDraft`, `VersionNo: 1`, `CreatedBy: userID`; return `{"seriesId": ..., "versionId": ...}` with HTTP 201. On DB unique violation, return 400 with `gin.H{"error": err.Error()}` like products.

- [ ] **Step 3: Implement `updateSeriesDraft`** — Copy `updateProductDraft` (`server.go` ~418–484): parse `:id` as series UUID; load `Series`; update `Slug`/`SortOrder` if provided; find draft `SeriesVersion` for `series_id` + `state = draft`; if found, update fields; else create new draft with `VersionNo: latest.VersionNo+1`.

- [ ] **Step 4: Implement `listSeries`** — Return `{"items": [...]}` where each item includes at minimum: `seriesId`, `slug`, `sortOrder`, `draft` (nested object or null: name, state, version id), `published` (nested or null), `productCount` (int: `COUNT(*)` from `products` where `series_id = series.id` and `deleted_at` IS NULL). Use one or two SQL queries; avoid N+1 in hot path.

- [ ] **Step 5: Register routes** under `editor` group (same as products):

```go
editor.POST("/content/series", s.createSeriesDraft)
editor.PUT("/content/series/:id/draft", s.updateSeriesDraft)
editor.DELETE("/content/series/:id", s.deleteSeries)
authed.GET("/content/series", s.listSeries) // viewer can list; keep with authed only
```

Implement `deleteSeries` by mirroring `deleteProduct`: soft-delete `Series` row by id (`s.db.Delete(&models.Series{}, "id = ?", id)`).

- [ ] **Step 6: Write test** — New file `series_draft_test.go`:

```go
package app

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kiyaya/lllarik-api/internal/models"
	"github.com/stretchr/testify/require"
)

func TestSeriesDraft_CreateAndUpdate(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	editor := seedUser(t, gdb, "series-editor@example.com", models.RoleEditor, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", editor.ID, editor.Email, models.RoleEditor)

	body := `{"slug":"vol-01","sortOrder":1,"name":"Vol 01","category":"Collection","story":"s","tags":["a"],"images":["https://cdn.example/h.jpg"]}`
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/content/series", bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)

	var ser models.Series
	require.NoError(t, gdb.Where("slug = ?", "vol-01").First(&ser).Error)

	up := `{"name":"Vol 01","slug":"vol-01","sortOrder":1,"story":"updated","tags":["a"],"images":["https://cdn.example/h.jpg"]}`
	w2 := httptest.NewRecorder()
	req2 := httptest.NewRequest(http.MethodPut, "/api/v1/content/series/"+ser.ID.String()+"/draft", bytes.NewReader([]byte(up)))
	req2.Header.Set("Authorization", h)
	req2.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w2, req2)
	require.Equal(t, http.StatusOK, w2.Code)
}
```

- [ ] **Step 7: Run tests**

```bash
cd /home/kiyaya/kiyadev/lllarik-app/lllarik-api && go test ./internal/app/ -run TestSeriesDraft -count=1 -v
```

Expected: PASS.

- [ ] **Step 8: Commit** — `feat(api): series draft CRUD and list`

---

### Task 3: Product create requires `seriesId`; `GET /content/products?seriesId=`

**Files:**

- Modify: `lllarik-api/internal/app/server.go`
- Modify: `lllarik-api/internal/app/product_draft_test.go`

- [ ] **Step 1: Extend `productInput`** with `SeriesID string \`json:"seriesId"\``

- [ ] **Step 2: In `createProductDraft`**, after binding JSON: parse `seriesID := uuid.Parse(in.SeriesID)`; if invalid or `in.SeriesID == ""`, respond `400` `{"error":"seriesId is required"}`. Verify series exists: `gdb.First(&models.Series{}, "id = ?", seriesID)`; if not found, `400`. Set `product := models.Product{Slug: in.Slug, SortOrder: in.SortOrder, SeriesID: &seriesID}`.

- [ ] **Step 3: In `updateProductDraft`**, reject changing `series_id`: if incoming JSON includes `seriesId` different from stored `product.SeriesID` (compare stringified UUIDs), return `400` `{"error":"seriesId cannot be changed"}`. Omit `seriesId` from update payload on client after create.

- [ ] **Step 4: Extend `listProducts`** — Replace simple `Find` with:

```go
state := c.DefaultQuery("state", models.StatePublished)
q := s.db.Model(&models.ProductVersion{}).
	Joins("JOIN products ON products.id = product_versions.product_id AND products.deleted_at IS NULL").
	Where("product_versions.state = ?", state)
if sid := strings.TrimSpace(c.Query("seriesId")); sid != "" {
	id, err := uuid.Parse(sid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid seriesId"})
		return
	}
	q = q.Where("products.series_id = ?", id)
}
var versions []models.ProductVersion
if err := q.Order("product_versions.updated_at desc").Find(&versions).Error; err != nil {
	c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list products"})
	return
}
c.JSON(http.StatusOK, gin.H{"items": versions})
```

- [ ] **Step 5: Update every `POST /content/products` test** in `product_draft_test.go` to first create a series via `POST /content/series`, parse `seriesId` from response body (add helper to decode JSON), then add `"seriesId":"<uuid>"` to product create JSON. Without this, tests fail.

- [ ] **Step 6: Add test** `TestProductDraft_CreateRejectsMissingSeriesId` — POST product without `seriesId` → expect 400.

- [ ] **Step 7: Run**

```bash
cd /home/kiyaya/kiyadev/lllarik-app/lllarik-api && go test ./internal/app/ -count=1
```

Expected: all PASS.

- [ ] **Step 8: Commit** — `feat(api): require seriesId on product create and filter list`

---

### Task 4: Publish promotes series drafts; 409 if draft product missing `series_id`

**Files:**

- Modify: `lllarik-api/internal/app/server.go`

- [ ] **Step 1: Pre-flight inside `publish`** (start of transaction or just before): load all `ProductVersion` where `state = draft`; join `products`; where `products.series_id IS NULL`, collect `product` IDs; if len > 0, respond:

```go
c.JSON(http.StatusConflict, gin.H{
	"error":   "incomplete catalog",
	"productIds": idsAsStrings,
})
return
```

- [ ] **Step 2: In the same transaction**, before the product loop, loop all `SeriesVersion` with `state = draft` (same pattern as products: `Find` drafts). For each draft: archive current published version for that `series_id` (`WHERE series_id = ? AND state = published` → `archived`); set draft to `published`; `Create(&models.ReleaseItem{ReleaseID: release.ID, ItemType: "series_version", ItemID: draft.ID})`.

- [ ] **Step 3: Integration test** — Create product draft with `series_id` null (insert `Product` + `ProductVersion` manually in test DB **without** using API if API forbids—use raw GORM create with `SeriesID: nil`), then `POST /publish` as admin → expect 409 and body contains `productIds`.

- [ ] **Step 4: Happy-path test** — Series draft + product draft with valid `seriesId`; publish; assert series version published and product version published.

- [ ] **Step 5: Run** `go test ./internal/app/ -count=1`

- [ ] **Step 6: Commit** — `feat(api): publish series drafts and block orphan product drafts`

---

### Task 5: `POST /content/series/:id/unpublish` cascade

**Files:**

- Modify: `lllarik-api/internal/app/server.go`
- Modify: `lllarik-api/internal/app/series_draft_test.go` (or new test)

- [ ] **Step 1: Handler** — Parse series ID; in `Transaction`: find latest `SeriesVersion` with `state = published` for that series → set `archived`. Find all `Product` with `series_id = seriesID`; for each product, find latest `ProductVersion` with `state = published` → set `archived`. Return 200 `{"ok":true}`. If no published series version, 404.

- [ ] **Step 2: Route** (editor group): `editor.POST("/content/series/:id/unpublish", s.unpublishSeries)`

- [ ] **Step 3: Test** — Publish series + products; call unpublish; `publicContent` should omit series (no published children).

- [ ] **Step 4: Commit** — `feat(api): cascade unpublish series`

---

### Task 6: `GET /public/content` nested `series` payload

**Files:**

- Modify: `lllarik-api/internal/app/server.go` (`publicContent`)
- Modify: `lllarik-api/internal/app/*_test.go`

- [ ] **Step 1: Replace flat published products response** — Build `seriesOut []gin.H`: for each `Series` (not deleted), load latest **published** `SeriesVersion`. Load all `Product` where `series_id = series.ID`. For each product, load latest **published** `ProductVersion`. Sort products by `product.SortOrder`, then `version.Name`. If len(products)==0, **skip** series. Map each version to JSON keys matching current landing expectations: `name`, `category`, `material`, `story`, `tags`, `image_url` (lowercase snake for Go default JSON—**match existing** `publicContent` which currently returns GORM structs; check actual JSON keys from `ProductVersion`—Go uses `ImageURL` as `ImageURL` in JSON unless `json` tags exist). Add explicit `json` struct tags on response DTOs if needed so frontend sees `imageUrl` **or** update frontend to accept both (landing already checks `image_url`, `ImageURL`, `image`).

- [ ] **Step 2: Response shape**

```go
c.JSON(http.StatusOK, gin.H{
	"series": seriesOut,
	"copy":   copyPayload,
})
```

Remove top-level `"products"` key (breaking change; only consumer is `lllarik`—update in Task 8).

- [ ] **Step 3: Test** — After publish, GET `/api/v1/public/content` without auth; assert `series` array length, nested `products` length, first product has `name`.

- [ ] **Step 4: Update `lllarik-api/docs/API.md`** with example JSON.

- [ ] **Step 5: Commit** — `feat(api): public content returns nested series`

---

### Task 7: Dashboard service — series hooks and product `seriesId`

**Files:**

- Modify: `lllarik/src/lib/dashboardService.ts`

- [ ] **Step 1: Add types**

```ts
export type DashboardSeriesListItem = {
  seriesId: string;
  slug: string;
  sortOrder: number;
  productCount: number;
  draft: { name: string; versionId: string } | null;
  published: { name: string; versionId: string } | null;
};
```

(Adjust fields to match actual Go JSON response from `listSeries`.)

- [ ] **Step 2: Add `useDashboardSeriesList`** — `useQuery` → `GET /api/v1/content/series`, map items.

- [ ] **Step 3: Add `useSeriesDraftMutations`** — `createSeries`, `updateSeries` mirroring products.

- [ ] **Step 4: Extend `DashboardProduct`** with `seriesId?: string`; extend `normalizeProduct` to read `seriesId` / `SeriesID` from joined responses if API adds them to list responses. If list API does not embed `series_id`, add it in Go `listProducts` by selecting join columns into a DTO—**plan requires** list responses for dashboard to show context: add `seriesId` to each item in JSON from backend `listProducts` (small `server.go` change: use a slice of struct with embedded `ProductVersion` + `SeriesID uuid.UUID`).

- [ ] **Step 5: `createProduct` mutation** — send `seriesId` in POST body from series detail page.

- [ ] **Step 6: `publish` onSuccess** — also invalidate `["dashboard-series"]` query key.

- [ ] **Step 7: Add `unpublishSeries` mutation** — `POST /api/v1/content/series/:id/unpublish`.

- [ ] **Step 8: Run** `cd lllarik && npm run lint`

- [ ] **Step 9: Commit** — `feat(dashboard): series API client hooks`

---

### Task 8: Dashboard UI — series list and series detail pages

**Files:**

- Create: `lllarik/src/app/(app)/(protected)/dashboard/series/page.tsx`
- Create: `lllarik/src/app/(app)/(protected)/dashboard/series/[id]/page.tsx`
- Modify: `lllarik/src/app/(app)/(protected)/dashboard/layout.tsx`
- Modify: `lllarik/src/app/(app)/(protected)/dashboard/products/page.tsx` (redirect or minimal stub)

- [ ] **Step 1: Nav** — Add `{ href: "/dashboard/series", label: "Series", icon: Boxes }` and remove or repoint old Products link to `/dashboard/series` (spec: series-first). If you keep `/dashboard/products`, make it redirect: `redirect("/dashboard/series")` in `products/page.tsx`.

- [ ] **Step 2: `series/page.tsx`** — Table: slug, name (from draft or published), product count, link to `/dashboard/series/[id]`, button “New series” → inline form or navigate to new route `/dashboard/series/new` (simplest: **modal** or dedicated `new` page—pick one; `new` page duplicates create form without id).

- [ ] **Step 3: `series/[id]/page.tsx`** — Load series by id from list query or `GET` detail if you add one; reuse field layout from `products/page.tsx` for **series** draft (name, slug, sortOrder, category, material, story, tags, multi-image upload calling same presign route). Below: table of products from `GET /api/v1/content/products?state=draft&seriesId=` + published optional; “Add product” sets local state to open product form with `seriesId` fixed; submit calls `createProduct` with payload including `seriesId`.

- [ ] **Step 4: Extract shared upload/tag helpers** from `products/page.tsx` into `lllarik/src/app/(app)/(protected)/dashboard/products/product-form-utils.ts` **only if** needed to avoid duplication; otherwise duplicate minimally for speed (YAGNI).

- [ ] **Step 5: Run** `npm test -- --run src/app/(app)/(protected)/dashboard/products/page.test.tsx` and add `series/page.test.tsx` smoke test if time.

- [ ] **Step 6: Commit** — `feat(dashboard): series list and detail with scoped products`

---

### Task 9: Releases page — show `series_version` release items

**Files:**

- Modify: `lllarik/src/app/(app)/(protected)/dashboard/releases/page.tsx`
- Modify: `lllarik-api` if release list API does not expose item types—check `listReleases` and whether release **items** are loaded; today may only list releases metadata. If items not exposed, **MVP:** skip UI column until API returns `items` on `GET /releases/:id`—spec asks to show types: extend backend `GET /releases` to include aggregated counts or extend admin UI only when data exists. **Minimum:** document in API; optional task: `GET /releases/:id/items` new endpoint. **Pragmatic MVP in plan:** add `ReleaseItem` query in Go on existing list (could be heavy); **prefer** new endpoint `GET /api/v1/releases/:id/items` returning `{items:[{itemType, itemId}]}`. Implement small handler + test; dashboard releases expand row to fetch items.

If scope creep: **defer** to follow-up and mark spec section “Releases page” as partial—**include one step** in Task 9:

- [ ] **Step 1: Backend** `GET /api/v1/releases/:id/items` — return release items with `itemType` and `itemId` (strings).

- [ ] **Step 2: Frontend** — In releases table, show badge column “Contains series” if any item has `itemType === "series_version"`.

- [ ] **Step 3: Commit** — `feat: release items listing for series and products`

---

### Task 10: Landing — types, `getLandingContent`, `ProductShowcase`

**Files:**

- Modify: `lllarik/src/lib/landingContent.ts`
- Modify: `lllarik/src/lib/landingContent.test.ts`
- Modify: `lllarik/src/components/ProductShowcase.tsx`
- Modify: `lllarik/src/components/ProductShowcase.test.tsx`

- [ ] **Step 1: Types**

```ts
export type LandingSeries = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  image: string;
  products: LandingProduct[];
};
```

Extend `LandingContent`: `products: LandingProduct[]` becomes **`series: LandingSeries[]`** for runtime API-driven content; keep `products` as **derived** getter or replace usages: `LandingSections` passes `series` to `ProductShowcase`.

- [ ] **Step 2: Map API** in `getLandingContent` — Read `data.series` array; for each series map `image` from primary image field; map nested `products` with existing per-product mapper used today for flat list.

- [ ] **Step 3: Lookbook** — Build `lookbookSpreads` from **all child products across series** (flatten, preserve order: series sort then product sort) so lookbook still has tiles.

- [ ] **Step 4: `ProductShowcase`** — Props: `series: LandingSeries[]`. Grid iterates `series`; card shows series `image`/`name`/`story`. On click, open **first dialog** with series story + grid of children; child click opens **existing** `ProductModal` (extract current modal to accept `LandingProduct`).

- [ ] **Step 5: Tests** — `landingContent.test.ts`: mock fetch returns `{ series: [{ ... products: [...] }] }`; assert mapped length. `ProductShowcase.test.tsx`: render one series with two products; click series then child; assert modal shows child name.

- [ ] **Step 6: Run** `npm test -- --run`

- [ ] **Step 7: Commit** — `feat(landing): series-first showcase and nested public content`

---

### Task 11: Docs and manual QA

- [ ] **Step 1: Update `lllarik-api/docs/FRONTEND-INTEGRATION.md`** — `public/content` shape, required `seriesId` on product create.

- [ ] **Step 2: Manual QA checklist** — Create series → add two products → publish → open landing (with `CONTENT_API_URL` set) → see series → open → see children → open child modal.

- [ ] **Step 3: Commit** — `docs: product series integration notes`

---

## Plan self-review (spec coverage)

| Spec section | Task(s) |
| ------------ | ------- |
| Series + SeriesVersion model | Task 1 |
| Product.series_id, create requires series | Task 1, 3 |
| Series CRUD draft, list, delete | Task 2 |
| Publish series + 409 orphan drafts | Task 4 |
| Unpublish cascade | Task 5 |
| Public nested series, omit empty | Task 6 |
| Dashboard series list + detail | Task 7, 8 |
| Releases / item types | Task 9 (MVP + optional endpoint) |
| Landing series grid + modal + child modal | Task 10 |
| Migration / rollout | Task 1–6 (AutoMigrate); ops backfill documented in Task 11 |

**Placeholder scan:** None intentional; Task 9 acknowledges optional endpoint—engineer must implement either endpoint + UI or explicitly defer with spec note.

**Type consistency:** `seriesId` JSON on wire matches `SeriesID` in Go struct tags (`json:"seriesId"` on `productInput`); list responses must expose `seriesId` string for dashboard tables.

---

## Execution handoff

Plan complete and saved to `lllarik/docs/superpowers/plans/2026-04-13-product-series-implementation.md`.

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration. **Required sub-skill:** superpowers:subagent-driven-development.

**2. Inline execution** — Run tasks in this session with checkpoints. **Required sub-skill:** superpowers:executing-plans.

Which approach do you want?
