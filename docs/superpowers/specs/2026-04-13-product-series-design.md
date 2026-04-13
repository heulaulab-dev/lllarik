# Product Series (Dashboard + Landing) Design

## Context

The catalog should be **series-first** on the public landing: visitors browse **series**, open a series to see **child products** (e.g. A.1, A.2), and each child uses the **existing product detail UX** (today: the `ProductShowcase` dialog/modal, not a separate routed page).

Admins create a **series** first, then add **products** that belong to that series. The backend today models **Product** + **ProductVersion** with draft/publish/archive and a single **publish** transaction that promotes all drafts; **GET /public/content** returns flat published product versions.

## Goals

- Introduce a **first-class Series** entity with **draft/published versions** aligned with **ProductVersion** lifecycle.
- Require **new** products to belong to a **series** (`series_id`).
- Extend **publish** and **public** APIs so the landing can render **nested** series → products.
- Revamp **dashboard** navigation: series list → series detail (manage series + its products).
- Revamp **landing** `ProductShowcase`: grid of **series**; series interaction shows **children**; child opens **existing** modal/detail pattern.

## Non-Goals

- New routed URLs for product or series detail on the landing (e.g. `/collection/[slug]`) in this change; modals remain the primary UX unless added later.
- Changing copy blocks or unrelated dashboard modules.
- Full media-domain redesign (reuse existing presign + `images` / `imageUrl` rules).

## Decisions (defaults where not explicitly chosen in brainstorm)

| Topic | Decision |
| ----- | -------- |
| Series versioning | **Full parity:** `Series` + `SeriesVersion` with same state machine as products (`draft`, `published`, `archived`). |
| Unpublish series | **Cascade:** unpublishing a series archives its published **SeriesVersion** and **all published ProductVersions** for products in that series. UI must require **explicit confirmation** listing impact. |
| Slugs | **Global uniqueness** for `series.slug` and `product.slug` (simplest routing and mental model for future deep links). |
| Empty series on public site | **Omit** series that have **no published child products** from the public payload (cleaner landing). |
| Legacy products | `product.series_id` **nullable** in DB for existing rows; new creates **require** a series. Legacy rows excluded from nested public series (or listed only in admin until backfilled). |

## Data Model

### `Series`

- `id` (UUID, PK)
- `slug` (string, unique, not null)
- `sort_order` (int, default 0)
- `created_at`, `updated_at`, `deleted_at` (soft delete aligned with `Product`)

### `SeriesVersion`

- `id` (UUID, PK)
- `series_id` (UUID, FK → `series`, not null, indexed)
- `version_no` (int, not null)
- `state` (string: `draft` \| `published` \| `archived`, indexed)
- Content fields (mirror product version patterns where applicable):
  - `name` (not null)
  - `category`, `material`, `story` (strings, optional)
  - At least one visual: `images` non-empty or `image_url` set before publish (same operational rule as products)
  - `tags` (JSON array of strings)
  - `images` (JSON array of strings), `image_url` (primary; rule: if `images` non-empty, primary = `images[0]`, else legacy `image_url`)
- `created_by` (UUID, not null)
- `created_at`, `updated_at`

**Constraints:** At most one `SeriesVersion` in `draft` per series at a time (same invariant style as products). Published/archived history by `version_no`.

### `Product` (change)

- Add `series_id` (UUID, nullable for migration, FK → `series`, indexed)
- **Application rule:** create-product API **rejects** missing `series_id` for new products. Updates may set `series_id` only if business rules allow (recommend: **disallow** moving between series after create to avoid broken releases; document exception process if needed).

## API

### Authenticated editor (dashboard)

- **Series**
  - `POST /content/series` — create `Series` + initial `SeriesVersion` (draft)
  - `PUT /content/series/:id/draft` — update draft version (create new draft row if following same pattern as products)
  - `GET /content/series` — list series shells + draft/published summary for navigation
  - `DELETE /content/series/:id` — soft-delete series; **minimum viable:** mirror `deleteProduct` semantics (same role gates and error shapes as today)
- **Products**
  - Extend create/update draft payloads with **`seriesId`** (required on create)
  - `GET /content/products?seriesId=` optional filter for series detail screen

### Unpublish

- `POST /content/series/:id/unpublish` — implements cascade rule above inside a transaction; mirrors product unpublish patterns.

### Admin publish (`POST /publish`)

Extend the existing transaction to process **draft `SeriesVersion` records** the same way as product drafts:

1. For each draft series version: archive current published version for that `series_id`, promote draft to `published`, append `ReleaseItem` with `item_type = series_version` (new type).
2. Keep existing product draft promotion loop; ensure product `series_id` is set before publish for new content.

Ordering: process series promotions before or interleaved with products as long as FKs exist; products already reference `series_id` on the `Product` row, not on the version row—no ordering conflict.

### Public (`GET /public/content`)

Response shape extended from flat `products` to include **`series`** (array), each item:

- Resolved **published** series fields (from latest published `SeriesVersion`)
- `products`: array of **published** child products (latest published `ProductVersion` per product), sorted by `product.sort_order` asc, then `name`

**Filter:** drop series with **zero** children after filtering to published versions.

**Legacy:** products with `series_id` null do not appear under any series; optionally include deprecated `productsFlat` during transition—**non-goal** for this spec: landing uses **only** nested `series`; admin handles legacy migration.

## Dashboard UX

1. **Series list** (replaces or precedes flat “all products” as the primary entry): columns—name, slug, draft/published badge, child count, actions (open, unpublish).
2. **Series detail** — two regions:
   - **Series form:** same field groups as product draft where applicable (basic info, story, tags, media).
   - **Products in series:** table + “Add product” (opens existing product form scoped with `seriesId` preset).
3. **Releases** page: show release items for both `series_version` and `product_version` (filter or column by type).

## Landing UX (`lllarik`)

1. Server fetch: `getPublishedContent()` (or equivalent) maps **`series`** from API to showcase props.
2. **Grid:** one card per **series** (hero from series primary image, name, short story/category per current card design language).
3. **Series open:** dialog (or stacked flow) showing series narrative + **grid/list of child products**.
4. **Child select:** opens **existing** `ProductModal` layout (reuse component; pass child product shape).

Empty states: no series → existing “No products available yet” message or series-specific copy; series with no published children should not appear from API.

## Error Handling

- Create product without `seriesId`: **400** with clear message.
- Invalid `seriesId`: **400**.
- Publish with draft product missing `series_id`: **409** with body listing offending product IDs (“incomplete catalog”).
- Unpublish series: transaction; partial failure → **500**, no half-updates.

## Testing

### Backend

- Migration: `series_id` column nullable; FK to `series`.
- Create series + draft; create product with `seriesId`; publish; public payload contains series with one child.
- Second publish creates new versions; public shows updated copy.
- Unpublish series removes/cascades archived states; public omits series or children as specified.
- Unique slug violations return **409** or **400** consistently with existing product slug errors.

### Frontend

- Service mapping tests: API → `LandingProduct`-like types for series and children.
- `ProductShowcase` (or extracted pieces): series grid, child list, modal opens for child with expected fields.

## Migration / Rollout

1. Ship DB migration (`series`, `series_version`, `product.series_id`).
2. Backfill: either create a **default “Legacy”** series and assign existing products, or leave null and **only show series-backed content** on landing until ops backfills (document chosen ops path).
3. Deploy API before or with frontend; if frontend goes first, handle missing `series` key with empty array.

## Out of Scope (follow-ups)

- SEO routes per series/child.
- Moving a product between series.
- Per-series product slug uniqueness without global uniqueness.
