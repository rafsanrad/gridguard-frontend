"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import {
  useCreateOutage,
  useDeleteOutage,
  useOutages,
  useUpdateOutage,
  useUpdateOutageStatus,
} from "@/hooks/use-outages";

import { useFeeders } from "@/hooks/use-load-shedding";

import {
  NEXT_OUTAGE_STATUS,
  type Outage,
  type OutageStatus,
  type OutageType,
} from "@/types/outage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const outageSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().max(500),
    type: z.enum(["PLANNED", "UNPLANNED"]),
    feederId: z.string().min(1, "Select a feeder"),
    startedAt: z.string().min(1, "Start time is required"),
    estimatedRestoredAt: z.string(),
    cause: z.string().max(255),
    affectedCustomers: z.string(),
  })
  .refine(
    (data) =>
      !data.estimatedRestoredAt ||
      new Date(data.estimatedRestoredAt).getTime() >
        new Date(data.startedAt).getTime(),
    {
      path: ["estimatedRestoredAt"],
      message: "Restoration time must be after start time",
    },
  )
  .refine(
    (data) =>
      data.affectedCustomers === "" ||
      (/^\d+$/.test(data.affectedCustomers) &&
        Number.isSafeInteger(Number(data.affectedCustomers))),
    {
      path: ["affectedCustomers"],
      message: "Affected customers must be a non-negative integer",
    },
  );

