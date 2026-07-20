import { Skeleton } from "@/components/ui/skeleton";
import type { ViewMode } from "./data-room-shell";

/** Placeholder shown while the current folder's contents load from IndexedDB. */
export function ExplorerSkeleton({ viewMode }: { viewMode: ViewMode }) {
  const count = 10;

  if (viewMode === "list") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="bg-card divide-y overflow-hidden rounded-xl border shadow-sm">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border p-3.5 shadow-sm">
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
