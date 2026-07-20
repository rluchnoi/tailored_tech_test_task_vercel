"use client";

import { toast } from "sonner";
import { NameDialog } from "./name-dialog";
import { useDataRoom } from "../data-room-provider";
import { splitExtension } from "@/lib/naming";
import { isFile } from "@/lib/types";
import type { DataRoomNode } from "@/lib/types";

/** Rename dialog for a folder or file. Driven by a `node` prop — `null` closes
 * it. For files, the initial selection excludes the extension so the user edits
 * the base name without accidentally dropping ".pdf". */
export function RenameDialog({
  node,
  onOpenChange,
}: {
  node: DataRoomNode | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { rename } = useDataRoom();

  const isFileNode = node ? isFile(node) : false;
  const selectionEnd =
    node && isFileNode ? splitExtension(node.name)[0].length : undefined;

  return (
    <NameDialog
      // Remount per node so the initial value/selection reset correctly.
      key={node?.id ?? "none"}
      open={node !== null}
      onOpenChange={onOpenChange}
      title={isFileNode ? "Rename file" : "Rename folder"}
      label={isFileNode ? "File name" : "Folder name"}
      initialValue={node?.name ?? ""}
      submitLabel="Save"
      selectionEnd={selectionEnd}
      onSubmit={async (name) => {
        if (!node) return;
        if (name === node.name) return; // no-op, just close
        try {
          const updated = await rename(node.id, name);
          if (updated.name !== name) {
            toast.success(`Renamed to "${updated.name}" to avoid a duplicate`);
          } else {
            toast.success(`Renamed to "${updated.name}"`);
          }
        } catch {
          toast.error("Could not rename. Please try again.");
          throw new Error("rename failed");
        }
      }}
    />
  );
}
