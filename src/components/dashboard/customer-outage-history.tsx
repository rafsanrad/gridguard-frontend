"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  X,
  Zap,
} from "lucide-react";

import { useMyOutageReports } from "@/hooks/use-customer-data";
import type { CustomerOutageReport } from "@/services/customer.service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 5;

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "RESTORED":
    case "CLOSED":
      return "default";

    case "REPORTED":
    case "ACKNOWLEDGED":
      return "secondary";

    case "ASSIGNED":
    case "INVESTIGATING":
    case "REPAIRING":
      return "outline";

    default:
      return "secondary";
  }
}

export default function CustomerOutageHistory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] =
    useState<CustomerOutageReport | null>(null);

  const reports = useMyOutageReports({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const totalPages = reports.data?.meta.totalPages ?? 1;
  const totalReports = reports.data?.meta.total ?? 0;
  const reportList = reports.data?.data ?? [];

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-primary" />
            My Outage Reports
          </CardTitle>

          <CardDescription>
            View your submitted outage reports and any linked outage updates.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Search and refresh */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search by location or description..."
                className="pr-9 pl-9"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => handleSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              disabled={reports.isFetching}
              onClick={() => void reports.refetch()}
            >
              <RefreshCw
                className={`size-4 ${reports.isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Report count */}
          {!reports.isPending && !reports.isError && (
            <p className="text-sm text-muted-foreground">
              {totalReports} {totalReports === 1 ? "report" : "reports"} found
            </p>
          )}

          {/* Loading */}
          {reports.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : reports.isError ? (
            /* Error */
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4">
              <p className="text-sm text-destructive">
                Failed to load outage reports.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void reports.refetch()}
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </div>
          ) : reportList.length > 0 ? (
            /* Reports */
            <div className="space-y-3">
              {reportList.map((report) => (
                <div
                  key={report.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 font-medium">
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        {report.location || "Location not specified"}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatDate(report.reportedAt)}
                      </p>
                    </div>

                    {report.outage ? (
                      <Badge variant={getStatusVariant(report.outage.status)}>
                        {formatStatus(report.outage.status)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No Linked Outage</Badge>
                    )}
                  </div>

                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {report.description || "No description provided."}
                  </p>

                  {report.outage && (
                    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <Zap className="size-4 shrink-0 text-primary" />

                      <span className="truncate">
                        Linked outage:{" "}
                        <span className="font-medium">
                          {report.outage.title}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end border-t pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="size-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center">
              <AlertTriangle className="size-7 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                {search.trim()
                  ? "No outage reports match your search."
                  : "You have not submitted any outage reports yet."}
              </p>

              {search && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!reports.isPending &&
            !reports.isError &&
            totalReports > PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({totalReports} reports)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || reports.isFetching}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || reports.isFetching}
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

      {/* Report details dialog */}
      <Dialog
        open={selectedReport !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Outage Report Details</DialogTitle>

            <DialogDescription>
              Information about your submitted power outage report.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-medium">Reported Location</p>

                <p className="text-sm text-muted-foreground">
                  {selectedReport.location || "Location not specified"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Description</p>

                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {selectedReport.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Reported At</p>

                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedReport.reportedAt)}
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Zap className="size-4 text-primary" />
                  Linked Outage Information
                </h3>

                {selectedReport.outage ? (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {selectedReport.outage.title}
                      </p>

                      <Badge
                        variant={getStatusVariant(selectedReport.outage.status)}
                      >
                        {formatStatus(selectedReport.outage.status)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="font-medium">Outage Type</p>

                        <p className="text-muted-foreground">
                          {selectedReport.outage.type}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Started At</p>

                        <p className="text-muted-foreground">
                          {formatDate(selectedReport.outage.startedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Estimated Restoration</p>

                        <p className="text-muted-foreground">
                          {formatDate(
                            selectedReport.outage.estimatedRestoredAt,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Actual Restoration</p>

                        <p className="text-muted-foreground">
                          {formatDate(selectedReport.outage.restoredAt)}
                        </p>
                      </div>
                    </div>

                    {selectedReport.outage.cause && (
                      <div>
                        <p className="text-sm font-medium">Cause</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedReport.outage.cause}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4">
                    <p className="text-sm text-muted-foreground">
                      This report is not linked to an existing outage.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
