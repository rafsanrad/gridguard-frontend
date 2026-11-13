"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
} from "lucide-react";

import { useMyPayments } from "@/hooks/use-customer-data";
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

const PAGE_SIZE = 5;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAmount(amount: string, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function getStatusClassName(status: string) {
  switch (status) {
    case "SUCCESS":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";

    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";

    case "CANCELLED":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function CustomerPaymentsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawPage = Number(searchParams.get("page") ?? "1");

  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const paymentsQuery = useMyPayments({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const payments = paymentsQuery.data?.data ?? [];
  const meta = paymentsQuery.data?.meta;

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <CreditCard className="size-8 text-primary" />

        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>

          <p className="text-muted-foreground">
            Track your service request payments and transactions.
          </p>
        </div>
      </div>

      {/* Payment history card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>My Transactions</CardTitle>

              <CardDescription>
                {meta
                  ? `${meta.total} payment record(s)`
                  : "Your payment activity"}
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={paymentsQuery.isFetching}
              onClick={() => void paymentsQuery.refetch()}
            >
              <RefreshCw
                className={`size-4 ${
                  paymentsQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading */}
          {paymentsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-32 w-full" />
              ))}
            </div>
          ) : paymentsQuery.isError ? (
            /* Error */
            <div className="flex min-h-40 flex-col items-center justify-center gap-3">
              <p className="text-sm text-destructive">
                Failed to load payment history.
              </p>

              <Button
                variant="outline"
                onClick={() => void paymentsQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : payments.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
              <ReceiptText className="size-10 text-muted-foreground" />

              <p className="font-medium">No payments found</p>

              <p className="max-w-sm text-sm text-muted-foreground">
                Payments for your service requests will appear here.
              </p>
            </div>
          ) : (
            /* Payment list */
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  {/* Payment title and status */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        {payment.serviceRequest.title}
                      </h3>

                      <p className="break-all text-xs text-muted-foreground">
                        {payment.merchantInvoiceNumber}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusClassName(payment.status)}
                    >
                      {payment.status}
                    </Badge>
                  </div>

                  {/* Payment information */}
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Amount</p>

                      <p className="font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Provider</p>

                      <p className="font-medium">{payment.provider}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Created</p>

                      <p>{formatDate(payment.createdAt)}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Paid At</p>

                      <p>
                        {payment.paidAt
                          ? formatDate(payment.paidAt)
                          : "Not paid yet"}
                      </p>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  {payment.transactionId && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        Transaction ID
                      </p>

                      <p className="break-all font-mono text-sm">
                        {payment.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* URL-synchronized pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || paymentsQuery.isFetching}
                  onClick={() => updatePage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || paymentsQuery.isFetching}
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

export default function CustomerPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <CustomerPaymentsContent />
    </Suspense>
  );
}
