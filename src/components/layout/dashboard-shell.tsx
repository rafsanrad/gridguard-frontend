"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import {
  authService,
  type AuthUser,
  type UserRole,
} from "@/services/auth.service";

const dashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  OPERATOR: "/operator/dashboard",
  CUSTOMER: "/customer/dashboard",
};

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setLoading(true);

      try {
        const response = await authService.getMe();
        if (!active) return;

        const currentUser = response.data;
        const rolePrefix = `/${currentUser.role.toLowerCase()}`;

        if (pathname !== rolePrefix && !pathname.startsWith(`${rolePrefix}/`)) {
          router.replace(dashboardRoutes[currentUser.role]);
          return;
        }

        setUser(currentUser);
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 shrink-0 md:block">
        <DashboardSidebar role={user.role} />
      </div>

      <main className="min-w-0 flex-1 bg-background p-6">{children}</main>
    </div>
  );
}
