# VViewer Audit Findings and Improvement Plan

Date: 2026-03-04
Scope: Optimization and correctness, feature maturity, attack surface

## Implementation Status

- [x] Phase 1, Item 1: Unified text extraction geometry pipeline into shared utility and migrated search/preview consumers (`f49d297`).
- [x] Phase 1, Item 2: Extract feature-specific hooks from `src/App.tsx`.
   - [x] Extracted operation log responsibility into `src/hooks/useOperationLog.ts` and integrated in `App.tsx`.
   - [x] Extracted import/load workflow into `src/hooks/usePdfImport.ts` and integrated in `App.tsx`.
   - [x] Extracted export/print and extraction workflow into `src/hooks/usePdfExport.ts` and integrated in `App.tsx`.
   - [x] Extracted session persistence/recovery into `src/hooks/useSessionRecovery.ts` and integrated in `App.tsx`.
- [x] Phase 1, Item 4: Add integration tests for critical workflows.
- [x] Phase 1, Item 5: Add architecture note for state ownership.
- [ ] Phase 2 onward: Not started.

## Phase 2 Progress

- [x] Implemented persistence policy mode:
   - default `metadata-only`
   - optional explicit `full` mode for byte-level restore
- [x] Added user-facing privacy setting in `PrivacyPanelDialog` for persistence mode selection.
- [x] Expanded security headers in `public/_headers` (CSP, framing, MIME sniffing, referrer, permissions, isolation policies).
- [x] Tightened service worker cache scope to explicit app-shell/static asset allowlist.
- [x] Added CI dependency vulnerability gate for high/critical production advisories (`npm audit --audit-level=high --omit=dev`).
- [ ] Next: Phase 3 feature maturity and UX reliability work.

## Executive Summary

The app is in a good functional state and has shipped many useful features quickly. The next step is to reduce complexity and risk while improving long-term maintainability. The largest technical risks are:

1. `src/App.tsx` is a high-coupling orchestration hub (harder to reason about, test, and evolve safely).
2. PDF text extraction/parsing logic is duplicated across features (search and preview text layer), creating divergence risk.
3. Persistence and caching strategy currently favors convenience over least-privilege data handling.
4. Security hardening is partial (service worker freshness fixed, but browser security headers and dependency governance are still minimal).

---

## Findings

## 1) Optimization and Correctness (SOLID, DRY, KISS)

### F1. App-level orchestration is too concentrated
- Evidence: `src/App.tsx` owns UI state, side effects, persistence, keyboard handling, search wiring, export flow, and dialogs.
- Risk: Violates single-responsibility and increases regression probability when adding features.
- Impact: Medium to high.

### F2. Duplicate PDF text extraction logic
- Evidence: Text parsing appears in both `src/hooks/usePdfTextSearch.ts` and `src/components/PagePreview/PagePreview.tsx`.
- Risk: Divergent behavior for selection/search/highlight geometry, harder bug fixes.
- Impact: High for correctness over time.

### F3. Mixed domain state between store and component state
- Evidence: Core document data is in Zustand (`src/stores/pdfStore.ts`), while operation timeline/search nav/dialog orchestration is outside store (`src/App.tsx`, `src/components/Layout/AppShell.tsx`).
- Risk: Hard-to-track state ownership and edge cases during undo/redo/session restore.
- Impact: Medium.

### F4. Large snapshots and history handling are expensive
- Evidence: Session snapshot stores full base64 PDF bytes in localStorage (`src/stores/pdfStore.ts`, `bytesToBase64` usage), plus recent history list.
- Risk: Quota pressure, serialization overhead, browser slowdowns on large PDFs.
- Impact: Medium/high for large docs.

### F5. Test coverage does not match complexity growth
- Evidence: Utility tests exist, but critical UI/state integration paths (zoom modes, search highlight sync, DnD+undo interactions, service worker update flow) are not broadly covered.
- Risk: Regressions recur in production-like builds.
- Impact: High.

---

## 2) Features (Current Gaps)

### F6. Search UX is good but not complete for document navigation workflows
- Current: page-level hits + highlight + prev/next in panel.
- Missing: global keyboard navigation for matches, match counters in preview context, optional highlight intensity toggles.
- Impact: Medium.

### F7. No explicit "large-document mode"
- Current: Some rendering optimizations exist, but behavior under 500+ pages is not explicitly controlled.
- Missing: progressive feature degradation strategy (thumbnail density, highlight throttling, deferred indexing).
- Impact: Medium.

### F8. Accessibility and UX consistency need a formal pass
- Current: good tooltip and keyboard baseline exists.
- Missing: consistent ARIA announcements for search navigation/highlight state; focus management audit for all dialogs and panel actions.
- Impact: Medium.

### F9. Product-level quality gates are not yet explicit
- Missing: performance budgets, reliability SLOs, and release checklist before deployment.
- Impact: Medium.

---

## 3) Attack Surface and Security Posture

### F10. Sensitive content persistence in localStorage
- Evidence: Full PDF bytes are persisted as base64 session snapshots (`src/stores/pdfStore.ts`, `src/utils/sessionStorage.ts`).
- Risk: Local data exposure on shared devices, larger blast radius for XSS.
- Impact: High.

