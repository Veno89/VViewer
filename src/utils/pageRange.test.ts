import { describe, expect, it } from 'vitest';
import { parsePageRangeInput } from './pageRange';

describe('parsePageRangeInput', () => {
  it('parses single pages and ranges', () => {
    expect(parsePageRangeInput('1-3, 5, 8-9', 12)).toEqual([0, 1, 2, 4, 7, 8]);
  });

  it('supports reverse ranges', () => {
    expect(parsePageRangeInput('5-3', 10)).toEqual([2, 3, 4]);
  });

  it('deduplicates repeated pages', () => {
    expect(parsePageRangeInput('1,1,1-2', 4)).toEqual([0, 1]);
  });

  it('throws on out-of-bounds values', () => {
    expect(() => parsePageRangeInput('0,2', 4)).toThrow();
    expect(() => parsePageRangeInput('1-9', 8)).toThrow();
  });

  it('throws on invalid tokens', () => {
    expect(() => parsePageRangeInput('a,b', 4)).toThrow();
    expect(() => parsePageRangeInput('', 4)).toThrow();
  });
});
