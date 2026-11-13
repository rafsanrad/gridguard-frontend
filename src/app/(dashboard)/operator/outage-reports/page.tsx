"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import type { OutageReport } from "@/types/outage-report";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  useOutageReportDetails,
  useOutageReports,
} from "@/hooks/use-outage-reports";

const PAGE_SIZE = 10;

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ReportDetails({
  report,
  onClose,
}: {
  report: OutageReport;
  onClose: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Customer Report Details</CardTitle>
            <CardDescription>Report ID: {report.id}</CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close details"
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Customer Information</h3>

            <p className="flex items-center gap-2 text-sm">
              <UserRound className="size-4" />
              {report.customer?.name ?? "Unknown"}
            </p>

            <p className="flex items-center gap-2 text-sm">
              <Mail className="size-4" />
              {report.customer?.email ?? "N/A"}
            </p>

            <p className="flex items-center gap-2 text-sm">
              <Phone className="size-4" />
              {report.customer?.phone || "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Report Information</h3>

            <p className="flex items-center gap-2 text-sm">
              <MapPin className="size-4" />
              {report.location || "Location not provided"}
            </p>

            <p className="text-sm text-muted-foreground">
              Reported: {formatDate(report.reportedAt ?? report.createdAt)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>

          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {report.description || "No description provided."}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Zap className="size-4" />
            Linked Outage
          </h3>

          {report.outage ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{report.outage.title}</p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{report.outage.type}</Badge>

                <Badge variant="secondary">{report.outage.status}</Badge>
              </div>

              <p className="text-muted-foreground">
                Started: {formatDate(report.outage.startedAt)}
              </p>

              <p className="text-muted-foreground">
                Cause: {report.outage.cause || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This customer report is not linked to an existing outage.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            render={<Link href="/operator/outages" />}
            nativeButton={false}
          >
            Open Outage Management
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OperatorOutageReportsContent() {
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

  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    setSelectedId(null);

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

    setSelectedId(null);

    updateQueryParams({
      search: searchInput.trim() || null,
      page: nextPage > 1 ? String(nextPage) : null,
    });
  }

  const reportsQuery = useOutageReports({
    page,
    limit: PAGE_SIZE,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const detailQuery = useOutageReportDetails(selectedId ?? undefined);

  const reports = reportsQuery.data?.data ?? [];
  const meta = reportsQuery.data?.meta;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <ClipboardList className="size-8 text-primary" />
            Customer Outage Reports
          </h1>

          <p className="mt-2 text-muted-foreground">
            Review electricity outage reports submitted by customers.
          </p>
        </div>

        <Button
          variant="outline"
          render={<Link href="/operator/outages" />}
          nativeButton={false}
        >
          <Zap className="size-4" />
          Manage Outages
        </Button>
      </div>

      {selectedId &&
        (detailQuery.isPending ? (
          <Skeleton className="h-72 w-full" />
        ) : detailQuery.isError ? (
          <Card>
            <CardContent className="space-y-3 py-6">
              <p className="text-destructive">Failed to load report details.</p>

              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        ) : detailQuery.data ? (
          <ReportDetails
            report={detailQuery.data}
            onClose={() => setSelectedId(null)}
          />
        ) : null)}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Submitted Reports</CardTitle>

              <CardDescription>
                {meta
                  ? `${meta.total} total customer reports`
                  : "Browse submitted outage reports"}
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={reportsQuery.isFetching}
              onClick={() => void reportsQuery.refetch()}
            >
              <RefreshCw
                className={`size-4 ${
                  reportsQuery.isFetching ? "animate-spin" : ""
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
              placeholder="Search description or location..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          {reportsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-36 w-full" />
              ))}
            </div>
          ) : reportsQuery.isError ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-destructive">
                Failed to load customer reports.
              </p>

              <Button
                variant="outline"
                onClick={() => void reportsQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : reports.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No customer outage reports found.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {report.customer?.name ?? "Unknown Customer"}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {report.customer?.email ?? "N/A"}
                      </p>
                    </div>

                    <Badge variant={report.outageId ? "default" : "secondary"}>
                      {report.outageId ? "Linked Outage" : "Unlinked Report"}
                    </Badge>
                  </div>

                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    {report.location || "Location not provided"}
                  </p>

                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {report.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(report.reportedAt ?? report.createdAt)}
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedId(report.id)}
                    >
                      <Eye className="size-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} reports)
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || reportsQuery.isFetching}
                  onClick={() => updatePage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || reportsQuery.isFetching}
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

export default function OperatorOutageReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      }
    >
      <OperatorOutageReportsContent />
    </Suspense>
  );
}
