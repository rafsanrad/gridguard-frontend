"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { outageReportService } from "@/services/outage-report.service";

import type { OutageReportQueryParams } from "@/types/outage-report";

export const outageReportKeys = {
  all: ["outage-reports"] as const,

  lists: () => ["outage-reports", "list"] as const,

  list: (params: OutageReportQueryParams) =>
    ["outage-reports", "list", params] as const,

  myReports: (params: OutageReportQueryParams) =>
    ["outage-reports", "my", params] as const,

  detail: (id: string) => ["outage-reports", "detail", id] as const,
};

export function useOutageReports(params: OutageReportQueryParams = {}) {
  return useQuery({
    queryKey: outageReportKeys.list(params),
    queryFn: () => outageReportService.getAll(params),
  });
}

export function useMyOutageReports(params: OutageReportQueryParams = {}) {
  return useQuery({
    queryKey: outageReportKeys.myReports(params),
    queryFn: () => outageReportService.getMyReports(params),
  });
}

export function useOutageReportDetails(id?: string) {
  return useQuery({
    queryKey: outageReportKeys.detail(id ?? ""),
    queryFn: () => outageReportService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateOutageReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: outageReportService.create,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outageReportKeys.all,
      });
    },
  });
}
