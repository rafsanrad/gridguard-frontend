"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useCreateNotification,
  useNotificationDetail,
  useNotificationRecipients,
  useNotifications,
} from "@/hooks/use-notifications";

import type {
  CreateNotificationPayload,
  Notification,
  NotificationType,
} from "@/types/notification";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NOTIFICATION_TYPES: {
  value: NotificationType;
  label: string;
}[] = [
  { value: "LOAD_SHEDDING", label: "Load Shedding" },
  { value: "OUTAGE", label: "Outage" },
  { value: "SERVICE_REQUEST", label: "Service Request" },
  { value: "PAYMENT", label: "Payment" },
  { value: "SYSTEM", label: "System" },
];

const initialForm: CreateNotificationPayload = {
  title: "",
  message: "",
  type: "SYSTEM",
  userId: "",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getTypeLabel = (type: NotificationType) =>
  NOTIFICATION_TYPES.find((item) => item.value === type)?.label ?? type;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export default function NotificationManagement() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateNotificationPayload>({
    ...initialForm,
  });

  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientPage, setRecipientPage] = useState(1);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const notificationsQuery = useNotifications({
    page,
    limit: 10,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const recipientsQuery = useNotificationRecipients({
    page: recipientPage,
    limit: 10,
    search: recipientSearch,
    sortBy: "name",
    sortOrder: "asc",
  });

  const detailQuery = useNotificationDetail(detailsId);
  const createMutation = useCreateNotification();

  const notifications = notificationsQuery.data?.data ?? [];
  const meta = notificationsQuery.data?.meta;

  const recipients = recipientsQuery.data?.data ?? [];
  const recipientMeta = recipientsQuery.data?.meta;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const resetCreateForm = () => {
    setForm({ ...initialForm });
    setSelectedRecipient(null);
    setRecipientSearch("");
    setRecipientPage(1);
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (createMutation.isPending) return;

    setCreateOpen(open);

    if (!open) {
      resetCreateForm();
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const message = form.message.trim();

    if (title.length < 3 || title.length > 150) {
      toast.error("Title must contain 3 to 150 characters");
      return;
    }

    if (message.length < 1 || message.length > 500) {
      toast.error("Message must contain 1 to 500 characters");
      return;
    }

    if (!form.userId) {
      toast.error("Please select a customer");
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...form,
        title,
        message,
      });

      toast.success("Notification created successfully");
      setCreateOpen(false);
      resetCreateForm();
      setPage(1);
      setSearch("");
      setSearchInput("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRefresh = async () => {
    try {
      await notificationsQuery.refetch();
      toast.success("Notifications refreshed");
    } catch {
      toast.error("Failed to refresh notifications");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Notification Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send notifications to customers and review notification history.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Notification
        </Button>
      </div>

      {/* Search and refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title or message..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => void handleRefresh()}
          disabled={notificationsQuery.isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              notificationsQuery.isFetching ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* Notification history */}
      <div className="overflow-hidden rounded-xl border">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="size-5" />
            <h2 className="font-semibold">Notification History</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta
              ? `${meta.total} notifications found`
              : "Loading notifications"}
          </p>
        </div>

        {notificationsQuery.isPending ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading notifications...
          </div>
        ) : notificationsQuery.isError ? (
          <div className="space-y-3 p-10 text-center">
            <p className="text-sm text-destructive">
              {getErrorMessage(notificationsQuery.error)}
            </p>
            <Button
              variant="outline"
              onClick={() => void notificationsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="font-medium">No notifications found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a notification or try another search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Notification</th>
                  <th className="px-5 py-3 font-medium">Recipient</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {notifications.map((notification: Notification) => (
                  <tr key={notification.id} className="hover:bg-muted/30">
                    <td className="max-w-xs px-5 py-4">
                      <p className="truncate font-medium">
                        {notification.title}
                      </p>
                      <p className="mt-1 truncate text-muted-foreground">
                        {notification.message}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {notification.user?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.user?.email ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {getTypeLabel(notification.type)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          notification.isRead
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailsId(notification.id)}
                      >
                        <Eye className="mr-2 size-4" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create notification dialog */}
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>
              Select a customer and compose a notification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-5">
            {/* Recipient selection */}
            <div className="space-y-2">
              <Label>Recipient</Label>

              {selectedRecipient ? (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {selectedRecipient.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedRecipient.email}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedRecipient(null);
                      setForm((current) => ({ ...current, userId: "" }));
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={recipientSearch}
                      onChange={(event) => {
                        setRecipientSearch(event.target.value);
                        setRecipientPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-44 space-y-1 overflow-y-auto">
                    {recipientsQuery.isPending ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Loading customers...
                      </p>
                    ) : recipientsQuery.isError ? (
                      <p className="py-4 text-center text-sm text-destructive">
                        Failed to load customers.
                      </p>
                    ) : recipients.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No customers found.
                      </p>
                    ) : (
                      recipients.map((recipient) => (
                        <button
                          key={recipient.id}
                          type="button"
                          onClick={() => {
                            setSelectedRecipient(recipient);
                            setForm((current) => ({
                              ...current,
                              userId: recipient.id,
                            }));
                          }}
                          className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                        >
                          <p className="text-sm font-medium">
                            {recipient.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {recipient.email}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  {recipientMeta && recipientMeta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-xs text-muted-foreground">
                        Page {recipientMeta.page} of {recipientMeta.totalPages}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={recipientPage <= 1}
                          onClick={() =>
                            setRecipientPage((current) =>
                              Math.max(1, current - 1),
                            )
                          }
                        >
                          Previous
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={recipientPage >= recipientMeta.totalPages}
                          onClick={() =>
                            setRecipientPage((current) => current + 1)
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification type */}
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>

              <select
                id="notification-type"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as NotificationType,
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                maxLength={150}
                placeholder="Enter notification title"
                required
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.title.length}/150
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                maxLength={500}
                rows={5}
                placeholder="Write your notification message..."
                required
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.message.length}/500
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createMutation.isPending || !form.userId}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Send Notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notification details dialog */}
      <Dialog
        open={Boolean(detailsId)}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              View notification information and delivery status.
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isPending ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Loading details...</span>
            </div>
          ) : detailQuery.isError ? (
            <p className="py-6 text-sm text-destructive">
              {getErrorMessage(detailQuery.error)}
            </p>
          ) : detailQuery.data?.data ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Title</p>
                <p className="mt-1 font-medium">
                  {detailQuery.data.data.title}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Message</p>
                <p className="mt-1 whitespace-pre-wrap">
                  {detailQuery.data.data.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="mt-1 font-medium">
                    {getTypeLabel(detailQuery.data.data.type)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Read Status</p>
                  <p className="mt-1 font-medium">
                    {detailQuery.data.data.isRead ? "Read" : "Unread"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Recipient</p>
                <p className="mt-1 font-medium">
                  {detailQuery.data.data.user?.name ?? "Unknown"}
                </p>
                <p className="text-muted-foreground">
                  {detailQuery.data.data.user?.email ?? "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p className="mt-1">
                    {formatDate(detailQuery.data.data.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Read At</p>
                  <p className="mt-1">
                    {detailQuery.data.data.readAt
                      ? formatDate(detailQuery.data.data.readAt)
                      : "Not read yet"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
