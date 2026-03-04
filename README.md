# VViewer — PDF Page Editor

A modern, client-side PDF viewer and page editor built with React + TypeScript. All processing happens in the browser — no uploads, no servers, full privacy.

## Features (Planned)

- **View PDFs** — Fast rendering with page thumbnails and full-page preview
- **Rearrange Pages** — Drag-and-drop page reordering
- **Delete Pages** — Remove unwanted pages from a document
- **Rotate Pages** — Rotate individual pages or all pages at once (90°/180°/270°)
- **Merge PDFs** — Combine multiple PDF files into one
- **Split PDFs** — Extract page ranges into separate files
- **Print** — Print the edited document directly from the browser
- **Download** — Export the modified PDF

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| PDF Rendering | Mozilla pdf.js (`pdfjs-dist`) |
| PDF Manipulation | `pdf-lib` |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| State Management | Zustand |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Important: Run With Vite

Do not open `index.html` directly with Live Server for development.

- `src/main.tsx` is TypeScript/TSX and must be transformed by Vite.
- Opening through Live Server can trigger MIME errors such as `application/octet-stream` for module files.
- Use the Vite URL shown in terminal, typically `http://localhost:5173/`.

## Architecture

```
src/
├── components/          # React UI components
│   ├── Layout/          # App shell, header, sidebar
│   ├── Toolbar/         # Action buttons (rotate, delete, print...)
│   ├── ThumbnailPanel/  # Draggable page thumbnail grid
│   ├── PagePreview/     # Full-size page viewer
│   └── Dialogs/         # Modals (merge, split, confirm)
├── hooks/               # Custom React hooks
│   ├── usePdfDocument.ts
│   ├── usePdfRenderer.ts
│   └── useDragAndDrop.ts
├── stores/              # Zustand state stores
│   └── pdfStore.ts      # Core PDF state (pages, order, rotations)
├── services/            # Business logic (no UI)
│   ├── pdfLoader.ts     # Load PDF via pdf.js
│   ├── pdfExporter.ts   # Build new PDF via pdf-lib
│   └── pdfPrinter.ts    # Print via iframe/window
├── types/               # TypeScript type definitions
│   └── pdf.ts
├── utils/               # Helpers
│   └── canvas.ts        # Canvas rendering utilities
├── App.tsx
└── main.tsx
```

## License

MIT
