"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";

import { useOutages } from "@/hooks/use-outages";
import type { OutageStatus } from "@/types/outage";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 9;

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ status }: { status: OutageStatus }) {
  const styles: Record<OutageStatus, string> = {
    REPORTED:
      "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    ACKNOWLEDGED:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    ASSIGNED:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    INVESTIGATING:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    REPAIRING:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    RESTORED:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    CLOSED: "bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function OutagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [searchInput, setSearchInput] = useState(search);
  const [previousSearch, setPreviousSearch] = useState(search);

  if (search !== previousSearch) {
    setPreviousSearch(search);
    setSearchInput(search);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed === search) return;

      const params = new URLSearchParams(searchParams.toString());

      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }

      params.delete("page");

      const query = params.toString();

      router.replace(query ? `/outages?${query}` : "/outages", {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search, searchParams, router]);

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }

    const query = params.toString();

    router.push(query ? `/outages?${query}` : "/outages", {
      scroll: false,
    });
  }

  const outagesQuery = useOutages({
    page,
    limit: PAGE_SIZE,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const outages = outagesQuery.data?.data ?? [];
  const meta = outagesQuery.data?.meta;

  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <Badge variant="secondary" className="mb-5">
            <Activity className="mr-1 size-3.5" />
            GridGuard Outage Center
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Power Outage Updates
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stay informed about reported electricity outages, affected feeders,
            and estimated restoration times. All displayed times use Bangladesh
            Standard Time (UTC+6).
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/schedules" />}>
              View Load Shedding Schedules
              <ArrowRight className="size-4" />
            </Button>

            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/login" />}
            >
              Report an Outage
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Reported Outages
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse outage information published in GridGuard.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={outagesQuery.isFetching}
            onClick={() => void outagesQuery.refetch()}
          >
            <RefreshCw
              className={`size-4 ${
                outagesQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search outages..."
            className="pl-9"
            aria-label="Search outages"
          />
        </div>

        {outagesQuery.isPending ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : outagesQuery.isError ? (
          <div className="rounded-xl border p-12 text-center">
            <p className="font-medium text-destructive">
              Unable to load outage information.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again. Public API access may need to be enabled.
            </p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => void outagesQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : outages.length === 0 ? (
          <div className="rounded-xl border px-6 py-16 text-center">
            <Zap className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No outages found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No outage records match your current search.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {outages.map((outage) => (
              <Card key={outage.id} className="flex h-full flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{outage.type}</Badge>
                    <StatusBadge status={outage.status} />
                  </div>

                  <CardTitle className="text-lg leading-snug">
                    {outage.title}
                  </CardTitle>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {outage.feeder.name} ({outage.feeder.code})
                  </p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-5">
                  {outage.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {outage.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-3 border-t pt-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Outage Started</p>
                        <p className="font-medium">
                          {formatDate(outage.startedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-muted-foreground">
                          Estimated Restoration
                        </p>
                        <p className="font-medium">
                          {formatDate(outage.estimatedRestoredAt)}
                        </p>
                      </div>
                    </div>

                    {outage.restoredAt && (
                      <div>
                        <p className="text-muted-foreground">Restored At</p>
                        <p className="font-medium">
                          {formatDate(outage.restoredAt)}
                        </p>
                      </div>
                    )}

                    {outage.affectedCustomers != null && (
                      <div>
                        <p className="text-muted-foreground">
                          Affected Customers
                        </p>
                        <p className="font-medium">
                          {outage.affectedCustomers.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages} ({meta.total} outages)
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || outagesQuery.isFetching}
                onClick={() => changePage(page - 1)}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages || outagesQuery.isFetching}
                onClick={() => changePage(page + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PublicOutages() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl space-y-5 p-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      }
    >
      <OutagesContent />
    </Suspense>
  );
}
