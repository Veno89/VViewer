import { describe, expect, it } from 'vitest';
import { dedupePagesBySource, filterEvenPagesByCurrentOrder, filterOddPagesByCurrentOrder, sortPagesByOriginalOrder } from './pageTools';
import type { PageInfo } from '../types/pdf';

const pages: PageInfo[] = [
  { id: 'a', sourceFileIndex: 1, sourcePageIndex: 3, rotation: 0 },
  { id: 'b', sourceFileIndex: 0, sourcePageIndex: 2, rotation: 0 },
  { id: 'c', sourceFileIndex: 0, sourcePageIndex: 1, rotation: 0 },
  { id: 'd', sourceFileIndex: 1, sourcePageIndex: 3, rotation: 0 },
  { id: 'e', sourceFileIndex: 2, sourcePageIndex: 0, rotation: 90 },
];

describe('pageTools', () => {
  it('sorts pages by original source and page index', () => {
    const sorted = sortPagesByOriginalOrder(pages);
    expect(sorted.map((page) => page.id)).toEqual(['c', 'b', 'a', 'd', 'e']);
  });

  it('deduplicates pages by source coordinates and rotation', () => {
    const deduped = dedupePagesBySource(pages);
    expect(deduped.map((page) => page.id)).toEqual(['a', 'b', 'c', 'e']);
  });

  it('filters odd and even pages by current order', () => {
    expect(filterOddPagesByCurrentOrder(pages).map((page) => page.id)).toEqual(['a', 'c', 'e']);
    expect(filterEvenPagesByCurrentOrder(pages).map((page) => page.id)).toEqual(['b', 'd']);
  });
});
