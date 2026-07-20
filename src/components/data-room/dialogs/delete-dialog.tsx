"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDataRoom } from "../data-room-provider";
import { isFolder } from "@/lib/types";
import type { DataRoomNode } from "@/lib/types";

/** Confirmation before a destructive delete. Folders spell out that the entire
 * subtree goes with them, since that delete is recursive and irreversible. */
export function DeleteDialog({
  node,
  onOpenChange,
}: {
  node: DataRoomNode | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { remove } = useDataRoom();
  const [deleting, setDeleting] = useState(false);

  const folder = node ? isFolder(node) : false;

  const handleDelete = async () => {
    if (!node) return;
    setDeleting(true);
    try {
      await remove(node.id);
      toast.success(`Deleted "${node.name}"`);
      onOpenChange(false);
    } catch {
      toast.error("Could not delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={node !== null}
      onOpenChange={(open) => !deleting && onOpenChange(open)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {folder ? "folder" : "file"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {folder ? (
              <>
                <span className="text-foreground font-medium">
                  {node?.name}
                </span>{" "}
                and everything inside it — all nested folders and files — will
                be permanently deleted. This cannot be undone.
              </>
            ) : (
              <>
                <span className="text-foreground font-medium">
                  {node?.name}
                </span>{" "}
                will be permanently deleted. This cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
