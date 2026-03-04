import type { OperationLogEntry } from '@/types/pdf';

interface OperationHistoryPanelProps {
  entries: OperationLogEntry[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchMatches: Array<{ pageId: string; pageNumber: number; snippet: string }>;
  isIndexingSearch: boolean;
  onOpenSearchMatch: (pageId: string) => void;
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
  onOpenSearchMatch,
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
    <aside className="hidden w-80 border-l border-gray-200 bg-white lg:block dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Power Panel
      </div>
      <div className="max-h-full space-y-3 overflow-y-auto p-3">
        <section className="rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Search Pages</p>
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900"
            placeholder="Search text..."
            aria-label="Search page text"
          />
          {isIndexingSearch && <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Indexing pages...</p>}
          {!isIndexingSearch && searchQuery.trim().length >= 2 && (
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{searchMatches.length} match(es)</p>
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
                    <div className="font-medium text-gray-800 dark:text-gray-100">Page {match.pageNumber}</div>
                    <div className="truncate text-gray-500 dark:text-gray-400">{match.snippet}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Smart Tools</p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button type="button" onClick={onSortOriginal} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Sort Original</button>
            <button type="button" onClick={onRemoveDuplicates} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Dedupe</button>
            <button type="button" onClick={onExtractOdd} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Extract Odd</button>
            <button type="button" onClick={onExtractEven} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Extract Even</button>
          </div>
          <button
            type="button"
            onClick={onOpenExportPreview}
            className="mt-2 w-full rounded bg-cyan-600 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-cyan-700"
          >
            Export Preview
          </button>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button type="button" onClick={onOpenKeyboardHelp} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Shortcuts</button>
            <button type="button" onClick={onOpenPrivacyPanel} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Privacy</button>
          </div>
        </section>

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
