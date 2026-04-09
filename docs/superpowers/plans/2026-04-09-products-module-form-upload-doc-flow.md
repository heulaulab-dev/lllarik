# Products Module Form Upload and Documentation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the products module to support badge-based metadata UX, multi-image upload with preview and primary selection, and complete admin/developer product flow documentation.

**Architecture:** Keep the existing draft-product endpoints and page structure, add a backward-compatible `images` list to the API/frontend contracts, and preserve `imageUrl` as primary-image compatibility output. Implement upload in the dashboard form via existing presign endpoint (`/api/v1/storage/presign-upload`) and direct browser `PUT` uploads. Deliver docs in two tracks: admin operational flow and developer markdown API/flow details.

**Tech Stack:** Next.js App Router, React 19, TanStack Query, shadcn/ui (`Badge`, `Card`, `Table`, `Button`, `Input`), Vitest; Go 1.25+, Gin, GORM, testify, SQLite integration tests.

---

## File map

| File | Action | Responsibility |
|------|--------|----------------|
| `lllarik-api/internal/models/models.go` | Modify | Add `Images []string` to `ProductVersion` persistence model. |
| `lllarik-api/internal/app/server.go` | Modify | Accept `images` in product input; map `images[0]` to `imageUrl` compatibility field. |
| `lllarik-api/internal/app/product_draft_test.go` | Create | Integration tests for create/update/list compatibility with `images` and legacy `imageUrl`. |
| `lllarik-api/docs/API.md` | Modify | Document `images[]` contract + compatibility behavior. |
| `lllarik-api/docs/FRONTEND-INTEGRATION.md` | Modify | Document direct upload + ordered images + primary mapping. |
| `lllarik/src/lib/dashboardService.ts` | Modify | Extend `DashboardProduct` type with `images`; add upload helper API type(s). |
| `lllarik/src/app/(app)/dashboard/products/page.tsx` | Modify | Replace image URL input with uploader + preview + badge-driven tags/status/category/material UX. |
| `lllarik/src/app/(app)/dashboard/products/page.test.tsx` | Create | UI behavior tests (tags, image list transitions, submit disabling during upload). |
| `lllarik/docs/superpowers/specs/2026-04-09-products-form-upload-flow-design.md` | Existing | Design source of truth (already approved). |
| `lllarik/docs/superpowers/specs/2026-04-09-products-admin-flow.md` | Create | Admin-facing product flow guide (markdown). |
| `lllarik/docs/superpowers/specs/2026-04-09-products-dev-flow.md` | Create | Developer-facing markdown flow and regression checklist. |

---

### Task 1: Add backend model/input compatibility for `images[]`

**Files:**
- Modify: `lllarik-api/internal/models/models.go`
- Modify: `lllarik-api/internal/app/server.go`

- [ ] **Step 1: Write failing API test for payload parsing and primary mapping**

Create `lllarik-api/internal/app/product_draft_test.go` with initial failing test:

```go
func TestProductDraft_CreateAcceptsImagesAndSetsPrimaryImageURL(t *testing.T) {
	gdb := testDB(t)
	r := testRouter(t, gdb)
	editor := seedUser(t, gdb, "editor@example.com", models.RoleEditor, true)
	h := authHeader(t, "test-secret-key-for-jwt-testing-32b!", editor.ID, editor.Email, models.RoleEditor)

	body := `{
		"slug":"solen",
		"name":"Solen",
		"category":"Pendant",
		"material":"Brass",
		"story":"test",
		"tags":["warm","minimal"],
		"images":["https://cdn.example/1.jpg","https://cdn.example/2.jpg"]
	}`

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/content/products", bytes.NewReader([]byte(body)))
	req.Header.Set("Authorization", h)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)

	var version models.ProductVersion
	require.NoError(t, gdb.Order("created_at desc").First(&version).Error)
	require.Equal(t, []string{"https://cdn.example/1.jpg", "https://cdn.example/2.jpg"}, version.Images)
	require.Equal(t, "https://cdn.example/1.jpg", version.ImageURL)
}
```

- [ ] **Step 2: Run test to confirm failure**

Run:

