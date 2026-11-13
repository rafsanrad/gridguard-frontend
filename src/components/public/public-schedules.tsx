"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useFeeders,
  useLoadSheddingSchedules,
} from "@/hooks/use-load-shedding";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 9;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300";
    case "ONGOING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function formatDuration(start: string, end: string) {
  const milliseconds = new Date(end).getTime() - new Date(start).getTime();

  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "Not available";
  }

  const totalMinutes = Math.round(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
}

function SchedulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const feederId = searchParams.get("feederId") ?? "";

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

      router.replace(query ? `/schedules?${query}` : "/schedules", {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search, searchParams, router]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();

    router.push(query ? `/schedules?${query}` : "/schedules", {
      scroll: false,
    });
  }

  const schedulesQuery = useLoadSheddingSchedules({
    page,
    limit: PAGE_SIZE,
    search,
    feederId: feederId || undefined,
    sortBy: "startDateTime",
    sortOrder: "desc",
  });

  const feedersQuery = useFeeders({
    page: 1,
    limit: 100,
  });

  const schedules = schedulesQuery.data?.data ?? [];
  const meta = schedulesQuery.data?.meta;
  const feeders = feedersQuery.data?.data ?? [];

  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <Badge variant="secondary" className="mb-5">
            <CalendarClock className="mr-1 size-3.5" />
            GridGuard Schedule Center
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Load Shedding Schedules
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Plan ahead with scheduled electricity interruption information.
            Browse affected feeders, scheduled start and end times, and
            maintenance details. All times use Bangladesh Standard Time (UTC+6).
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/outages" />}>
              View Power Outages
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Electricity Schedules
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              View planned, ongoing, completed, and cancelled schedules.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={schedulesQuery.isFetching}
            onClick={() => void schedulesQuery.refetch()}
          >
            <RefreshCw
              className={`size-4 ${
                schedulesQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search schedules..."
              className="pl-9"
              aria-label="Search schedules"
            />
          </div>

          <select
            aria-label="Filter schedules by feeder"
            value={feederId}
            onChange={(event) =>
              updateParams({
                feederId: event.target.value || null,
                page: null,
              })
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Feeders</option>

            {feederId && !feeders.some((feeder) => feeder.id === feederId) && (
              <option value={feederId}>Selected Feeder</option>
            )}

            {feeders.map((feeder) => (
              <option key={feeder.id} value={feeder.id}>
                {feeder.name} ({feeder.code})
              </option>
            ))}
          </select>
        </div>

        {schedulesQuery.isPending ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : schedulesQuery.isError ? (
          <div className="rounded-xl border p-12 text-center">
            <p className="font-medium text-destructive">
              Unable to load schedules.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again. Public API access may need to be enabled.
            </p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => void schedulesQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-xl border px-6 py-16 text-center">
            <CalendarClock className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No schedules found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No load shedding schedules match your filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="flex h-full flex-col">
                <CardHeader className="space-y-3">
                  <div>
                    <Badge
                      variant="outline"
                      className={getStatusStyle(schedule.status)}
                    >
                      {schedule.status}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg leading-snug">
                    {schedule.title}
                  </CardTitle>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {schedule.feeder.name} ({schedule.feeder.code})
                  </p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-5">
                  {schedule.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {schedule.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-3 border-t pt-4 text-sm">
                    <div className="flex items-start gap-3">
                      <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Scheduled Start</p>
                        <p className="font-medium">
                          {formatDate(schedule.startDateTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Scheduled End</p>
                        <p className="font-medium">
                          {formatDate(schedule.endDateTime)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Planned Duration</p>
                      <p className="font-medium">
                        {formatDuration(
                          schedule.startDateTime,
                          schedule.endDateTime,
                        )}
                      </p>
                    </div>

                    {schedule.reason && (
                      <div>
                        <p className="text-muted-foreground">Reason</p>
                        <p className="font-medium">{schedule.reason}</p>
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
              Page {meta.page} of {meta.totalPages} ({meta.total} schedules)
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || schedulesQuery.isFetching}
                onClick={() =>
                  updateParams({
                    page: page > 2 ? String(page - 1) : null,
                  })
                }
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages || schedulesQuery.isFetching}
                onClick={() => updateParams({ page: String(page + 1) })}
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

export default function PublicSchedules() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl space-y-5 p-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      }
    >
      <SchedulesContent />
    </Suspense>
  );
}
