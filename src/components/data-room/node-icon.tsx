import { Folder, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataRoomNode } from "@/lib/types";

/**
 * Colored icon tile for a node — amber for folders, red for PDFs — matching the
 * visual vocabulary of familiar file explorers. `size` toggles between the
 * larger grid-card tile and the compact list-row tile.
 */
export function NodeIcon({
  node,
  size = "md",
  className,
}: {
  node: DataRoomNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const isFolder = node.type === "folder";
  const box = size === "sm" ? "size-9 rounded-lg" : "size-11 rounded-xl";
  const glyph = size === "sm" ? "size-4.5" : "size-5.5";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        box,
        isFolder
          ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          : "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
        className,
      )}
    >
      {isFolder ? (
        <Folder className={cn(glyph, "fill-current/20")} />
      ) : (
        <FileText className={glyph} />
      )}
    </div>
  );
}
