"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/services/user.service";
import type { UserQueryParams } from "@/types/user";

export const userQueryKeys = {
  all: ["users"] as const,
  list: (params: UserQueryParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

export function useUsers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => userService.getAll(params),
  });
}

export function useUserDetails(id?: string) {
  return useQuery({
    queryKey: userQueryKeys.detail(id ?? ""),
    queryFn: () => userService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.update,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.all,
      }),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.all,
      }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.all,
      }),
  });
}
