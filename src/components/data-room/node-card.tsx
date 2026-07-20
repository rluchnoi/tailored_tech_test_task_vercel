"use client";

import { cn } from "@/lib/utils";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { isFile } from "@/lib/types";
import { NodeIcon } from "./node-icon";
import { NodeActionsMenu } from "./node-actions-menu";
import type { NodeActionHandlers } from "./node-explorer";
import type { DataRoomNode } from "@/lib/types";

/**
 * Grid tile for a single folder or file. The whole card is a button (open the
 * folder / preview the file); the actions menu floats in the corner and stops
 * propagation so it never triggers an open.
 */
export function NodeCard({
  node,
  onOpen,
  index = 0,
  ...actions
}: {
  node: DataRoomNode;
  onOpen: () => void;
  index?: number;
} & NodeActionHandlers) {
  const meta = isFile(node)
    ? `${formatBytes(node.size)} · ${formatRelativeTime(node.updatedAt)}`
    : `Updated ${formatRelativeTime(node.updatedAt)}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      // Capped stagger so a large folder still finishes settling quickly.
      style={{ animationDelay: `${Math.min(index * 28, 320)}ms` }}
      className={cn(
        "group animate-rise bg-card relative flex flex-col gap-3 rounded-xl border p-3.5 text-left",
        "transition-[box-shadow,border-color,background-color] duration-200 ease-out",
        "hover:border-primary/35 hover:bg-accent/40 hover:shadow-md hover:shadow-primary/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-start justify-between">
        <NodeIcon node={node} />
        <NodeActionsMenu
          node={node}
          {...actions}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium" title={node.name}>
          {node.name}
        </p>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">{meta}</p>
      </div>
    </div>
  );
}
