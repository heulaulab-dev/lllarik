import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardAppLayout from "./layout";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockLogoutMutate = vi.fn();

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

  it("keeps existing primary nav labels", () => {
    render(
      <DashboardAppLayout>
        <div>Dashboard page body</div>
      </DashboardAppLayout>,
    );

    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Releases")).toBeInTheDocument();
    expect(screen.getByText("Landing")).toBeInTheDocument();
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
