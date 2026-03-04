export interface NormalizedTextRect {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TransformableTextItem {
  str?: unknown;
  transform?: unknown;
  width?: unknown;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toTransform(item: TransformableTextItem): number[] | null {
  if (!Array.isArray(item.transform) || item.transform.length < 6) {
    return null;
  }

  const transform = item.transform as unknown[];
  if (!transform.every((value) => typeof value === 'number' && Number.isFinite(value))) {
    return null;
  }

  return transform as number[];
}

export function normalizeTextItem(
  item: TransformableTextItem,
  viewportWidth: number,
  viewportHeight: number,
): NormalizedTextRect | null {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }

  if (typeof item.str !== 'string' || item.str.trim().length === 0) {
    return null;
  }

  const transform = toTransform(item);
  if (!transform || typeof item.width !== 'number' || !Number.isFinite(item.width)) {
    return null;
  }

  const rawHeight = Math.max(Math.abs(transform[3]), 8);
  const rawWidth = Math.max(item.width, 1);
  const rawLeft = transform[4];
  const rawTop = viewportHeight - transform[5] - rawHeight;

  const clampedLeft = clamp(rawLeft, 0, viewportWidth);
  const clampedTop = clamp(rawTop, 0, viewportHeight);
  const clampedWidth = Math.max(0, Math.min(viewportWidth - clampedLeft, rawWidth));
  const clampedHeight = Math.max(0, Math.min(viewportHeight - clampedTop, rawHeight));

  if (clampedWidth <= 0 || clampedHeight <= 0) {
    return null;
  }

  return {
    text: item.str,
    left: clampedLeft / viewportWidth,
    top: clampedTop / viewportHeight,
    width: clampedWidth / viewportWidth,
    height: clampedHeight / viewportHeight,
  };
}

export function normalizeTextItems(
  items: unknown[],
  viewportWidth: number,
  viewportHeight: number,
): NormalizedTextRect[] {
  return items
    .map((item) => normalizeTextItem(item as TransformableTextItem, viewportWidth, viewportHeight))
    .filter((item): item is NormalizedTextRect => Boolean(item));
}

export function mergeNormalizedText(items: NormalizedTextRect[]): string {
  return items
    .map((item) => item.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
