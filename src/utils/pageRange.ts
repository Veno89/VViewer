export function parsePageRangeInput(input: string, totalPages: number): number[] {
  const cleaned = input.replace(/\s+/g, '');
  if (!cleaned) {
    throw new Error('Page range is empty.');
  }

  const selected = new Set<number>();
  const segments = cleaned.split(',').filter(Boolean);

  if (segments.length === 0) {
    throw new Error('No page numbers found in the range.');
  }

  for (const segment of segments) {
    const rangeMatch = /^(\d+)-(\d+)$/.exec(segment);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);

      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        throw new Error(`Range ${segment} is out of bounds. Document has ${totalPages} pages.`);
      }

      const step = start <= end ? 1 : -1;
      for (let value = start; step > 0 ? value <= end : value >= end; value += step) {
        selected.add(value - 1);
      }

      continue;
    }

    const singleMatch = /^\d+$/.exec(segment);
    if (singleMatch) {
      const pageNumber = Number(singleMatch[0]);
      if (pageNumber < 1 || pageNumber > totalPages) {
        throw new Error(`Page ${pageNumber} is out of bounds. Document has ${totalPages} pages.`);
      }

      selected.add(pageNumber - 1);
      continue;
    }

    throw new Error(`Invalid page range token: ${segment}`);
  }

  return [...selected].sort((a, b) => a - b);
}