```bash
cd lllarik-api && go test ./internal/app -run TestProductDraft_CreateAcceptsImagesAndSetsPrimaryImageURL -count=1 -v
```

Expected: FAIL (`unknown field images` / missing `Images` model field).

- [ ] **Step 3: Implement minimal backend support**

Update `models.go`:

```go
type ProductVersion struct {
	// ...
	Tags     []string `gorm:"serializer:json"`
	Images   []string `gorm:"serializer:json"`
	ImageURL string
	// ...
}
```

Update `server.go` input + mapping:

```go
type productInput struct {
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

func resolvePrimaryImage(in productInput) (images []string, primary string) {
	images = in.Images
	if len(images) > 0 {
		return images, images[0]
	}
	return nil, in.ImageURL
}
```

Apply this helper in create/update/new-draft mappings.

- [ ] **Step 4: Run targeted test again**

Run:

```bash
cd lllarik-api && go test ./internal/app -run TestProductDraft_CreateAcceptsImagesAndSetsPrimaryImageURL -count=1 -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd lllarik-api
git add internal/models/models.go internal/app/server.go internal/app/product_draft_test.go
git commit -m "feat(api): support images array with imageUrl fallback for products"
```

---

### Task 2: Add backend regression tests for legacy and update flows

**Files:**
- Modify: `lllarik-api/internal/app/product_draft_test.go`

- [ ] **Step 1: Add legacy payload compatibility test (imageUrl-only)**

```go
func TestProductDraft_CreateLegacyImageURLOnlyStillWorks(t *testing.T) {
	// arrange + POST with only "imageUrl"
	// assert persisted version.Images is empty and version.ImageURL equals provided url
}
```

- [ ] **Step 2: Add update flow test for reordering primary image**

```go
func TestProductDraft_UpdateImagesReordersPrimary(t *testing.T) {
	// create product with images [a,b], then PUT with [b,a]
	// assert draft.Images == [b,a] and draft.ImageURL == b
}
```

- [ ] **Step 3: Run package tests**

```bash
cd lllarik-api && go test ./internal/app -count=1 -v
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
cd lllarik-api
git add internal/app/product_draft_test.go
git commit -m "test(api): cover product images compatibility and update behavior"
```

---

### Task 3: Update frontend product contract and upload helper

**Files:**
- Modify: `lllarik/src/lib/dashboardService.ts`

- [ ] **Step 1: Write failing frontend type-level test**

Create `lllarik/src/app/(app)/dashboard/products/page.test.tsx` with a minimal failing assertion expecting `images` in payload:

```tsx
it("builds submit payload with images and primary imageUrl", () => {
  const payload = {
    name: "Solen",
    slug: "solen",
    imageUrl: "https://cdn.example/1.jpg",
    images: ["https://cdn.example/1.jpg", "https://cdn.example/2.jpg"],
  };
  expect(payload.images[0]).toBe(payload.imageUrl);
});
```

- [ ] **Step 2: Run test to verify baseline behavior**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx"
```

Expected: may fail initially due to missing test setup/imports; fix harness minimally.

- [ ] **Step 3: Extend `DashboardProduct` and add upload helper type**

In `dashboardService.ts`:

```ts
export type DashboardProduct = {
  id?: string;
  productId?: string;
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  images?: string[];
  imageUrl: string;
  slug?: string;
  sortOrder?: number;
};

export type PresignUploadResponse = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
};
```

(Keep existing hooks intact and compatible.)

- [ ] **Step 4: Typecheck**

```bash
cd lllarik && npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
cd lllarik
git add src/lib/dashboardService.ts src/app/\(app\)/dashboard/products/page.test.tsx
git commit -m "feat(dashboard): extend product contract for multi-image support"
```

---

### Task 4: Implement products page badge UX and tag chips

**Files:**
- Modify: `lllarik/src/app/(app)/dashboard/products/page.tsx`

- [ ] **Step 1: Add failing tag-chip interaction test**

In `page.test.tsx`, add:

```tsx
it("adds and removes tag badges without duplicates", async () => {
  // render page
  // add "minimal" twice
  // expect one badge
  // remove it and expect zero
});
```

- [ ] **Step 2: Run targeted test and confirm fail**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx"
```

