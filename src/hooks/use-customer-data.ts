"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  customerService,
  type CustomerQueryParams,
} from "@/services/customer.service";

export const customerQueryKeys = {
  outageReports: ["customer", "outage-reports"] as const,
  serviceRequests: ["customer", "service-requests"] as const,
  payments: ["customer", "payments"] as const,
  notifications: ["customer", "notifications"] as const,
};

export function useMyOutageReports(params: CustomerQueryParams = {}) {
  return useQuery({
    queryKey: [...customerQueryKeys.outageReports, params],
    queryFn: () => customerService.getMyOutageReports(params),
  });
}

export function useMyServiceRequests(params: CustomerQueryParams = {}) {
  return useQuery({
    queryKey: [...customerQueryKeys.serviceRequests, params],
    queryFn: () => customerService.getMyServiceRequests(params),
  });
}

export function useMyPayments(params: CustomerQueryParams = {}) {
  return useQuery({
    queryKey: [...customerQueryKeys.payments, params],
    queryFn: () => customerService.getMyPayments(params),
  });
}

export function useMyNotifications(params: CustomerQueryParams = {}) {
  return useQuery({
    queryKey: [...customerQueryKeys.notifications, params],
    queryFn: () => customerService.getMyNotifications(params),
  });
}

export function useCreateOutageReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.createOutageReport,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: customerQueryKeys.outageReports,
      });
    },
  });
}
