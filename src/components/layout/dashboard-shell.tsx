"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";

import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserRole } from "@/services/auth.service";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const dashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  OPERATOR: "/operator/dashboard",
  CUSTOMER: "/customer/dashboard",
};

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user, isPending, isError } = useCurrentUser();

  const rolePrefix = user ? `/${user.role.toLowerCase()}` : null;

  const isAuthorizedRoute =
    !!rolePrefix &&
    (pathname === rolePrefix || pathname.startsWith(`${rolePrefix}/`));

  useEffect(() => {
    if (isError) {
      router.replace("/login");
      return;
    }

    if (user && !isAuthorizedRoute) {
      router.replace(dashboardRoutes[user.role]);
    }
  }, [isError, user, isAuthorizedRoute, router]);

  if (isPending || isError || !user || !isAuthorizedRoute) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p role="status" className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh min-w-0">
      {/* Desktop Sidebar */}
      <div className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r md:block">
        <DashboardSidebar role={user.role} />
      </div>

      {/* Main Dashboard Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Navigation Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-6 shrink-0 text-primary" />

            <span className="truncate text-lg font-bold">
              Grid<span className="text-primary">Guard</span>
            </span>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open dashboard menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="h-dvh w-64 max-w-[85vw] overflow-hidden p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard navigation</SheetTitle>
              </SheetHeader>

              <DashboardSidebar
                role={user.role}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Dashboard Topbar */}
        <DashboardHeader user={user} />

        {/* Dashboard Content */}
        <main
          id="dashboard-content"
          className="min-h-0 min-w-0 flex-1 bg-background p-4 sm:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
