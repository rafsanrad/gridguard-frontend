import { apiClient } from "@/lib/api-client";
import type { AnalyticsResponse } from "@/types/analytics";

export const analyticsService = {
  getDashboardAnalytics: () =>
    apiClient<AnalyticsResponse>("/analytics/dashboard"),
};
