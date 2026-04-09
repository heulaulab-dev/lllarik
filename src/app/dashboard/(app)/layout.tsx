"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
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

const items = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Boxes },
  { href: "/dashboard/copy", label: "Copy", icon: FileText },
  { href: "/dashboard/releases", label: "Releases", icon: Megaphone },
  { href: "/", label: "Landing", icon: BarChart3 },
];

export default function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const logout = useDashboardLogout();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/dashboard/login");
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <Link
            href="/dashboard/overview"
            className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
          >
            LLLARIK Dashboard
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Content Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => {
              logout.mutate();
              router.push("/dashboard/login");
            }}
          >
            <LogOut />
            Sign out
          </Button>
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
                <DropdownMenuItem
                  onClick={() => {
                    logout.mutate();
                    router.push("/dashboard/login");
                  }}
                >
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
