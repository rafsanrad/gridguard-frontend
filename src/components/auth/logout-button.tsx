"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // 1. Clear authentication cookies through the backend
      await authService.logout();

      // 2. Clear all user-specific cached data
      queryClient.clear();

      // 3. Redirect to login
      toast.success("Logged out successfully");

      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoggingOut}
      onClick={handleLogout}
      className="gap-2"
    >
      <LogOut className="size-4" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
