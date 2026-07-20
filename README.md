# Acme Data Room

A single-page **Data Room** (secure document repository, à la Google Drive/Dropbox)
built as a take-home project. Create nested folders, upload/view/rename/delete PDF
files, and search documents by filename across the whole Data Room.

**Live demo:** [tailoredtechtesttaskvercel.vercel.app](https://tailoredtechtesttaskvercel.vercel.app/)

## Features

- Nested folders — create, rename, delete (recursively), navigate via breadcrumbs
- PDF upload (drag & drop or file picker), in-app viewer, rename, delete
- Duplicate names are auto-suffixed (`report.pdf` → `report (2).pdf`)
- Global, case-insensitive, debounced filename search with path-annotated results
  and match highlighting
- Grid/list view toggle, responsive layout, dark/white/red themes

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (`base-nova`, built on `@base-ui/react`)
- **IndexedDB** for persistence — there is no real backend. All data (metadata
  *and* file bytes) lives in the browser behind a repository layer
  (`src/lib/repository/`) that a real API could later replace without touching
  the UI.

## Design decisions & scope

- **No backend/server.** Uploads and storage are mocked with IndexedDB so the
  app deploys as a static-friendly Next.js app with zero infra, while keeping
  a clean seam (the repository layer) for swapping in a real API later.
- **Search is filename-only**, not full-text. Content search was scoped out —
  it would need PDF text extraction (and OCR for scanned PDFs) to work
  reliably, which was out of scope for this task.
- Because all data lives in IndexedDB, **content is per-browser** — the demo
  seeds itself with sample folders/PDFs on first load, and clearing site data
  (or opening in a different browser) resets it.

## Local setup

Requires Node 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the Data Room seeds
itself with demo content on first run.

Other commands:

```bash
npm run build     # production build (also runs the full type-check)
npm run lint       # eslint
npx tsc --noEmit   # type-check only
```

There is no automated test runner configured; flows are verified manually.

## Project structure

```
src/lib/
  types.ts                    Domain model: DataRoomNode = FolderNode | FileNode
  db.ts                       IndexedDB open + tx helpers
  naming.ts                   uniqueName() — duplicate-name auto-suffixing
  repository/nodeRepository.ts  All persistence: CRUD, search, subtree stats

src/components/data-room/
  data-room-provider.tsx      Client state + all mutations, exposes useDataRoom()
  data-room-shell.tsx         Top-level layout, dialogs, upload handling
  node-explorer.tsx           Grid/list/search/empty/loading states
  pdf-viewer.tsx, dialogs/    In-app PDF viewer, create/rename/delete dialogs
```

See [CLAUDE.md](CLAUDE.md) for full architecture notes and implementation
gotchas.
