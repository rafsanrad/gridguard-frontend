"use client";

import {
  Activity,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useMyOutageReports,
  useMyServiceRequests,
  useMyPayments,
} from "@/hooks/use-customer-data";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  status?: string;
  icon: LucideIcon;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerRecentActivity() {
  const outageReports = useMyOutageReports({
    page: 1,
    limit: 5,
  });

  const serviceRequests = useMyServiceRequests({
    page: 1,
    limit: 5,
  });

  const payments = useMyPayments({
    page: 1,
    limit: 5,
  });

  const isPending =
    outageReports.isPending || serviceRequests.isPending || payments.isPending;

  const isError =
    outageReports.isError || serviceRequests.isError || payments.isError;

  const activities: ActivityItem[] = [
    ...(outageReports.data?.data.map((report) => ({
      id: `outage-${report.id}`,
      title: "Outage Report Submitted",
      description: report.location || "Power outage reported",
      date: report.reportedAt,
      icon: AlertTriangle,
    })) ?? []),

    ...(serviceRequests.data?.data.map((request) => ({
      id: `service-${request.id}`,
      title: request.title,
      description: "Service Request",
      date: request.createdAt,
      status: request.status,
      icon: Wrench,
    })) ?? []),

    ...(payments.data?.data.map((payment) => ({
      id: `payment-${payment.id}`,
      title: `Payment - ${payment.provider}`,
      description: payment.merchantInvoiceNumber,
      date: payment.createdAt,
      status: payment.status,
      icon: CreditCard,
    })) ?? []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleRetry = () => {
    if (outageReports.isError) {
      void outageReports.refetch();
    }

    if (serviceRequests.isError) {
      void serviceRequests.refetch();
    }

    if (payments.isError) {
      void payments.refetch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <CardTitle>Recent Activity</CardTitle>
        </div>

        <CardDescription>
          Your latest outage reports, service requests, and payments
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {isError && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-3">
                <p className="text-sm text-destructive">
                  Some activities could not be loaded.
                </p>

                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            )}

            {activities.length > 0 ? (
              activities.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{item.title}</p>

                        {item.status && (
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                            {item.status}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : !isError ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No recent activities found.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
