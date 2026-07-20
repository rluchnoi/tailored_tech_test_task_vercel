"use client";

import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isFile } from "@/lib/types";
import type { NodeActionHandlers } from "./node-explorer";
import type { DataRoomNode } from "@/lib/types";

/**
 * The per-node "⋮" menu shared by the grid card and list row. Preview only
 * appears for files; rename and delete apply to both.
 */
export function NodeActionsMenu({
  node,
  onOpenFile,
  onRename,
  onDelete,
  className,
}: {
  node: DataRoomNode;
  className?: string;
} & NodeActionHandlers) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            // Stop clicks from bubbling to the card/row's open handler.
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for ${node.name}`}
            className={cn(
              "text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          />
        }
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        {isFile(node) && (
          <DropdownMenuItem onClick={() => onOpenFile(node)}>
            <Eye className="size-4" />
            Preview
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onRename(node)}>
          <Pencil className="size-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(node)}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
