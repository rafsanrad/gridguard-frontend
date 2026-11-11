"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  useServiceRequests,
  useServiceRequestDetails,
  useUpdateServiceRequest,
} from "@/hooks/use-service-requests";

import type {
  ServiceRequest,
  ServiceRequestStatus,
} from "@/types/service-request";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

const STATUSES: ServiceRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

const FINAL_STATUSES: ServiceRequestStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

function isFinalStatus(status: ServiceRequestStatus) {
  return FINAL_STATUSES.includes(status);
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAmount(amount: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
  }).format(Number(amount));
}

function getStatusVariant(
  status: ServiceRequestStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    case "APPROVED":
    case "IN_PROGRESS":
      return "outline";
    default:
      return "secondary";
  }
}

export default function ServiceRequestManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editRequest, setEditRequest] = useState<ServiceRequest | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ServiceRequestStatus>("PENDING");

  const requestsQuery = useServiceRequests({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const detailsQuery = useServiceRequestDetails(selectedId ?? undefined);

  const updateMutation = useUpdateServiceRequest();

  const requests = requestsQuery.data?.data ?? [];
  const meta = requestsQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  function openEdit(request: ServiceRequest) {
    setEditRequest(request);
    setTitle(request.title);
    setDescription(request.description ?? "");
    setStatus(request.status);
  }

  async function handleUpdate() {
    if (!editRequest || updateMutation.isPending) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 150) {
      toast.error("Title must contain 3–150 characters.");
      return;
    }

    if (cleanDescription.length > 500) {
      toast.error("Description cannot exceed 500 characters.");
      return;
    }

    if (isFinalStatus(editRequest.status)) {
      toast.error("Finalized requests cannot be updated.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editRequest.id,
        payload: {
          title: cleanTitle,
          description: cleanDescription,
          status,
        },
      });

      toast.success("Service request updated successfully.");
      setEditRequest(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update service request.",
      );
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <ClipboardList className="size-8 text-primary" />
          Service Request Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review customer requests and manage their progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Service Requests</CardTitle>
          <CardDescription>
            Search requests, review customer information, and update request
            details or status.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search requests or customers..."
                className="pr-9 pl-9"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              disabled={requestsQuery.isFetching}
              onClick={() => void requestsQuery.refetch()}
            >
              <RefreshCw
                className={`size-4 ${
                  requestsQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>

          {!requestsQuery.isPending && !requestsQuery.isError && (
            <p className="text-sm text-muted-foreground">
              {meta?.total ?? 0} requests found
            </p>
          )}

          {requestsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-36 w-full rounded-lg" />
              ))}
            </div>
          ) : requestsQuery.isError ? (
            <div className="space-y-3 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-destructive">
                Failed to load service requests.
              </p>
              <Button
                variant="outline"
                onClick={() => void requestsQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No service requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{request.title}</h3>

                      <p className="text-sm text-muted-foreground">
                        {request.customer?.name ?? "Unknown customer"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {request.customer?.email ?? "No email"}
                      </p>
                    </div>

                    <Badge variant={getStatusVariant(request.status)}>
                      {formatStatus(request.status)}
                    </Badge>
                  </div>

                  {request.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {request.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">
                      {formatAmount(request.amount)}
                    </span>

                    <span className="text-muted-foreground">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedId(request.id)}
                    >
                      <Eye className="size-4" />
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      disabled={isFinalStatus(request.status)}
                      onClick={() => openEdit(request)}
                    >
                      <Pencil className="size-4" />
                      Edit Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || requestsQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || requestsQuery.isFetching}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request details */}
      <Dialog
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Service Request Details</DialogTitle>
            <DialogDescription>
              Customer, request, and payment information.
            </DialogDescription>
          </DialogHeader>

          {detailsQuery.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : detailsQuery.isError ? (
            <p className="text-sm text-destructive">
              Failed to load request details.
            </p>
          ) : detailsQuery.data ? (
            <div className="space-y-5 text-sm">
              <div>
                <h3 className="font-semibold">{detailsQuery.data.title}</h3>
                <p className="mt-1 text-muted-foreground">
                  {detailsQuery.data.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={getStatusVariant(detailsQuery.data.status)}>
                  {formatStatus(detailsQuery.data.status)}
                </Badge>

                <span className="font-semibold">
                  {formatAmount(detailsQuery.data.amount)}
                </span>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold">Customer Information</h4>

                <p>Name: {detailsQuery.data.customer?.name}</p>
                <p>Email: {detailsQuery.data.customer?.email}</p>
                <p>
                  Phone: {detailsQuery.data.customer?.phone || "Not provided"}
                </p>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold">Dates</h4>
                <p>Created: {formatDate(detailsQuery.data.createdAt)}</p>
                <p>Updated: {formatDate(detailsQuery.data.updatedAt)}</p>
                <p>Completed: {formatDate(detailsQuery.data.completedAt)}</p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold">Payment History</h4>

                {detailsQuery.data.payments?.length ? (
                  detailsQuery.data.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="space-y-2 rounded-lg border p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{payment.provider}</span>

                        <Badge variant="outline">
                          {formatStatus(payment.status)}
                        </Badge>
                      </div>

                      <p>
                        Amount: {payment.amount} {payment.currency}
                      </p>
                      <p>
                        Transaction: {payment.transactionId || "Not available"}
                      </p>
                      <p>Paid: {formatDate(payment.paidAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No payment records found.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit request */}
      <Dialog
        open={editRequest !== null}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) {
            setEditRequest(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Service Request</DialogTitle>
            <DialogDescription>
              Update the request details and status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="request-title">Title</Label>
              <Input
                id="request-title"
                value={title}
                maxLength={150}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-description">Description</Label>
              <Textarea
                id="request-description"
                value={description}
                maxLength={500}
                rows={4}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Request Status</Label>

              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) {
                    setStatus(value as ServiceRequestStatus);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {formatStatus(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {FINAL_STATUSES.includes(status) &&
              status !== editRequest?.status && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  This status is final. After saving, the request cannot be
                  edited again.
                </p>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={updateMutation.isPending}
              onClick={() => setEditRequest(null)}
            >
              Cancel
            </Button>

            <Button
              disabled={updateMutation.isPending}
              onClick={() => void handleUpdate()}
            >
              {updateMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
