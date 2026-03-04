import type { OperationLogEntry } from '@/types/pdf';

interface OperationHistoryPanelProps {
  entries: OperationLogEntry[];
}

export function OperationHistoryPanel({ entries }: OperationHistoryPanelProps) {
  return (
    <aside className="hidden w-72 border-l border-gray-200 bg-white lg:block dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Activity
      </div>
      <div className="max-h-full overflow-y-auto p-3">
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
