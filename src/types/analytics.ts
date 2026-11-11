export interface AnalyticsSummary {
  totalOutages: number;
  activeOutages: number;
  restoredOutages: number;
  totalSchedules: number;
  upcomingSchedules: number;
  totalServiceRequests: number;
  pendingServiceRequests: number;
  totalPayments: number;
  successfulPayments: number;
  totalRevenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardAnalytics {
  summary: AnalyticsSummary;
  outagesByStatus: StatusCount[];
  serviceRequestsByStatus: StatusCount[];
}

export interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: DashboardAnalytics;
}
