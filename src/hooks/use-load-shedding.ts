
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { loadSheddingService } from "@/services/load-shedding.service";

import type {
  LoadSheddingQueryParams,
} from "@/types/load-shedding";

export const loadSheddingQueryKeys = {
  all: ["load-shedding"] as const,

  list: (params: LoadSheddingQueryParams) =>
    ["load-shedding", "list", params] as const,

  detail: (id: string) =>
    ["load-shedding", "detail", id] as const,

  feeders: (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => ["feeders", params] as const,
};

export function useLoadSheddingSchedules(
  params: LoadSheddingQueryParams = {},
) {
  return useQuery({
    queryKey: loadSheddingQueryKeys.list(params),
    queryFn: () => loadSheddingService.getAll(params),
  });
}

export function useLoadSheddingDetails(id?: string) {
  return useQuery({
    queryKey: loadSheddingQueryKeys.detail(id ?? ""),
    queryFn: () => loadSheddingService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useFeeders(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
) {
  return useQuery({
    queryKey: loadSheddingQueryKeys.feeders(params),
    queryFn: () => loadSheddingService.getFeeders(params),
  });
}

export function useCreateLoadShedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loadSheddingService.create,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: loadSheddingQueryKeys.all,
      });
    },
  });
}

export function useUpdateLoadShedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loadSheddingService.update,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: loadSheddingQueryKeys.all,
      });
    },
  });
}

export function useCancelLoadShedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loadSheddingService.cancel,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: loadSheddingQueryKeys.all,
      });
    },
  });
}
