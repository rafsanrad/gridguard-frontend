import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardAnalyticsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading dashboard analytics"
      aria-busy="true"
    >
      {/* Section heading and refresh button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* Statistics cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-24" />
              </div>

              <Skeleton className="size-10 rounded-lg" />
            </div>

            <Skeleton className="mt-4 h-3 w-44 max-w-full" />
          </div>
        ))}
      </div>

      {/* Status charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, chartIndex) => (
          <div
            key={chartIndex}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>

            <div className="mt-6 space-y-5">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div key={rowIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  <Skeleton
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${100 - rowIndex * 15}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">
        Loading GridGuard dashboard statistics and charts.
      </span>
    </div>
  );
}
