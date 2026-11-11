"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";

export const analyticsQueryKeys = {
  dashboard: ["analytics", "dashboard"] as const,
};

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: analyticsQueryKeys.dashboard,
    queryFn: analyticsService.getDashboardAnalytics,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
