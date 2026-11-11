import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CreateOutagePayload,
  Outage,
  OutageQueryParams,
  PaginatedResult,
  UpdateOutagePayload,
  UpdateOutageStatusPayload,
} from "@/types/outage";

const OUTAGE_ENDPOINT = "/outages";

function buildQueryString<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export const outageService = {
  async getAll(params: OutageQueryParams = {}) {
    const query = buildQueryString(params);

    const response = await apiClient<ApiResponse<PaginatedResult<Outage>>>(
      `${OUTAGE_ENDPOINT}${query}`,
    );

    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient<ApiResponse<Outage>>(
      `${OUTAGE_ENDPOINT}/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  async create(payload: CreateOutagePayload) {
    const response = await apiClient<ApiResponse<Outage>>(OUTAGE_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  async update({ id, payload }: { id: string; payload: UpdateOutagePayload }) {
    const response = await apiClient<ApiResponse<Outage>>(
      `${OUTAGE_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },

  async updateStatus({
    id,
    payload,
  }: {
    id: string;
    payload: UpdateOutageStatusPayload;
  }) {
    const response = await apiClient<ApiResponse<Outage>>(
      `${OUTAGE_ENDPOINT}/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient<ApiResponse<Outage>>(
      `${OUTAGE_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  },
};
