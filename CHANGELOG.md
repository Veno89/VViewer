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
  - First-load onboarding modal with optional "don't show again" preference.
  - Expanded contextual guidance with richer toolbar and zoom control tooltips.
  - Enhanced splash/empty state with product trust messaging and recent updates highlights.
  - In-editor Power Panel with text search, smart tools, and restore shortcuts.
  - Session snapshot history with quick restore points on the splash screen.
  - Keyboard shortcuts help dialog and privacy details panel.
  - Export preview modal with profile selection and progress feedback.
  - Odd/even extract presets and source-order sorting/deduplication tools.
- Quality tooling:
  - Vitest setup and page-range parser tests.
  - Additional utility tests for page tool operations (sort/dedupe/odd-even).
  - GitHub Actions CI workflow for install, build, and test.
  - VS Code workspace settings/extensions recommendations.

### Changed
- App orchestration in `src/App.tsx` expanded to centralize import validation, action logging, session persistence, and shell wiring.
- Store contracts in `src/types/pdf.ts` and `src/stores/pdfStore.ts` extended for persistence snapshots and operation tracking.
- Layout composition in `src/components/Layout/AppShell.tsx` updated to include bulk action bar and operation history panel.
- Layout composition in `src/components/Layout/AppShell.tsx` expanded with thumbnail windowing and a richer Power Panel experience.
- Zoom controls and preview rendering updated to support effective zoom reporting and fit modes.
- Visual design system refreshed with futuristic styling, atmospheric backgrounds, and updated typography.
- Export pipeline now supports lightweight profiles and cooperative yielding to reduce UI jank on large exports.
- Added baseline offline install support via web manifest and service worker registration.
- Thumbnail panel rendering strategy simplified during drag interactions to prioritize stability over aggressive virtualization.

### Fixed
- Resolved MIME/module loading confusion by standardizing local run path to Vite dev server workflow.
- Fixed nested interactive element warning (button-in-button issue) in thumbnail controls.
- Eliminated max update depth loop in thumbnail visibility/render flow.
- Prevented pdf.js detached `ArrayBuffer` warning by cloning worker input bytes before load.
- Fixed thumbnail cache invalidation so preview thumbnails reflect page rotation changes.
- Corrected PDF blob typing/creation edge cases in exporter/printer paths.
- Resolved resize-time pdf.js canvas race by canceling in-flight render tasks before re-rendering.
- Improved large-document thumbnail performance via viewport-based rendering window.
- Stabilized drag-and-drop thumbnail behavior by introducing a drag overlay ghost preview and safer drag-state reset handling.
- Prevented thumbnail preview disappearance during drag by disabling virtualization paint optimizations while actively dragging.
- Addressed intermittent fit-width/fit-page canvas render overlap warning by serializing render task cancellation before starting new renders.
- Removed fit-mode render feedback loops that could trigger redundant preview render cycles.

### UX
- Added hover tooltip bubbles (matching existing UI tooltip style) for Power Panel search and smart tool actions.

### Notes
- Current build and test status is green (`npm run build`, `npm run test`).
- Known non-blocking warning: production bundle size warning due to PDF-related dependencies.
