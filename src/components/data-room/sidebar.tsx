"use client";

import { FolderPlus, Upload, FolderLock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataRoom } from "./data-room-provider";
import { formatBytes } from "@/lib/format";

/**
 * Left rail: brand, the two primary create actions, and a lightweight usage
 * summary for the current folder. Hidden on small screens where the toolbar
 * carries the same actions.
 */
export function Sidebar({
  onNewFolder,
  onUpload,
}: {
  onNewFolder: () => void;
  onUpload: () => void;
}) {
  const { stats } = useDataRoom();

  return (
    <aside className="bg-background hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <FolderLock className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Acme Data Room</p>
          <p className="text-muted-foreground text-xs">Due diligence</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3 py-2">
        <Button className="justify-start gap-2" onClick={onUpload}>
          <Upload className="size-4" />
          Upload PDF
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-2"
          onClick={onNewFolder}
        >
          <FolderPlus className="size-4" />
          New folder
        </Button>
      </div>

      <div className="mt-auto px-5 py-5">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <HardDrive className="size-3.5" />
          {/* Totals include everything nested, not just direct children. */}
          <span>Total contents</span>
        </div>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Folders</span>
            <span className="font-medium tabular-nums">{stats.folders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Files</span>
            <span className="font-medium tabular-nums">{stats.files}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium tabular-nums">
              {formatBytes(stats.size)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
