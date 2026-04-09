# Vercel-Style Sidebar Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the dashboard sidebar to a Vercel-inspired light-mode layout while preserving existing navigation routes and behavior.

**Architecture:** Keep the existing dashboard layout and sidebar primitives, then layer a style-only composition update in `src/app/dashboard/(app)/layout.tsx`. Add a lightweight search row (visual-only), grouped menu sections, and a bottom account row while preserving routing and auth/logout logic. Validate behavior with targeted UI tests and lint checks.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui sidebar primitives, Lucide icons, ESLint, Vitest + React Testing Library (new for UI verification)

---

## File Structure

- Modify: `src/app/dashboard/(app)/layout.tsx`  
  Responsibility: apply Vercel-like sidebar layout/styling, keep existing routes and behavior.
- Modify: `package.json`  
  Responsibility: add test script and test dependencies.
- Create: `vitest.config.ts`  
  Responsibility: Vitest config for jsdom + path aliases.
- Create: `src/test/setup.ts`  
  Responsibility: shared test setup (`@testing-library/jest-dom`).
- Create: `src/app/dashboard/(app)/layout.sidebar.test.tsx`  
  Responsibility: regression coverage for nav links, active state, and account/sign-out UI presence.

### Task 1: Add UI Test Harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write the failing test entrypoint command**

Run: `npm run test -- --runInBand`  
Expected: script error like `Missing script: "test"`

- [ ] **Step 2: Add test dependencies and scripts**

Run:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Then update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Run tests to verify harness boots**

Run: `npm run test`  
Expected: PASS with `0 tests` or no failing tests.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts
git commit -m "test: add vitest harness for dashboard ui regression checks"
```

### Task 2: Add Failing Sidebar Regression Tests

**Files:**
- Create: `src/app/dashboard/(app)/layout.sidebar.test.tsx`
- Test: `src/app/dashboard/(app)/layout.sidebar.test.tsx`

- [ ] **Step 1: Write failing tests for required sidebar chrome**

Create `src/app/dashboard/(app)/layout.sidebar.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardAppLayout from "./layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/overview",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/dashboardStore", () => ({
  useDashboardAuthStore: () => "token-present",
}));

vi.mock("@/lib/dashboardService", () => ({
  useDashboardLogout: () => ({ mutate: vi.fn() }),
}));

