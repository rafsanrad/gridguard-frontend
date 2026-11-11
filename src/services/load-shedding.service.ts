
import { apiClient } from "@/lib/api-client";
import type {
  CreateLoadSheddingPayload,
  Feeder,
  LoadSheddingQueryParams,
  LoadSheddingSchedule,
  PaginatedResult,
  UpdateLoadSheddingPayload,
} from "@/types/load-shedding";

// API response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Feeder query parameters
interface FeederQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Build query string from an object
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

// API endpoints
// These paths are relative to NEXT_PUBLIC_API_URL.
// Verify that they match your Express router mount paths.
const LOAD_SHEDDING_ENDPOINT = "/load-shedding";
const FEEDER_ENDPOINT = "/feeders";

export const loadSheddingService = {
  // Get all load shedding schedules
  async getAll(params: LoadSheddingQueryParams = {}) {
    const query = buildQueryString(params);

    const response = await apiClient<
      ApiResponse<PaginatedResult<LoadSheddingSchedule>>
    >(`${LOAD_SHEDDING_ENDPOINT}${query}`);

    return response.data;
  },

  // Get single load shedding schedule
  async getById(id: string) {
    const response = await apiClient<ApiResponse<LoadSheddingSchedule>>(
      `${LOAD_SHEDDING_ENDPOINT}/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  // Create load shedding schedule
  async create(payload: CreateLoadSheddingPayload) {
    const response = await apiClient<ApiResponse<LoadSheddingSchedule>>(
      LOAD_SHEDDING_ENDPOINT,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },

  // Update load shedding schedule
  async update({
    id,
    payload,
  }: {
    id: string;
    payload: UpdateLoadSheddingPayload;
  }) {
    const response = await apiClient<ApiResponse<LoadSheddingSchedule>>(
      `${LOAD_SHEDDING_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },

  // Cancel load shedding schedule
  // Backend uses soft cancellation (status = CANCELLED)
  async cancel(id: string) {
    const response = await apiClient<ApiResponse<LoadSheddingSchedule>>(
      `${LOAD_SHEDDING_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  },

  // Get active feeders
  async getFeeders(params: FeederQueryParams = {}) {
    const query = buildQueryString(params);

    const response = await apiClient<ApiResponse<PaginatedResult<Feeder>>>(
      `${FEEDER_ENDPOINT}${query}`,
    );

    return response.data;
  },
};
