# VViewer - Client-Side PDF Editor

VViewer is a browser-based PDF editor built with React and TypeScript.
All document processing happens locally in the browser: no uploads, no accounts, no telemetry.

## What It Does Today

- Open one or multiple PDFs and merge them into a single working document.
- Reorder pages with drag-and-drop thumbnails.
- Multi-select pages and run batch actions.
- Rotate one page, selected pages, or all pages.
- Delete one page or selected pages.
- Select pages by typed ranges (for example `1-3, 7, 10-12`).
- Undo and redo page-structure actions.
- Smart tools: sort by original order, dedupe, extract odd pages, extract even pages.
- Export preview with profile selection and progress updates.
- Download edited PDF and print directly from the browser.
- Search embedded text across pages with snippets, result navigation, and in-page highlights.
- Select and copy embedded text directly from preview.
- Session restore and timeline snapshots.
- Keyboard shortcuts help panel and privacy panel.
- Light and dark themes.
- Baseline PWA support (manifest + service worker).

## Not Included

- OCR is not implemented yet.
- Search/highlight/text copy work for PDFs with embedded/selectable text.

## Stack

| Layer | Technology |
| --- | --- |
| UI | React 18 + TypeScript |
| Build | Vite |
| Rendering | `pdfjs-dist` |
| PDF output | `pdf-lib` |
| DnD | `@dnd-kit/core` + `@dnd-kit/sortable` |
| State | Zustand |
| Styling | Tailwind CSS |
| Testing | Vitest |

## Scripts

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```

## Development Notes

- Run via Vite dev server, not Live Server.
- Do not open `index.html` directly.
- Typical local URL: `http://localhost:5173/`.

## Production and Caching

- A service worker is used in production builds.
- `public/_headers` configures no-cache behavior for `sw.js` and `index.html` on Netlify.
- If a deploy looks stale, hard refresh once (`Ctrl+F5`) to force update.

## Project Structure

```text
src/
	components/
		Dialogs/
		DropZone/
		Layout/
		PagePreview/
		ThumbnailPanel/
		Toolbar/
	hooks/
		useKeyboardShortcuts.ts
		useOperationLog.ts
		usePdfDocument.ts
		usePdfExport.ts
		usePdfImport.ts
		usePdfRenderer.ts
		usePdfTextSearch.ts
		useTheme.ts
	services/
		pdfExporter.ts
		pdfLoader.ts
		pdfPrinter.ts
	stores/
		pdfStore.ts
	types/
		pdf.ts
	utils/
		pageRange.ts
		pageTools.ts
		pdfTextLayer.ts
	App.tsx
	main.tsx
```

## Quality Status

- CI builds and tests run on push/PR (`.github/workflows/ci.yml`).
- Ongoing hardening/refactor plan is tracked in `AI_AUDIT_IMPROVEMENT_PLAN.md`.

## License

MIT
