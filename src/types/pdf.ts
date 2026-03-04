export type PageRotation = 0 | 90 | 180 | 270;
export type ZoomMode = 'manual' | 'fit-width' | 'fit-page';

export interface PdfSourceFile {
  index: number;
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

export interface PageInfo {
  id: string;
  sourceFileIndex: number;
  sourcePageIndex: number;
  rotation: PageRotation;
}

export interface PersistedPdfSourceFile {
  index: number;
  name: string;
  bytesBase64: string;
  pageCount: number;
}

export interface PersistedPdfSession {
  sourceFiles: PersistedPdfSourceFile[];
  pages: PageInfo[];
  selectedIds: string[];
  activePageId: string | null;
  lastSelectedPageId: string | null;
  zoom: number;
  savedAt: string;
}

export interface OperationLogEntry {
  id: string;
  label: string;
  timestamp: string;
}

export interface PdfStateData {
  sourceFiles: PdfSourceFile[];
  pages: PageInfo[];
  selectedIds: Set<string>;
  activePageId: string | null;
  lastSelectedPageId: string | null;
  zoom: number;
  history: PageInfo[][];
  future: PageInfo[][];
  isLoading: boolean;
  error: string | null;
}

export interface PdfStateActions {
  loadPdf: (bytes: Uint8Array, fileName?: string) => Promise<void>;
  reorderPages: (activeId: string, overId: string) => void;
  deletePage: (id: string) => void;
  deleteSelected: () => void;
  rotatePage: (id: string) => void;
  rotateAll: () => void;
  selectPage: (id: string, multi: boolean, range: boolean) => void;
  selectAll: () => void;
  setSelectedPageIds: (ids: string[]) => void;
  clearSelection: () => void;
  setActivePage: (id: string) => void;
  setZoom: (zoom: number) => void;
  clearDocument: () => void;
  hydrateSession: (session: PersistedPdfSession) => void;
  getSessionSnapshot: () => PersistedPdfSession | null;
  undo: () => void;
  redo: () => void;
  setError: (message: string | null) => void;
}

export type PdfState = PdfStateData & PdfStateActions;
