"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { serviceRequestService } from "@/services/service-request.service";

import type {
  ServiceRequestQueryParams,
  UpdateServiceRequestPayload,
} from "@/types/service-request";

export const serviceRequestQueryKeys = {
  all: ["service-requests"] as const,

  lists: () => ["service-requests", "list"] as const,

  list: (params: ServiceRequestQueryParams) =>
    ["service-requests", "list", params] as const,

  detail: (id: string) => ["service-requests", "detail", id] as const,
};

export function useServiceRequests(params: ServiceRequestQueryParams = {}) {
  return useQuery({
    queryKey: serviceRequestQueryKeys.list(params),
    queryFn: () => serviceRequestService.getAll(params),
  });
}

export function useServiceRequestDetails(id?: string) {
  return useQuery({
    queryKey: serviceRequestQueryKeys.detail(id ?? ""),
    queryFn: () => serviceRequestService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateServiceRequestPayload;
    }) => serviceRequestService.update(id, payload),

    onSuccess: (_data, variables) => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: serviceRequestQueryKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: ["customer", "service-requests"],
        }),
      ]);
    },
  });
}
