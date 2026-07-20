"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useDataRoom } from "./data-room-provider";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { NodeExplorer } from "./node-explorer";
import { CreateFolderDialog } from "./dialogs/create-folder-dialog";
import { RenameDialog } from "./dialogs/rename-dialog";
import { DeleteDialog } from "./dialogs/delete-dialog";
import { PdfViewer } from "./pdf-viewer";
import { DropZone } from "./drop-zone";
import type { DataRoomNode, FileNode } from "@/lib/types";

export type ViewMode = "grid" | "list";

/**
 * Top-level composition of the Data Room. Owns transient UI state (view mode,
 * which dialog is open, which file is being previewed) and the shared upload
 * handler, and hands data operations down to the pieces that need them.
 */
export function DataRoomShell() {
  const { uploadFiles } = useDataRoom();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DataRoomNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataRoomNode | null>(null);
  const [viewerTarget, setViewerTarget] = useState<FileNode | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single upload path shared by the button, the drag-and-drop zone, and the
  // hidden <input>. Surfaces a clear toast for both successes and rejections.
  const handleUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const toastId = toast.loading(
        `Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`,
      );
      try {
        const { added, rejected } = await uploadFiles(files);
        if (added > 0) {
          toast.success(
            `Uploaded ${added} file${added > 1 ? "s" : ""}`,
            { id: toastId },
          );
        } else {
          toast.dismiss(toastId);
        }
        if (rejected.length > 0) {
          toast.error(
            rejected.length === 1
              ? `"${rejected[0]}" was skipped — only PDF files are supported`
              : `${rejected.length} files were skipped — only PDFs are supported`,
          );
        }
      } catch {
        toast.error("Upload failed. Please try again.", { id: toastId });
      }
    },
    [uploadFiles],
  );

  const openUploadPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      void handleUpload(files);
      // Reset so selecting the same file again re-triggers change.
      e.target.value = "";
    },
    [handleUpload],
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        onNewFolder={() => setCreateFolderOpen(true)}
        onUpload={openUploadPicker}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewFolder={() => setCreateFolderOpen(true)}
          onUpload={openUploadPicker}
        />

        <DropZone onDropFiles={handleUpload} className="flex-1 overflow-y-auto">
          <NodeExplorer
            viewMode={viewMode}
            onOpenFile={setViewerTarget}
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
            onUpload={openUploadPicker}
            onNewFolder={() => setCreateFolderOpen(true)}
          />
        </DropZone>
      </div>

      {/* Hidden input backing the Upload buttons. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={onInputChange}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
      <RenameDialog
        node={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      />
      <DeleteDialog
        node={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
      <PdfViewer
        file={viewerTarget}
        onOpenChange={(open) => !open && setViewerTarget(null)}
      />
    </div>
  );
}