### F11. Security headers are minimal
- Evidence: `public/_headers` only controls cache behavior for `/sw.js` and `/index.html`.
- Missing: CSP, X-Frame-Options / frame-ancestors, Referrer-Policy, Permissions-Policy, MIME sniffing controls.
- Impact: High.

### F12. Service worker cache scope is broad
- Evidence: `public/sw.js` caches same-origin GET responses with stale-while-revalidate style.
- Risk: Over-caching non-critical assets and complexity in incident response.
- Impact: Medium.

### F13. Dependency and supply-chain governance is basic
- Missing: automated vulnerability scanning as required PR gate, lockfile hygiene policy, periodic dependency update cadence.
- Impact: Medium.

### F14. Resource exhaustion controls are partial
- Current: warning for files > 50MB exists.
- Missing: strict hard limits for file size/page count and defensive cancellation policy under sustained load.
- Impact: Medium.

---

## Phased Plan (with AI Agent Instructions)

## Phase 1: Stabilize Architecture and Remove Duplication (1-2 sprints)

Goal: Improve correctness and maintainability without feature changes.

AI Agent instructions:
1. Create a new domain module for text extraction geometry (single source of truth) and migrate both search and preview text-layer consumers to that module.
2. Refactor `src/App.tsx` by extracting feature-specific hooks:
   - import/load flow hook
   - export/print flow hook
   - session persistence/recovery hook
   - operation log hook
3. Keep behavior identical; do not alter UI output in this phase.
4. Add integration tests for:
   - zoom mode transitions
   - search result navigation sync with active page
   - undo/redo state after reorder/delete/rotate
5. Add a short architecture note documenting state ownership boundaries.

Acceptance criteria:
- `src/App.tsx` reduced in responsibility and line count meaningfully.
- Duplicate text parsing logic removed.
- Existing behavior unchanged in manual smoke test and CI.

---

## Phase 2: Security Hardening Baseline (1 sprint)

Goal: Reduce attack surface and sensitive data exposure.

AI Agent instructions:
1. Implement a persistence policy mode:
   - default: metadata-only restore (no raw PDF bytes)
   - optional explicit opt-in for full byte persistence
2. Add a user-facing privacy setting explaining storage behavior and risk tradeoffs.
3. Expand Netlify headers in `public/_headers`:
   - add CSP suitable for this app and required asset sources
   - add frame restrictions, referrer policy, MIME sniffing protection, and permissions policy
4. Tighten service worker cache allowlist to app shell/static assets only.
5. Add dependency security checks to CI and fail builds on high/critical advisories.

Acceptance criteria:
- No raw PDF bytes persisted unless explicitly enabled.
- Security headers are present in deployed responses.
- CI blocks merges on critical vulnerabilities.

---

## Phase 3: Feature Maturity and UX Reliability (1-2 sprints)

Goal: Improve day-to-day usability for large and complex documents.

AI Agent instructions:
1. Implement large-document mode thresholds with measurable degradation strategy:
   - defer indexing/highlights when overloaded
   - reduce thumbnail work aggressively
   - surface clear status to users
2. Add keyboard shortcuts for search navigation and expose them in the shortcuts dialog.
3. Improve accessibility pass:
   - ensure dialog focus trap consistency
   - announce search match changes in live regions
   - verify tab order in power panel and toolbar
4. Add a reliability test matrix (unit + integration) around heavy workflows.

Acceptance criteria:
- App remains responsive on high page counts.
- Search/navigation is keyboard-complete and announced properly.
- Accessibility audit items are closed for core workflows.

---

## Phase 4: Performance and Release Governance (ongoing)

Goal: Create predictable quality gates for each release.

AI Agent instructions:
1. Define budgets and track in CI:
   - build size budget per chunk
   - first interaction latency target on reference hardware
2. Add a release checklist markdown used in each PR:
   - security headers verified
   - SW update path verified
   - regression suite passed
   - manual smoke checklist completed
3. Add observability-friendly hooks for non-PII diagnostics (client-only, privacy-preserving).
4. Run quarterly dependency refresh and architecture debt review.

Acceptance criteria:
- Every release is validated against explicit, repeatable quality gates.
- Performance regressions are detected before deployment.

---

## Priority Backlog (Top 10)

1. Unify text extraction and geometry pipeline.
2. Split `App.tsx` responsibilities into domain hooks.
3. Stop default raw-PDF-byte persistence in localStorage.
4. Add robust security headers in `public/_headers`.
5. Restrict service worker cache scope to explicit allowlist.
6. Add integration tests for zoom/search/DnD/undo critical paths.
7. Introduce large-document mode and adaptive degradation.
8. Finish accessibility pass for panel/dialog/search flows.
9. Enforce dependency vulnerability policy in CI.
10. Establish release checklist and performance budgets.

---

## Notes for Future AI Agents

- Prefer minimal behavioral changes in architectural phases; separate refactor and feature changes.
- Preserve existing user-facing workflows unless an explicit migration note is included.
- When touching caching/persistence/security, always update changelog and deployment notes.
- For performance work, include before/after measurements (even simple reproducible local metrics).
- Avoid introducing hidden coupling between search, preview rendering, and persistence layers.
