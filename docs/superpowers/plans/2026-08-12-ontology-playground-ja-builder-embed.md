# AIビルダー・埋め込み表示 日本語化計画

> Issue: #17

## 目的

AIビルダーと配布用埋め込みウィジェットの固定UI・ローカルエラー・アクセシブル名を日本語化する。API、RDF、JSON、ID、読込データは維持する。

## 対象

- `src/components/NLBuilderModal.tsx`
- `src/components/EmbedWidget.tsx`
- `src/components/EmbedWidget.test.tsx`
- `src/locales/ja.ts`
- 必要な日本語化テスト

## 実装方針

1. 既存の埋め込みテストを日本語期待値へ更新し、AIビルダーの固定UIテストを追加する。
2. REDを確認してから `jaMessages.aiBuilder`、`jaMessages.embed`、件数・エラーformatterを追加する。
3. AIビルダーの入力、音声、例文、生成、プレビュー、JSON編集、適用、エラー状態を翻訳カタログへ接続する。
4. SpeechRecognitionの言語を `ja-JP` にする。
5. 埋め込みの読込、エラー、ヘッダー、タブ、コピー、インスペクターの固定UIとアクセシブル名を翻訳する。
6. API・パーサー由来の詳細は日本語の説明に続けて保持し、生成/読込データは改変しない。

## TDD手順

1. `EmbedWidget.test.tsx` の固定UI期待値を日本語化する。
2. AIビルダーの入力画面、生成中、失敗、プレビューを検証するテストを追加する。
3. 対象テストでREDを確認する。
4. 最小限の実装でGREENにする。
5. `npm run qa:ja`、対象ESLint、全テスト、buildを実行する。

## 非対象

- APIの生成仕様とレスポンス形式
- 生成/読込された名称、説明、プロパティ、関係、ID
- RDF/XML、JSONキー、URI、埋め込み設定属性
- 学習画面、学習記事本文、カタログエントリ本文

## 完了条件

- Issue #17 の受け入れ条件を満たす。
- 対象テスト、翻訳検査、全テスト、本番buildが成功する。
- exact pathでcommit・pushし、PRを作成する。
