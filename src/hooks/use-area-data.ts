"use client";

import { useQuery } from "@tanstack/react-query";

import { areaService, type ScheduleQueryParams } from "@/services/area.service";

export const areaQueryKeys = {
  area: (areaId: string) => ["area", areaId] as const,

  schedules: (params: ScheduleQueryParams) =>
    ["load-shedding", params] as const,
};

export function useAreaDetails(areaId?: string | null) {
  return useQuery({
    queryKey: areaQueryKeys.area(areaId ?? ""),

    queryFn: () => areaService.getAreaById(areaId!),

    enabled: Boolean(areaId),
  });
}

export function useAreaSchedules(params?: ScheduleQueryParams) {
  return useQuery({
    queryKey: [
      "load-shedding",
      params?.feederId ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
      params?.sortBy ?? "startDateTime",
      params?.sortOrder ?? "asc",
    ],

    queryFn: () => areaService.getSchedules(params!),

    enabled: Boolean(params?.feederId),
  });
}
