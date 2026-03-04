interface SearchMatchLike {
  pageId: string;
}

export function normalizeSearchMatchIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return ((index % total) + total) % total;
}

export function resolveActiveSearchMatchIndex(
  matches: SearchMatchLike[],
  activePageId: string | null,
  previousIndex: number,
): number {
  if (matches.length === 0) {
    return 0;
  }

  if (activePageId) {
    const matchedIndex = matches.findIndex((match) => match.pageId === activePageId);
    if (matchedIndex >= 0) {
      return matchedIndex;
    }
  }

  return Math.min(previousIndex, matches.length - 1);
}
