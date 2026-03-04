import { describe, expect, it } from 'vitest';
import { mergeNormalizedText, normalizeTextItem, normalizeTextItems } from './pdfTextLayer';

describe('pdfTextLayer utils', () => {
  it('normalizes a valid text item into viewport-relative rect', () => {
    const normalized = normalizeTextItem(
      {
        str: 'Hello',
        transform: [1, 0, 0, 10, 20, 80],
        width: 50,
      },
      200,
      100,
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.text).toBe('Hello');
    expect(normalized?.left).toBeCloseTo(0.1);
    expect(normalized?.top).toBeCloseTo(0.1);
    expect(normalized?.width).toBeCloseTo(0.25);
    expect(normalized?.height).toBeCloseTo(0.1);
  });

  it('returns null for invalid items and keeps only valid entries', () => {
    const normalized = normalizeTextItems(
      [
        { str: 'A', transform: [1, 0, 0, 12, 10, 30], width: 20 },
        { str: '', transform: [1, 0, 0, 10, 10, 10], width: 10 },
        { str: 'Bad', transform: [1, 0, 0], width: 10 },
        { str: 'BadWidth', transform: [1, 0, 0, 10, 10, 10], width: 'x' },
      ],
      100,
      100,
    );

    expect(normalized).toHaveLength(1);
    expect(normalized[0]?.text).toBe('A');
  });

  it('merges normalized text with consistent spacing', () => {
    const merged = mergeNormalizedText([
      { text: 'Hello', left: 0, top: 0, width: 0.1, height: 0.1 },
      { text: 'world', left: 0.2, top: 0, width: 0.1, height: 0.1 },
      { text: '  from\nPDF ', left: 0.3, top: 0, width: 0.1, height: 0.1 },
    ]);

    expect(merged).toBe('Hello world from PDF');
  });
});
