import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PropsWithChildren } from 'react';

interface SortableItemProps extends PropsWithChildren {
  id: string;
  isDropTarget?: boolean;
}

export function SortableItem({ id, children, isDropTarget = false }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-70 shadow-2xl ring-2 ring-blue-500' : ''} ${isDropTarget ? 'relative before:absolute before:-top-1 before:left-0 before:right-0 before:h-0.5 before:bg-blue-500' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
