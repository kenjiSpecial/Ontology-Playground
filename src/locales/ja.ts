import type { MessageTree } from './validateJa';

export const jaMessages = {
  meta: {
    productName: 'Ontology Playground',
    preview: 'プレビュー',
    description: 'オントロジーを学び、設計し、可視化するプレイグラウンド',
  },
  common: {
    close: '閉じる',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    loading: '読み込み中…',
    retry: '再試行',
  },
  navigation: {
    home: 'ホーム',
    catalogue: 'カタログ',
    designer: 'デザイナー',
    school: 'オントロジースクール',
  },
  terms: {
    fabricIq: 'Microsoft Fabric IQ',
    github: 'GitHub',
    rdf: 'RDF',
    owl: 'OWL',
  },
} as const satisfies MessageTree;

export type JapaneseMessages = typeof jaMessages;

export const jaAllowedEnglishOnlyPaths = [
  'meta.productName',
  'terms.fabricIq',
  'terms.github',
  'terms.rdf',
  'terms.owl',
] as const;

export const jaFormatters = {
  points: (count: number): string => `${count}ポイント`,
  badges: (count: number): string => `${count}個のバッジ`,
  loadFailed: (status: number): string => `読み込みに失敗しました（${status}）`,
} as const;
