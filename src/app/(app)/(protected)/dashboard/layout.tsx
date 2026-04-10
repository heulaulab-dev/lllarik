"use client";

import { type ComponentType, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Copy,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDashboardAuthStore } from "@/lib/dashboardStore";
import { useDashboardLogout, useDashboardMe } from "@/lib/dashboardService";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  group: "main" | "secondary";
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, group: "main" },
  { href: "/dashboard/products", label: "Products", icon: Boxes, group: "main" },
  { href: "/dashboard/copy", label: "Copy", icon: Copy, group: "main" },
  { href: "/dashboard/releases", label: "Releases", icon: Megaphone, group: "secondary" },
  { href: "/dashboard/users", label: "Users", icon: Users, group: "secondary", adminOnly: true },
  { href: "/", label: "Landing", icon: BarChart3, group: "secondary" },
];

function accountInitials(email: string | undefined) {
  if (!email) return "—";
  const local = email.split("@")[0]?.trim() ?? "";
  const parts = local.split(/[.\-_]/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  const compact = local.replaceAll(/[^a-zA-Z0-9]/g, "");
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase();
  return (local.slice(0, 2) || "?").toUpperCase();
}

type AccountMenuProps = {
  displayName: string;
  displayEmail: string;
  showUsersNav: boolean;
  onSignOut: () => void;
};

function AccountMenu({ displayName, displayEmail, showUsersNav, onSignOut }: Readonly<AccountMenuProps>) {
  return (
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="px-2 py-2">
          <p className="font-semibold text-sm truncate">{displayName || "Signed in"}</p>
          <p className="font-normal text-muted-foreground text-xs truncate">{displayEmail || "No email"}</p>
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem render={<Link href="/dashboard/overview" />}>
        <LayoutDashboard className="size-4" />
        Overview
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href="/dashboard/products" />}>
        <Boxes className="size-4" />
        Products
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href="/dashboard/copy" />}>
        <Copy className="size-4" />
        Copy
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href="/dashboard/releases" />}>
        <Megaphone className="size-4" />
        Releases
      </DropdownMenuItem>
      {showUsersNav ? (
        <DropdownMenuItem render={<Link href="/dashboard/users" />}>
          <Users className="size-4" />
          Users
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem render={<Link href="/" />}>
        <BarChart3 className="size-4" />
        Landing
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut}>
        <LogOut className="size-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export default function DashboardAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { data: me, isLoading: meLoading } = useDashboardMe();
  const logout = useDashboardLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const showUsersNav = !meLoading && me?.role === "admin";
  const displayEmail = me?.email ?? "";
  const displayName = me?.name?.trim() ?? "";
  const displayInitials = displayName
    ? displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!)
        .join("")
        .toUpperCase()
    : accountInitials(displayEmail);
  const visibleItems = useMemo(
    () => navItems.filter((item) => !item.adminOnly || showUsersNav),
    [showUsersNav],
  );
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filtered = useMemo(
    () => (normalizedSearch ? visibleItems.filter((i) => i.label.toLowerCase().includes(normalizedSearch)) : visibleItems),
    [normalizedSearch, visibleItems],
  );

  const handleSignOut = () => {
    logout
      .mutateAsync()
      .finally(() => {
        useDashboardAuthStore.getState().clearTokens();
        globalThis.location.assign("/login");
      })
      .catch(() => {});
  };

  return (
    <div className="flex bg-background min-h-screen">
      <aside className="hidden md:flex md:flex-col bg-[#fafafa] border-r w-64 shrink-0">
        <div className="space-y-2 p-3">
          <Link href="/dashboard/overview" className="block bg-white px-3 py-2 border rounded-md text-sm">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Workspace</div>
            <div className="font-medium text-foreground text-sm truncate">LLLARIK Dashboard</div>
          </Link>
          <div className="relative">
            <Search className="top-1/2 left-2.5 absolute size-3.5 text-muted-foreground -translate-y-1/2 pointer-events-none" />
            <Input
              aria-label="Search dashboard"
              data-testid="dashboard-sidebar-search"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-white pr-8 pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 px-2 overflow-x-hidden overflow-y-auto">
          {(["main", "secondary"] as const).map((group) => {
            const list = filtered.filter((item) => item.group === group);
            if (list.length === 0) return null;
            return (
              <div key={group} className="mb-3">
                <p className="px-2 pb-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                  {group}
                </p>
                <div className="space-y-1">
                  {list.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 hover:bg-primary/5 px-2 rounded-md h-8 text-sm",
                        pathname === item.href && "bg-primary/5 font-medium",
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t">
          <div data-testid="dashboard-sidebar-account" className="bg-white shadow-xs px-2.5 py-2.5 border rounded-xl">
            <div className="flex items-center gap-2.5">
              <Avatar className="border size-8">
                <AvatarFallback title={displayEmail}>{meLoading ? "…" : displayInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs truncate leading-tight" title={displayName || displayEmail}>
                  {meLoading ? "…" : displayName || "Signed in"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight" title={displayEmail}>
                  {meLoading ? "Loading…" : displayEmail || "No email"}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")} aria-label="Account actions">
                    <MoreHorizontal className="size-3.5" />
                  </span>
                </DropdownMenuTrigger>
                <AccountMenu
                  displayName={displayName}
                  displayEmail={displayEmail}
                  showUsersNav={showUsersNav}
                  onSignOut={handleSignOut}
                />
              </DropdownMenu>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-3 px-4 border-b h-16">
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
                    : (visibleItems.find((item) => item.href === pathname)?.label ?? "Page")}
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
              <AccountMenu
                displayName={displayName}
                displayEmail={displayEmail}
                showUsersNav={showUsersNav}
                onSignOut={handleSignOut}
              />
            </DropdownMenu>
          </div>
        </header>
        <Separator />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
