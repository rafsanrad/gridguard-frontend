"use client";

import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";

import LogoutButton from "@/components/auth/logout-button";
import ModeToggle from "@/components/shared/mode-toggle";

import type { AuthUser } from "@/services/auth.service";

interface DashboardHeaderProps {
  user: AuthUser;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();

  const pageTitle =
    pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ??
    "Dashboard";

  const workspaceName = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <header className="flex min-h-16 min-w-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 sm:flex-nowrap sm:px-6">
      {/* Page information */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold capitalize sm:text-lg">
          {pageTitle}
        </h2>

        <p className="truncate text-xs text-muted-foreground">
          {workspaceName} workspace
        </p>
      </div>

      {/* Header actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <ModeToggle />

        {/* Logout */}
        <LogoutButton />

        {/* User profile */}
        <div className="flex min-w-0 items-center gap-2 border-l pl-2 sm:pl-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10"
            aria-hidden="true"
          >
            <UserRound className="size-5 text-primary" />
          </div>

          <div className="hidden min-w-0 md:block">
            <p className="max-w-36 truncate text-sm font-medium">{user.name}</p>

            <p className="text-xs text-muted-foreground">{workspaceName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
