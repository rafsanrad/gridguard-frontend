"use client";

import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";

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

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b bg-card px-4 py-3 sm:px-6">
      <div>
        <h2 className="text-lg font-semibold capitalize">{pageTitle}</h2>
        <p className="text-xs text-muted-foreground">
          {user.role.toLowerCase()} workspace
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />

        <div className="flex items-center gap-2 border-l pl-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="size-5 text-primary" />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
