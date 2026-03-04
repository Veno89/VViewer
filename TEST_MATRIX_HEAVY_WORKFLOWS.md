# Heavy Workflow Reliability Matrix

Date: 2026-03-04

## Goal

Provide a repeatable validation matrix for high-load document workflows where regressions are most likely.

## Automated Coverage

1. `src/stores/pdfStore.integration.test.ts`
- Zoom clamping behavior
- Reorder/delete/rotate with undo/redo consistency

2. `src/utils/searchNavigation.test.ts`
- Search match index wraparound and active page synchronization

3. `src/utils/performanceMode.test.ts`
- Large-document threshold activation
- Thumbnail render window targeting around active/selected pages
- Full render fallback outside degraded mode

## Manual Regression Matrix

1. Large document import and navigation
- Load a PDF with 180+ pages
- Verify performance mode banner appears
- Scroll thumbnails and switch active pages rapidly
- Expected: UI remains responsive, thumbnail rendering prioritizes active window

2. Search under large-document mode
- Enter a query with known matches
- Navigate with `F3` and `Shift+F3`
- Expected: search list updates, navigation works, and status note clarifies scan/highlight limits

3. Dialog accessibility and keyboard behavior
- Open: onboarding, page range, keyboard help, privacy panel, export preview
- Verify initial focus is placed inside each dialog
- Cycle focus with `Tab` and `Shift+Tab`
- Press `Escape`
- Expected: focus stays trapped while open, `Escape` closes dialog, focus returns to prior element

4. Mixed editing stress workflow
- Reorder pages, rotate selected pages, perform odd/even extraction, then undo/redo repeatedly
- Run search and open a highlighted match afterward
- Expected: no desync between active page, search match state, and operation history restore points

## Run Commands

```bash
npm run test
npm run build
```

## Notes

- Keep this matrix aligned with `AI_AUDIT_IMPROVEMENT_PLAN.md` Phase 3 progress.
- Expand test automation first for any manual step that fails repeatedly.
