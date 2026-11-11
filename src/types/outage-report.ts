import type { Outage } from "@/types/outage";

export interface OutageReportCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface OutageReport {
  id: string;
  description: string | null;
  location: string | null;
  customerId: string;
  outageId: string | null;
  reportedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  customer: OutageReportCustomer;
  outage: Outage | null;
}

export interface OutageReportQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "reportedAt" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateOutageReportPayload {
  description?: string;
  location?: string;
  outageId?: string;
}

export interface OutageReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OutageReportListResponse {
  success: boolean;
  message: string;
  data: OutageReport[];
  meta: OutageReportPagination;
}

export interface OutageReportDetailResponse {
  success: boolean;
  message: string;
  data: OutageReport;
}
