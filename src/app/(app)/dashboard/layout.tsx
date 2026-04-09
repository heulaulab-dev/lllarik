"use client";

import { useEffect } from "react";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardAuthStore } from "@/lib/dashboardStore";
import { useDashboardLogout } from "@/lib/dashboardService";

type SidebarGroupKey = "main" | "secondary";

const items = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, group: "main" },
  { href: "/dashboard/products", label: "Products", icon: Boxes, group: "main" },
  { href: "/dashboard/copy", label: "Copy", icon: FileText, group: "main" },
  { href: "/dashboard/releases", label: "Releases", icon: Megaphone, group: "secondary" },
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

export default function DashboardAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const logout = useDashboardLogout();
  const handleSignOut = () => {
    logout.mutate();
    router.push("/login");
  };

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r bg-[#fafafa]">
        <SidebarHeader className="gap-1.5 p-3">
          <Link href="/dashboard/overview" className="rounded-md border bg-white px-3 py-2 text-sm">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Workspace</div>
            <div className="truncate text-sm font-medium text-foreground">LLLARIK Dashboard</div>
          </Link>
          <button
            type="button"
            aria-label="Search dashboard"
            aria-disabled="true"
            onClick={(event) => event.preventDefault()}
            data-testid="dashboard-sidebar-search"
            className="flex w-full items-center gap-2 rounded-md border bg-white px-2.5 py-2 text-xs text-muted-foreground opacity-70"
          >
            <Search className="size-3.5" />
            <span>Search</span>
            <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px]">/</kbd>
          </button>
        </SidebarHeader>
        <SidebarContent>
          {groupOrder.map((group, index) => (
            <div key={group}>
              {index > 0 && <SidebarSeparator />}
              <SidebarGroup className={group === "main" ? "pt-0" : "pt-1"}>
                <SidebarGroupLabel className="h-7 px-2 text-[11px] font-semibold uppercase tracking-wide">
                  {groupLabels[group]}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {itemsByGroup[group].map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={pathname === item.href}
                          tooltip={item.label}
                          className="h-8 px-2"
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-3 pt-2">
          <div
            data-testid="dashboard-sidebar-account"
            className="flex items-center gap-2 rounded-md border bg-white px-2 py-2"
          >
            <Avatar className="size-7">
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium leading-tight">Account</p>
              <p className="truncate text-[11px] text-muted-foreground leading-tight">Manage profile</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleSignOut}
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="More account options"
              disabled
              className="h-7 w-7"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="h-16 border-b flex items-center px-4 gap-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/dashboard/overview" />}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{items.find((i) => i.href === pathname)?.label ?? "Page"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                  <Avatar className="size-8">
                    <AvatarFallback>AD</AvatarFallback>
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
  );
}
