export type ServiceRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface ServiceRequestCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface ServiceRequestPayment {
  id: string;
  amount: string;
  currency: string;
  provider: string;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  status: ServiceRequestStatus;
  amount: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  customer: ServiceRequestCustomer;
  payments: ServiceRequestPayment[];
}

export interface ServiceRequestQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | "title"
    | "status"
    | "amount"
    | "createdAt"
    | "updatedAt"
    | "completedAt";
  sortOrder?: "asc" | "desc";
}

export interface UpdateServiceRequestPayload {
  title?: string;
  description?: string;
  status?: ServiceRequestStatus;
}

export interface ServiceRequestPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ServiceRequestListResponse {
  success: boolean;
  message: string;
  data: ServiceRequest[];
  meta: ServiceRequestPagination;
}

export interface ServiceRequestDetailResponse {
  success: boolean;
  message: string;
  data: ServiceRequest;
}
