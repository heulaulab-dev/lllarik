# Products Module Form Enhancement and Documentation Flow

## Goal

Improve the dashboard Products draft form to be more usable and production-ready by:
- replacing image URL entry with multi-image upload,
- adding inline image preview and primary-image controls,
- using `shadcn/ui` badges for tags/status/category/material,
- and providing a clear final product documentation flow for admin users, with a markdown companion for developers.

## Scope

- Frontend updates in `lllarik` products dashboard form/table UX.
- Backend payload/handler support in `lllarik-api` for `images: string[]` while preserving `imageUrl`.
- Documentation updates focused on admin product operations.
- Developer markdown companion documenting technical flow and compatibility.

## Non-Goals

- No full media-domain redesign (no separate product-media endpoints in this change).
- No broad dashboard IA/navigation redesign.
- No changes to publish logic beyond payload compatibility needed for images.

## Selected Approach

Approach A (selected): **Hybrid update** (UI-first with minimal API extension).

Why this approach:
- Delivers requested multi-image + preview behavior quickly.
- Maintains backward compatibility with existing `imageUrl` consumers.
- Reuses existing presign upload flow without introducing new infrastructure.

## Alternatives Considered

### Alternative 1: Frontend-only adaptation
- Keep API unchanged and persist only first uploaded image to `imageUrl`.
- Multi-image exists only as ephemeral UI state.

Trade-offs:
- Lower backend effort.
- Does not meet durable multi-image requirement.

### Alternative 2: Full media model redesign
- Add dedicated media entities/endpoints with ordering and metadata.

Trade-offs:
- Most scalable long-term.
- Higher complexity and longer delivery time than current scope needs.

## Design

### 1) Architecture and Data Contract

#### Frontend (`lllarik`)
- Product form replaces `Image URL` text input with multi-file uploader (`image/*`, multiple).
- Upload sequence per file:
  1. call `POST /api/v1/storage/presign-upload`,
  2. upload browser file via `PUT` to returned `uploadUrl`,
  3. store returned `publicUrl` in `images[]` form state.
- Form submit payload includes `images` and keeps `imageUrl` aligned to primary image (`images[0]`).

#### Backend (`lllarik-api`)
- Extend product input and persistence mapping to accept `images: []string`.
- Keep `imageUrl` for backward compatibility.
- Canonical primary image rule:
  - if `images` exists and non-empty: `imageUrl = images[0]`,
  - if `images` empty but `imageUrl` present: preserve legacy behavior.

#### Compatibility Rules
- Existing clients that only read/write `imageUrl` must continue to work unchanged.
- New clients prefer `images`, fallback to `imageUrl` when `images` is absent.

### 2) Components and UX Behavior

#### Form Structure
- Keep create/edit draft flow in the existing products page.
- Organize fields into visible groups:
  - Basic info: name, slug, category, material, sort order
  - Story
  - Tags
  - Media

#### Tags with Badge UI
- Replace comma-separated tags-only UX with:
  - input + add interaction,
  - removable badge chips per tag.
- Badge behavior:
  - prevent duplicate tags (case-insensitive normalization),
  - trim whitespace before save.

#### Multi-Image Upload and Preview
- Allow selecting multiple image files in one action.
- Show per-file upload status (`uploading`, `success`, `failed`).
- Preview grid card for each uploaded image:
  - thumbnail preview,
  - remove action,
  - "Set Primary" action (moves image to first position).
- Save button is disabled while any upload is still in progress.

#### Badge Usage in Product List/Table
- `Status` badge column (`Draft`, `Published`) where state is available.
- `Category` and `Material` rendered as muted badges.
- `Tags` shown as compact badge chips (with truncation policy when crowded).
- Image summary indicator for multi-image records (for example `+N`).

### 3) Data Flow

1. User selects files.
2. UI requests presign data per file.
3. UI uploads files directly to object storage.
4. UI stores successful `publicUrl` values in ordered `images[]`.
5. User optionally sets a primary image by reordering.
6. On submit, payload sends:
   - `images` full ordered list,
   - `imageUrl` as first image for compatibility.
7. Backend persists and returns draft update/create response.

### 4) Error Handling

- **Presign request fails**: keep current form state, mark file as failed, allow retry.
- **Upload fails**: isolate error to failing file; successful files remain intact.
- **Save fails**: do not reset form; keep user edits and show actionable error.
- **Edit flow remove behavior**: removing an image updates `images[]` before save.
- **Primary image consistency**: whenever ordering changes, recompute `imageUrl` from first image.

### 5) Validation Rules

- Required fields for save: `name`, `slug`.
- Image requirement:
  - creation should require at least one uploaded image,
  - edit may allow existing no-image records but warns user before publish (if current business rule requires media).
- Tags are optional but normalized.

### 6) Testing Strategy

#### Frontend tests
- Tag badge add/remove/deduplicate behavior.
- Image state transitions:
  - add uploaded image,
  - remove image,
  - set primary and reorder.
- Save button disabled during in-flight uploads.
- Payload construction verifies `images[]` and `imageUrl` primary mapping.

#### Frontend integration tests
- Mock presign response + upload + save request.
- Confirm successful form submission includes expected media structure.

#### Backend tests
- Handler accepts `images[]` without breaking legacy `imageUrl`.
- Primary mapping (`images[0] -> imageUrl`) behaves correctly.
- Legacy-only payload still works.

## Final Product Documentation Flow

### A) Admin User Guide (primary audience)

Document a clear operational flow in admin-facing language:

1. Open Products dashboard.
2. Create a new draft or select an existing draft.
3. Fill basic product details.
4. Add and manage tags via badge chips.
5. Upload multiple product images.
6. Set the primary image from uploaded images.
7. Save draft changes.
8. Publish content.
9. Verify landing/product presentation.
10. Troubleshoot common issues (failed upload, missing preview, validation errors).

### B) Developer Markdown Companion

Provide a concise markdown section for developers covering:
- request/response payload contract (`images[]` + `imageUrl` compatibility),
- presign upload request and browser `PUT` sequence,
- primary image ordering rules,
- failure/retry handling expectations,
- regression checklist for product create/edit flows.

## Risks and Mitigations

- **Risk:** Compatibility regressions for existing `imageUrl` consumers.  
  **Mitigation:** Preserve `imageUrl` and add handler tests for legacy payloads.

- **Risk:** Partial upload failures causing user confusion.  
  **Mitigation:** per-file status UI with retry/remove controls and non-destructive form behavior.

- **Risk:** Table density increases with many badges.  
  **Mitigation:** compact badge styles and truncation/collapse strategy.

## Implementation Notes

- Prefer incremental changes in existing products module rather than large refactors.
- Keep API extension focused to the product input/output contract.
- Update docs in both user-facing (admin steps) and developer-facing markdown format in the same delivery slice.

