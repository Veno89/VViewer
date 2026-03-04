import {
  DragOverlay,
  type DragCancelEvent,
  type DragOverEvent,
  type DragStartEvent,
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import type { PageInfo } from '@/types/pdf';
import { SortableItem } from './SortableItem';
import { ThumbnailCard } from './ThumbnailCard';

interface ThumbnailPanelProps {
  pages: PageInfo[];
  activePageId: string | null;
  selectedIds: Set<string>;
  thumbnails: Record<string, string>;
  onReorder: (activeId: string, overId: string) => void;
  onSelect: (pageId: string, multi: boolean, range: boolean) => void;
  onRotate: (pageId: string) => void;
  onDelete: (pageId: string) => void;
}

export function ThumbnailPanel({
  pages,
  activePageId,
  selectedIds,
  thumbnails,
  onReorder,
  onSelect,
  onRotate,
  onDelete,
}: ThumbnailPanelProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [dragState, setDragState] = useState<{ activeId: string | null; overId: string | null }>({
    activeId: null,
    overId: null,
  });

  const ids = useMemo(() => pages.map((page) => page.id), [pages]);
  const activeDragPage = useMemo(
    () => pages.find((page) => page.id === dragState.activeId) ?? null,
    [dragState.activeId, pages],
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const activeId = String(event.active.id);
    setDragState({ activeId, overId: null });
  };

  const handleDragCancel = (_event: DragCancelEvent): void => {
    setDragState({ activeId: null, overId: null });
  };

  const handleDragOver = (event: DragOverEvent): void => {
    setDragState((state) => ({ ...state, overId: event.over ? String(event.over.id) : null }));
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setDragState({ activeId: null, overId: null });
    if (!over || active.id === over.id) {
      return;
    }

    onReorder(String(active.id), String(over.id));
  };

  return (
    <div className="h-full overflow-y-auto p-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {pages.map((page) => (
              <div key={page.id}>
                <SortableItem
                  id={page.id}
                  isDropTarget={dragState.activeId !== page.id && dragState.overId === page.id}
                >
                  <ThumbnailCard
                    page={page}
                    thumbnailUrl={thumbnails[page.id]}
                    isActive={activePageId === page.id}
                    isSelected={selectedIds.has(page.id)}
                    onClick={(event) => {
                      onSelect(page.id, event.ctrlKey || event.metaKey, event.shiftKey);
                    }}
                    onActivate={() => {
                      onSelect(page.id, false, false);
                    }}
                    onRotate={() => onRotate(page.id)}
                    onDelete={() => onDelete(page.id)}
                  />
                </SortableItem>
              </div>
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeDragPage ? (
            <div className="w-full max-w-[220px] opacity-90">
              <ThumbnailCard
                page={activeDragPage}
                thumbnailUrl={thumbnails[activeDragPage.id]}
                isActive={false}
                isSelected={false}
                onClick={() => {
                  // Drag overlay is visual-only.
                }}
                onActivate={() => {
                  // Drag overlay is visual-only.
                }}
                onRotate={() => {
                  // Drag overlay is visual-only.
                }}
                onDelete={() => {
                  // Drag overlay is visual-only.
                }}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
