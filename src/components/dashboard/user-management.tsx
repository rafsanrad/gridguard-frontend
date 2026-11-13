"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  useDeleteUser,
  useUpdateUser,
  useUpdateUserStatus,
  useUsers,
} from "@/hooks/use-users";

import type {
  ManagedUser,
  UpdateUserPayload,
  UserGender,
  UserRole,
} from "@/types/user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 10;

const roles: UserRole[] = ["CUSTOMER", "OPERATOR", "ADMIN"];
const genders: UserGender[] = ["MALE", "FEMALE", "OTHER"];

function UserEditForm({
  user,
  onClose,
}: {
  user: ManagedUser;
  onClose: () => void;
}) {
  const updateUser = useUpdateUser();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [gender, setGender] = useState<UserGender | "">(user.gender ?? "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload: UpdateUserPayload = {
      name: name.trim(),
      phone: phone.trim(),
      role,
    };

    if (gender) payload.gender = gender;

    try {
      await updateUser.mutateAsync({
        id: user.id,
        payload,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-lg border bg-muted/20 p-4"
    >
      <h3 className="font-semibold">Edit User</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Name</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Phone</span>
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={20}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Gender</span>
          <select
            value={gender}
            onChange={(event) =>
              setGender(event.target.value as UserGender | "")
            }
            className="h-10 w-full rounded-md border bg-background px-3"
          >
            <option value="">Not specified</option>
            {genders.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="h-10 w-full rounded-md border bg-background px-3"
          >
            {roles.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function UserManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const roleParam = searchParams.get("role") ?? "";
  const role = roles.includes(roleParam as UserRole)
    ? (roleParam as UserRole)
    : undefined;

  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [searchInput, setSearchInput] = useState(search);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Sync URL search state during navigation.
  const [previousSearch, setPreviousSearch] = useState(search);

  if (previousSearch !== search) {
    setPreviousSearch(search);
    setSearchInput(search);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === search) return;

      const params = new URLSearchParams(searchParams.toString());

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");

      params.delete("page");

      const query = params.toString();
      router.replace(query ? `/admin/users?${query}` : "/admin/users", {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search, searchParams, router]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const query = params.toString();

    router.push(query ? `/admin/users?${query}` : "/admin/users", {
      scroll: false,
    });
  }

  const usersQuery = useUsers({
    page,
    limit: PAGE_SIZE,
    search,
    role,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  async function handleStatusChange(user: ManagedUser) {
    const nextStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    if (
      !window.confirm(
        `Are you sure you want to ${nextStatus === "BLOCKED" ? "block" : "activate"} ${user.name}?`,
      )
    ) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      await updateStatus.mutateAsync({
        id: user.id,
        status: nextStatus,
      });
      setActionMessage(`${user.name} is now ${nextStatus}.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Status update failed",
      );
    }
  }

  async function handleDelete(user: ManagedUser) {
    if (
      !window.confirm(`Delete ${user.name}? This will soft-delete the account.`)
    ) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      await deleteUser.mutateAsync(user.id);
      setActionMessage(`${user.name} was deleted.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="size-6 text-primary" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage registered customers, operators, and admins.
          </p>
        </div>

        <Button
          variant="outline"
          disabled={usersQuery.isFetching}
          onClick={() => void usersQuery.refetch()}
        >
          <RefreshCw
            className={`size-4 ${usersQuery.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email, or phone..."
              className="pl-9"
            />
          </div>

          <select
            aria-label="Filter users by role"
            value={role ?? ""}
            onChange={(event) =>
              updateParams({
                role: event.target.value || null,
                page: null,
              })
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All Roles</option>
            {roles.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      {actionMessage && (
        <p role="status" className="text-sm text-green-600">
          {actionMessage}
        </p>
      )}

      {usersQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <p className="text-destructive">{usersQuery.error.message}</p>
            <Button variant="outline" onClick={() => void usersQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No users found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="break-words text-base">
                      {user.name}
                    </CardTitle>
                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "ACTIVE"
                          ? "text-green-600"
                          : "text-destructive"
                      }
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                  <p>Phone: {user.phone || "N/A"}</p>
                  <p>Gender: {user.gender || "N/A"}</p>
                  <p>Email: {user.emailVerified ? "Verified" : "Unverified"}</p>
                  <p>
                    Joined:{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-BD")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditingId(editingId === user.id ? null : user.id)
                    }
                  >
                    {editingId === user.id ? "Close Edit" : "Edit"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateStatus.isPending}
                    onClick={() => void handleStatusChange(user)}
                  >
                    {user.status === "ACTIVE" ? "Block" : "Activate"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleteUser.isPending}
                    onClick={() => void handleDelete(user)}
                  >
                    Delete
                  </Button>
                </div>

                {editingId === user.id && (
                  <UserEditForm
                    key={user.id}
                    user={user}
                    onClose={() => setEditingId(null)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} users
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || usersQuery.isFetching}
              onClick={() =>
                updateParams({
                  page: page > 2 ? String(page - 1) : null,
                })
              }
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages || usersQuery.isFetching}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
