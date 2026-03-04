import { describe, expect, it } from 'vitest';
import { normalizeSearchMatchIndex, resolveActiveSearchMatchIndex } from './searchNavigation';

describe('searchNavigation helpers', () => {
  it('normalizes index with wraparound', () => {
    expect(normalizeSearchMatchIndex(0, 3)).toBe(0);
    expect(normalizeSearchMatchIndex(3, 3)).toBe(0);
    expect(normalizeSearchMatchIndex(4, 3)).toBe(1);
    expect(normalizeSearchMatchIndex(-1, 3)).toBe(2);
  });

  it('resolves active search match index from active page', () => {
    const matches = [{ pageId: 'p1' }, { pageId: 'p2' }, { pageId: 'p3' }];
    expect(resolveActiveSearchMatchIndex(matches, 'p2', 0)).toBe(1);
  });

  it('keeps previous index bounded when active page has no match', () => {
    const matches = [{ pageId: 'p1' }, { pageId: 'p2' }];
    expect(resolveActiveSearchMatchIndex(matches, 'px', 10)).toBe(1);
    expect(resolveActiveSearchMatchIndex(matches, null, 1)).toBe(1);
    expect(resolveActiveSearchMatchIndex([], null, 5)).toBe(0);
  });
});
