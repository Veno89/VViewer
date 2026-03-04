import { describe, expect, it } from 'vitest';
import { buildSearchStatusNote, resolveSearchScanPageCount } from './searchReliability';

describe('searchReliability', () => {
  it('normalizes scan page count safely', () => {
    expect(resolveSearchScanPageCount(0, 10)).toBe(0);
    expect(resolveSearchScanPageCount(50, Number.MAX_SAFE_INTEGER)).toBe(50);
    expect(resolveSearchScanPageCount(50, 20)).toBe(20);
    expect(resolveSearchScanPageCount(50, 0)).toBe(1);
  });

  it('builds limited scan status note for large documents', () => {
    const note = buildSearchStatusNote({
      isLargeDocumentMode: true,
      pageCount: 260,
      query: 'invoice',
      isScanLimited: true,
      scannedPages: 120,
    });

    expect(note).toContain('search scanned 120 of 260 pages');
  });

  it('returns empty note outside large-document mode', () => {
    const note = buildSearchStatusNote({
      isLargeDocumentMode: false,
      pageCount: 40,
      query: 'report',
      isScanLimited: false,
      scannedPages: 40,
    });

    expect(note).toBe('');
  });
});