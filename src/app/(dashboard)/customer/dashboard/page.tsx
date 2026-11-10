"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  CreditCard,
  House,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useMyOutageReports,
  useMyServiceRequests,
  useMyPayments,
  useMyNotifications,
} from "@/hooks/use-customer-data";

interface StatCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  total?: number;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}

function StatCard({
  title,
  description,
  icon: Icon,
  total,
  isPending,
  isError,
  onRetry,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>

        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>

      <CardContent className="space-y-2">
        {isPending ? (
          <Skeleton className="h-9 w-16" />
        ) : isError ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-destructive">Failed to load</span>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRetry}
              aria-label={`Retry loading ${title}`}
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        ) : (
          <p className="text-3xl font-bold">{total ?? 0}</p>
        )}

        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function CustomerDashboardPage() {
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

  const notifications = useMyNotifications({
    page: 1,
    limit: 5,
  });

  const stats: StatCardProps[] = [
    {
      title: "Outage Reports",
      description: "Your submitted outage reports",
      icon: AlertTriangle,
      total: outageReports.data?.meta.total,
      isPending: outageReports.isPending,
      isError: outageReports.isError,
      onRetry: () => {
        void outageReports.refetch();
      },
    },
    {
      title: "Service Requests",
      description: "Your electricity service requests",
      icon: Wrench,
      total: serviceRequests.data?.meta.total,
      isPending: serviceRequests.isPending,
      isError: serviceRequests.isError,
      onRetry: () => {
        void serviceRequests.refetch();
      },
    },
    {
      title: "Payments",
      description: "Your payment transactions",
      icon: CreditCard,
      total: payments.data?.meta.total,
      isPending: payments.isPending,
      isError: payments.isError,
      onRetry: () => {
        void payments.refetch();
      },
    },
    {
      title: "Notifications",
      description: "Your received notifications",
      icon: Bell,
      total: notifications.data?.meta.total,
      isPending: notifications.isPending,
      isError: notifications.isError,
      onRetry: () => {
        void notifications.refetch();
      },
    },
  ];

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <House className="size-8 text-success" />

          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        </div>

        <p className="text-muted-foreground">
          View power updates, report outages, and manage electricity services.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />

            <CardTitle>Recent Activity</CardTitle>
          </div>

          <CardDescription>
            Your latest electricity service activities
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serviceRequests.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : serviceRequests.isError ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
              <p className="text-sm text-destructive">
                Failed to load recent activity.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void serviceRequests.refetch();
                }}
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </div>
          ) : serviceRequests.data?.data.length ? (
            <div className="space-y-3">
              {serviceRequests.data.data.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{request.title}</p>

                    <p className="text-xs text-muted-foreground">
                      Service Request
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium">
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                No recent service requests found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
