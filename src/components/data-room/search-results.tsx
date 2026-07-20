"use client";

import { Fragment } from "react";
import { ChevronRight, FolderLock, SearchX } from "lucide-react";
import { useDataRoom } from "./data-room-provider";
import { NodeIcon } from "./node-icon";
import { NodeActionsMenu } from "./node-actions-menu";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { isFile } from "@/lib/types";
import type { NodeActionHandlers } from "./node-explorer";
import type { DataRoomNode } from "@/lib/types";
import type { SearchResult } from "@/lib/repository/nodeRepository";

/**
 * Flat, path-annotated results for a global filename search. Rendered instead of
 * the folder grid whenever a query is active — search spans the whole Data Room,
 * so a location-aware list reads better than a grid regardless of view mode.
 */
export function SearchResults({
  onOpen,
  ...actions
}: {
  onOpen: (node: DataRoomNode) => void;
} & NodeActionHandlers) {
  const { searchQuery, searchResults } = useDataRoom();

  if (searchResults.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-2xl">
          <SearchX className="size-8" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">No documents found</h2>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          Nothing matches{" "}
          <span className="text-foreground font-medium">
            “{searchQuery.trim()}”
          </span>
          . Try a different name.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      <p className="text-muted-foreground mb-3 text-sm">
        {searchResults.length} result{searchResults.length > 1 ? "s" : ""} for{" "}
        <span className="text-foreground font-medium">
          “{searchQuery.trim()}”
        </span>
      </p>
      <div className="overflow-hidden rounded-xl border">
        <ul className="divide-y">
          {searchResults.map((result) => (
            <SearchResultRow
              key={result.node.id}
              result={result}
              query={searchQuery.trim()}
              onOpen={() => onOpen(result.node)}
              {...actions}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SearchResultRow({
  result,
  query,
  onOpen,
  ...actions
}: {
  result: SearchResult;
  query: string;
  onOpen: () => void;
} & NodeActionHandlers) {
  const { node, path } = result;

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
      className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <div className="flex min-w-0 items-center gap-3">
        <NodeIcon node={node} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={node.name}>
            {highlight(node.name, query)}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <LocationTrail path={path} />
            {isFile(node) && (
              <span className="text-muted-foreground shrink-0 text-xs">
                · {formatBytes(node.size)}
              </span>
            )}
            <span className="text-muted-foreground shrink-0 text-xs">
              · {formatRelativeTime(node.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <NodeActionsMenu node={node} {...actions} />
    </li>
  );
}

/** Renders the ancestor folder path, e.g. "Data Room › Legal › Contracts". */
function LocationTrail({ path }: { path: SearchResult["path"] }) {
  return (
    <span className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs">
      <FolderLock className="size-3 shrink-0" />
      <span className="shrink-0">Data Room</span>
      {path.map((folder) => (
        <Fragment key={folder.id}>
          <ChevronRight className="size-3 shrink-0 opacity-60" />
          <span className="truncate">{folder.name}</span>
        </Fragment>
      ))}
    </span>
  );
}

/** Wraps case-insensitive matches of `query` in a highlighted <mark>. */
function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const at = lower.indexOf(q, i);
    if (at === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (at > i) parts.push(text.slice(i, at));
    parts.push(
      <mark
        key={key++}
        className="rounded-sm bg-amber-200/70 text-inherit dark:bg-amber-400/30"
      >
        {text.slice(at, at + q.length)}
      </mark>,
    );
    i = at + q.length;
  }
  return parts;
}
