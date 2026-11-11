

import { apiClient } from "@/lib/api-client";
import type {
  CreateOutageReportPayload,
  OutageReport,
  OutageReportDetailResponse,
  OutageReportListResponse,
  OutageReportQueryParams,
} from "@/types/outage-report";

const BASE_URL = "/outage-reports";

function buildQueryString<T extends object>(params: T) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const outageReportService = {
  async getAll(params: OutageReportQueryParams = {}) {
    return apiClient<OutageReportListResponse>(
      `${BASE_URL}${buildQueryString(params)}`,
    );
  },

  async getMyReports(params: OutageReportQueryParams = {}) {
    return apiClient<OutageReportListResponse>(
      `${BASE_URL}/my${buildQueryString(params)}`,
    );
  },

  async getById(id: string) {
    const response = await apiClient<OutageReportDetailResponse>(
      `${BASE_URL}/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  async create(payload: CreateOutageReportPayload) {
    const response = await apiClient<OutageReportDetailResponse>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },
};
