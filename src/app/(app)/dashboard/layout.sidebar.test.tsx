import React from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import DashboardAppLayout from "./layout";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockLogoutMutate = vi.fn();
const originalMatchMedia = globalThis.matchMedia;

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/overview",
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "/"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/dashboardStore", () => ({
  useDashboardAuthStore: (selector: (state: { accessToken: string }) => string) =>
    selector({ accessToken: "test-access-token" }),
}));

vi.mock("@/lib/dashboardService", () => ({
  useDashboardLogout: () => ({
    mutate: mockLogoutMutate,
  }),
}));

describe("dashboard app sidebar regression coverage", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("keeps existing primary nav labels", () => {
    const { container } = render(
      <DashboardAppLayout>
        <div>Dashboard page body</div>
      </DashboardAppLayout>,
    );

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).not.toBeNull();

    const scoped = within(sidebar as HTMLElement);
    expect(scoped.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/dashboard/overview");
    expect(scoped.getByRole("link", { name: "Products" })).toHaveAttribute("href", "/dashboard/products");
    expect(scoped.getByRole("link", { name: "Copy" })).toHaveAttribute("href", "/dashboard/copy");
    expect(scoped.getByRole("link", { name: "Releases" })).toHaveAttribute("href", "/dashboard/releases");
    expect(scoped.getByRole("link", { name: "Landing" })).toHaveAttribute("href", "/");
  });

  it("renders the sidebar search chrome marker", () => {
    render(
      <DashboardAppLayout>
        <div>Dashboard page body</div>
      </DashboardAppLayout>,
    );

    expect(screen.getByTestId("dashboard-sidebar-search")).toBeInTheDocument();
  });

  it("renders the sidebar account chrome marker", () => {
    render(
      <DashboardAppLayout>
        <div>Dashboard page body</div>
      </DashboardAppLayout>,
    );

    expect(screen.getByTestId("dashboard-sidebar-account")).toBeInTheDocument();
  });
});
