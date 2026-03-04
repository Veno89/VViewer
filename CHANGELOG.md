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
- Reworked preview canvas rendering flow to use explicit cancel-and-render sequencing with stale-run guards, preventing lingering fit-mode overlap warnings.
- Updated pdf.js cancel handling to tolerate both `RenderingCancelledException` and `RenderingCancelled` variants without surfacing false errors.
- Fixed Power Panel tooltip clipping by separating fixed controls from the scrollable activity area.
- Corrected drag-time thumbnail shrink/disappear artifacts by switching sortable item transforms from `CSS.Transform` to `CSS.Translate` when using drag overlays.
- Fixed drag-and-drop collapse/z-index issues by removing extra wrapper div around sortable items that broke `@dnd-kit` layout measurements, and raising overlay z-index.
- Switched Power Panel tooltips to native `title` attributes for guaranteed cross-layout visibility.
- Restored styled `tooltip-bubble` Power Panel tooltips (Toolbar-consistent) using explicit JSX class references so styles are retained in production Tailwind builds.
- Added delayed rendering indicator (300 ms) to prevent flash during fast fit-mode transitions, and broadened pdf.js error suppression for canvas-conflict messages.
- Fixed stale production deploy behavior by updating service worker strategy (network-first for navigation, immediate activation, client claim) and adding no-cache headers for `sw.js`/`index.html` on Netlify.
- Fixed `+/-` zoom controls by wiring `PagePreview` to the store zoom state (manual zoom source of truth) while keeping header zoom readout based on effective fit/manual zoom.
- Fixed Power Panel horizontal clipping by making it match its grid column width, and adjusted Smart Tools tooltip anchoring to prevent edge overflow near the browser window.
- Added in-document search highlights for text-based PDFs (no OCR) and Power Panel match navigation with previous/next controls and active match position.
- Added a general selectable text layer in preview so users can mark/copy embedded PDF text directly (independent of search).
- Clarified thumbnail rotation labels by showing `Original` for unrotated pages instead of `0deg`.

### UX
- Added hover tooltip bubbles (matching existing UI tooltip style) for Power Panel search and smart tool actions.

### Notes
- Current build and test status is green (`npm run build`, `npm run test`).
- Known non-blocking warning: production bundle size warning due to PDF-related dependencies.
