"use client";

import { useEffect, useState } from "react";
import { Download, FileWarning, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getBlob } from "@/lib/repository/nodeRepository";
import { formatBytes } from "@/lib/format";
import type { FileNode } from "@/lib/types";

/**
 * Full-height modal PDF preview. The blob loading lives in an inner component
 * that is remounted per file (via `key`), so its initial state is naturally
 * "loading" and the effect only sets state from async callbacks.
 */
export function PdfViewer({
  file,
  onOpenChange,
}: {
  file: FileNode | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[92dvh] w-[96vw] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl"
      >
        {file && (
          <PdfDocument
            key={file.blobId}
            file={file}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error" };

function PdfDocument({
  file,
  onClose,
}: {
  file: FileNode;
  onClose: () => void;
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;

    getBlob(file.blobId)
      .then((blob) => {
        if (!active) return;
        if (!blob) {
          setState({ status: "error" });
          return;
        }
        // Render via the browser's native PDF viewer in an <iframe>.
        objectUrl = URL.createObjectURL(blob);
        setState({ status: "ready", url: objectUrl });
      })
      .catch(() => active && setState({ status: "error" }));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.blobId]);

  const download = () => {
    if (state.status !== "ready") return;
    const a = document.createElement("a");
    a.href = state.url;
    a.download = file.name;
    a.click();
  };

  return (
    <>
      <DialogHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b px-4 py-3">
        <div className="min-w-0">
          <DialogTitle className="truncate text-sm" title={file.name}>
            {file.name}
          </DialogTitle>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {formatBytes(file.size)} · PDF
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={download}
            disabled={state.status !== "ready"}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogHeader>

      <div className="bg-muted relative flex-1">
        {state.status === "loading" && (
          <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading document…</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <FileWarning className="size-8" />
            <p className="text-sm">This document could not be loaded.</p>
          </div>
        )}

        {state.status === "ready" && (
          <iframe
            src={state.url}
            title={file.name}
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
      </div>
    </>
  );
}
