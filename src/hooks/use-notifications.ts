"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "@/services/notification.service";

import type {
  CreateNotificationPayload,
  NotificationQueryParams,
  RecipientQueryParams,
} from "@/types/notification";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: ["notifications", "list"] as const,
  recipients: ["notifications", "recipients"] as const,
  detail: (id: string) => ["notifications", "detail", id] as const,
};

export function useNotifications(params: NotificationQueryParams = {}) {
  return useQuery({
    queryKey: [...notificationQueryKeys.lists, params],
    queryFn: () => notificationService.getAllNotifications(params),
  });
}

export function useNotificationRecipients(params: RecipientQueryParams = {}) {
  return useQuery({
    queryKey: [...notificationQueryKeys.recipients, params],
    queryFn: () => notificationService.getNotificationRecipients(params),
  });
}

export function useNotificationDetail(id: string | null) {
  return useQuery({
    queryKey: notificationQueryKeys.detail(id ?? ""),
    queryFn: () => notificationService.getNotificationById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) =>
      notificationService.createNotification(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists,
      });
    },
  });
}
