"use client";

import { Suspense } from "react";
import ZoneManagement from "@/components/dashboard/zone-management";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminZonesPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96" />}>
      <ZoneManagement />
    </Suspense>
  );
}
