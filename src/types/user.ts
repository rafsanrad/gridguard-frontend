export type UserRole = "ADMIN" | "OPERATOR" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type UserGender = "MALE" | "FEMALE" | "OTHER";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  gender: UserGender | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  areaId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails extends ManagedUser {
  needPasswordChange: boolean;
  area: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  gender?: UserGender;
  role?: UserRole;
  areaId?: string | null;
}

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
