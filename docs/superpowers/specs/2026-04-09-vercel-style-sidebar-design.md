# Vercel-Style Sidebar Visual Refresh (Light Mode)

## Goal

Refresh the dashboard sidebar visual style and layout to feel close to the Vercel dashboard sidebar while keeping existing navigation behavior and routes unchanged.

## Scope

- Update sidebar visual style/layout only.
- Keep current navigation items, route paths, and click behavior.
- Light mode only.
- Include sidebar chrome details inspired by Vercel:
  - top project/workspace row
  - search row
  - grouped nav sections with spacing/dividers
  - bottom account row

## Non-Goals

- No backend or API changes.
- No navigation information architecture redesign.
- No dark mode work in this change.
- No permissions/auth behavior changes.

## Selected Approach

Approach A: apply a style refresh in the existing sidebar component without changing behavior.

Why this approach:
- Lowest regression risk
- Fastest implementation
- Matches requested scope (visual and layout only)

## Design

### 1) Architecture

- Keep existing sidebar component and nav data source as-is.
- Recompose the visual layout into 4 zones:
  1. Header/project row
  2. Search row
  3. Grouped nav list
  4. Footer/account row
- Preserve existing active-route logic and click handlers.

### 2) Components

#### Sidebar Shell
- Width target around `240-260px`
- Light neutral background with subtle border
- Compact, consistent vertical spacing

#### Header Block
- Project/workspace identity row (icon/avatar + name + optional small badge)
- Presentational only unless existing data already provides dynamic values

#### Search Row
- Rounded, low-contrast control with search icon
- Small keyboard hint badge (for parity with Vercel-like chrome)
- May remain visual-only if no current filter behavior exists

#### Navigation Groups
- Existing nav items rendered in visual groups
- Subtle separator/spacing between groups
- Item states:
  - default: low-emphasis text
  - hover: soft background
  - active: compact filled background + stronger text

#### Footer Account Row
- Bottom-pinned user row with avatar/name and overflow/action icon
- Uses existing user/session data if available
- Fallback label if user data is missing

### 3) Data Flow

- No new data fetching.
- Existing nav configuration remains source of truth.
- Existing route match logic determines active item.
- Existing auth/session state feeds footer identity when available.

### 4) Error Handling and Fallbacks

- Missing user name -> show `Account`.
- Missing avatar -> show initials or neutral placeholder.
- Empty nav group -> skip rendering that group container.
- Keep current auth/loading gates untouched.

### 5) Accessibility

- Preserve semantic interactive elements (`button`/`a`) for nav rows.
- Visible focus states for keyboard users.
- Maintain readable contrast for default, hover, and active states in light theme.
- Add `aria-label` for the search control if needed.

### 6) Testing and Verification

#### Visual checks
- Sidebar no longer appears sparse; spacing and hierarchy look denser and intentional.
- Header/search/group/footer regions are visually distinct.
- Active and hover states are clearly readable.

#### Regression checks
- Every existing nav item still routes correctly.
- Active-route highlight still follows current path logic.
- No overflow issues at typical dashboard widths.

#### A11y checks
- Keyboard tab focus is visible on search and nav rows.
- Contrast remains acceptable for light mode text and state backgrounds.

## Risks

- Cosmetic drift from project design language if values are too aggressive.
- Minor layout regressions on narrow widths.

Mitigation:
- Keep sizing and spacing tokenized and conservative.
- Validate at common breakpoints during QA.

## Implementation Notes

- Prefer targeted class/style edits in the current sidebar component.
- Avoid refactoring nav business logic.
- Keep code changes isolated to sidebar-related files unless a shared style token is required.

