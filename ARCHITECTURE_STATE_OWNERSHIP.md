# Architecture: State Ownership and Boundaries

Date: 2026-03-04

## Purpose

This note defines where state should live in VViewer and why, so future changes keep coupling low and behavior predictable.

## Ownership Model

## 1) Domain State (Zustand store)

File: `src/stores/pdfStore.ts`

Store-only responsibilities:
- Source PDF files and page list.
- Selection and active page.
- Rotation/reorder/delete/undo/redo operations.
- Zoom scalar value.
- Session snapshot serialization/deserialization primitives.

Rules:
- Any mutation that changes page order/content/selection belongs in the store.
- Store actions should remain deterministic and side-effect light (no UI concerns).

## 2) Orchestration Hooks (App-level)

Files: `src/hooks/usePdfImport.ts`, `src/hooks/usePdfExport.ts`, `src/hooks/useOperationLog.ts`, `src/hooks/useSessionRecovery.ts`

Hook responsibilities:
- Coordinate domain actions with UI concerns and side effects.
- Handle user-flow orchestration (dialogs, progress, notifications).
- Persist/recover session data and invoke domain actions.

Rules:
- Hooks may call services and store actions.
- Hooks should expose narrow, task-focused APIs to `App.tsx`.

## 3) Presentation State (Component-local)

Examples:
- `src/components/Layout/AppShell.tsx` search match index and mobile sidebar toggle.
- Dialog open/close booleans in `src/App.tsx`.

Rules:
- Keep ephemeral UI-only state local.
- Avoid duplicating domain state locally.

## 4) Shared Pure Utilities

Files: `src/utils/pdfTextLayer.ts`, `src/utils/searchNavigation.ts`, `src/utils/pageRange.ts`, `src/utils/pageTools.ts`

Responsibilities:
- Pure, deterministic transformations and calculations.
- No side effects or direct store access.

Rules:
- If logic is reused by multiple hooks/components, move it to `utils`.
- Add unit tests for all non-trivial utility behavior.

## Practical Change Checklist

Before implementing a new feature:
1. Decide if it mutates document domain state. If yes, extend store action(s).
2. Decide if it orchestrates side effects/user flow. If yes, place in a dedicated hook.
3. Keep view-specific toggles local to components.
4. Extract duplicated math/parsing/navigation into pure utilities.
5. Add tests at the lowest effective layer first (utils/store), then integration coverage.

## Anti-Patterns to Avoid

- Expanding `App.tsx` with new unrelated orchestration blocks.
- Duplicating PDF text parsing/geometry logic in multiple files.
- Mixing persistence mechanics directly inside presentation components.
- Adding UI-level conditionals into store actions.
