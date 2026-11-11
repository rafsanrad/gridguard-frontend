"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  ClipboardList,
  Loader2,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useCreateServiceRequest,
  useMyServiceRequests,
} from "@/hooks/use-customer-data";

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
import { ServiceRequestPayment } from "@/components/dashboard/service-request-payment";

// Validation schema
const requestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),

  description: z.string().max(500, "Description cannot exceed 500 characters"),

  amount: z.number().min(100, "Minimum service amount is ৳100"),
});

// Status badge styling
function getStatusClassName(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";

    case "APPROVED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300";

    case "IN_PROGRESS":
      return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300";

    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300";

    case "REJECTED":
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

// Format date
function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

// Format BDT amount
function formatAmount(amount: string) {
  const value = Number(amount);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function MyRequestsPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Separate state for manual Refresh button
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Fetch service requests
  const requestsQuery = useMyServiceRequests({
    page,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Create service request mutation
  const createMutation = useCreateServiceRequest();

  // Automatically refresh pending requests every 3 seconds.
  // This does not trigger the manual Refresh icon animation.
  const hasPendingRequests =
    requestsQuery.data?.data?.some((request) => request.status === "PENDING") ??
    false;

  const refetchRequests = requestsQuery.refetch;

  useEffect(() => {
    if (!hasPendingRequests) {
      return;
    }

    const interval = window.setInterval(() => {
      void refetchRequests();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasPendingRequests, refetchRequests]);

  // Manual refresh
  const handleManualRefresh = async () => {
    if (isManualRefreshing) {
      return;
    }

    setIsManualRefreshing(true);

    try {
      await requestsQuery.refetch();
    } catch {
      toast.error("Failed to refresh service requests.");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Request form
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      amount: "",
    },

    onSubmit: async ({ value }) => {
      const parsed = requestSchema.safeParse({
        title: value.title.trim(),
        description: value.description.trim(),
        amount: Number(value.amount),
      });

      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ??
            "Please check your request details.",
        );

        return;
      }

      try {
        await createMutation.mutateAsync({
          title: parsed.data.title,
          description: parsed.data.description || undefined,
          amount: parsed.data.amount,
        });

        toast.success("Service request submitted successfully.");

        form.reset();
        setPage(1);
        setShowForm(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to submit service request.",
        );
      }
    },
  });

  const requests = requestsQuery.data?.data ?? [];
  const meta = requestsQuery.data?.meta;

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ClipboardList className="size-8 text-primary" />

            <h1 className="text-3xl font-bold">My Requests</h1>
          </div>

          <p className="text-muted-foreground">
            Submit and track your electricity service requests.
          </p>
        </div>

        <Button onClick={() => setShowForm((previous) => !previous)}>
          <Plus className="size-4" />
          {showForm ? "Close Form" : "New Request"}
        </Button>
      </div>

      {/* Create request form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Service Request</CardTitle>

            <CardDescription>
              Provide the details of the electricity service you need.
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
              {/* Title */}
              <form.Field name="title">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Request Title</Label>

                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Electric Meter Replacement"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      maxLength={150}
                      required
                    />
                  </div>
                )}
              </form.Field>

              {/* Description */}
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Description</Label>

                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Describe the service you need..."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      maxLength={500}
                      rows={4}
                    />
                  </div>
                )}
              </form.Field>

              {/* Amount */}
              <form.Field name="amount">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Amount (BDT)</Label>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="100"
                      step="0.01"
                      placeholder="e.g. 500"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      required
                    />

                    <p className="text-xs text-muted-foreground">
                      Minimum service amount is ৳100.
                    </p>
                  </div>
                )}
              </form.Field>

              {/* Form buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>

                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button
                      type="submit"
                      disabled={isSubmitting || createMutation.isPending}
                    >
                      {(isSubmitting || createMutation.isPending) && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Submit Request
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Service request history */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Service Request History</CardTitle>

              <CardDescription>
                View the status of your submitted requests.
              </CardDescription>
            </div>

            {/* Manual Refresh button */}
            <Button
              variant="outline"
              size="sm"
              disabled={isManualRefreshing}
              onClick={() => void handleManualRefresh()}
            >
              <RefreshCw
                className={`size-4 ${isManualRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading */}
          {requestsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-28 w-full" />
              ))}
            </div>
          ) : requestsQuery.isError ? (
            /* Error */
            <div className="flex min-h-40 flex-col items-center justify-center gap-3">
              <p className="text-sm text-destructive">
                Failed to load service requests.
              </p>

              <Button
                variant="outline"
                onClick={() => void requestsQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </div>
          ) : requests.length > 0 ? (
            /* Request list */
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  {/* Request title and status */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{request.title}</h3>

                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDate(request.createdAt)}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusClassName(request.status)}
                    >
                      {request.status.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  {/* Description */}
                  {request.description && (
                    <p className="text-sm text-muted-foreground">
                      {request.description}
                    </p>
                  )}

                  {/* Amount */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Service Amount
                    </span>

                    <span className="font-semibold">
                      {formatAmount(request.amount)}
                    </span>
                  </div>

                  {/* Completed date */}
                  {request.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      Completed {formatDate(request.completedAt)}
                    </p>
                  )}

                  {/* Stripe payment */}
                  <ServiceRequestPayment
                    serviceRequestId={request.id}
                    status={request.status}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
              <ClipboardList className="size-9 text-muted-foreground" />

              <p className="font-medium">No service requests yet</p>

              <p className="max-w-sm text-sm text-muted-foreground">
                Create your first service request to get started.
              </p>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || requestsQuery.isFetching}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || requestsQuery.isFetching}
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
