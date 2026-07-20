import type { DataRoomNode } from "./types";

/** Splits `"report.final.pdf"` into `["report.final", ".pdf"]`. */
export function splitExtension(name: string): [base: string, ext: string] {
  const dot = name.lastIndexOf(".");
  // Treat a leading dot (e.g. ".env") or no dot as "no extension".
  if (dot <= 0) return [name, ""];
  return [name.slice(0, dot), name.slice(dot)];
}

/**
 * Produces a name that does not collide with any sibling, appending
 * `" (n)"` before the extension until it is unique.
 *
 * Examples (given a sibling `report.pdf`):
 *   report.pdf   -> report (2).pdf
 *   report (2).pdf, report.pdf -> report (3).pdf
 *
 * Comparison is case-insensitive so `Report.pdf` and `report.pdf` are treated
 * as a collision, matching how most file explorers behave.
 *
 * @param excludeId  A node id to ignore when checking (used on rename so a node
 *                   doesn't collide with itself).
 */
export function uniqueName(
  desired: string,
  siblings: DataRoomNode[],
  excludeId?: string,
): string {
  const taken = new Set(
    siblings
      .filter((n) => n.id !== excludeId)
      .map((n) => n.name.trim().toLowerCase()),
  );

  const trimmed = desired.trim();
  if (!taken.has(trimmed.toLowerCase())) return trimmed;

  const [base, ext] = splitExtension(trimmed);
  let counter = 2;
  let candidate = `${base} (${counter})${ext}`;
  while (taken.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${base} (${counter})${ext}`;
  }
  return candidate;
}
