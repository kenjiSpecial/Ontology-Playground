import { describe, expect, it } from 'vitest';
import {
  jaAllowedEmbeddedEnglishTerms,
  jaAllowedEnglishOnlyPaths,
  jaFormatters,
  jaMessages,
} from './ja';
import { validateJapaneseCatalog } from './validateJa';

describe('Japanese message catalog', () => {
  it('contains no invalid or stale values', () => {
    expect(
      validateJapaneseCatalog(jaMessages, jaAllowedEnglishOnlyPaths, jaAllowedEmbeddedEnglishTerms),
    ).toEqual([]);
  });

  it('formats counters in Japanese', () => {
    expect(jaFormatters.points(3)).toBe('3ポイント');
    expect(jaFormatters.badges(2)).toBe('2個のバッジ');
    expect(jaFormatters.loadFailed(404)).toBe('読み込みに失敗しました（404）');
  });
});
