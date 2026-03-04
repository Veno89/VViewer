# Changelog

All notable changes to this project are documented in this file.

## [0.1.0] - 2026-03-04

### Added
- Complete client-side PDF editor workflow built with React + TypeScript + Vite + Tailwind.
- Zustand store for document state, page operations, selection state, zoom, and undo/redo history.
- PDF processing services:
  - `pdfLoader` for loading/parsing documents with `pdfjs-dist`.
  - `pdfExporter` for building reordered/rotated output with `pdf-lib`.
  - `pdfPrinter` for browser print flow via hidden iframe.
- Full UI surface:
  - Empty-state drop zone with file picker support.
  - Sortable thumbnail sidebar with drag-and-drop reordering (`@dnd-kit`).
  - Main page preview canvas with zoom controls.
  - Toolbar and header actions for open/add/download/print/rotate/undo/redo.
  - Range-selection dialog and undo toast.
  - Error boundary and responsive app shell.
- Productivity/UX improvements:
  - Multi-select operations (Ctrl/Shift selection, bulk rotate/delete/clear selection).
  - Keyboard shortcuts including undo/redo, select-all, download, delete, and arrow navigation.
  - Dark mode toggle with persisted preference.
  - Session persistence and restore flow across reloads.
  - Operation history/activity panel for recent actions.
  - Fit-width and fit-page zoom modes.
  - Drag insertion cues and thumbnail paint optimization (`content-visibility`).
- Quality tooling:
  - Vitest setup and page-range parser tests.
  - GitHub Actions CI workflow for install, build, and test.
  - VS Code workspace settings/extensions recommendations.

### Changed
- App orchestration in `src/App.tsx` expanded to centralize import validation, action logging, session persistence, and shell wiring.
- Store contracts in `src/types/pdf.ts` and `src/stores/pdfStore.ts` extended for persistence snapshots and operation tracking.
- Layout composition in `src/components/Layout/AppShell.tsx` updated to include bulk action bar and operation history panel.
- Zoom controls and preview rendering updated to support effective zoom reporting and fit modes.

### Fixed
- Resolved MIME/module loading confusion by standardizing local run path to Vite dev server workflow.
- Fixed nested interactive element warning (button-in-button issue) in thumbnail controls.
- Eliminated max update depth loop in thumbnail visibility/render flow.
- Prevented pdf.js detached `ArrayBuffer` warning by cloning worker input bytes before load.
- Fixed thumbnail cache invalidation so preview thumbnails reflect page rotation changes.
- Corrected PDF blob typing/creation edge cases in exporter/printer paths.

### Notes
- Current build and test status is green (`npm run build`, `npm run test`).
- Known non-blocking warning: production bundle size warning due to PDF-related dependencies.