Expected: FAIL because UI still uses comma-separated text.

- [ ] **Step 3: Implement badge tag editor**

In `page.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
// ...
const [tagInput, setTagInput] = useState("");

function addTag(raw: string) {
  const value = raw.trim();
  if (!value) return;
  setForm((v) => {
    const exists = v.tags.some((t) => t.toLowerCase() === value.toLowerCase());
    if (exists) return v;
    return { ...v, tags: [...v.tags, value] };
  });
  setTagInput("");
}
```

Render `Badge` list with remove action and keyboard-enter add behavior.

- [ ] **Step 4: Re-run test**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx"
```

Expected: PASS for tag scenario.

- [ ] **Step 5: Commit**

```bash
cd lllarik
git add src/app/\(app\)/dashboard/products/page.tsx src/app/\(app\)/dashboard/products/page.test.tsx
git commit -m "feat(products): replace tag text entry with badge chip editor"
```

---

### Task 5: Implement multi-image upload, preview, and primary selection

**Files:**
- Modify: `lllarik/src/app/(app)/dashboard/products/page.tsx`
- Modify: `lllarik/src/lib/dashboardService.ts` (if helper reuse needed)
- Modify: `lllarik/src/app/(app)/dashboard/products/page.test.tsx`

- [ ] **Step 1: Add failing UI test for image reorder primary behavior**

```tsx
it("sets first image as primary and keeps save disabled while uploading", async () => {
  // mock presign/upload
  // select two files
  // expect save disabled during upload
  // set second as primary
  // expect outgoing payload imageUrl === images[0]
});
```

- [ ] **Step 2: Run test to confirm fail**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx"
```

Expected: FAIL (upload UI/logic not implemented yet).

- [ ] **Step 3: Implement uploader + preview state**

Add state:

```tsx
type UploadItem = { url: string; name: string; status: "uploading" | "success" | "failed"; error?: string };
const [uploads, setUploads] = useState<UploadItem[]>([]);
const isUploading = uploads.some((u) => u.status === "uploading");
```

Upload flow per file:

```tsx
const presign = await apiRequest<PresignUploadResponse>({
  url: "/api/v1/storage/presign-upload",
  method: "POST",
  data: { fileName: file.name, contentType: file.type, folder: "products" },
});
await fetch(presign.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
```

After success:
- push `publicUrl` to `form.images`,
- keep `form.imageUrl` synced to first image.

Render preview cards with:
- image thumbnail,
- remove button,
- "Set Primary" button (move selected URL to index 0).

- [ ] **Step 4: Re-run frontend tests + typecheck**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx" && npx tsc --noEmit
```

Expected: PASS and no TS errors.

- [ ] **Step 5: Commit**

```bash
cd lllarik
git add src/app/\(app\)/dashboard/products/page.tsx src/app/\(app\)/dashboard/products/page.test.tsx src/lib/dashboardService.ts
git commit -m "feat(products): add multi-image upload, preview, and primary image selection"
```

---

### Task 6: Add status/category/material badge rendering in products list

**Files:**
- Modify: `lllarik/src/app/(app)/dashboard/products/page.tsx`

- [ ] **Step 1: Add failing render assertion for badges**

```tsx
it("renders status, category, and material as badges in table", () => {
  // render with product row
  // expect badges for Draft + category + material
});
```

- [ ] **Step 2: Run test and confirm fail**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx"
```

Expected: FAIL (currently plain text cells).

- [ ] **Step 3: Implement table badge rendering**

Use `Badge` variants:

```tsx
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">{row.category}</Badge>
<Badge variant="outline">{row.material}</Badge>
```

For tags:

```tsx
{row.tags?.slice(0, 2).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
{row.tags?.length > 2 ? <Badge variant="ghost">+{row.tags.length - 2}</Badge> : null}
```

- [ ] **Step 4: Re-run tests**

```bash
cd lllarik && npm test -- --run "src/app/(app)/dashboard/products/page.test.tsx"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd lllarik
git add src/app/\(app\)/dashboard/products/page.tsx src/app/\(app\)/dashboard/products/page.test.tsx
git commit -m "feat(products): render status and metadata with shadcn badges"
```

