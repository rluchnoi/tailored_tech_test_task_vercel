"use client";

import { FolderPlus, LayoutGrid, List, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
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
    <header className="bg-background/80 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur sm:px-6">
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      {/* Create actions collapse to icon buttons on mobile (sidebar hidden). */}
      <div className="flex items-center gap-1 md:hidden">
        <Button size="icon" variant="ghost" onClick={onUpload}>
          <Upload className="size-4" />
          <span className="sr-only">Upload PDF</span>
        </Button>
        <Button size="icon" variant="ghost" onClick={onNewFolder}>
          <FolderPlus className="size-4" />
          <span className="sr-only">New folder</span>
        </Button>
      </div>

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