const emptyValues = {
  title: "",
  description: "",
  type: "UNPLANNED" as OutageType,
  feederId: "",
  startedAt: "",
  estimatedRestoredAt: "",
  cause: "",
  affectedCustomers: "",
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function toISO(value: string) {
  return new Date(`${value}:00+06:00`).toISOString();
}

function StatusBadge({ status }: { status: OutageStatus }) {
  const colors: Record<OutageStatus, string> = {
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
    <Badge variant="outline" className={colors[status]}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function OperatorOutagesContent() {
  const router = useRouter();
  const pathname = usePathname();
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

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchParamsRef = useRef(searchParams.toString());

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  function updateQueryParams(
    updates: Record<string, string | null>,
    method: "push" | "replace" = "push",
  ) {
    const params = new URLSearchParams(searchParamsRef.current);

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    searchParamsRef.current = query;

    if (method === "replace") {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      updateQueryParams(
        {
          search: value.trim() || null,
          page: null,
        },
        "replace",
      );

      searchTimer.current = null;
    }, 350);
  }

  function updatePage(nextPage: number) {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }

    updateQueryParams({
      search: searchInput.trim() || null,
      page: nextPage > 1 ? String(nextPage) : null,
    });
  }

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Outage | null>(null);
  const [feederSearch, setFeederSearch] = useState("");

  const [statusOutage, setStatusOutage] = useState<Outage | null>(null);

  const [statusNotes, setStatusNotes] = useState("");

  const outagesQuery = useOutages({
    page,
    limit: 10,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const feedersQuery = useFeeders({
    page: 1,
    limit: 100,
    search: feederSearch,
  });

  const createMutation = useCreateOutage();
  const updateMutation = useUpdateOutage();
  const statusMutation = useUpdateOutageStatus();
  const deleteMutation = useDeleteOutage();

  const form = useForm({
    defaultValues: emptyValues,

    onSubmit: async ({ value }) => {
      const parsed = outageSchema.safeParse(value);

      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ?? "Please check the form.",
        );
        return;
      }

      const data = parsed.data;

      const common = {
        title: data.title,
        description: data.description,
        cause: data.cause,
        affectedCustomers:
          data.affectedCustomers === ""
            ? undefined
            : Number(data.affectedCustomers),
        estimatedRestoredAt: data.estimatedRestoredAt
          ? toISO(data.estimatedRestoredAt)
          : undefined,
      };

      try {
        if (editing) {
          await updateMutation.mutateAsync({
            id: editing.id,
            payload: common,
          });

          toast.success("Outage updated successfully.");
        } else {
          await createMutation.mutateAsync({
            ...common,
            type: data.type,
            feederId: data.feederId,
            startedAt: toISO(data.startedAt),
          });

          toast.success("Outage created successfully.");
        }

        setShowForm(false);
        setEditing(null);
        form.reset();
        updatePage(1);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save outage.",
        );
      }
    },
  });

  const outages = outagesQuery.data?.data ?? [];
  const meta = outagesQuery.data?.meta;
  const feeders = feedersQuery.data?.data ?? [];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    form.reset(emptyValues);
    setShowForm(true);
  }

  function openEdit(outage: Outage) {
    setEditing(outage);

    form.reset({
      title: outage.title,
      description: outage.description ?? "",
      type: outage.type,
      feederId: outage.feederId,
      startedAt: toDateTimeLocal(outage.startedAt),
      estimatedRestoredAt: outage.estimatedRestoredAt
        ? toDateTimeLocal(outage.estimatedRestoredAt)
        : "",
      cause: outage.cause ?? "",
      affectedCustomers: outage.affectedCustomers?.toString() ?? "",
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStatusUpdate() {
    if (!statusOutage) return;

    const nextStatus = NEXT_OUTAGE_STATUS[statusOutage.status];

    if (!nextStatus) return;

    try {
      await statusMutation.mutateAsync({
        id: statusOutage.id,
        payload: {
          status: nextStatus,
          notes: statusNotes.trim() || undefined,
        },
      });

      toast.success(`Outage status updated to ${nextStatus}.`);

      setStatusOutage(null);
      setStatusNotes("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status.",
      );
    }
  }

  async function handleDelete(outage: Outage) {
    if (!window.confirm(`Delete "${outage.title}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(outage.id);
      toast.success("Outage deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete outage.",
      );
    }
  }

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Activity className="size-8 text-primary" />
            Outage Management
          </h1>

          <p className="mt-2 text-muted-foreground">
            Monitor electricity outages and manage restoration.
          </p>
        </div>

        <Button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditing(null);
            } else {
              openCreate();
            }
          }}
        >
          <Plus className="size-4" />
          {showForm ? "Close Form" : "Report Outage"}
        </Button>
      </div>

      {/* Create / Edit */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Outage" : "Create Outage"}</CardTitle>

            <CardDescription>
              Enter the outage information. All times use Bangladesh Standard
              Time (UTC+6).
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
                    <Label htmlFor="outage-title">Title</Label>

                    <Input
                      id="outage-title"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      maxLength={150}
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="outage-description">Description</Label>

                    <Textarea
                      id="outage-description"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      maxLength={500}
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="type">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="outage-type">Type</Label>

                      <select
                        id="outage-type"
                        className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                        value={field.state.value}
                        disabled={Boolean(editing)}
                        onChange={(event) =>
                          field.handleChange(event.target.value as OutageType)
                        }
                      >
                        <option value="UNPLANNED">Unplanned</option>
                        <option value="PLANNED">Planned</option>
                      </select>
                    </div>
                  )}
                </form.Field>

                <form.Field name="feederId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="outage-feeder">Feeder</Label>

                      {!editing && (
                        <Input
                          placeholder="Search feeders..."
                          value={feederSearch}
                          onChange={(event) =>
                            setFeederSearch(event.target.value)
                          }
                        />
                      )}

                      <select
                        id="outage-feeder"
                        className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                        value={field.state.value}
                        disabled={Boolean(editing)}
                        required
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      >
                        <option value="">Select feeder</option>

                        {editing &&
                          !feeders.some(
                            (item) => item.id === editing.feederId,
                          ) && (
                            <option value={editing.feederId}>
                              {editing.feeder.name}
                            </option>
                          )}

                        {feeders.map((feeder) => (
                          <option key={feeder.id} value={feeder.id}>
                            {feeder.name} ({feeder.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form.Field>

                <form.Field name="startedAt">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="outage-start">Start Time</Label>

                      <Input
                        id="outage-start"
                        type="datetime-local"
                        value={field.state.value}
                        disabled={Boolean(editing)}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="estimatedRestoredAt">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="outage-estimated">
                        Estimated Restoration
                      </Label>

                      <Input
                        id="outage-estimated"
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="cause">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="outage-cause">Cause</Label>

                      <Input
                        id="outage-cause"
                        value={field.state.value}
                        maxLength={255}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="e.g. Transformer fault"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="affectedCustomers">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="outage-customers">
                        Affected Customers
                      </Label>

                      <Input
                        id="outage-customers"
                        type="number"
                        min={0}
                        step={1}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {editing ? "Save Changes" : "Create Outage"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Status update */}
      {statusOutage && (
        <Card>
          <CardHeader>
            <CardTitle>Update Outage Status</CardTitle>

            <CardDescription>
              {statusOutage.title}: {statusOutage.status} →{" "}
              {NEXT_OUTAGE_STATUS[statusOutage.status]}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status-notes">Status Notes (Optional)</Label>

              <Textarea
                id="status-notes"
                value={statusNotes}
                onChange={(event) => setStatusNotes(event.target.value)}
                maxLength={500}
                placeholder="Describe the progress..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusOutage(null);
                  setStatusNotes("");
                }}
              >
                Cancel
              </Button>

              <Button
                disabled={statusMutation.isPending}
                onClick={() => void handleStatusUpdate()}
              >
                {statusMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Confirm Status Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outage list */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Outages</CardTitle>
              <CardDescription>
                View and manage reported outages.
              </CardDescription>
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
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />

            <Input
              className="pl-9"
              placeholder="Search outages..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          {outagesQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-40 w-full" />
              ))}
            </div>
          ) : outagesQuery.isError ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-destructive">Failed to load outages.</p>

              <Button
                variant="outline"
                onClick={() => void outagesQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : outages.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No outages found.
            </p>
          ) : (
            <div className="space-y-3">
              {outages.map((outage) => {
                const nextStatus = NEXT_OUTAGE_STATUS[outage.status];

                return (
                  <div
                    key={outage.id}
                    className="space-y-4 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{outage.title}</h3>

                        <p className="text-sm text-muted-foreground">
                          {outage.feeder.name} ({outage.feeder.code})
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{outage.type}</Badge>

                        <StatusBadge status={outage.status} />
                      </div>
                    </div>

                    {outage.description && (
                      <p className="text-sm text-muted-foreground">
                        {outage.description}
                      </p>
                    )}

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground">Started</p>
                        <p className="font-medium">
                          {formatDate(outage.startedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          Estimated Restoration
                        </p>
                        <p className="font-medium">
                          {formatDate(outage.estimatedRestoredAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          Affected Customers
                        </p>
                        <p className="font-medium">
                          {outage.affectedCustomers ?? "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Cause</p>
                        <p className="font-medium">{outage.cause || "N/A"}</p>
                      </div>
                    </div>

                    {outage.restoredAt && (
                      <p className="flex items-center gap-2 text-sm">
                        <Clock3 className="size-4 text-green-600" />
                        Restored: {formatDate(outage.restoredAt)}
                      </p>
                    )}

                    <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setStatusOutage(outage);
                            setStatusNotes("");
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                        >
                          Move to {nextStatus}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(outage)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => void handleDelete(outage)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} outages)
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || outagesQuery.isFetching}
                  onClick={() => updatePage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || outagesQuery.isFetching}
                  onClick={() => updatePage(page + 1)}
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

export default function OperatorOutagesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 p-4" aria-label="Loading outages">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <OperatorOutagesContent />
    </Suspense>
  );
}
