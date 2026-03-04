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
import { useEffect, useMemo, useRef, useState } from 'react';
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
  onVisibleIdsChange?: (ids: Set<string>) => void;
}

const ITEM_HEIGHT = 248;
const OVERSCAN = 4;

export function ThumbnailPanel({
  pages,
  activePageId,
  selectedIds,
  thumbnails,
  onReorder,
  onSelect,
  onRotate,
  onDelete,
  onVisibleIdsChange,
}: ThumbnailPanelProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(700);
  const [dragState, setDragState] = useState<{ activeId: string | null; overId: string | null }>({
    activeId: null,
    overId: null,
  });

  const ids = useMemo(() => pages.map((page) => page.id), [pages]);
  const isVirtualized = dragState.activeId === null;
  const activeDragPage = useMemo(
    () => pages.find((page) => page.id === dragState.activeId) ?? null,
    [dragState.activeId, pages],
  );

  const windowRange = useMemo(() => {
    if (!isVirtualized) {
      return { start: 0, end: pages.length - 1 };
    }

    const start = Math.max(Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN, 0);
    const end = Math.min(Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN, pages.length - 1);
    return { start, end };
  }, [isVirtualized, pages.length, scrollTop, viewportHeight]);

  const visiblePages = useMemo(() => {
    if (pages.length === 0) {
      return [];
    }

    return pages.slice(windowRange.start, windowRange.end + 1);
  }, [pages, windowRange.end, windowRange.start]);

  useEffect(() => {
    if (!onVisibleIdsChange) {
      return;
    }

    onVisibleIdsChange(new Set(visiblePages.map((page) => page.id)));
  }, [onVisibleIdsChange, visiblePages]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setViewportHeight(Math.max(200, Math.floor(entry.contentRect.height)));
    });

    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleDragStart = (event: DragStartEvent): void => {
    const activeId = String(event.active.id);
    setDragState({ activeId, overId: null });

    // Render all thumbnail IDs while dragging to avoid blank slots.
    onVisibleIdsChange?.(new Set(ids));
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
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-3"
      onScroll={(event) => {
        setScrollTop(event.currentTarget.scrollTop);
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2" style={isVirtualized ? { paddingTop: windowRange.start * ITEM_HEIGHT } : undefined}>
            {visiblePages.map((page) => (
              <div
                key={page.id}
                style={{
                  ...(isVirtualized
                    ? {
                        contentVisibility: 'auto',
                        containIntrinsicSize: '240px',
                      }
                    : {}),
                }}
              >
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
            {isVirtualized && <div style={{ height: Math.max(0, (pages.length - windowRange.end - 1) * ITEM_HEIGHT) }} />}
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
