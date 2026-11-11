export type ScheduleStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface Feeder {
  id: string;
  name: string;
  code: string;
  voltageLevel: string | null;
  isActive: boolean;
  substationId: string;
}

export interface LoadSheddingSchedule {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  status: ScheduleStatus;
  reason: string | null;
  isNotificationSent: boolean;
  feederId: string;
  feeder: Feeder;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoadSheddingQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  feederId?: string;
}

export interface CreateLoadSheddingPayload {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  feederId: string;
}

export type UpdateLoadSheddingPayload = Partial<
  Omit<CreateLoadSheddingPayload, "feederId">
>;

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
