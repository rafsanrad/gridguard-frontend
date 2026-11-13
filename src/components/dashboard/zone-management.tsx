"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useCreateZone,
  useDeleteZone,
  useUpdateZone,
  useZones,
} from "@/hooks/use-zones";

import type { CreateZonePayload, Zone } from "@/types/zone";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 10;

function ZoneForm({ zone, onClose }: { zone?: Zone; onClose: () => void }) {
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();

  const [name, setName] = useState(zone?.name ?? "");
  const [code, setCode] = useState(zone?.code ?? "");
  const [description, setDescription] = useState(zone?.description ?? "");
  const [isActive, setIsActive] = useState(zone?.isActive ?? true);
  const [error, setError] = useState("");

  const isPending = createZone.isPending || updateZone.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload: CreateZonePayload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
    };

    try {
      if (zone) {
        await updateZone.mutateAsync({
          id: zone.id,
          payload: { ...payload, isActive },
        });
      } else {
        await createZone.mutateAsync(payload);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save zone");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-muted/20 p-4"
    >
      <h3 className="font-semibold">{zone ? "Edit Zone" : "Create Zone"}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Zone Name *</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
            placeholder="Enter zone name"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Zone Code *</span>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            minLength={2}
            maxLength={50}
            required
            placeholder="Enter unique code"
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Optional description"
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </label>

      {zone && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 accent-primary"
          />
          Active Zone
        </label>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : zone ? "Save Changes" : "Create Zone"}
        </Button>

        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ZoneManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [searchInput, setSearchInput] = useState(search);
  const [previousSearch, setPreviousSearch] = useState(search);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

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

      router.replace(query ? `/admin/zones?${query}` : "/admin/zones", {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search, searchParams, router]);

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }

    const query = params.toString();

    router.push(query ? `/admin/zones?${query}` : "/admin/zones", {
      scroll: false,
    });
  }

  const zonesQuery = useZones({
    page,
    limit: PAGE_SIZE,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const zones = zonesQuery.data?.data ?? [];
  const meta = zonesQuery.data?.meta;

  async function toggleActive(zone: Zone) {
    const nextStatus = !zone.isActive;

    if (
      !window.confirm(`${nextStatus ? "Activate" : "Deactivate"} ${zone.name}?`)
    ) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      await updateZone.mutateAsync({
        id: zone.id,
        payload: { isActive: nextStatus },
      });

      setActionMessage(
        `${zone.name} is now ${nextStatus ? "active" : "inactive"}.`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDeactivate(zone: Zone) {
    if (!window.confirm(`Deactivate ${zone.name}? This is a soft deletion.`)) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      await deleteZone.mutateAsync(zone.id);
      setActionMessage(`${zone.name} was deactivated.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Deactivation failed",
      );
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <MapPinned className="size-6 text-primary" />
            Zone Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage electricity distribution zones.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={zonesQuery.isFetching}
            onClick={() => void zonesQuery.refetch()}
          >
            <RefreshCw
              className={`size-4 ${zonesQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            onClick={() => {
              setShowCreate((value) => !value);
              setEditingId(null);
            }}
          >
            <Plus className="size-4" />
            Add Zone
          </Button>
        </div>
      </div>

      {showCreate && <ZoneForm onClose={() => setShowCreate(false)} />}

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search zone name, code, or description..."
              className="pl-9"
            />
          </div>
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

      {zonesQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      ) : zonesQuery.isError ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <p className="text-destructive">{zonesQuery.error.message}</p>
            <Button variant="outline" onClick={() => void zonesQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : zones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No zones found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="break-words text-lg">
                      {zone.name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Code: {zone.code}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      zone.isActive ? "text-green-600" : "text-destructive"
                    }
                  >
                    {zone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="min-h-10 text-sm text-muted-foreground">
                  {zone.description || "No description provided."}
                </p>

                <p className="text-xs text-muted-foreground">
                  Created:{" "}
                  {new Date(zone.createdAt).toLocaleDateString("en-BD")}
                </p>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setEditingId(editingId === zone.id ? null : zone.id);
                    }}
                  >
                    {editingId === zone.id ? "Close Edit" : "Edit"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateZone.isPending}
                    onClick={() => void toggleActive(zone)}
                  >
                    {zone.isActive ? "Deactivate" : "Activate"}
                  </Button>

                  {zone.isActive && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteZone.isPending}
                      onClick={() => void handleDeactivate(zone)}
                    >
                      Soft Delete
                    </Button>
                  )}
                </div>

                {editingId === zone.id && (
                  <ZoneForm
                    key={zone.id}
                    zone={zone}
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
            Page {meta.page} of {meta.totalPages} · {meta.total} zones
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || zonesQuery.isFetching}
              onClick={() => changePage(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages || zonesQuery.isFetching}
              onClick={() => changePage(page + 1)}
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
