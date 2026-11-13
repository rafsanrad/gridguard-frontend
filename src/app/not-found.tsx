import Link from "next/link";
import { ArrowLeft, Home, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-5">
        <Zap className="size-10 text-primary" />
      </div>

      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Error 404
      </p>

      <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">
        Page Not Found
      </h1>

      <p className="mt-5 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back to GridGuard.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          <Home className="size-4" />
          Back to Home
        </Button>

        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          <ArrowLeft className="size-4" />
          Go to Login
        </Button>
      </div>
    </main>
  );
}
