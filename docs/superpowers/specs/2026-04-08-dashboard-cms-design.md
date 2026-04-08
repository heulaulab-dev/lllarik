# Dashboard CMS Design (Landing-Compatible)

## Overview

Build a dashboard side for content management without changing the landing page design or component structure. The landing continues to render the same sections and visual behavior, but content is sourced from a Go REST API backed by Postgres (GORM) instead of hardcoded values.

Scope for v1:
- Editable: products + landing wording/copy blocks
- Backend: Go + GORM + Postgres
- Auth: email/password + JWT
- Roles: admin, editor, viewer
- Workflow: draft + publish

Out of scope for v1:
- Scheduled publishing
- Public user-facing auth changes
- Major landing redesign
- Full rollback UI (API-ready design only)

## Goals

- Preserve current landing visual output and section architecture.
- Introduce a role-based dashboard at `/dashboard` in the existing Next app.
- Centralize content in Postgres with clear draft/publish boundaries.
- Provide release traceability for audit and future rollback support.

## Non-Goals

- Rebuilding landing components or changing interaction patterns.
- Migrating to external CMS vendors.
- Supporting non-content domains (orders, CRM, analytics) in this phase.

## Architecture

### High-Level

1. **Next.js app (existing)**
   - Keeps landing routes and components.
   - Adds dashboard routes under `/dashboard`.
   - Uses typed fetch layer to read content from Go API.

2. **Go API service (new)**
   - Exposes REST endpoints for auth, RBAC-protected content CRUD, draft/publish.
   - Handles all write operations and content release logic.

3. **Postgres (new)**
   - Stores users, role, versioned content, and publish release history.

### Boundary Rules

- Landing reads **published** content only.
- Dashboard reads draft/published and writes draft only (except publish action).
- All dashboard writes go through Go API; no direct DB writes from frontend.

## Data Model

### users

- `id` (uuid pk)
- `email` (unique)
- `password_hash`
- `role` (`admin|editor|viewer`)
- `is_active`
- `created_at`, `updated_at`

### products

- `id` (uuid pk)
- `slug` (unique)
- `sort_order` (int)
- `created_at`, `updated_at`

### product_versions

- `id` (uuid pk)
- `product_id` (fk products.id)
- `version_no` (int)
- `state` (`draft|published|archived`)
- `name`
- `category`
- `material`
- `story`
- `tags` (text[])
- `image_url`
- `created_by` (fk users.id)
- `created_at`, `updated_at`

Constraints:
- unique (`product_id`, `version_no`)
- at most one current draft per product (enforced by service logic)

### copy_blocks

- `id` (uuid pk)
- `key` (unique) examples:
  - `hero.headline.line1`
  - `hero.headline.line2`
  - `lookbook.intro`
  - `productShowcase.heading`
- `group_name` (e.g., `hero`, `lookbook`, `narrative`)
- `created_at`, `updated_at`

### copy_block_versions

- `id` (uuid pk)
- `copy_block_id` (fk copy_blocks.id)
- `version_no` (int)
- `state` (`draft|published|archived`)
- `value` (text)
- `created_by` (fk users.id)
- `created_at`, `updated_at`

Constraints:
- unique (`copy_block_id`, `version_no`)

### publish_releases

- `id` (uuid pk)
- `released_by` (fk users.id)
- `released_at` (timestamp)
- `note` (nullable text)

### release_items

- `id` (uuid pk)
- `release_id` (fk publish_releases.id)
- `item_type` (`product_version|copy_block_version`)
- `item_id` (uuid)

Purpose:
- immutable mapping of which versions were promoted in each release

## API Design

Base path: `/api/v1`

### Auth

- `POST /auth/login`
  - input: email, password
  - output: JWT access token (+ optional refresh strategy)
- `GET /auth/me`
  - output: user profile and role

### Products

- `GET /content/products?state=draft|published`
- `POST /content/products`
  - creates product shell + initial draft version
