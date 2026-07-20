"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

/**
 * Reusable single-field dialog for naming things. Backs both "New folder" and
 * "Rename": it owns the input value, trivial validation, submit-in-progress
 * state, and selecting the text on open (with the extension pre-excluded for
 * files so renames are quick).
 */
export function NameDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  initialValue = "",
  submitLabel,
  selectionEnd,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  submitLabel: string;
  /** Where to end the initial text selection (e.g. before a file extension). */
  selectionEnd?: number;
  onSubmit: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  // Reset the field whenever the dialog transitions to open. Adjusting state
  // during render (React's endorsed alternative to a reset effect) keeps the
  // field in sync with `initialValue` without an extra render pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue(initialValue);
      setSubmitting(false);
    }
  }

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      onOpenChange(false);
    } catch {
      // Error toasts are raised by the caller; keep the dialog open to retry.
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="py-4">
            <label
              htmlFor="name-dialog-input"
              className="mb-1.5 block text-sm font-medium"
            >
              {label}
            </label>
            <Input
              id="name-dialog-input"
              autoFocus
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              onFocus={(e) => {
                if (selectionEnd !== undefined) {
                  e.target.setSelectionRange(0, selectionEnd);
                } else {
                  e.target.select();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
