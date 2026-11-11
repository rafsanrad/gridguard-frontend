export type NotificationType =
  | "LOAD_SHEDDING"
  | "OUTAGE"
  | "SERVICE_REQUEST"
  | "PAYMENT"
  | "SYSTEM";

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: NotificationRecipient;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type RecipientQueryParams = NotificationQueryParams;

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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
