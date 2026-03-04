import type { MouseEvent } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import type { PageInfo } from '@/types/pdf';

interface ThumbnailCardProps {
  page: PageInfo;
  thumbnailUrl?: string;
  isSelected: boolean;
  isActive: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onActivate: () => void;
  onRotate: () => void;
  onDelete: () => void;
}

export function ThumbnailCard({
  page,
  thumbnailUrl,
  isSelected,
  isActive,
  onClick,
  onActivate,
  onRotate,
  onDelete,
}: ThumbnailCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group w-full rounded-lg border bg-white p-2 text-left shadow-sm transition ${
        isSelected || isActive ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-300'
      }`}
      aria-label={`Page ${page.sourcePageIndex + 1}`}
    >
      <div className="relative overflow-hidden rounded-md bg-gray-100">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={`Thumbnail page ${page.sourcePageIndex + 1}`} className="w-full" />
        ) : (
          <div className="flex h-[180px] items-center justify-center text-xs text-gray-500">Rendering...</div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 transition group-hover:opacity-100" />

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            className="pointer-events-auto rounded bg-white p-1 text-gray-700 shadow hover:bg-gray-100"
            onClick={(event) => {
              event.stopPropagation();
              onRotate();
            }}
            aria-label="Rotate page"
          >
            <RotateCw size={14} />
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded bg-white p-1 text-red-600 shadow hover:bg-red-50"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label="Delete page"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <span>Page {page.sourcePageIndex + 1}</span>
        <span>{page.rotation}deg</span>
      </div>
    </div>
  );
}
