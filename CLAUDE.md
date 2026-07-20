# Acme Data Room — Project Guide for Claude

A single-page **Data Room** (secure document repository, à la Google Drive/Dropbox)
built for a take-home task. Users create nested folders, upload/view/rename/delete
PDF files, and **search documents by filename** across the whole Data Room. There is
**no real backend** — all data (metadata *and* file bytes) lives in the browser via
IndexedDB, behind a repository layer that a real API could later replace without
touching the UI.

Search is **filename only** (global, case-insensitive, debounced). Content/full-text
search was scoped out on purpose — it would need PDF text extraction (pdfjs) and
wouldn't cover scanned/image PDFs without OCR. Don't add it without an explicit ask.

> **Next.js 16 note:** this is a newer Next.js than older training data assumes —
> APIs, conventions, and file structure may differ. Consult the guides in
> `node_modules/next/dist/docs/` before writing framework code, and heed deprecations.

## Priorities (optimize in this order)

When a trade-off comes up, resolve it in favor of the higher item on this list.

1. **User experience & functionality.** UX flows must be intuitive and easy to use.
   Handle edge cases and error states (duplicate names, empty folders, non-PDF
   uploads, load/error states) — the app should "work well out of the box."
2. **Design & polish.** Keep the design clean and cohesive. **Do not ship
   unimplemented features** — no dead buttons, placeholder menus, or controls that
   don't do anything. If it's visible, it works.
3. **Code quality & readability.** Clear structure, honest naming, granular
   components — but never at the expense of items 1 and 2.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (also runs full type-check)
npm run lint     # eslint
npx tsc --noEmit # type-check only
```

There is no test runner configured. Flows are verified manually / via ad-hoc
Puppeteer scripts driving system Chromium (`/snap/bin/chromium`).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (`base-nova` preset, which is built on
  **`@base-ui/react`**, not Radix — this matters, see Gotchas)
- **lucide-react** icons, **sonner** toasts
- **IndexedDB** for persistence (no external DB/idb dependency)

## Architecture

Data flows in one direction: **UI → `useDataRoom()` context → repository → IndexedDB.**
Components never touch IndexedDB directly.

```
src/lib/
  types.ts                    Domain model: DataRoomNode = FolderNode | FileNode
  db.ts                       IndexedDB open + tx helpers (readRequest / withStore)
  naming.ts                   uniqueName() — duplicate-name auto-suffixing
  format.ts                   byte-size & relative-time formatting
  samplePdf.ts                generates valid demo PDFs at runtime
  repository/
    nodeRepository.ts         ALL persistence: list/get/create/rename/delete/getBlob,
                              searchByName, getSubtreeStats
    seed.ts                   first-run demo content (only if store is empty)

src/components/data-room/
  data-room-provider.tsx      Client state: current folder, children, subtree stats,
                              search query/results (debounced), all mutations, seeding
                              on mount. Exposes useDataRoom().
  data-room-shell.tsx         Top-level layout; owns UI state (view mode, which dialog
                              is open, upload handler + hidden <input>).
  sidebar.tsx, toolbar.tsx, breadcrumbs.tsx, search-box.tsx
  node-explorer.tsx           loading / empty / search / grid / list switch; defines
                              NodeActionHandlers
  search-results.tsx          flat, path-annotated results with match highlighting
  node-card.tsx, node-row.tsx, node-icon.tsx, node-actions-menu.tsx
  empty-state.tsx, explorer-skeleton.tsx, drop-zone.tsx, pdf-viewer.tsx
  dialogs/                    name-dialog (shared), create-folder, rename, delete
```

### Data model

Single adjacency-list `Node` keyed by `id`, pointing at its parent via `parentId`
(`null` = Data Room root). Folders and files are both nodes; files additionally carry
`mimeType`, `size`, and a `blobId` into a separate `blobs` store. This makes nesting,
recursive delete, and "list children of X" trivial. Two IndexedDB stores: `nodes`
(indexed by `parentId`) and `blobs`.

### Search

`searchByName` loads all node metadata once (no blobs) and matches in memory,
resolving each hit's folder path from the same snapshot. The provider debounces the
query (~200ms); when the query is non-empty, `node-explorer` renders `search-results`
(a flat, path-annotated list) instead of the folder grid. `navigateTo` always clears
the query, so opening a folder result drops you into that folder. Stale results are
never cleared synchronously in the debounce effect (they're just ignored when
`isSearching` is false) — this avoids the `set-state-in-effect` lint rule.

## Conventions

- Components are `.tsx` in kebab-case; interactive ones start with `"use client"`.
- Reference files with clickable paths; keep comment density like the surrounding code.
- All persistence goes through `nodeRepository.ts`. If you add a data operation,
  add it there and expose it via `data-room-provider.tsx`, not inline in a component.
- User-facing errors surface as `sonner` toasts; repository/provider functions throw,
  callers catch and toast.

## Gotchas (learned the hard way)

- **IndexedDB reads must use `readRequest()` in `db.ts`.** Attaching `onsuccess` to an
  `IDBRequest` *after* its transaction has completed never fires → the promise hangs
  forever. `readRequest` attaches the handler synchronously. Do **not** return a raw
  `IDBRequest` out of `withStore` and await it later. `withStore` is for writes (it
  resolves on `tx.oncomplete`).
- **shadcn here is `@base-ui/react`, not Radix.** Triggers take a `render={<button/>}`
  prop, **not** `asChild`. Menu items fire **`onClick`**, not `onSelect`.
- **Duplicate names** are auto-suffixed by the repository (`report.pdf` →
  `report (2).pdf`), case-insensitively, preserving the extension. Rename/create surface
  the final name in the toast when it differs from what was typed.
- IndexedDB + browser `--virtual-time-budget` headless screenshots don't finish async
  seeding reliably; drive with real waits (Puppeteer `waitForFunction`) instead.
