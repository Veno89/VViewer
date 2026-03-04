# VViewer — Comprehensive AI Agent Build Prompt

> Copy this entire file and paste it as your prompt to an AI coding agent (Copilot Agent, Cursor, Windsurf, etc.) to build the full application.

---

## PROJECT OVERVIEW

You are building **VViewer**, a fully client-side PDF page editor web application. The app runs entirely in the browser with zero backend — all PDF processing happens locally using JavaScript libraries. The user opens a PDF, sees page thumbnails, and can rearrange, rotate, delete, merge, and print pages, then download the modified PDF.

The project scaffold already exists in this repo with React + TypeScript + Vite + Tailwind CSS configured. Your job is to implement the full working application.

---

## TECH STACK (already configured in package.json)

| Purpose | Package |
|---------|---------|
| UI Framework | React 18 + TypeScript |
| Build | Vite 6 |
| PDF Rendering (viewing) | `pdfjs-dist` (Mozilla pdf.js) |
| PDF Manipulation (editing) | `pdf-lib` |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Styling | Tailwind CSS 3 |
| Icons | `lucide-react` |
| State Management | `zustand` |

**Do NOT add a backend, server, database, or any additional frameworks.** Everything runs client-side.

---

## FEATURES TO IMPLEMENT (in priority order)

### Phase 1 — Core Viewer
1. **Open PDF**: User clicks "Open File" button or drags-and-drops a PDF onto the app. Read the file as `ArrayBuffer`. Store the raw bytes in the Zustand store.
2. **Thumbnail Panel**: Render every page as a thumbnail (150px wide) in a scrollable sidebar on the left. Use `pdfjs-dist` to render each page to an offscreen `<canvas>`, convert to a data URL, and display as `<img>`. Show page number below each thumbnail.
3. **Page Preview**: Clicking a thumbnail shows a large preview of that page in the main content area. Render at full resolution using `pdfjs-dist` into a `<canvas>`.
4. **Zoom Controls**: Allow the user to zoom in/out on the preview (50% → 200%). Fit-to-width and fit-to-page buttons.

### Phase 2 — Page Manipulation
5. **Rearrange Pages (Drag & Drop)**: Use `@dnd-kit/sortable` to make the thumbnail panel a sortable list. Dragging a thumbnail to a new position reorders the page array in the store. Visual feedback: dragged item has elevated shadow, drop target shows an insertion line.
6. **Delete Pages**: Each thumbnail has a small "X" button (top-right corner, visible on hover). Clicking it removes that page from the array. Show a brief undo toast for 5 seconds.
7. **Rotate Single Page**: Each thumbnail has a rotate button (visible on hover, bottom-right). Each click rotates that page 90° clockwise. The thumbnail and preview must reflect the rotation. Store rotation as degrees (0/90/180/270) per page.
8. **Rotate All Pages**: Toolbar button "Rotate All" applies +90° to every page at once.
9. **Select Multiple Pages**: Allow Ctrl+Click and Shift+Click to select multiple thumbnails (highlighted border). Bulk actions (delete, rotate) apply to the selection.

### Phase 3 — Advanced Operations
10. **Merge PDFs**: "Add File" button lets user open another PDF. Its pages are appended to the current page array. Multiple files can be merged.
11. **Split / Extract Pages**: User selects pages → clicks "Extract". A new PDF is built containing only the selected pages and downloaded.
12. **Page Range Selection**: Input field where user types "1-3, 5, 8-12" to quickly select pages.

### Phase 4 — Output
13. **Download Modified PDF**: "Download" button builds a new PDF using `pdf-lib`:
    - Create a new `PDFDocument`.
    - For each page in the current order, copy the page from the original document(s) using `copyPages()`.
    - Apply rotation to each page using `page.setRotation(degrees(...))`.
    - Serialize with `pdfDoc.save()` and trigger browser download.
14. **Print**: "Print" button embeds the final PDF bytes into a hidden `<iframe>` as a blob URL and calls `iframe.contentWindow.print()`.

### Phase 5 — UX Polish
15. **Loading State**: Show a spinner/skeleton while rendering thumbnails for large PDFs.
16. **Empty State**: When no PDF is open, show a large drop zone with instructions: "Drop a PDF here or click to open".
17. **Keyboard Shortcuts**: `Delete` = remove selected pages, `Ctrl+A` = select all, `Ctrl+Z` = undo, `Ctrl+S` = download.
18. **Undo/Redo**: Maintain a history stack in the store. Undo reverts the last page operation (delete, reorder, rotate).
19. **Dark Mode**: Toggle between light and dark themes. Persist preference in `localStorage`.
20. **Responsive Layout**: On smaller screens, thumbnail panel collapses to the bottom or is hidden behind a toggle.

