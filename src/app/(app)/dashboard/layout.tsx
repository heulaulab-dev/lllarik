"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  MoreHorizontal,
  Search,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DashboardTourJoyride } from "@/components/DashboardTourJoyride";
import { useDashboardAuthStore } from "@/lib/dashboardStore";
import { useDashboardLogout, useDashboardMe } from "@/lib/dashboardService";

type SidebarGroupKey = "main" | "secondary";

const items = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, group: "main" },
  { href: "/dashboard/products", label: "Products", icon: Boxes, group: "main" },
  { href: "/dashboard/copy", label: "Copy", icon: FileText, group: "main" },
  { href: "/dashboard/releases", label: "Releases", icon: Megaphone, group: "secondary" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, group: "secondary" },
  { href: "/dashboard/users", label: "Users", icon: Users, group: "secondary" },
  { href: "/", label: "Landing", icon: BarChart3, group: "secondary" },
];

const groupOrder: SidebarGroupKey[] = ["main", "secondary"];
const groupLabels: Record<SidebarGroupKey, string> = {
  main: "Main",
  secondary: "Secondary",
};
const itemsByGroup = groupOrder.reduce<Record<SidebarGroupKey, (typeof items)[number][]>>(
  (acc, group) => {
    acc[group] = items.filter((item) => item.group === group);
    return acc;
  },
  { main: [], secondary: [] },
);

function accountInitials(email: string | undefined) {
  if (!email) return "—";
  const local = email.split("@")[0]?.trim() ?? "";
  const parts = local.split(/[.\-_]/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const compact = local.replaceAll(/[^a-zA-Z0-9]/g, "");
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase();
  return (local.slice(0, 2) || "?").toUpperCase();
}

export default function DashboardAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const { data: me, isLoading: meLoading } = useDashboardMe();
  const logout = useDashboardLogout();
  const showUsersNav = !meLoading && me?.role === "admin";
  const displayEmail = me?.email ?? "";
  const displayName = me?.name?.trim() ?? "";
  const [searchQuery, setSearchQuery] = useState("");
  const [replayTour, setReplayTour] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    if (u.searchParams.get("replayTour") !== "1") return;
    u.searchParams.delete("replayTour");
    const qs = u.searchParams.toString();
    const next = `${u.pathname}${qs ? `?${qs}` : ""}${u.hash}`;
    window.history.replaceState({}, "", next);
    setReplayTour(true);
  }, []);

  const handleReplayTourConsumed = useCallback(() => {
    setReplayTour(false);
  }, []);
  const displayInitials = displayName
    ? displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!)
        .join("")
        .toUpperCase()
    : accountInitials(displayEmail);
  const roleLabel = me?.role ? me.role.charAt(0).toUpperCase() + me.role.slice(1) : "…";
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredItemsByGroup = useMemo(() => {
    return groupOrder.reduce<Record<SidebarGroupKey, (typeof items)[number][]>>(
      (acc, group) => {
        const visibleItems = itemsByGroup[group].filter((item) => item.href !== "/dashboard/users" || showUsersNav);
        acc[group] = normalizedSearch
          ? visibleItems.filter((item) => item.label.toLowerCase().includes(normalizedSearch))
          : visibleItems;
        return acc;
      },
      { main: [], secondary: [] },
    );
  }, [normalizedSearch, showUsersNav]);

  const handleSignOut = () => {
    logout
      .mutateAsync()
      .finally(() => {
        useDashboardAuthStore.getState().clearTokens();
        globalThis.location.assign("/login");
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <>
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r bg-[#fafafa]">
        <SidebarHeader className="gap-1.5 p-3">
          <Link
            href="/dashboard/overview"
            className="rounded-md border bg-white px-3 py-2 text-sm"
            data-tour-id="tour-workspace"
          >
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Workspace</div>
            <div className="truncate text-sm font-medium text-foreground">LLLARIK Dashboard</div>
          </Link>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search dashboard"
              data-testid="dashboard-sidebar-search"
              data-tour-id="tour-search"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-8 bg-white pl-8 pr-8 text-xs"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              /
            </kbd>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groupOrder.map((group, index) => (
            <div key={group}>
              {index > 0 && <SidebarSeparator />}
              <SidebarGroup className={group === "main" ? "pt-0" : "pt-1"}>
                <SidebarGroupLabel
                  className="h-7 px-2 text-[11px] font-semibold uppercase tracking-wide"
                  data-tour-id={group === "main" ? "tour-nav-main" : "tour-nav-secondary"}
                >
                  {groupLabels[group]}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredItemsByGroup[group].map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={pathname === item.href}
                          tooltip={item.label}
                          className="h-8 px-2"
                          data-tour-id={item.href === "/dashboard/users" ? "tour-users" : undefined}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {normalizedSearch && filteredItemsByGroup[group].length === 0 ? (
                      <SidebarMenuItem>
                        <div className="px-2 py-1 text-xs text-muted-foreground">No matches</div>
                      </SidebarMenuItem>
                    ) : null}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-3 pt-2">
          <div
            data-testid="dashboard-sidebar-account"
            data-tour-id="tour-account"
            className="rounded-xl border bg-white px-2.5 py-2.5 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8 border">
                <AvatarFallback title={displayEmail}>{meLoading ? "…" : displayInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight" title={displayName || displayEmail}>
                  {meLoading ? "…" : displayName || "Signed in"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground leading-tight" title={displayEmail}>
                  {meLoading ? "Loading…" : displayEmail || "No email"}
                </p>
              </div>
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {meLoading ? "…" : roleLabel}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")} aria-label="Account actions">
                    <MoreHorizontal className="size-3.5" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="h-16 border-b flex items-center px-4 gap-3">
          <span data-tour-id="tour-sidebar-trigger" className="inline-flex">
            <SidebarTrigger />
          </span>
          <Separator orientation="vertical" className="h-5" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/dashboard/overview" />}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {pathname === "/dashboard/users"
                    ? "Users"
                    : (items.find((i) => i.href === pathname)?.label ?? "Page")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                  <Avatar className="size-8">
                    <AvatarFallback title={displayEmail}>{meLoading ? "…" : displayInitials}</AvatarFallback>
                  </Avatar>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    <DashboardTourJoyride
      me={me}
      meLoading={meLoading}
      forceFullReplay={replayTour}
      onReplayConsumed={handleReplayTourConsumed}
    />
    </>
  );
}
