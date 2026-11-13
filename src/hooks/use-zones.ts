"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { zoneService } from "@/services/zone.service";
import type { ZoneQueryParams } from "@/types/zone";

export const zoneQueryKeys = {
  all: ["zones"] as const,
  list: (params: ZoneQueryParams) => ["zones", "list", params] as const,
  detail: (id: string) => ["zones", "detail", id] as const,
};

export function useZones(params: ZoneQueryParams = {}) {
  return useQuery({
    queryKey: zoneQueryKeys.list(params),
    queryFn: () => zoneService.getAll(params),
  });
}

export function useZoneDetails(id?: string) {
  return useQuery({
    queryKey: zoneQueryKeys.detail(id ?? ""),
    queryFn: () => zoneService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: zoneService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: zoneQueryKeys.all,
      }),
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: zoneService.update,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: zoneQueryKeys.all,
      }),
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: zoneService.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: zoneQueryKeys.all,
      }),
  });
}
