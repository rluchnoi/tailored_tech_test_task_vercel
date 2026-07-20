/**
 * Repository layer — the single source of truth for reading and writing the
 * Data Room tree. Every persistence concern (IndexedDB transactions, id
 * generation, recursive deletes, duplicate-name resolution) lives here so the
 * React layer only ever deals with plain domain objects.
 *
 * This is deliberately the seam where a real backend would slot in: swap the
 * IndexedDB calls below for `fetch()` requests and the UI would not change.
 */

import {
  BLOBS_STORE,
  NODES_STORE,
  PARENT_INDEX,
  readRequest,
  withStore,
} from "@/lib/db";
import { uniqueName } from "@/lib/naming";
import type { DataRoomNode, FileNode, FolderNode } from "@/lib/types";

interface BlobRecord {
  blobId: string;
  blob: Blob;
}

function newId(): string {
  // crypto.randomUUID is available in every browser we target.
  return crypto.randomUUID();
}

function now(): number {
  return Date.now();
}

/** Lists the direct children of a folder (or the root when `parentId` is null). */
export async function listChildren(
  parentId: string | null,
): Promise<DataRoomNode[]> {
  // IndexedDB cannot index on `null`, so for the root we fetch everything and
  // filter; for a real parent we use the indexed range query.
  const all = await readRequest<DataRoomNode[]>(NODES_STORE, (store) =>
    parentId === null
      ? store.getAll()
      : store.index(PARENT_INDEX).getAll(IDBKeyRange.only(parentId)),
  );
  return parentId === null ? all.filter((n) => n.parentId === null) : all;
}

/** Fetches a single node by id, or `null` if it does not exist. */
export async function getNode(id: string): Promise<DataRoomNode | null> {
  const node = await readRequest<DataRoomNode | undefined>(
    NODES_STORE,
    (store) => store.get(id),
  );
  return node ?? null;
}

/**
 * Walks from a node up to the root, returning ancestors ordered root-first.
 * Used to render the breadcrumb. The node itself is not included.
 */
export async function getAncestors(
  id: string | null,
): Promise<FolderNode[]> {
  const chain: FolderNode[] = [];
  let currentId = id;
  while (currentId) {
    const node = await getNode(currentId);
    if (!node || node.type !== "folder") break;
    chain.unshift(node);
    currentId = node.parentId;
  }
  return chain;
}

/** Creates a folder, de-duplicating its name against existing siblings. */
export async function createFolder(
  parentId: string | null,
  name: string,
): Promise<FolderNode> {
  const siblings = await listChildren(parentId);
  const folder: FolderNode = {
    id: newId(),
    parentId,
    type: "folder",
    name: uniqueName(name, siblings),
    createdAt: now(),
    updatedAt: now(),
  };
  await withStore(NODES_STORE, "readwrite", (getStore) =>
    getStore(NODES_STORE).put(folder),
  );
  return folder;
}

/**
 * Stores an uploaded file: writes the blob and its metadata in one atomic
 * transaction, de-duplicating the file name against existing siblings.
 */
export async function createFile(
  parentId: string | null,
  file: File,
): Promise<FileNode> {
  const siblings = await listChildren(parentId);
  const blobId = newId();
  const fileNode: FileNode = {
    id: newId(),
    parentId,
    type: "file",
    name: uniqueName(file.name, siblings),
    createdAt: now(),
    updatedAt: now(),
    mimeType: file.type || "application/pdf",
    size: file.size,
    blobId,
  };

  await withStore([NODES_STORE, BLOBS_STORE], "readwrite", (getStore) => {
    getStore(BLOBS_STORE).put({ blobId, blob: file } satisfies BlobRecord);
    getStore(NODES_STORE).put(fileNode);
  });
  return fileNode;
}

