"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wraps the file area and accepts dropped files anywhere inside it. A drag
 * counter tracks enter/leave across nested children so the overlay does not
 * flicker as the pointer moves over cards. Only shows for file drags (not text
 * selections or internal element drags).
 */
export function DropZone({
  onDropFiles,
  className,
  children,
}: {
  onDropFiles: (files: File[]) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  const hasFiles = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes("Files");

  const onDragEnter = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      onDropFiles(Array.from(e.dataTransfer.files));
    },
    [onDropFiles],
  );

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn("relative", className)}
    >
      {children}

      {isDragging && (
        <div className="bg-background/70 pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="border-primary/40 bg-background flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-10 py-8 shadow-lg">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <UploadCloud className="size-6" />
            </div>
            <p className="text-sm font-medium">Drop PDFs to upload</p>
            <p className="text-muted-foreground text-xs">
              They&apos;ll be added to this folder
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
