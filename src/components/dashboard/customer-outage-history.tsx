"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
} from "lucide-react";

import { useMyOutageReports } from "@/hooks/use-customer-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 5;

export default function CustomerOutageHistory() {
  const [page, setPage] = useState(1);

  const reports = useMyOutageReports({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const totalPages = reports.data?.meta.totalPages ?? 1;
  const totalReports = reports.data?.meta.total ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-primary" />
          My Outage Reports
        </CardTitle>

        <CardDescription>
          View your previously submitted power outage reports.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {reports.isPending ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : reports.isError ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
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
        ) : reports.data?.data.length ? (
          <div className="space-y-3">
            {reports.data.data.map((report) => (
              <div key={report.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-medium">
                    <MapPin className="size-4 text-muted-foreground" />
                    {report.location || "Location not specified"}
                  </p>

                  <span className="text-xs text-muted-foreground">
                    {new Date(report.reportedAt).toLocaleDateString("en-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {report.description || "No description provided."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              You have not submitted any outage reports yet.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!reports.isPending && !reports.isError && totalReports > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({totalReports} reports)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || reports.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
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
  );
}