---

## ARCHITECTURE & FILE STRUCTURE

Implement the following structure exactly:

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppShell.tsx          # Main layout: sidebar + content area
│   │   └── Header.tsx            # Top bar with app title + toolbar buttons
│   ├── Toolbar/
│   │   └── Toolbar.tsx           # Action buttons: open, download, print, rotate all, undo/redo
│   ├── ThumbnailPanel/
│   │   ├── ThumbnailPanel.tsx    # Scrollable sortable thumbnail list
│   │   ├── ThumbnailCard.tsx     # Single page thumbnail with overlay actions
│   │   └── SortableItem.tsx      # dnd-kit sortable wrapper
│   ├── PagePreview/
│   │   ├── PagePreview.tsx       # Large page canvas renderer
│   │   └── ZoomControls.tsx      # Zoom in/out/fit buttons
│   ├── DropZone/
│   │   └── DropZone.tsx          # Empty state file drop target
│   └── Dialogs/
│       ├── UndoToast.tsx         # Brief undo notification
│       └── PageRangeDialog.tsx   # Input dialog for page range selection
├── hooks/
│   ├── usePdfDocument.ts         # Load & parse PDF with pdfjs-dist
│   ├── usePdfRenderer.ts         # Render a single page to canvas/dataURL
│   └── useKeyboardShortcuts.ts   # Global keyboard shortcut handler
├── stores/
│   └── pdfStore.ts               # Zustand store: pages[], selectedIds, zoom, history
├── services/
│   ├── pdfLoader.ts              # Read File → ArrayBuffer, init pdfjs-dist document
│   ├── pdfExporter.ts            # Build final PDF with pdf-lib (reorder + rotate)
│   └── pdfPrinter.ts             # Print via hidden iframe
├── types/
│   └── pdf.ts                    # PageInfo, PdfState, etc.
├── utils/
│   └── canvas.ts                 # renderPageToDataUrl helper
├── App.tsx                       # Root component (wraps AppShell)
├── main.tsx                      # Entry point
├── index.css                     # Tailwind imports
└── vite-env.d.ts
```

---

## CRITICAL IMPLEMENTATION DETAILS

### pdf.js Setup
```typescript
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();
```
- Use `pdfjsLib.getDocument({ data: arrayBuffer })` to load.
- For thumbnails: render at `scale = 0.3` to keep them small and fast.
- For preview: render at `scale` matching the zoom level.

### pdf-lib Export
```typescript
import { PDFDocument, degrees } from 'pdf-lib';

async function exportPdf(
  originalBytes: Uint8Array[],    // raw bytes of each source PDF
  pages: PageInfo[],              // current page order with rotations
): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  // Group pages by their source document
  // For each source, load it and copyPages()
  // Add pages in the current order, applying setRotation(degrees(page.rotation))
  return output.save();
}
```

### Zustand Store Shape
```typescript
interface PageInfo {
  id: string;              // unique ID (e.g., `${fileIndex}-${pageIndex}`)
  sourceFileIndex: number; // which loaded PDF this page belongs to
  sourcePageIndex: number; // original page index in that PDF
  rotation: number;        // 0 | 90 | 180 | 270
}

interface PdfState {
  sourceFiles: Uint8Array[];   // raw bytes of each loaded PDF
  pages: PageInfo[];           // current page order
  selectedIds: Set<string>;    // selected page IDs
  activePageId: string | null; // page shown in preview
  zoom: number;                // preview zoom (0.5 to 2.0)
  history: PageInfo[][];       // undo stack
  future: PageInfo[][];        // redo stack

