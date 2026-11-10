import { apiClient } from "@/lib/api-client";

export type UserRole = "ADMIN" | "OPERATOR" | "CUSTOMER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  login: (payload: LoginInput) =>
    apiClient<
      ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>
    >("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => apiClient<ApiResponse<AuthUser>>("/auth/me"),

  logout: () =>
  apiClient<ApiResponse<null>>("/auth/logout", {
    method: "POST",
  }),
};