---

### Task 7: Update API and integration documentation

**Files:**
- Modify: `lllarik-api/docs/API.md`
- Modify: `lllarik-api/docs/FRONTEND-INTEGRATION.md`

- [ ] **Step 1: Document product payload with `images[]` compatibility**

Add request/response examples showing:

```json
{
  "slug": "solen",
  "name": "Solen",
  "images": ["https://.../1.jpg", "https://.../2.jpg"],
  "imageUrl": "https://.../1.jpg"
}
```

And explicit rule: `imageUrl` is primary/fallback; `images[0]` is canonical when provided.

- [ ] **Step 2: Document frontend upload sequence**

In `FRONTEND-INTEGRATION.md`, add:
1. `POST /api/v1/storage/presign-upload`
2. browser `PUT` to `uploadUrl`
3. append `publicUrl` to ordered `images[]`
4. set `imageUrl = images[0]`
5. save draft product

- [ ] **Step 3: Commit**

```bash
cd lllarik-api
git add docs/API.md docs/FRONTEND-INTEGRATION.md
git commit -m "docs(api): document multi-image product flow and compatibility"
```

---

### Task 8: Write final product documentation flow (admin + dev markdown)

**Files:**
- Create: `lllarik/docs/superpowers/specs/2026-04-09-products-admin-flow.md`
- Create: `lllarik/docs/superpowers/specs/2026-04-09-products-dev-flow.md`

- [ ] **Step 1: Write admin operational guide**

`products-admin-flow.md` sections:
- Dashboard navigation and create/edit entry points
- Tag badges usage
- Multi-image upload and preview
- Set primary image
- Save draft and publish flow
- Verification checklist on landing
- Troubleshooting (failed upload, no preview, validation)

- [ ] **Step 2: Write developer companion markdown**

`products-dev-flow.md` sections:
- Data contract (`images[]`, `imageUrl` fallback)
- Presign + upload code sequence
- Frontend state rules (uploading/failed/success)
- API compatibility scenarios
- Regression test checklist and commands

- [ ] **Step 3: Commit**

```bash
cd lllarik
git add docs/superpowers/specs/2026-04-09-products-admin-flow.md docs/superpowers/specs/2026-04-09-products-dev-flow.md
git commit -m "docs(products): add admin and developer product flow guides"
```

---

### Task 9: Full verification sweep

**Files:**
- Modify: none (verification only unless fixes needed)

- [ ] **Step 1: Run backend tests**

```bash
cd lllarik-api && go test ./... -count=1
```

Expected: PASS.

- [ ] **Step 2: Run frontend tests/lint/typecheck**

```bash
cd lllarik && npm test && npm run lint && npx tsc --noEmit
```

Expected: PASS with no lint/type errors.

- [ ] **Step 3: Manual smoke flow**

Run app stack and verify:
- create draft product with 2+ images,
- set primary,
- save and reopen draft,
- publish and verify landing content uses primary image,
- legacy records with only `imageUrl` still render.

- [ ] **Step 4: Final commit for any verification fixes**

```bash
git add -A
git commit -m "fix: resolve final verification issues for product multi-image flow"
```

(Skip if no changes were required.)

---

## Self-review (plan vs spec)

| Spec requirement | Task(s) |
|------------------|---------|
| Badge usage (tags/status/category/material) | Tasks 4 and 6 |
| Multi-image upload replacing URL input | Task 5 |
| Preview + primary image controls | Task 5 |
| Direct-to-storage presign upload flow | Tasks 5 and 7 |
| Backend compatibility (`images` + `imageUrl`) | Tasks 1 and 2 |
| Error/resilience test coverage | Tasks 2, 5, 9 |
| Admin-focused documentation flow | Task 8 |
| Developer markdown flow | Task 8 |

Placeholder scan: no TBD/TODO placeholders left.  
Type consistency check: `images[]` and `imageUrl` naming is consistent across API, frontend, and docs tasks.

---

**Plan complete and saved to `lllarik/docs/superpowers/plans/2026-04-09-products-module-form-upload-doc-flow.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

