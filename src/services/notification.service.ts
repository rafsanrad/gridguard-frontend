import { apiClient } from "@/lib/api-client";

import type {
  ApiResponse,
  CreateNotificationPayload,
  Notification,
  NotificationQueryParams,
  NotificationRecipient,
  PaginatedResponse,
  RecipientQueryParams,
} from "@/types/notification";

const buildQueryString = (params: NotificationQueryParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
};

export const notificationService = {
  getAllNotifications: (params: NotificationQueryParams = {}) => {
    const query = buildQueryString(params);

    return apiClient<PaginatedResponse<Notification>>(
      `/notifications${query ? `?${query}` : ""}`,
    );
  },

  getNotificationRecipients: (params: RecipientQueryParams = {}) => {
    const query = buildQueryString(params);

    return apiClient<PaginatedResponse<NotificationRecipient>>(
      `/users/recipients${query ? `?${query}` : ""}`,
    );
  },

  getNotificationById: (id: string) => {
    return apiClient<ApiResponse<Notification>>(`/notifications/${id}`);
  },

  createNotification: (payload: CreateNotificationPayload) => {
    return apiClient<ApiResponse<Notification>>("/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
