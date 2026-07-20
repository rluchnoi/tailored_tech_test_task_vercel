"use client";

import { FolderPlus, Upload, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataRoom } from "./data-room-provider";
import { AcmeLogo } from "./acme-logo";
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
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-r transition-colors md:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <AcmeLogo />
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-tight">
            Acme Corp.
          </p>
          <p className="text-muted-foreground text-sm">Data Room</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-3 py-2">
        <Button
          variant="brand"
          className="h-11 justify-start gap-2.5 px-4 text-[0.95rem]"
          onClick={onUpload}
        >
          <Upload className="size-4.5" />
          Upload PDF
        </Button>
        <Button
          variant="brand-outline"
          className="h-11 justify-start gap-2.5 px-4 text-[0.95rem]"
          onClick={onNewFolder}
        >
          <FolderPlus className="size-4.5" />
          New folder
        </Button>
      </div>

      <div className="mt-auto p-3">
        <div className="bg-card/60 rounded-xl border p-4 shadow-sm">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <HardDrive className="size-3.5" />
            {/* Totals include everything nested, not just direct children. */}
            <span>Total contents</span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Folders</span>
              <span className="font-medium tabular-nums">{stats.folders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Files</span>
              <span className="font-medium tabular-nums">{stats.files}</span>
            </div>
            <div className="border-border/70 mt-1 flex justify-between border-t pt-1.5">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium tabular-nums">
                {formatBytes(stats.size)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
