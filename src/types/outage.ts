export type OutageType = "PLANNED" | "UNPLANNED";

export type OutageStatus =
  | "REPORTED"
  | "ACKNOWLEDGED"
  | "ASSIGNED"
  | "INVESTIGATING"
  | "REPAIRING"
  | "RESTORED"
  | "CLOSED";

export interface OutageFeeder {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface OutageReporter {
  id: string;
  name: string;
  email: string;
}

export interface Outage {
  id: string;
  title: string;
  description: string | null;
  type: OutageType;
  status: OutageStatus;
  startedAt: string;
  estimatedRestoredAt: string | null;
  restoredAt: string | null;
  cause: string | null;
  affectedCustomers: number | null;
  feederId: string;
  feeder: OutageFeeder;
  reportedById: string;
  reportedBy: OutageReporter;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateOutagePayload {
  title: string;
  description?: string;
  type: OutageType;
  startedAt: string;
  estimatedRestoredAt?: string;
  cause?: string;
  affectedCustomers?: number;
  feederId: string;
}

export interface UpdateOutagePayload {
  title?: string;
  description?: string;
  estimatedRestoredAt?: string;
  cause?: string;
  affectedCustomers?: number;
}

export interface UpdateOutageStatusPayload {
  status: OutageStatus;
  notes?: string;
}

export interface OutageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | "title"
    | "type"
    | "status"
    | "startedAt"
    | "estimatedRestoredAt"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const OUTAGE_STATUSES: OutageStatus[] = [
  "REPORTED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "INVESTIGATING",
  "REPAIRING",
  "RESTORED",
  "CLOSED",
];

export const NEXT_OUTAGE_STATUS: Record<OutageStatus, OutageStatus | null> = {
  REPORTED: "ACKNOWLEDGED",
  ACKNOWLEDGED: "ASSIGNED",
  ASSIGNED: "INVESTIGATING",
  INVESTIGATING: "REPAIRING",
  REPAIRING: "RESTORED",
  RESTORED: "CLOSED",
  CLOSED: null,
};
