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
  ...actions
}: {
  node: DataRoomNode;
  onOpen: () => void;
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
      className={cn(
        "group bg-background relative flex flex-col gap-3 rounded-xl border p-3.5 text-left transition-all",
        "hover:border-foreground/15 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
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