/** Renames a node, de-duplicating against siblings (ignoring itself). */
export async function renameNode(
  id: string,
  newName: string,
): Promise<DataRoomNode> {
  const node = await getNode(id);
  if (!node) throw new Error("Node not found");

  const siblings = await listChildren(node.parentId);
  const updated: DataRoomNode = {
    ...node,
    name: uniqueName(newName, siblings, id),
    updatedAt: now(),
  };
  await withStore(NODES_STORE, "readwrite", (getStore) =>
    getStore(NODES_STORE).put(updated),
  );
  return updated;
}

/**
 * Deletes a node and, for folders, its entire subtree. Collects every
 * descendant first, then removes all metadata and blobs in a single
 * transaction so a delete can never leave the tree half-removed.
 */
export async function deleteNode(id: string): Promise<void> {
  const root = await getNode(id);
  if (!root) return;

  const toDelete: DataRoomNode[] = [root];
  const queue = [root];
  while (queue.length) {
    const current = queue.shift()!;
    if (current.type === "folder") {
      const children = await listChildren(current.id);
      toDelete.push(...children);
      queue.push(...children);
    }
  }

  const blobIds = toDelete
    .filter((n): n is FileNode => n.type === "file")
    .map((n) => n.blobId);

  await withStore([NODES_STORE, BLOBS_STORE], "readwrite", (getStore) => {
    const nodes = getStore(NODES_STORE);
    const blobs = getStore(BLOBS_STORE);
    for (const node of toDelete) nodes.delete(node.id);
    for (const blobId of blobIds) blobs.delete(blobId);
  });
}

/** Retrieves the raw bytes for a file so we can render it in the viewer. */
export async function getBlob(blobId: string): Promise<Blob | null> {
  const record = await readRequest<BlobRecord | undefined>(
    BLOBS_STORE,
    (store) => store.get(blobId),
  );
  return record?.blob ?? null;
}

/** Total number of nodes — used to decide whether to seed demo content. */
export async function countNodes(): Promise<number> {
  return readRequest<number>(NODES_STORE, (store) => store.count());
}

export interface SearchResult {
  node: DataRoomNode;
  /** Ancestor folders of the match, root-first, for showing its location. */
  path: FolderNode[];
}

/**
 * Case-insensitive filename search across the entire Data Room. Loads all node
 * metadata once (cheap — no blobs) and matches in memory, resolving each hit's
 * folder path from the same snapshot so results can show where they live.
 */
export async function searchByName(query: string): Promise<SearchResult[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const all = await readRequest<DataRoomNode[]>(NODES_STORE, (store) =>
    store.getAll(),
  );
  const byId = new Map(all.map((node) => [node.id, node]));

  const pathOf = (node: DataRoomNode): FolderNode[] => {
    const chain: FolderNode[] = [];
    let parentId = node.parentId;
    while (parentId) {
      const parent = byId.get(parentId);
      if (!parent || parent.type !== "folder") break;
      chain.unshift(parent);
      parentId = parent.parentId;
    }
    return chain;
  };

  return all
    .filter((node) => node.name.toLowerCase().includes(needle))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    })
    .map((node) => ({ node, path: pathOf(node) }));
}

export interface FolderStats {
  folders: number;
  files: number;
  size: number;
}

/**
 * Aggregates the entire subtree under a folder (all nested folders and files),
 * not just its direct children — so a folder's size reflects everything it
 * ultimately contains, matching how an OS reports folder size. Pass `null` for
 * the Data Room root.
 */
export async function getSubtreeStats(
  rootId: string | null,
): Promise<FolderStats> {
  const stats: FolderStats = { folders: 0, files: 0, size: 0 };
  const queue: (string | null)[] = [rootId];

  while (queue.length) {
    const children = await listChildren(queue.shift()!);
    for (const node of children) {
      if (node.type === "folder") {
        stats.folders += 1;
        queue.push(node.id);
      } else {
        stats.files += 1;
        stats.size += node.size;
      }
    }
  }
  return stats;
}