  // Actions
  loadPdf: (bytes: Uint8Array) => Promise<void>;
  reorderPages: (activeId: string, overId: string) => void;
  deletePage: (id: string) => void;
  deleteSelected: () => void;
  rotatePage: (id: string) => void;
  rotateAll: () => void;
  selectPage: (id: string, multi: boolean, range: boolean) => void;
  setActivePage: (id: string) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
}
```

### Drag & Drop
- Wrap `ThumbnailPanel` in `<DndContext>` and `<SortableContext>`.
- Each `ThumbnailCard` is wrapped in `useSortable()`.
- On `onDragEnd`, call `store.reorderPages(active.id, over.id)`.
- Use `arrayMove` from `@dnd-kit/sortable` for the reorder logic.

### Printing
```typescript
function printPdf(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.print();
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
}
```

---

## UI DESIGN GUIDELINES

- **Color scheme**: Neutral grays (`gray-50` through `gray-900`) with a blue accent (`blue-500`/`blue-600`) for primary actions and selection highlights.
- **Layout**: Fixed header (height 56px). Left sidebar (width 240px) for thumbnails. Remaining space for page preview.
- **Thumbnails**: White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-lg`). On hover: show action overlay (delete X, rotate icon). Selected: blue border (`ring-2 ring-blue-500`).
- **Toolbar**: Icon buttons with tooltips. Group related actions with subtle dividers.
- **Typography**: Use `Inter` or the default Tailwind sans-serif stack.
- **Animations**: Smooth drag animations via dnd-kit defaults. Fade-in for thumbnails as they render. Slide-in for undo toast.
- **Drag visual**: Dragged thumbnail slightly transparent (`opacity-70`), elevated shadow. Drop position indicated by a 2px blue line between thumbnails.

---

## CONSTRAINTS & RULES

1. **No backend.** All processing happens in the browser.
2. **No external API calls.** Everything is offline-capable.
3. **TypeScript strict mode.** No `any` types unless absolutely necessary. Define proper interfaces.
4. **Functional components only.** No class components.
5. **Do not use `document.querySelector`** for React-managed DOM. Use refs.
6. **Clean up resources**: Revoke object URLs, destroy pdf.js documents, cancel pending renders on unmount.
7. **Handle errors gracefully**: Invalid/corrupted PDFs should show a user-friendly error, not crash.
8. **Performance**: For PDFs with 100+ pages, render thumbnails lazily (only visible ones). Use `IntersectionObserver` or a virtualized list.
9. **Accessibility**: All buttons need `aria-label`. Keyboard navigation should work for the thumbnail list.
10. **File size limit**: Warn (don't block) for files over 50 MB.

---

## STEP-BY-STEP BUILD ORDER

Follow this exact sequence. After each step, the app should be runnable without errors.

1. **Set up Zustand store** (`pdfStore.ts`) with the full state shape and all actions (stubs are fine initially).
2. **Define types** (`types/pdf.ts`).
3. **Implement `pdfLoader.ts`** — load a PDF with pdfjs-dist, extract page count, store bytes.
4. **Implement `canvas.ts`** — `renderPageToDataUrl(pdfDoc, pageIndex, scale, rotation)`.
5. **Build `DropZone.tsx`** — file input + drag-and-drop. On file load, call `store.loadPdf()`.
6. **Build `ThumbnailCard.tsx`** — display a page thumbnail image with page number.
7. **Build `ThumbnailPanel.tsx`** — list of ThumbnailCards. Wire up dnd-kit sortable.
8. **Build `PagePreview.tsx`** — render the active page at current zoom.
9. **Build `AppShell.tsx`** — compose sidebar + preview.
10. **Build `Header.tsx` + `Toolbar.tsx`** — action buttons wired to store actions.
11. **Implement delete + rotate** in the store and wire to thumbnail overlay buttons.
12. **Implement `pdfExporter.ts`** — build the modified PDF with pdf-lib.
13. **Wire Download button** to exporter.
14. **Implement `pdfPrinter.ts`** and wire Print button.
15. **Add multi-select** (Ctrl+Click, Shift+Click) and bulk operations.
16. **Add undo/redo** with history stack.
17. **Add keyboard shortcuts**.
18. **Implement "Add File" (merge)** and "Extract" (split).
19. **Add zoom controls**.
20. **Polish**: loading states, dark mode toggle, responsive layout, error boundaries.

---

## TESTING CHECKLIST

After building, verify:
- [ ] Can open a PDF via file picker
- [ ] Can open a PDF via drag-and-drop
- [ ] Thumbnails render correctly for all pages
- [ ] Clicking a thumbnail shows it in the preview
- [ ] Can drag-and-drop to reorder pages; order persists in export
- [ ] Can delete a page; undo restores it
- [ ] Can rotate a single page; rotation shows in thumbnail and preview
- [ ] "Rotate All" rotates every page
- [ ] Download produces a valid PDF with correct page order and rotations
- [ ] Print opens the system print dialog with the correct document
- [ ] Can merge a second PDF file
- [ ] Can select multiple pages and delete/rotate them together
- [ ] Ctrl+Z undoes the last action
- [ ] App doesn't crash on a 200-page PDF
- [ ] App shows a friendly error for a corrupted/non-PDF file

---

Now start implementing from step 1. Build incrementally, ensuring the app compiles and runs after each step. Use `npm run dev` to verify.
