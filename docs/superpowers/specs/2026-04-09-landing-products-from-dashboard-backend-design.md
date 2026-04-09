# Landing Products from Dashboard/Backend Design

## Context

The landing page still renders static product data. The product source of truth should be the dashboard publishing workflow and backend public content endpoint, so published products are reflected on the landing page without hardcoded data.

## Goals

- Replace static landing product data with backend published products.
- Fetch products server-side in Next.js for SEO and first render completeness.
- Render an empty-state message when there are no published products.
- Keep implementation small and aligned with existing frontend patterns.

## Non-Goals

- No client-side retry UI.
- No static fallback product list when backend fails.
- No new caching/revalidation strategy unless already required by existing code.

## Proposed Architecture

1. Landing page uses a server-side data function to fetch published products from backend.
2. A dedicated service function handles:
   - endpoint calling
   - payload validation/normalization
   - mapping to UI-friendly product shape
   - graceful fallback to empty array on failure
3. Landing section renders:
   - product cards when data exists
   - message `No products available yet` when data is empty

## Approaches Considered

### Approach 1: Direct fetch in landing page (simple)

- Pros: minimal files, very straightforward.
- Cons: fetch and mapping logic can leak into page and become harder to reuse/test.

### Approach 2: Service-layer wrapper (recommended)

- Pros: keeps page clean, centralizes mapping/error handling, reusable for future pages.
- Cons: slightly more setup than direct inline fetch.

### Approach 3: Next route handler proxy

- Pros: abstracts backend URL from page-level fetch.
- Cons: extra hop and complexity for current needs.

**Decision:** Approach 2.

## Components and Responsibilities

### Data Service (new or updated)

- File example: `lib/products/getPublishedProducts.ts`.
- Inputs: none (reads API base URL from env/config).
- Behavior:
  - call backend public endpoint for published content/products
  - return normalized product list
  - never throw to page render path
  - return `[]` on request failure, non-OK response, or unrecoverable payload issues

### Landing Page (updated)

- Replace static data source with `await getPublishedProducts()` in server component/page.
- Keep existing visual product card component contract where possible.
- When list length is zero, render section with `No products available yet`.

### Mapping Layer

- Map backend fields to UI props in one place (service layer), not inside JSX rendering.
- Apply safe defaults for optional fields to avoid rendering crashes.
- Drop invalid items if partial payload corruption occurs.

## Data Flow

1. Request hits landing page route.
2. Server render calls `getPublishedProducts()`.
3. Service fetches backend public endpoint.
4. Service validates/maps payload to UI shape.
5. Page renders cards or empty-state message based on result length.

## Error Handling

- Network error, timeout, DNS error: log concise warning and return `[]`.
- Non-2xx response: log concise warning and return `[]`.
- Unexpected payload shape: normalize best-effort, drop invalid items, otherwise return `[]`.
- UI behavior remains deterministic: show products section with `No products available yet` for empty results.

## Configuration

- Use existing frontend env pattern for backend base URL (e.g. `NEXT_PUBLIC_API_BASE_URL` or current server-side equivalent used in repo).
- Keep endpoint path constants near service function to avoid scattered literals.

## Testing Plan

### Automated

- Service tests:
  - maps valid API response into expected UI product shape
  - returns empty array on thrown fetch/non-OK response
  - handles malformed payload safely without throwing
- Page/integration tests (if present in current test stack):
  - renders product cards when products exist
  - renders `No products available yet` when list is empty

### Manual

1. Publish one or more products in dashboard.
2. Verify landing product section shows published products.
3. Unpublish/remove all published products.
4. Verify landing shows `No products available yet`.
5. Stop backend or force API failure.
6. Verify landing still renders and shows `No products available yet`.

## Rollout Notes

- No schema migration expected.
- No dashboard behavior changes required; this is a landing read-path integration.
- Should be deployable independently with correct frontend API base URL configuration.