describe("Dashboard sidebar visual structure", () => {
  it("renders search row and account block", () => {
    render(
      <DashboardAppLayout>
        <div>content</div>
      </DashboardAppLayout>
    );

    expect(screen.getByPlaceholderText(/find/i)).toBeInTheDocument();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it("keeps all existing navigation labels", () => {
    render(
      <DashboardAppLayout>
        <div>content</div>
      </DashboardAppLayout>
    );

    ["Overview", "Products", "Copy", "Releases", "Landing"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm failure before implementation**

Run: `npm run test -- src/app/dashboard/(app)/layout.sidebar.test.tsx`  
Expected: FAIL because search placeholder or account layout selectors do not exist yet.

- [ ] **Step 3: Tighten assertions to avoid false positives**

Update tests to assert sidebar-local structure markers once implementation adds test ids:

```tsx
expect(screen.getByTestId("dashboard-sidebar-search")).toBeInTheDocument();
expect(screen.getByTestId("dashboard-sidebar-account")).toBeInTheDocument();
```

- [ ] **Step 4: Re-run failing tests**

Run: `npm run test -- src/app/dashboard/(app)/layout.sidebar.test.tsx`  
Expected: FAIL with `Unable to find an element by: [data-testid="dashboard-sidebar-search"]`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/(app)/layout.sidebar.test.tsx"
git commit -m "test: add failing sidebar chrome regression coverage"
```

### Task 3: Implement Vercel-Like Sidebar Layout (Style-Only)

**Files:**
- Modify: `src/app/dashboard/(app)/layout.tsx`
- Test: `src/app/dashboard/(app)/layout.sidebar.test.tsx`

- [ ] **Step 1: Add imports and group metadata for visual sections**

In `src/app/dashboard/(app)/layout.tsx`, extend icons and nav metadata:

```tsx
import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Search,
  MoreHorizontal,
} from "lucide-react";

import { SidebarSeparator } from "@/components/ui/sidebar";

const items = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, group: "main" },
  { href: "/dashboard/products", label: "Products", icon: Boxes, group: "main" },
  { href: "/dashboard/copy", label: "Copy", icon: FileText, group: "main" },
  { href: "/dashboard/releases", label: "Releases", icon: Megaphone, group: "secondary" },
  { href: "/", label: "Landing", icon: BarChart3, group: "secondary" },
];
```

- [ ] **Step 2: Rebuild sidebar header/content/footer with chrome details**

Replace sidebar sections with:

```tsx
<Sidebar variant="inset" className="border-r bg-[#fafafa]">
  <SidebarHeader className="gap-3 px-3 pt-3 pb-2">
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">LL</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">LLLARIK</p>
        <p className="text-muted-foreground text-xs">Dashboard</p>
      </div>
    </div>
    <div
      data-testid="dashboard-sidebar-search"
      className="text-muted-foreground flex h-8 items-center gap-2 rounded-md border bg-white px-2 text-xs"
    >
      <Search className="size-3.5" />
      <span className="flex-1">Find...</span>
      <span className="rounded border px-1 text-[10px] leading-4">F</span>
    </div>
  </SidebarHeader>
  <SidebarContent className="px-2">
    {/* grouped nav rendering here */}
  </SidebarContent>
  <SidebarFooter className="px-3 pb-3 pt-2">
    <div
      data-testid="dashboard-sidebar-account"
      className="flex items-center gap-2 rounded-md border bg-white px-2 py-2"
    >
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">AD</AvatarFallback>
      </Avatar>
      <span className="flex-1 truncate text-sm">Account</span>
      <Button variant="ghost" size="icon-sm" className="size-6">
        <MoreHorizontal className="size-3.5" />
      </Button>
    </div>
    <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
      <LogOut />
      Sign out
    </Button>
  </SidebarFooter>
</Sidebar>
```

Add the shared sign-out callback before `return`:

```tsx
const handleSignOut = () => {
  logout.mutate();
  router.push("/dashboard/login");
};
```

- [ ] **Step 3: Render grouped nav menus without route behavior changes**

Inside `SidebarContent`, render groups using current items and existing route match:

```tsx
{(["main", "secondary"] as const).map((groupKey) => {
  const groupItems = items.filter((item) => item.group === groupKey);
  if (groupItems.length === 0) return null;

  return (
    <SidebarGroup key={groupKey} className="p-1">
      {groupKey === "secondary" ? <SidebarSeparator className="my-2" /> : null}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {groupItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href}
                className="h-8 rounded-md px-2 text-[13px] data-active:bg-zinc-200/70 data-active:font-medium"
                tooltip={item.label}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
})}
```

- [ ] **Step 4: Run tests and lint**

Run:

```bash
npm run test -- "src/app/dashboard/(app)/layout.sidebar.test.tsx"
npm run lint
```

Expected:
- Vitest: PASS all sidebar tests
- ESLint: no new errors

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/(app)/layout.tsx" "src/app/dashboard/(app)/layout.sidebar.test.tsx"
git commit -m "feat: refresh dashboard sidebar with vercel-inspired light layout"
```

### Task 4: End-to-End Verification Pass

**Files:**
- Modify (if needed): `src/app/dashboard/(app)/layout.tsx`
- Modify (if needed): `src/app/dashboard/(app)/layout.sidebar.test.tsx`

- [ ] **Step 1: Run app for manual visual QA**

Run: `npm run dev`  
Expected: Next.js dev server starts on `http://localhost:3000`.

- [ ] **Step 2: Verify required UI outcomes**

Manual checks:
- Sidebar feels denser and less empty
- Header row, search row, grouped nav, footer account row are visible
- Active nav item is still correct on each dashboard page
- Sign-out still routes to `/dashboard/login`

- [ ] **Step 3: Run full checks**

Run:

```bash
npm run test
npm run lint
npm run build
```

Expected:
- tests pass
- lint passes
- production build succeeds

- [ ] **Step 4: Update snapshots/assertions only if behavior is correct**

If tests fail due to expected markup changes, update test expectations (not logic).

- [ ] **Step 5: Commit final polish**

```bash
git add "src/app/dashboard/(app)/layout.tsx" "src/app/dashboard/(app)/layout.sidebar.test.tsx"
git commit -m "test: finalize sidebar regression checks and visual polish"
```

