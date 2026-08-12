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
    expect(jaFormatters.questComplete('グラフ探索者')).toBe('クエスト完了！獲得: グラフ探索者');
    expect(jaFormatters.deployedCommit('abc1234')).toBe('デプロイ済みコミット abc1234');
    expect(jaFormatters.entities(6)).toBe('エンティティ（6）');
    expect(jaFormatters.relationships(8)).toBe('リレーションシップ（8）');
    expect(jaFormatters.properties(6)).toBe('6件のプロパティ');
    expect(jaFormatters.propertiesHeading(6)).toBe('プロパティ（6）');
    expect(jaFormatters.searchNoResults('顧客')).toBe('「顧客」に一致する結果はありません');
    expect(jaFormatters.shortestPath(2)).toBe('最短経路 — 2ホップ');
    expect(jaFormatters.queryPlaceholder('Fourth Coffee')).toBe('Fourth Coffeeについて質問…');
    expect(jaFormatters.queryDetectedEntityDefinition('Problem')).toBe('エンティティ定義の質問として解釈: Problem');
    expect(jaFormatters.queryPropertiesHeading(3)).toBe('プロパティ（3件）:');
    expect(jaFormatters.querySchemaTotal(3, 1)).toBe('合計: 3個のエンティティ、1個のリレーションシップ');
    expect(jaFormatters.questProgress(1, 3)).toBe('1/3ステップ');
    expect(jaFormatters.questRewardPoints(100)).toBe('+100ポイント');
    expect(jaFormatters.earnedBadges(2)).toBe('獲得バッジ（2）');
    expect(jaFormatters.totalPoints(350)).toBe('合計: 350ポイント');
    expect(jaFormatters.designerEntityCount(2)).toBe('エンティティ型（2）');
    expect(jaFormatters.designerPropertyCount(3)).toBe('プロパティ（3）');
    expect(jaFormatters.designerValidationIssueCount(2)).toBe('修正が必要な問題が2件あります');
    expect(jaFormatters.designerNameTooLong('エンティティ型', 'Customer')).toContain('26文字以内');
  });
});
