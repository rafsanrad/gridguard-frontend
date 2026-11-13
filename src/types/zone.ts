export interface Zone {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ZoneQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateZonePayload {
  name: string;
  code: string;
  description?: string;
}

export type UpdateZonePayload = Partial<CreateZonePayload> & {
  isActive?: boolean;
};

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
