"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("GridGuard dashboard error:", error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="size-10 text-destructive" />
          </div>

          <CardTitle className="text-2xl">Dashboard unavailable</CardTitle>

          <CardDescription>
            Something went wrong while loading this dashboard. Your account and
            data have not been changed.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full" onClick={() => reset()}>
            <RefreshCw className="size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
