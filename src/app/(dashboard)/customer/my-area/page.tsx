"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  House,
  MapPin,
  Network,
  RefreshCw,
  Zap,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useAreaDetails, useAreaSchedules } from "@/hooks/use-area-data";
import type { LoadSheddingSchedule } from "@/services/area.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DisplayStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type ScheduleFilter = "ALL" | "UPCOMING" | "IN_PROGRESS" | "HISTORY";

const PAGE_SIZE = 10;

function getDisplayStatus(
  schedule: LoadSheddingSchedule,
  now: number,
): DisplayStatus {
  if (schedule.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (schedule.status === "COMPLETED") {
    return "COMPLETED";
  }

  const start = new Date(schedule.startDateTime).getTime();
  const end = new Date(schedule.endDateTime).getTime();

  if (now >= end) {
    return "COMPLETED";
  }

  if (now >= start) {
    return "IN_PROGRESS";
  }

  return "UPCOMING";
}

function getStatusPriority(status: DisplayStatus): number {
  switch (status) {
    case "IN_PROGRESS":
      return 0;
    case "UPCOMING":
      return 1;
    case "COMPLETED":
      return 2;
    case "CANCELLED":
      return 3;
  }
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatDuration(start: string, end: string): string {
  const milliseconds = new Date(end).getTime() - new Date(start).getTime();

  const minutes = Math.max(0, Math.floor(milliseconds / 60000));

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) {
    return `${hours}h ${remainingMinutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${remainingMinutes}m`;
}

function ScheduleStatusBadge({ status }: { status: DisplayStatus }) {
  const config: Record<DisplayStatus, { label: string; className: string }> = {
    UPCOMING: {
      label: "Upcoming",
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    },
    COMPLETED: {
      label: "Past",
      className: "border-border bg-muted text-muted-foreground",
    },
    CANCELLED: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    },
  };

  return (
    <Badge variant="outline" className={config[status].className}>
      {config[status].label}
    </Badge>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-medium">{value || "N/A"}</span>
    </div>
  );
}

export default function MyAreaPage() {
  const [page, setPage] = useState(1);

  const [filter, setFilter] = useState<ScheduleFilter>("ALL");

  const [now, setNow] = useState<number | null>(null);

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      setNow(Date.now());
    };

    const timeout = window.setTimeout(updateTime, 0);

    const interval = window.setInterval(updateTime, 60_000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  // Current user
  const {
    data: user,
    isPending: userPending,
    isError: userError,
    refetch: refetchUser,
  } = useCurrentUser();

  const areaId = user?.areaId;

  // Customer's area
  const areaQuery = useAreaDetails(areaId);

  const area = areaQuery.data?.data;

  // Load shedding schedules for assigned feeder
  const schedulesQuery = useAreaSchedules(
    area?.feederId
      ? {
          feederId: area.feederId,
          page,
          limit: PAGE_SIZE,
          sortBy: "startDateTime",
          sortOrder: "asc",
        }
      : undefined,
  );

  // Schedule statuses and sorting
  const schedules =
    now === null
      ? []
      : [...(schedulesQuery.data?.data ?? [])]
          .map((schedule) => ({
            ...schedule,
            displayStatus: getDisplayStatus(schedule, now),
          }))
          .sort((a, b) => {
            const priorityDifference =
              getStatusPriority(a.displayStatus) -
              getStatusPriority(b.displayStatus);

            if (priorityDifference !== 0) {
              return priorityDifference;
            }

            const aStart = new Date(a.startDateTime).getTime();

            const bStart = new Date(b.startDateTime).getTime();

            if (
              a.displayStatus === "COMPLETED" ||
              a.displayStatus === "CANCELLED"
            ) {
              return bStart - aStart;
            }

            return aStart - bStart;
          });

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    if (filter === "ALL") {
      return true;
    }

    if (filter === "HISTORY") {
      return (
        schedule.displayStatus === "COMPLETED" ||
        schedule.displayStatus === "CANCELLED"
      );
    }

    return schedule.displayStatus === filter;
  });

  // Pagination
  const totalPages = schedulesQuery.data?.meta?.totalPages ?? 1;

  const totalSchedules = schedulesQuery.data?.meta?.total ?? 0;

  // Counts on current page
  const upcomingCount = schedules.filter(
    (schedule) => schedule.displayStatus === "UPCOMING",
  ).length;

  const activeCount = schedules.filter(
    (schedule) => schedule.displayStatus === "IN_PROGRESS",
  ).length;

  // Loading state
  if (userPending || (areaId && areaQuery.isPending)) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  // User API error
  if (userError) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">My Area</h1>

        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3">
            <p className="text-sm text-destructive">
              Failed to load your account information.
            </p>

            <Button variant="outline" onClick={() => void refetchUser()}>
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // No assigned area
  if (!areaId) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">My Area</h1>

        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <MapPin className="size-10 text-muted-foreground" />

            <p className="font-medium">No area assigned</p>

            <p className="max-w-md text-sm text-muted-foreground">
              Your account is not currently linked to an electricity service
              area. Please contact an administrator to assign your area.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Area API error
  if (areaQuery.isError || !area) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">My Area</h1>

        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3">
            <p className="text-sm text-destructive">
              Failed to load your area information.
            </p>

            <Button variant="outline" onClick={() => void areaQuery.refetch()}>
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const { feeder } = area;
  const { substation } = feeder;
  const { zone } = substation;

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <House className="size-8 text-primary" />

          <h1 className="text-3xl font-bold">My Area</h1>
        </div>

        <p className="text-muted-foreground">
          View your electricity service area and power schedules.
        </p>
      </div>

      {/* Area and network */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              Area Information
            </CardTitle>

            <CardDescription>
              Your assigned electricity service area
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <InfoRow label="Area Name" value={area.name} />

            <InfoRow label="Area Code" value={area.code} />

            <InfoRow label="Address" value={area.address} />

            <InfoRow label="Description" value={area.description} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="size-5 text-primary" />
              Electricity Network
            </CardTitle>

            <CardDescription>
              Infrastructure supplying your area
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <InfoRow label="Feeder" value={feeder.name} />

            <InfoRow label="Feeder Code" value={feeder.code} />

            <InfoRow label="Substation" value={substation.name} />

            <InfoRow label="Zone" value={zone.name} />

            <InfoRow label="Zone Code" value={zone.code} />
          </CardContent>
        </Card>
      </div>

      {/* Load shedding schedules */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                Load Shedding Schedules
              </CardTitle>

              <CardDescription>
                Planned power interruptions for your feeder
              </CardDescription>
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
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary */}
          {!schedulesQuery.isPending &&
            !schedulesQuery.isError &&
            now !== null && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{upcomingCount} Upcoming</Badge>

                {activeCount > 0 && (
                  <Badge variant="secondary">{activeCount} In Progress</Badge>
                )}
              </div>
            )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2" aria-label="Filter schedules">
            {(["ALL", "UPCOMING", "IN_PROGRESS", "HISTORY"] as const).map(
              (option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={filter === option ? "default" : "outline"}
                  onClick={() => setFilter(option)}
                >
                  {option === "ALL"
                    ? "All"
                    : option === "IN_PROGRESS"
                      ? "In Progress"
                      : option === "HISTORY"
                        ? "History"
                        : "Upcoming"}
                </Button>
              ),
            )}
          </div>

          {/* Loading */}
          {schedulesQuery.isPending || now === null ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-24 w-full" />
              ))}
            </div>
          ) : schedulesQuery.isError ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3">
              <p className="text-sm text-destructive">
                Failed to load schedules.
              </p>

              <Button
                variant="outline"
                onClick={() => void schedulesQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </div>
          ) : filteredSchedules.length > 0 ? (
            <div className="space-y-3">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Zap className="size-4 text-primary" />
                      {schedule.title}
                    </h3>

                    <ScheduleStatusBadge status={schedule.displayStatus} />
                  </div>

                  {schedule.description && (
                    <p className="text-sm text-muted-foreground">
                      {schedule.description}
                    </p>
                  )}

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <InfoRow
                      label="Start"
                      value={formatDate(schedule.startDateTime)}
                    />

                    <InfoRow
                      label="End"
                      value={formatDate(schedule.endDateTime)}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="size-4" />

                    <span>
                      Duration:{" "}
                      {formatDuration(
                        schedule.startDateTime,
                        schedule.endDateTime,
                      )}
                    </span>
                  </div>

                  {schedule.reason && (
                    <InfoRow label="Reason" value={schedule.reason} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                {filter === "ALL"
                  ? "No load shedding schedules found for your area."
                  : "No matching schedules on this page."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {totalSchedules} total schedules
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || schedulesQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || schedulesQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
