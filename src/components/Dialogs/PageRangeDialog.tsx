import { useEffect, useState } from 'react';

interface PageRangeDialogProps {
  isOpen: boolean;
  totalPages: number;
  onClose: () => void;
  onApply: (input: string) => void;
  errorMessage?: string | null;
}

export function PageRangeDialog({ isOpen, totalPages, onClose, onApply, errorMessage }: PageRangeDialogProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setValue('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Page Range Selection</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter pages like <span className="font-medium">1-3, 5, 8-12</span> (1 to {totalPages}).
        </p>

        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="page-range-input">
          Page Range
        </label>
        <input
          id="page-range-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="1-3, 6, 10-12"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none ring-blue-500 focus:ring"
        />

        {errorMessage && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onApply(value)}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
