import type { OperationLogEntry } from '@/types/pdf';

interface OperationHistoryPanelProps {
  entries: OperationLogEntry[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchMatches: Array<{ pageId: string; pageNumber: number; snippet: string; matchCount: number }>;
  isIndexingSearch: boolean;
  searchStatusNote?: string;
  onOpenSearchMatch: (pageId: string) => void;
  activeSearchMatchIndex: number;
  onNextSearchMatch: () => void;
  onPreviousSearchMatch: () => void;
  onSortOriginal: () => void;
  onRemoveDuplicates: () => void;
  onExtractOdd: () => void;
  onExtractEven: () => void;
  onOpenExportPreview: () => void;
  onOpenKeyboardHelp: () => void;
  onOpenPrivacyPanel: () => void;
  onRestoreSnapshot: (entryId: string) => void;
}

export function OperationHistoryPanel({
  entries,
  searchQuery,
  onSearchQueryChange,
  searchMatches,
  isIndexingSearch,
  searchStatusNote,
  onOpenSearchMatch,
  activeSearchMatchIndex,
  onNextSearchMatch,
  onPreviousSearchMatch,
  onSortOriginal,
  onRemoveDuplicates,
  onExtractOdd,
  onExtractEven,
  onOpenExportPreview,
  onOpenKeyboardHelp,
  onOpenPrivacyPanel,
  onRestoreSnapshot,
}: OperationHistoryPanelProps) {
  return (
    <aside className="hidden min-w-0 w-full flex-col border-l border-gray-200 bg-white lg:flex dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Power Panel
      </div>
      <div className="space-y-3 p-3">
        <section className="rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Search Pages</p>
          <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">Find text across loaded PDFs (embedded text content).</p>
          <div className="mt-2">
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
              placeholder="Search text..."
              aria-label="Search page text"
            />
          </div>
          {searchStatusNote && (
            <p className="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-200">
              {searchStatusNote}
            </p>
          )}
          {isIndexingSearch && <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Indexing pages...</p>}
          {!isIndexingSearch && searchQuery.trim().length >= 2 && (
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{searchMatches.length} page(s) with matches</p>
          )}
          {searchMatches.length > 0 && (
            <div className="mt-2 flex items-center justify-between gap-2 rounded border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900">
              <span className="text-[11px] text-gray-600 dark:text-gray-300">Match {activeSearchMatchIndex + 1} / {searchMatches.length}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onPreviousSearchMatch}
                  className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={onNextSearchMatch}
                  className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {searchMatches.length > 0 && (
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
              {searchMatches.slice(0, 12).map((match) => (
                <li key={`${match.pageId}-${match.pageNumber}`}>
                  <button
                    type="button"
                    onClick={() => onOpenSearchMatch(match.pageId)}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-left text-[11px] hover:bg-cyan-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-cyan-900/30"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-100">Page {match.pageNumber} ({Math.max(match.matchCount, 1)})</div>
                    <div className="truncate text-gray-500 dark:text-gray-400">{match.snippet}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Smart Tools</p>
          <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">One-click document cleanup and extraction presets.</p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <div className="group relative">
              <button type="button" onClick={onSortOriginal} className="w-full rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Sort Original</button>
              <div className="tooltip-bubble pointer-events-none absolute left-0 top-full z-50 mt-1 w-48 opacity-0 transition group-hover:opacity-100">
                <p className="text-slate-600 dark:text-slate-300">Restore page sequence by source file and original page index</p>
              </div>
            </div>
            <div className="group relative">
              <button type="button" onClick={onRemoveDuplicates} className="w-full rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Dedupe</button>
              <div className="tooltip-bubble pointer-events-none absolute right-0 top-full z-50 mt-1 w-48 opacity-0 transition group-hover:opacity-100">
                <p className="text-slate-600 dark:text-slate-300">Remove duplicate source-page entries, keeping the first occurrence</p>
              </div>
            </div>
            <div className="group relative">
              <button type="button" onClick={onExtractOdd} className="w-full rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Extract Odd</button>
              <div className="tooltip-bubble pointer-events-none absolute left-0 top-full z-50 mt-1 w-48 opacity-0 transition group-hover:opacity-100">
                <p className="text-slate-600 dark:text-slate-300">Keep only odd-numbered pages (1, 3, 5…) based on current order</p>
              </div>
            </div>
            <div className="group relative">
              <button type="button" onClick={onExtractEven} className="w-full rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Extract Even</button>
              <div className="tooltip-bubble pointer-events-none absolute right-0 top-full z-50 mt-1 w-48 opacity-0 transition group-hover:opacity-100">
                <p className="text-slate-600 dark:text-slate-300">Keep only even-numbered pages (2, 4, 6…) based on current order</p>
              </div>
            </div>
          </div>
          <div className="group relative mt-2">
            <button
              type="button"
              onClick={onOpenExportPreview}
              className="w-full rounded bg-cyan-600 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-cyan-700"
            >
              Export Preview
            </button>
            <div className="tooltip-bubble pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-48 -translate-x-1/2 opacity-0 transition group-hover:opacity-100">
              <p className="text-slate-600 dark:text-slate-300">Open export summary, choose profile, and download</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button type="button" onClick={onOpenKeyboardHelp} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Shortcuts</button>
            <button type="button" onClick={onOpenPrivacyPanel} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Privacy</button>
          </div>
        </section>

      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 pt-0">
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Activity</div>
        {entries.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">No actions yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800">
                <div className="font-medium text-gray-800 dark:text-gray-100">{entry.label}</div>
                <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                {entry.snapshotPages && entry.snapshotPages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onRestoreSnapshot(entry.id)}
                    className="mt-1 rounded border border-gray-300 px-1.5 py-0.5 text-[10px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Restore Here
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        </section>
      </div>
    </aside>
  );
}
