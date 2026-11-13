import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CreateZonePayload,
  PaginatedResult,
  UpdateZonePayload,
  Zone,
  ZoneQueryParams,
} from "@/types/zone";

const ENDPOINT = "/zones";

function buildQuery(params: ZoneQueryParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const zoneService = {
  async getAll(params: ZoneQueryParams = {}) {
    const response = await apiClient<
      ApiResponse<Zone[]> & {
        meta: PaginatedResult<Zone>["meta"];
      }
    >(`${ENDPOINT}${buildQuery(params)}`);

    return {
      data: response.data,
      meta: response.meta,
    };
  },

  async getById(id: string) {
    const response = await apiClient<ApiResponse<Zone>>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  async create(payload: CreateZonePayload) {
    const response = await apiClient<ApiResponse<Zone>>(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  async update({ id, payload }: { id: string; payload: UpdateZonePayload }) {
    const response = await apiClient<ApiResponse<Zone>>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient<ApiResponse<Zone>>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    return response.data;
  },
};
