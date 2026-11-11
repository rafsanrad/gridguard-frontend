"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { outageService } from "@/services/outage.service";

import type { OutageQueryParams } from "@/types/outage";

export const outageQueryKeys = {
  all: ["outages"] as const,

  list: (params: OutageQueryParams) => ["outages", "list", params] as const,

  detail: (id: string) => ["outages", "detail", id] as const,
};

export function useOutages(params: OutageQueryParams = {}) {
  return useQuery({
    queryKey: outageQueryKeys.list(params),
    queryFn: () => outageService.getAll(params),
  });
}

export function useOutageDetails(id?: string) {
  return useQuery({
    queryKey: outageQueryKeys.detail(id ?? ""),
    queryFn: () => outageService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateOutage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: outageService.create,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outageQueryKeys.all,
      });
    },
  });
}

export function useUpdateOutage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: outageService.update,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outageQueryKeys.all,
      });
    },
  });
}

export function useUpdateOutageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: outageService.updateStatus,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outageQueryKeys.all,
      });
    },
  });
}

export function useDeleteOutage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: outageService.remove,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outageQueryKeys.all,
      });
    },
  });
}
