import type { PageInfo } from '@/types/pdf';

export function dedupePagesBySource(pages: PageInfo[]): PageInfo[] {
  const seen = new Set<string>();
  const deduped: PageInfo[] = [];

  pages.forEach((page) => {
    const key = `${page.sourceFileIndex}:${page.sourcePageIndex}:${page.rotation}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(page);
    }
  });

  return deduped;
}

export function sortPagesByOriginalOrder(pages: PageInfo[]): PageInfo[] {
  return [...pages].sort((left, right) => {
    if (left.sourceFileIndex !== right.sourceFileIndex) {
      return left.sourceFileIndex - right.sourceFileIndex;
    }

    return left.sourcePageIndex - right.sourcePageIndex;
  });
}

export function filterOddPagesByCurrentOrder(pages: PageInfo[]): PageInfo[] {
  return pages.filter((_, index) => index % 2 === 0);
}

export function filterEvenPagesByCurrentOrder(pages: PageInfo[]): PageInfo[] {
  return pages.filter((_, index) => index % 2 === 1);
}
