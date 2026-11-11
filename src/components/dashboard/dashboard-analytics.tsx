"use client";

import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Loader2,
  RefreshCw,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardAnalytics } from "@/hooks/use-analytics";
import type { StatusCount } from "@/types/analytics";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="size-5 text-primary" />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

interface StatusChartProps {
  title: string;
  description: string;
  data: StatusCount[];
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function StatusChart({ title, description, data }: StatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No data available.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {data.map((item) => {
            const percentage = total
              ? Math.round((item.count / total) * 100)
              : 0;

            return (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">
                    {formatStatus(item.status)}
                  </span>
                  <span className="text-muted-foreground">
                    {item.count} ({percentage}%)
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(item.count / max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const numberFormatter = new Intl.NumberFormat("en-BD");

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

export default function DashboardAnalytics() {
  const { data, isPending, isError, error, isFetching, refetch } =
    useDashboardAnalytics();

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          Loading dashboard analytics...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 rounded-xl border p-8 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load dashboard analytics."}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const analytics = data?.data;

  if (!analytics) {
    return (
      <p className="text-sm text-muted-foreground">
        Analytics data is unavailable.
      </p>
    );
  }

  const { summary, outagesByStatus, serviceRequestsByStatus } = analytics;

  const stats: StatCardProps[] = [
    {
      title: "Total Outages",
      value: numberFormatter.format(summary.totalOutages),
      description: "Recorded power outages",
      icon: Zap,
    },
    {
      title: "Active Outages",
      value: numberFormatter.format(summary.activeOutages),
      description: "Outages awaiting resolution",
      icon: AlertTriangle,
    },
    {
      title: "Restored Outages",
      value: numberFormatter.format(summary.restoredOutages),
      description: "Outages currently marked restored",
      icon: CheckCircle2,
    },
    {
      title: "Total Schedules",
      value: numberFormatter.format(summary.totalSchedules),
      description: "All load shedding schedules",
      icon: CalendarClock,
    },
    {
      title: "Upcoming Schedules",
      value: numberFormatter.format(summary.upcomingSchedules),
      description: "Scheduled future load shedding",
      icon: Activity,
    },
    {
      title: "Service Requests",
      value: numberFormatter.format(summary.totalServiceRequests),
      description: "All customer service requests",
      icon: ClipboardList,
    },
    {
      title: "Pending Requests",
      value: numberFormatter.format(summary.pendingServiceRequests),
      description: "Requests awaiting action",
      icon: ClipboardList,
    },
    {
      title: "Successful Payments",
      value: numberFormatter.format(summary.successfulPayments),
      description: `Out of ${numberFormatter.format(summary.totalPayments)} payments`,
      icon: CreditCard,
    },
    {
      title: "Total Revenue",
      value: currencyFormatter.format(summary.totalRevenue),
      description: "Revenue from successful payments",
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">System Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor GridGuard operations and performance.
          </p>
        </div>

        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <StatusChart
          title="Outages by Status"
          description="Distribution of recorded outage statuses."
          data={outagesByStatus}
        />

        <StatusChart
          title="Service Requests by Status"
          description="Distribution of customer service requests."
          data={serviceRequestsByStatus}
        />
      </div>
    </div>
  );
}
