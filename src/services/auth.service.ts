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

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  email: string;
}

export interface VerifyEmailOtpInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
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

  register: (payload: RegisterInput) =>
    apiClient<ApiResponse<unknown>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmail: (payload: VerifyEmailInput) =>
    apiClient<ApiResponse<unknown>>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmailOtp: (payload: VerifyEmailOtpInput) =>
    apiClient<ApiResponse<unknown>>("/auth/verify-email-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: ForgotPasswordInput) =>
    apiClient<ApiResponse<unknown>>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordInput) =>
    apiClient<ApiResponse<unknown>>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
