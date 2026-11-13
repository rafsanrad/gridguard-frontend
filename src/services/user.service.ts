import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ManagedUser,
  PaginatedResult,
  UpdateUserPayload,
  UserDetails,
  UserQueryParams,
  UserStatus,
} from "@/types/user";

const ENDPOINT = "/users";

function buildQuery(params: UserQueryParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const userService = {
  async getAll(params: UserQueryParams = {}) {
    const response = await apiClient<
      ApiResponse<ManagedUser[]> & {
        meta: PaginatedResult<ManagedUser>["meta"];
      }
    >(`${ENDPOINT}${buildQuery(params)}`);

    return {
      data: response.data,
      meta: response.meta,
    };
  },

  async getById(id: string) {
    const response = await apiClient<ApiResponse<UserDetails>>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  async update({ id, payload }: { id: string; payload: UpdateUserPayload }) {
    const response = await apiClient<ApiResponse<ManagedUser>>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  },

  async updateStatus({
    id,
    status,
  }: {
    id: string;
    status: Extract<UserStatus, "ACTIVE" | "BLOCKED">;
  }) {
    const response = await apiClient<ApiResponse<ManagedUser>>(
      `${ENDPOINT}/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );

    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient<ApiResponse<ManagedUser>>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    return response.data;
  },
};
