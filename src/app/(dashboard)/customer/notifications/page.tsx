"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  useMarkNotificationAsRead,
  useMyNotifications,
} from "@/hooks/use-customer-data";

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatType(type: string) {
  return type.replaceAll("_", " ");
}

export default function CustomerNotificationsPage() {
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const notificationsQuery = useMyNotifications({
    page,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const markReadMutation = useMarkNotificationAsRead();

  const notifications = notificationsQuery.data?.data ?? [];
  const meta = notificationsQuery.data?.meta;

  const unreadOnPage = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id);

    try {
      await markReadMutation.mutateAsync(id);
      toast.success("Notification marked as read.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update notification.",
      );
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Bell className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>

          <p className="text-muted-foreground">
            Stay updated about electricity services and important alerts.
          </p>
        </div>

        <Badge variant="secondary">{unreadOnPage} unread on this page</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>My Notifications</CardTitle>

              <CardDescription>
                {meta
                  ? `${meta.total} notification(s)`
                  : "Your recent alerts and updates"}
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={notificationsQuery.isFetching}
              onClick={() => void notificationsQuery.refetch()}
            >
              <RefreshCw
                className={`size-4 ${
                  notificationsQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {notificationsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-28 w-full" />
              ))}
            </div>
          ) : notificationsQuery.isError ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3">
              <p className="text-sm text-destructive">
                Failed to load notifications.
              </p>

              <Button
                variant="outline"
                onClick={() => void notificationsQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
              <BellOff className="size-10 text-muted-foreground" />

              <p className="font-medium">No notifications yet</p>

              <p className="max-w-sm text-sm text-muted-foreground">
                New notifications about your electricity services will appear
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const isMarking =
                  markingId === notification.id && markReadMutation.isPending;

                return (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      notification.isRead
                        ? "bg-background"
                        : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div
                          className={`mt-1 size-2.5 shrink-0 rounded-full ${
                            notification.isRead
                              ? "bg-muted-foreground/30"
                              : "bg-primary"
                          }`}
                        />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {notification.title}
                            </h3>

                            {!notification.isRead && (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline">
                              {formatType(notification.type)}
                            </Badge>

                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={markReadMutation.isPending}
                          onClick={() => void handleMarkAsRead(notification.id)}
                        >
                          {isMarking ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || notificationsQuery.isFetching}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= meta.totalPages || notificationsQuery.isFetching
                  }
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
