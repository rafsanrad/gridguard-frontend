"use client";

import { Suspense } from "react";
import UserManagement from "@/components/dashboard/user-management";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96" />}>
      <UserManagement />
    </Suspense>
  );
}
