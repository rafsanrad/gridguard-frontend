"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  useCancelLoadShedding,
  useCreateLoadShedding,
  useFeeders,
  useLoadSheddingSchedules,
  useUpdateLoadShedding,
} from "@/hooks/use-load-shedding";

import type { LoadSheddingSchedule } from "@/types/load-shedding";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

// Validation
const scheduleSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().max(500),
    feederId: z.string().min(1, "Select a feeder"),
    startDateTime: z.string().min(1, "Start time is required"),
    endDateTime: z.string().min(1, "End time is required"),
    reason: z.string().max(255),
  })
  .refine(
    (value) =>
      new Date(value.endDateTime).getTime() >
      new Date(value.startDateTime).getTime(),
    {
      path: ["endDateTime"],
      message: "End time must be after start time",
    },
  );

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// datetime-local expects YYYY-MM-DDTHH:mm
function toDateTimeLocal(value: string) {
  const date = new Date(value);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function getStatusClassName(status: string) {
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

const emptyValues = {
  title: "",
  description: "",
  feederId: "",
  startDateTime: "",
  endDateTime: "",
  reason: "",
};

export function LoadSheddingManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [feederFilter, setFeederFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<LoadSheddingSchedule | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const schedulesQuery = useLoadSheddingSchedules({
    page,
    limit: 10,
    search,
    feederId: feederFilter || undefined,
    sortBy: "startDateTime",
    sortOrder: "desc",
  });

  // This is the first feeder page. Search is available
  // if the system contains more than 100 feeders.
  const [feederSearch, setFeederSearch] = useState("");

  const feedersQuery = useFeeders({
    page: 1,
    limit: 100,
    search: feederSearch,
  });

  const createMutation = useCreateLoadShedding();
  const updateMutation = useUpdateLoadShedding();
  const cancelMutation = useCancelLoadShedding();

  const form = useForm({
    defaultValues: emptyValues,

    onSubmit: async ({ value }) => {
      const parsed = scheduleSchema.safeParse(value);

      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ?? "Please check schedule details.",
        );
        return;
      }

      const data = parsed.data;

      // Interpret datetime-local values in Bangladesh time,
      // regardless of the browser's local timezone.
      const toISO = (dateTime: string) =>
        new Date(`${dateTime}:00+06:00`).toISOString();

      try {
        if (editingSchedule) {
          await updateMutation.mutateAsync({
            id: editingSchedule.id,
            payload: {
              title: data.title,
              description: data.description || undefined,
              reason: data.reason || undefined,
              startDateTime: toISO(data.startDateTime),
              endDateTime: toISO(data.endDateTime),
            },
          });

          toast.success("Schedule updated successfully.");
        } else {
          await createMutation.mutateAsync({
            title: data.title,
            description: data.description || undefined,
            feederId: data.feederId,
            reason: data.reason || undefined,
            startDateTime: toISO(data.startDateTime),
            endDateTime: toISO(data.endDateTime),
          });

          toast.success("Schedule created successfully.");
        }

        form.reset();
        setEditingSchedule(null);
        setShowForm(false);
        setPage(1);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save schedule.",
        );
      }
    },
  });

  const schedules = schedulesQuery.data?.data ?? [];
  const meta = schedulesQuery.data?.meta;
  const feeders = feedersQuery.data?.data ?? [];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingSchedule(null);
    form.reset(emptyValues);
    setShowForm(true);
  }

  function openEditForm(schedule: LoadSheddingSchedule) {
    setEditingSchedule(schedule);

    form.reset({
      title: schedule.title,
      description: schedule.description ?? "",
      feederId: schedule.feederId,
      startDateTime: toDateTimeLocal(schedule.startDateTime),
      endDateTime: toDateTimeLocal(schedule.endDateTime),
      reason: schedule.reason ?? "",
    });

    setShowForm(true);
  }

  async function handleCancel(schedule: LoadSheddingSchedule) {
    const confirmed = window.confirm(`Cancel "${schedule.title}"?`);

    if (!confirmed) return;

    try {
      await cancelMutation.mutateAsync(schedule.id);
      toast.success("Schedule cancelled successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel schedule.",
      );
    }
  }

  async function handleRefresh() {
    setRefreshing(true);

    try {
      const result = await schedulesQuery.refetch();

      if (result.isError) {
        throw result.error;
      }

      toast.success("Schedules refreshed.");
    } catch {
      toast.error("Failed to refresh schedules.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarClock className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Load Shedding Management</h1>
          </div>

          <p className="text-muted-foreground">
            Create and manage planned electricity outages.
          </p>
        </div>

        <Button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingSchedule(null);
            } else {
              openCreateForm();
            }
          }}
        >
          <Plus className="size-4" />
          {showForm ? "Close Form" : "New Schedule"}
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSchedule
                ? "Edit Load Shedding Schedule"
                : "Create Load Shedding Schedule"}
            </CardTitle>
            <CardDescription>
              Provide the feeder and planned outage time.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <form.Field name="title">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-title">Title</Label>
                    <Input
                      id="schedule-title"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g. Planned Grid Maintenance"
                      maxLength={150}
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-description">Description</Label>
                    <Textarea
                      id="schedule-description"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="feederId">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-feeder">Feeder</Label>

                    <Input
                      placeholder="Search available feeders..."
                      value={feederSearch}
                      onChange={(event) => setFeederSearch(event.target.value)}
                      disabled={Boolean(editingSchedule)}
                    />

                    <select
                      id="schedule-feeder"
                      className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                      value={field.state.value}
                      disabled={
                        Boolean(editingSchedule) || feedersQuery.isPending
                      }
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      required
                    >
                      <option value="">
                        {feedersQuery.isPending
                          ? "Loading feeders..."
                          : "Select feeder"}
                      </option>

                      {editingSchedule &&
                        !feeders.some(
                          (feeder) => feeder.id === editingSchedule.feederId,
                        ) && (
                          <option value={editingSchedule.feederId}>
                            {editingSchedule.feeder.name} (
                            {editingSchedule.feeder.code})
                          </option>
                        )}

                      {feeders.map((feeder) => (
                        <option key={feeder.id} value={feeder.id}>
                          {feeder.name} ({feeder.code})
                        </option>
                      ))}
                    </select>

                    {editingSchedule && (
                      <p className="text-xs text-muted-foreground">
                        Feeder cannot be changed after creation.
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="startDateTime">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="schedule-start">Start Date & Time</Label>
                      <Input
                        id="schedule-start"
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="endDateTime">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="schedule-end">End Date & Time</Label>
                      <Input
                        id="schedule-end"
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <p className="text-xs text-muted-foreground">
                All schedule times are in Bangladesh Standard Time (UTC+6).
              </p>

              <form.Field name="reason">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-reason">Reason</Label>
                    <Input
                      id="schedule-reason"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g. Preventive maintenance"
                      maxLength={255}
                    />
                  </div>
                )}
              </form.Field>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSchedule(null);
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {editingSchedule ? "Save Changes" : "Create Schedule"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Schedules</CardTitle>
              <CardDescription>
                View and manage scheduled outages.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() => void handleRefresh()}
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-3 left-3 size-4" />

              <Input
                placeholder="Search schedules..."
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="border-input bg-background h-10 rounded-md border px-3 text-sm"
              value={feederFilter}
              onChange={(event) => {
                setFeederFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All feeders</option>

              {feeders.map((feeder) => (
                <option key={feeder.id} value={feeder.id}>
                  {feeder.name} ({feeder.code})
                </option>
              ))}
            </select>
          </div>

          {schedulesQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-24 w-full" />
              ))}
            </div>
          ) : schedulesQuery.isError ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-destructive">Failed to load schedules.</p>
              <Button
                variant="outline"
                onClick={() => void schedulesQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : schedules.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No load shedding schedules found.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{schedule.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {schedule.feeder.name} ({schedule.feeder.code})
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusClassName(schedule.status)}
                    >
                      {schedule.status}
                    </Badge>
                  </div>

                  {schedule.description && (
                    <p className="text-sm text-muted-foreground">
                      {schedule.description}
                    </p>
                  )}

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Start</p>
                      <p className="font-medium">
                        {formatDate(schedule.startDateTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">End</p>
                      <p className="font-medium">
                        {formatDate(schedule.endDateTime)}
                      </p>
                    </div>
                  </div>

                  {schedule.reason && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Reason:</span>{" "}
                      {schedule.reason}
                    </p>
                  )}

                  {schedule.status !== "CANCELLED" && (
                    <div className="flex justify-end gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openEditForm(schedule);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={cancelMutation.isPending}
                        onClick={() => void handleCancel(schedule)}
                      >
                        <XCircle className="size-4" />
                        Cancel Schedule
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} schedules)
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || schedulesQuery.isFetching}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= meta.totalPages || schedulesQuery.isFetching
                  }
                  onClick={() => setPage((previous) => previous + 1)}
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
