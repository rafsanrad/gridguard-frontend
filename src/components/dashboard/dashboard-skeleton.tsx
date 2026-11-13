import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  title?: string;
  showCharts?: boolean;
}

export default function DashboardSkeleton({
  title = "Dashboard",
  showCharts = true,
}: DashboardSkeletonProps) {
  return (
    <section
      className="space-y-8"
      role="status"
      aria-label={`Loading ${title}`}
    >
      <div className="space-y-4">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-lg" />
            </div>

            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </div>
        ))}
      </div>

      {showCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="space-y-6 rounded-xl border bg-card p-6"
            >
              <Skeleton className="h-6 w-48 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />

              <div className="space-y-5">
                {Array.from({ length: 4 }).map((_, row) => (
                  <div key={row} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>

                    <Skeleton
                      className="h-3 rounded-full"
                      style={{ width: `${90 - row * 15}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
