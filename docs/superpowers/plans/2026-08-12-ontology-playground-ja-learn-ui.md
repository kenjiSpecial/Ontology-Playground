# 学習画面 共通UI日本語化 実装計画

## 目的

`LearnPage` が表示する固定UI、状態、操作ラベル、クイズ結果、発表モード、記事内オントロジー図の補助UIを日本語化する。コースと記事のタイトル・説明・本文、オントロジー名、slug、URL、コード、内部状態値はこのIssueでは変更しない。

## 対象

- `src/components/LearnPage.tsx`
- `src/components/LearnPage.test.tsx`
- `src/components/QuizSlide.test.tsx`
- `src/locales/ja.ts`
- 必要な学習UIローカライズテスト
- `README.md` と `TODO.md` の進捗記録

## 方針

1. 固定文言を `jaMessages.learn` に集約する。
2. HTTP状態、戻り先、件数、手順番号、前後の記事名など動的文言は `jaFormatters` で組み立てる。
3. API・記事・カタログ由来の値は翻訳せず、日本語の固定文脈に埋め込む。
4. `dangerouslySetInnerHTML` に渡す記事HTMLの処理は変更しない。
5. DOMで生成する記事内グラフの補助UIも同じカタログから日本語化する。

## TDD手順

1. 読込、カタログ、コース詳細、記事移動、発表モード、クイズ、埋め込みエラー・差分UIの日本語期待値をテストへ追加する。
2. 未実装状態でフォーカステストが失敗することを確認する。
3. `jaMessages.learn` と必要なformatterを追加する。
4. `LearnPage` の固定文言とアクセシブル名を置換する。
5. 記事・カタログ由来の英語fixtureがそのまま表示されることをテストする。
6. 対象Lintとユーザー可視英語の残存スキャンを実行する。
7. `npm test`、`npm run qa:ja`、`npm run build` を実行する。
8. 独立レビュー後、Issue #19を閉じるPRを作成する。

## 完了条件

- 学習画面の固定UIにユーザー可視の英語が残らない。
- コース・記事・オントロジー由来の表示値、内部値、ルーティングが維持される。
- 全検証が合格し、高・中重要度の未解決レビューfindingがない。
