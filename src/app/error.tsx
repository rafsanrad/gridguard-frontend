"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("GridGuard application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="size-10 text-destructive" />
          </div>

          <CardTitle className="text-2xl">Something went wrong</CardTitle>

          <CardDescription>
            We couldn&apos;t load this page. Please try again.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => reset()}>
            <RefreshCw className="size-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <Home className="size-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
