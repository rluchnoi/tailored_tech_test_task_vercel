"use client";

import { useDataRoom } from "./data-room-provider";
import { NodeCard } from "./node-card";
import { NodeRow } from "./node-row";
import { EmptyState } from "./empty-state";
import { ExplorerSkeleton } from "./explorer-skeleton";
import { SearchResults } from "./search-results";
import type { ViewMode } from "./data-room-shell";
import type { DataRoomNode, FileNode } from "@/lib/types";

export interface NodeActionHandlers {
  onOpenFile: (file: FileNode) => void;
  onRename: (node: DataRoomNode) => void;
  onDelete: (node: DataRoomNode) => void;
}

/**
 * Renders the contents of the current folder, switching between loading,
 * empty, grid, and list presentations. Navigation into folders and opening
 * files is dispatched from here.
 */
export function NodeExplorer({
  viewMode,
  onOpenFile,
  onRename,
  onDelete,
  onUpload,
  onNewFolder,
}: {
  viewMode: ViewMode;
  onUpload: () => void;
  onNewFolder: () => void;
} & NodeActionHandlers) {
  const { loading, children, navigateTo, isSearching } = useDataRoom();

  if (loading) return <ExplorerSkeleton viewMode={viewMode} />;

  const open = (node: DataRoomNode) => {
    if (node.type === "folder") navigateTo(node.id);
    else onOpenFile(node);
  };

  const actions: NodeActionHandlers = { onOpenFile, onRename, onDelete };

  // A live query replaces folder browsing with global search results.
  if (isSearching) {
    return <SearchResults onOpen={open} {...actions} />;
  }

  if (children.length === 0) {
    return <EmptyState onUpload={onUpload} onNewFolder={onNewFolder} />;
  }

  if (viewMode === "list") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="overflow-hidden rounded-xl border">
          <div className="text-muted-foreground bg-muted/50 hidden grid-cols-[1fr_120px_160px_40px] gap-3 border-b px-4 py-2.5 text-xs font-medium sm:grid">
            <span>Name</span>
            <span>Size</span>
            <span>Modified</span>
            <span className="sr-only">Actions</span>
          </div>
          <ul className="divide-y">
            {children.map((node) => (
              <NodeRow
                key={node.id}
                node={node}
                onOpen={() => open(node)}
                {...actions}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {children.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            onOpen={() => open(node)}
            {...actions}
          />
        ))}
      </div>
    </div>
  );
}
