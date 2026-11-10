import { apiClient } from "@/lib/api-client";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface CustomerOutageReport {
  id: string;
  description: string | null;
  location: string | null;
  reportedAt: string;
  customerId: string;
  outageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerServiceRequest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  amount: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CustomerPayment {
  id: string;
  merchantInvoiceNumber: string;
  amount: string;
  currency: string;
  provider: string;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  serviceRequest: {
    id: string;
    title: string;
    status: string;
  };
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const buildQueryString = (params: CustomerQueryParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

export const customerService = {
  getMyOutageReports: (params?: CustomerQueryParams) =>
    apiClient<PaginatedResponse<CustomerOutageReport>>(
      `/outage-reports/my?${buildQueryString(params)}`,
    ),

  getMyServiceRequests: (params?: CustomerQueryParams) =>
    apiClient<PaginatedResponse<CustomerServiceRequest>>(
      `/service-requests/my?${buildQueryString(params)}`,
    ),

  getMyPayments: (params?: CustomerQueryParams) =>
    apiClient<PaginatedResponse<CustomerPayment>>(
      `/payments/my?${buildQueryString(params)}`,
    ),

  getMyNotifications: (params?: CustomerQueryParams) =>
    apiClient<PaginatedResponse<CustomerNotification>>(
      `/notifications/my?${buildQueryString(params)}`,
    ),
};
