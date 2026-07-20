"use client";

import { FolderPlus, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataRoom } from "./data-room-provider";

/**
 * Shown when the current folder has no children. Copy adapts slightly for the
 * root vs. a nested folder, and both primary actions are one click away.
 */
export function EmptyState({
  onUpload,
  onNewFolder,
}: {
  onUpload: () => void;
  onNewFolder: () => void;
}) {
  const { currentFolderId } = useDataRoom();
  const atRoot = currentFolderId === null;

  return (
    <div className="animate-rise flex h-full flex-col items-center justify-center px-6 py-16 text-center">
      <div className="from-primary/15 to-primary/5 text-primary ring-primary/10 animate-float flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ring-1">
        <FolderOpen className="size-8" />
      </div>
      <h2 className="font-display mt-5 text-xl font-semibold tracking-tight">
        {atRoot ? "Your Data Room is empty" : "This folder is empty"}
      </h2>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
        Upload PDF documents or create folders to organize them. You can also
        drag &amp; drop PDFs anywhere here.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="brand"
          className="h-11 gap-2.5 px-5 text-[0.95rem]"
          onClick={onUpload}
        >
          <Upload className="size-4.5" />
          Upload PDF
        </Button>
        <Button
          variant="brand-outline"
          className="h-11 gap-2.5 px-5 text-[0.95rem]"
          onClick={onNewFolder}
        >
          <FolderPlus className="size-4.5" />
          New folder
        </Button>
      </div>
    </div>
  );
}
