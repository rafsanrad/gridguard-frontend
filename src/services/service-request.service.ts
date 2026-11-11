import { apiClient } from "@/lib/api-client";

import type {
  ServiceRequest,
  ServiceRequestDetailResponse,
  ServiceRequestListResponse,
  ServiceRequestQueryParams,
  UpdateServiceRequestPayload,
} from "@/types/service-request";

const BASE_URL = "/service-requests";

function buildQueryString(params: ServiceRequestQueryParams = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export const serviceRequestService = {
  getAll: (params: ServiceRequestQueryParams = {}) => {
    const query = buildQueryString(params);

    return apiClient<ServiceRequestListResponse>(
      `${BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const response = await apiClient<ServiceRequestDetailResponse>(
      `${BASE_URL}/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  update: async (
    id: string,
    payload: UpdateServiceRequestPayload,
  ): Promise<ServiceRequest> => {
    const response = await apiClient<ServiceRequestDetailResponse>(
      `${BASE_URL}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },
};
