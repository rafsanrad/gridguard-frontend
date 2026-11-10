"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authService.getMe();
      return response.data;
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}
