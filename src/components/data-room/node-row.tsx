"use client";

import { formatBytes, formatRelativeTime } from "@/lib/format";
import { isFile } from "@/lib/types";
import { NodeIcon } from "./node-icon";
import { NodeActionsMenu } from "./node-actions-menu";
import type { NodeActionHandlers } from "./node-explorer";
import type { DataRoomNode } from "@/lib/types";

/** List-view row for a folder or file. Mirrors NodeCard's open/actions model. */
export function NodeRow({
  node,
  onOpen,
  index = 0,
  ...actions
}: {
  node: DataRoomNode;
  onOpen: () => void;
  index?: number;
} & NodeActionHandlers) {
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ animationDelay: `${Math.min(index * 22, 260)}ms` }}
      className="group animate-rise grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[1fr_120px_160px_40px]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <NodeIcon node={node} size="sm" />
        <span className="truncate text-sm font-medium" title={node.name}>
          {node.name}
        </span>
      </div>

      <span className="text-muted-foreground hidden text-xs tabular-nums sm:block">
        {isFile(node) ? formatBytes(node.size) : "—"}
      </span>
      <span className="text-muted-foreground hidden text-xs sm:block">
        {formatRelativeTime(node.updatedAt)}
      </span>

      <NodeActionsMenu node={node} {...actions} />
    </li>
  );
}
