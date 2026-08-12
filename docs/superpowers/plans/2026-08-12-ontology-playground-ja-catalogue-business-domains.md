# 業務ドメイン公式カタログoverlay 実装計画

## 目的

Issue #28のfinance、healthcare、manufacturing、university各本体・step 1〜3、計16件を日本語表示overlay化し、実カタログ進捗を24/71へ進める。

## 制約

- overlayだけで表示名・説明・tags・enum表示値を日本語化し、RDF/metadata、URI、内部ID/name、property key、relationship endpoint、raw enum、binding、slug/category/authorを変えない。
- 各entryのstable key collectionを完全に1回ずつ覆い、step間の構造差分を保持する。
- 既存の日本語学習教材と用語・意味を揃える。
- 実compiler outputをsource RDF/metadataから独立に導いたstable key集合と比較し、日本語表示coverageと内部値不変をQAする。

## Task 1: 16 overlayとQA

1. 対象16件が未overlayで失敗する実compiler QAを先に追加しRED確認。
2. 4ドメイン×4段階のoverlayを完全coverageで作成。
3. focused QA、catalogue build、qa:ja、全test、TypeScript、RDF validation、本番build、changed lint、diff checkをNode 20で実行。
4. README/TODOを24/71完了・残47件・Issues #29〜#33へ更新し、exact pathでcommit。

## レビューとdelivery

- source照合と翻訳品質を独立レビューし、Critical / Important / Mediumを修正。
- Issue #28のPRを作成し、最新HEADの検証・mergeability確認後、許可済み範囲でmergeする。
