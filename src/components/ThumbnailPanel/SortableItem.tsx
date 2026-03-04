import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, PropsWithChildren } from 'react';

interface SortableItemProps extends PropsWithChildren {
  id: string;
  isDropTarget?: boolean;
}

export function SortableItem({ id, children, isDropTarget = false }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: CSSProperties = {
    // Use Translate (not Transform) to avoid scale artifacts when combined with DragOverlay.
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDropTarget ? 'relative before:absolute before:-top-1 before:left-0 before:right-0 before:h-0.5 before:bg-blue-500' : ''}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
