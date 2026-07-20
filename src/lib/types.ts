/**
 * Core domain types for the Data Room.
 *
 * The tree is modelled with a single adjacency-list `Node` entity: every folder
 * and file is a node that points at its parent via `parentId`. A `null`
 * `parentId` means the node lives at the root of the Data Room. This keeps
 * moves, recursive deletes, and "list the children of X" trivial to reason
 * about while supporting arbitrary nesting.
 */

export type NodeType = "folder" | "file";

/** Fields shared by every node in the tree. */
interface BaseNode {
  id: string;
  /** Parent folder id, or `null` for nodes at the Data Room root. */
  parentId: string | null;
  type: NodeType;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface FolderNode extends BaseNode {
  type: "folder";
}

export interface FileNode extends BaseNode {
  type: "file";
  /** Always `application/pdf` for now — we only accept PDFs. */
  mimeType: string;
  /** Size of the stored blob in bytes. */
  size: number;
  /** Key into the `blobs` store holding the actual file bytes. */
  blobId: string;
}

export type DataRoomNode = FolderNode | FileNode;

export function isFolder(node: DataRoomNode): node is FolderNode {
  return node.type === "folder";
}

export function isFile(node: DataRoomNode): node is FileNode {
  return node.type === "file";
}