- `PUT /content/products/:id/draft`
  - updates draft version
- `DELETE /content/products/:id`
  - soft delete behavior recommended

### Copy Blocks

- `GET /content/copy?state=draft|published`
- `PUT /content/copy/:key/draft`
  - upserts latest draft value for key

### Publish / Releases

- `POST /publish` (admin only)
  - validates content
  - creates release
  - promotes current drafts to published and archives previous published versions
  - writes release_items snapshot
- `GET /releases`
  - list releases for audit/history

### Public Content for Landing

- `GET /public/content`
  - returns normalized payload shaped for landing needs:
    - `hero`
    - `productShowcase`
    - `lookbook`
    - `narrative`
    - other active sections

## RBAC

- `viewer`
  - read-only dashboard access
- `editor`
  - create/edit drafts for products and copy
  - cannot publish
- `admin`
  - full editor capabilities
  - publish permissions
  - user-role management (optional UI in v1, required backend capability)

## Dashboard UX (v1)

Routes:
- `/dashboard/login`
- `/dashboard/overview`
- `/dashboard/products`
- `/dashboard/copy`
- `/dashboard/releases`

Behavior:
- Products page edits fields aligned with current landing data shape.
- Copy page is grouped by section for usability.
- Publish button visible/enabled for admin only.
- UI clearly labels `Draft` vs `Published`.

## Publish Workflow

1. Editor/admin updates draft content.
2. Admin reviews changes from dashboard.
3. Admin triggers publish.
4. API runs transaction:
   - validate required content
   - create release row
   - move draft to published set
   - archive old published set
   - store release_items mapping
5. Landing fetches latest published snapshot.

Guarantee:
- Saving drafts never changes live landing until publish succeeds.

## Landing Compatibility Strategy

- Keep existing components (`Hero`, `ProductShowcase`, `Lookbook`, etc.) intact.
- Replace hardcoded data access with typed content mapping layer.
- Prefer server-side fetch in page composition, passing props to existing components.
- Optional local fallback content for development if API is unavailable.

## Validation and Error Handling

- Server-side schema validation on all write endpoints.
- Auth failures return 401 with generic credential errors.
- RBAC denial returns 403.
- Publish returns 422 if mandatory fields/keys are missing.
- Transaction rollback on any publish-step failure.
- Optimistic locking on draft update to avoid accidental overwrite.

## Testing Plan

### Go API

- Unit tests:
  - auth service
  - role middleware
  - publish service logic
- Integration tests with test DB:
  - products CRUD draft path
  - copy block draft path
  - publish transaction success/failure cases

### Next Dashboard + Landing Integration

- Component tests for dashboard forms and role-gated controls.
- E2E smoke test:
  - login as editor/admin
  - edit draft product/copy
  - publish as admin
  - verify landing uses new published values

### Contract Safety

- Type-checking and contract tests for `/public/content` payload shape used by landing mapper.

## Rollout Plan

1. Add Go service skeleton + DB migrations + auth.
2. Implement versioned content models + CRUD endpoints.
3. Add publish pipeline + release history endpoints.
4. Add dashboard routes and form UIs in Next.
5. Replace landing static content source with API-backed published content mapping.
6. Run integration/e2e verification and deploy.

## Risks and Mitigations

- **Risk:** publish operation partially applies changes  
  **Mitigation:** enforce single DB transaction for release promotion.

- **Risk:** editors overwrite each other  
  **Mitigation:** optimistic locking and conflict messaging.

- **Risk:** landing break due to schema drift  
  **Mitigation:** strict API contract tests + typed frontend mapper.

- **Risk:** unauthorized publish attempts  
  **Mitigation:** server-side role checks, not UI-only restrictions.

## Acceptance Criteria

- Dashboard exists under `/dashboard` with login and role-aware views.
- Product and copy draft edits persist in Postgres.
- Publish action promotes draft to live content.
- Landing renders published API content without visual redesign.
- All critical API and publish paths are covered by tests.
