"use client";

import { FolderPlus, LayoutGrid, List, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { SearchBox } from "./search-box";
import { ThemeSwitcher } from "./theme-switcher";
import type { ViewMode } from "./data-room-shell";

/**
 * Sticky header above the file grid: breadcrumb trail on the left, view toggle
 * and (on mobile) the create actions on the right.
 */
export function Toolbar({
  viewMode,
  onViewModeChange,
  onNewFolder,
  onUpload,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewFolder: () => void;
  onUpload: () => void;
}) {
  return (
    <header className="bg-background/70 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b px-4 py-3 backdrop-blur-md transition-colors sm:flex-nowrap sm:gap-3 sm:px-6">
      <div className="order-1 flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>

        {/* Create actions collapse to icon buttons on mobile (sidebar hidden).
            Brand-red icons and a roomier tap target keep them thumb-friendly. */}
        <div className="flex items-center gap-0.5 md:hidden">
          <Button
            size="icon-lg"
            variant="ghost"
            className="text-brand hover:bg-brand/10 hover:text-brand"
            onClick={onUpload}
          >
            <Upload className="size-5" />
            <span className="sr-only">Upload PDF</span>
          </Button>
          <Button
            size="icon-lg"
            variant="ghost"
            className="text-brand hover:bg-brand/10 hover:text-brand"
            onClick={onNewFolder}
          >
            <FolderPlus className="size-5" />
            <span className="sr-only">New folder</span>
          </Button>
        </div>
      </div>

      {/* Search: full-width second row on mobile, inline between breadcrumb and
          the view toggle on larger screens. */}
      <SearchBox className="order-3 w-full sm:order-2 sm:w-56 md:w-72" />

      <div className="order-2 flex shrink-0 items-center gap-1.5 sm:order-3">
        <div className="bg-muted flex items-center rounded-lg p-0.5">
          <ViewToggleButton
            active={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </ViewToggleButton>
          <ViewToggleButton
            active={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            label="List view"
          >
            <List className="size-4" />
          </ViewToggleButton>
        </div>

        <div className="bg-border h-5 w-px" aria-hidden />
        <ThemeSwitcher />
      </div>
    </header>
  );
}

function ViewToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
