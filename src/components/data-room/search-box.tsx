"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDataRoom } from "./data-room-provider";

/**
 * Global filename search field. Bound directly to the provider's query; the
 * provider debounces and runs the search. A clear button appears once there's
 * text, and Escape also clears.
 */
export function SearchBox({ className }: { className?: string }) {
  const { searchQuery, setSearchQuery } = useDataRoom();

  return (
    <div className={cn("group relative", className)}>
      <Search className="text-muted-foreground group-focus-within:text-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 transition-colors" />
      <Input
        type="search"
        role="searchbox"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
        placeholder="Search documents…"
        aria-label="Search documents by name"
        className="bg-card h-9 pl-8 pr-8 shadow-sm [&::-webkit-search-cancel-button]:appearance-none"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
