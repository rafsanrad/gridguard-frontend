"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  House,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/services/auth.service";

const sidebarLinks = {
  ADMIN: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Zones",
      href: "/admin/zones",
      icon: MapPin,
    },
    {
      label: "Load Shedding",
      href: "/admin/load-shedding",
      icon: CalendarDays,
    },
    {
      label: "Service Requests",
      href: "/admin/service-requests",
      icon: ClipboardList,
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
  ],

  OPERATOR: [
    {
      label: "Dashboard",
      href: "/operator/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Outages",
      href: "/operator/outages",
      icon: Activity,
    },
    {
      label: "Load Shedding",
      href: "/operator/schedules",
      icon: CalendarDays,
    },
    {
      label: "Service Requests",
      href: "/operator/service-requests",
      icon: ClipboardList,
    },
    {
      label: "Customer Reports",
      href: "/operator/outage-reports",
      icon: ClipboardList,
    },
    {
      label: "Notifications",
      href: "/operator/notifications",
      icon: Bell,
    },
  ],

  CUSTOMER: [
    {
      label: "Dashboard",
      href: "/customer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Report Outage",
      href: "/customer/report-outage",
      icon: Zap,
    },
    {
      label: "My Requests",
      href: "/customer/requests",
      icon: ClipboardList,
    },
    {
      label: "My Area",
      href: "/customer/my-area",
      icon: House,
    },
    {
      label: "Payments",
      href: "/customer/payments",
      icon: CreditCard,
    },
    {
      label: "Notifications",
      href: "/customer/notifications",
      icon: Bell,
    },
  ],
};

interface DashboardSidebarProps {
  role: UserRole;
  onNavigate?: () => void;
}

export default function DashboardSidebar({
  role,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const links = sidebarLinks[role];

  return (
    <aside className="flex h-full min-h-0 flex-col bg-card">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
        <ShieldCheck className="size-6 shrink-0 text-primary" />

        <span className="text-xl font-bold">
          Grid<span className="text-primary">Guard</span>
        </span>
      </div>

      {/* Scrollable navigation */}
      <nav
        aria-label="Dashboard navigation"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4"
      >
        {links.map((link) => {
          const Icon = link.icon;

          const isActive =
            pathname === link.href ||
            (link.href !== `/${role.toLowerCase()}/dashboard` &&
              pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <House className="size-5 shrink-0" />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
