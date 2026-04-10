# Dashboard onboarding tour (menu guide)

## Goal

Give first-time (and returning) dashboard users a **step-by-step spotlight tour** of the shell: workspace header, menu search, grouped navigation (Main / Secondary), account area, and (for admins) the **Users** entry. Users can **Skip** at any time, **replay** the tour from **Settings**, and progress is **stored on the server** so it stays in sync across devices.

When the sidebar or copy changes in a future release, only **steps whose `contentVersion` was bumped** should auto-run again (**“what’s new” mini-tour**), not the full tour.

## Scope

- **Backend (`lllarik-api`)**: persist per-user acknowledgements; extend `GET /auth/me`; add `PATCH` for tour acks.
- **Frontend (`lllarik`)**: tour manifest (step ids, versions, copy, targets, role filters); tour runner (recommended: **React Joyride** or **Driver.js**); integration in `dashboard/layout.tsx`; **Replay dashboard tour** on `/dashboard/settings`; stable `data-tour-id` (or equivalent) on shell elements.
- **Documentation**: `docs/API.md` updates for new/ changed fields and routes.

## Non-Goals

- CMS-managed tour content (no admin UI to edit steps in the database).
- Tour for non-dashboard routes (marketing site, login).
- Email or product-analytics “tour completed” events (optional later).
- Internationalization of tour strings in v1 (English only unless the app already has i18n for dashboard).

## Selected approach

**Approach 1 — per-step content versions** with a JSON map of acknowledgements on the user row.

- Each step has a stable `stepId` and integer **`contentVersion`**. Bump the version when that step’s copy, order, or highlight target changes.
- Server stores `{ "<stepId>": <acknowledgedVersion> }`. Pending steps are those where `ack[stepId] ?? 0 < contentVersion` in the current manifest.

## API and data model

### Column

- Add to `users`: **`dashboard_tour_step_acks`** — JSON object, maps `stepId` (string) → acknowledged `contentVersion` (integer). Missing or empty object means no step has been acknowledged.

### Merge rule

- **`PATCH /api/v1/me/dashboard-tour-acks`** (name can vary; must be documented) with body:
  ```json
  { "acks": { "sidebar.workspace": 1, "sidebar.search": 2 } }
  ```
- For each key in `acks`, persist **`max(existing[key], incoming[key])`** so clients cannot downgrade versions.
- Keys omitted are unchanged. Authenticated users may only update **their own** row.

### `GET /api/v1/auth/me`

- Extend the response with **`dashboardTourStepAcks`**: same shape as stored (string keys, integer values). Enables the dashboard shell to compute pending steps without an extra request.

### Response shape (illustrative)

`GET /auth/me` includes:

```json
{
  "userId": "…",
  "email": "…",
  "name": "…",
  "role": "…",
  "dashboardTourStepAcks": {
    "sidebar.workspace": 1
  }
}
```

## Frontend design

### Manifest

- Single module (e.g. `lib/dashboardTour.ts`) exporting ordered steps:
  - `stepId`, `contentVersion`, `title`, `body`, `target` (selector for `data-tour-id`), optional **`roles`** (e.g. only `admin` sees the Users step).
- **First visit**: empty acks → all applicable steps pending → full tour.
- **What’s new**: only steps with `contentVersion` greater than `ack[stepId]` run in order (mini-tour).

### Orchestration

- Run after **`me`** is loaded and the dashboard shell is mounted.
- If any pending step exists → start tour (unless **replay suppression** is not needed for normal case; replay uses `forceTour` — see below).
- **Skip**: PATCH acks for **every step shown in this run**, each set to that step’s current `contentVersion` from the manifest (user is “caught up” for those steps).
- **Done** (last step): same batch PATCH for all steps in the run.
- **Replay (Settings)**: set client flag **`forceTour`** (React state and/or `sessionStorage`). Tour runs **all applicable steps** for the user’s role regardless of pending; on Done/Skip, PATCH the same way so server state matches.

### Settings

- Add **“Replay dashboard tour”** to `/dashboard/settings` with short helper text. On click: set `forceTour`, navigate to a stable dashboard route (e.g. `/dashboard/overview`) if needed so the layout effect runs and the tour starts.

### Stable targets

Add **`data-tour-id="…"`** on:

- Workspace header block (link wrapping “LLLARIK Dashboard”).
- Search input (can align with existing `data-testid="dashboard-sidebar-search"` if the library can target it).
- **Main** group: either the group label or a representative nav row.
- **Secondary** group: same.
- **Users** nav item when rendered (admin only).
- Account card (`data-testid="dashboard-sidebar-account"` exists — add `data-tour-id` if cleaner).
- **SidebarTrigger** (top bar) for collapse / mobile context.

Exact ids are an implementation detail; the manifest must reference whatever is shipped.

### Library

- Prefer **React Joyride** or **Driver.js** for positioning, overlay, and keyboard flow; wrap with custom buttons: **Back**, **Next**, **Skip**.
- Honor **`prefers-reduced-motion`** where the library allows (instant transitions or reduced animation).

### Edge cases

- **Loading**: Do not start the tour until `me` (including acks) is available.
- **PATCH failure**: Toast error; do not auto-restart the tour on every navigation; user can retry from Settings.
- **Missing target** (collapsed sidebar, small viewport): Prefer expanding the sidebar if the UI API supports it; otherwise show a centered fallback tooltip explaining how to open the sidebar.
- **Role-gated step (Users)**: Omit from manifest for non-admins; they never ack that `stepId`. If a user later becomes admin, pending logic includes that step when `ack` is missing or outdated.

### Testing

- With mocked `me` and empty acks → tour starts (or steps render).
- With all relevant acks at current versions → no automatic tour.
- Replay control sets `forceTour` → tour runs; completing updates PATCH (mocked).

## Accessibility

- Focus management: Skip / Next / Back are keyboard reachable; restore focus to a sensible element when the tour ends.
- Sufficient contrast for tooltip content in light theme (match dashboard).

## Maintainer workflow

When changing the sidebar shell or a step’s meaning:

1. Edit the manifest copy or target.
2. Bump **`contentVersion`** for **only** the affected step(s).
3. Deploy API + frontend together; users with outdated acks get a **mini-tour** for those steps only.

## Verification checklist (before release)

- [ ] New user (empty acks) sees full tour on first dashboard visit.
- [ ] Skip marks shown steps as acknowledged (mini-tour does not repeat until a version bumps).
- [ ] Bump one step’s version → only that step runs automatically (with any other outdated steps).
- [ ] Settings replay runs full applicable tour without clearing server state incorrectly.
- [ ] Non-admin does not see Users step; admin does.
- [ ] `me` returns `dashboardTourStepAcks`; PATCH merge behaves as specified.
