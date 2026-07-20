"use client";

/**
 * Central client-side state for the Data Room. Owns the current navigation
 * position, the children of the current folder, and every mutation. Components
 * consume this via the `useDataRoom` hook and never touch the repository
 * directly, which keeps data-loading logic in one place.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as repo from "@/lib/repository/nodeRepository";
import { seedIfEmpty } from "@/lib/repository/seed";
import type { DataRoomNode, FolderNode } from "@/lib/types";

export const PDF_MIME = "application/pdf";

export interface UploadResult {
  added: number;
  rejected: string[];
}

interface DataRoomContextValue {
  loading: boolean;
  currentFolderId: string | null;
  /** Ancestors of the current folder, root-first, including the current folder. */
  breadcrumb: FolderNode[];
  children: DataRoomNode[];
  /** Recursive totals for the current folder's whole subtree. */
  stats: repo.FolderStats;
  navigateTo: (folderId: string | null) => void;
  createFolder: (name: string) => Promise<FolderNode>;
  uploadFiles: (files: File[]) => Promise<UploadResult>;
  rename: (id: string, name: string) => Promise<DataRoomNode>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const DataRoomContext = createContext<DataRoomContextValue | null>(null);

export function DataRoomProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderNode[]>([]);
  const [nodes, setNodes] = useState<DataRoomNode[]>([]);
  const [stats, setStats] = useState<repo.FolderStats>({
    folders: 0,
    files: 0,
    size: 0,
  });

  // Guards against out-of-order async loads when navigation changes rapidly.
  const loadToken = useRef(0);

  const load = useCallback(async (folderId: string | null) => {
    const token = ++loadToken.current;
    const [items, ancestors, subtree] = await Promise.all([
      repo.listChildren(folderId),
      repo.getAncestors(folderId),
      repo.getSubtreeStats(folderId),
    ]);
    if (token !== loadToken.current) return; // a newer load superseded us
    setNodes(sortNodes(items));
    setBreadcrumb(ancestors);
    setStats(subtree);
  }, []);

  // Initial mount: seed demo content once, then load the root.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await seedIfEmpty();
        if (active) await load(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const refresh = useCallback(
    () => load(currentFolderId),
    [load, currentFolderId],
  );

  const navigateTo = useCallback(
    (folderId: string | null) => {
      setCurrentFolderId(folderId);
      void load(folderId);
    },
    [load],
  );

  const createFolder = useCallback(
    async (name: string) => {
      const folder = await repo.createFolder(currentFolderId, name);
      await refresh();
      return folder;
    },
    [currentFolderId, refresh],
  );

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadResult> => {
      const rejected: string[] = [];
      let added = 0;
      for (const file of files) {
        const isPdf =
          file.type === PDF_MIME ||
          file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          rejected.push(file.name);
          continue;
        }
        await repo.createFile(currentFolderId, file);
        added += 1;
      }
      if (added > 0) await refresh();
      return { added, rejected };
    },
    [currentFolderId, refresh],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      const updated = await repo.renameNode(id, name);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await repo.deleteNode(id);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<DataRoomContextValue>(
    () => ({
      loading,
      currentFolderId,
      breadcrumb,
      children: nodes,
      stats,
      navigateTo,
      createFolder,
      uploadFiles,
      rename,
      remove,
      refresh,
    }),
    [
      loading,
      currentFolderId,
      breadcrumb,
      nodes,
      stats,
      navigateTo,
      createFolder,
      uploadFiles,
      rename,
      remove,
      refresh,
    ],
  );

  return (
    <DataRoomContext.Provider value={value}>
      {children}
    </DataRoomContext.Provider>
  );
}

export function useDataRoom(): DataRoomContextValue {
  const ctx = useContext(DataRoomContext);
  if (!ctx) {
    throw new Error("useDataRoom must be used within a DataRoomProvider");
  }
  return ctx;
}

/** Folders first, then files, each alphabetically (case-insensitive). */
function sortNodes(nodes: DataRoomNode[]): DataRoomNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
