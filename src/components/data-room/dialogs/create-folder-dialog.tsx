"use client";

import { toast } from "sonner";
import { NameDialog } from "./name-dialog";
import { useDataRoom } from "../data-room-provider";

/** "New folder" dialog. Delegates de-duplication to the repository and reports
 * the final name in case it was auto-suffixed to avoid a collision. */
export function CreateFolderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createFolder } = useDataRoom();

  return (
    <NameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New folder"
      label="Folder name"
      placeholder="e.g. Financials"
      initialValue="Untitled folder"
      submitLabel="Create folder"
      onSubmit={async (name) => {
        try {
          const folder = await createFolder(name);
          toast.success(`Created "${folder.name}"`);
        } catch {
          toast.error("Could not create the folder. Please try again.");
          throw new Error("create failed");
        }
      }}
    />
  );
}
