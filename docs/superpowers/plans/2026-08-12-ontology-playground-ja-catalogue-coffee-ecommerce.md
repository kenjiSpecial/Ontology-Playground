# コーヒー・EC公式カタログoverlay 実装計画

## 目的

Issue #27として、公式カタログのCosmic Coffee系4件とE-commerce系4件に、日本語表示専用overlayを追加する。元RDF、metadataの内部値、段階間のモデル構造は変更しない。

## 共通制約

- 対象は `content/ja/catalogue/official/` 配下の8 JSONと、必要最小限の日本語QA・進捗文書だけ。
- stable key、URI、内部name/ID、relationship endpoint、enum raw value、binding、slug、source、category、authorは原文を維持する。
- sourceに存在するtag/entity/property/relationship/attribute/enumを各overlayで完全に1回ずつ覆う。
- 非空の名前・説明は日本語表示文を持たせる。固有のtechnical tokenはvalidator契約どおり理由付きでのみ保持する。
- 各段階は、そのRDFに実在する要素だけを翻訳し、後続段階の要素を先取りしない。
- Node 20で検証し、generated `public/catalogue.json` / `public/learn.json` はcommitしない。

### Task 1: Cosmic Coffee 4件

1. failing QAを先に追加し、対象4 entryのoverlayがない状態でREDを確認する。
2. `cosmic-coffee-step-1`〜`step-3`と`cosmic-coffee`の表示名・説明・tags・全nested display textを自然な日本語にする。
3. compiler coverage、source internal values不変、段階構造不変を自動検証する。
4. 対象test、catalogue build、TypeScriptを実行し、exact pathでcommitする。

### Task 2: E-commerce 4件

1. failing QAを先に追加し、対象4 entryのoverlayがない状態でREDを確認する。
2. `ecommerce-step-1`〜`step-3`と`ecommerce`の表示名・説明・tags・全nested display textを自然な日本語にする。
3. compiler coverage、source internal values不変、段階構造不変を自動検証する。
4. 対象test、catalogue build、TypeScriptを実行し、exact pathでcommitする。

### Task 3: 統合検証・進捗更新

1. 8 entryすべてについて、日本語表示field、完全coverage、内部field不変をまとめて検証する。
2. README/TODOの実カタログoverlay進捗を8/71へ更新し、残りIssues #28〜#33を正確に示す。
3. 全test、`qa:ja`、catalogue build、RDF validation、本番build、TypeScript、changed-path ESLint、diff checkをNode 20で実行する。

## レビューとdelivery

- Taskごとに独立レビューし、Critical / Important / Medium findingを修正して再レビューする。
- 全体レビュー後、Issue #27に紐づくPRを作成する。
- current-headのローカル検証とGitHub上のmergeabilityを確認し、許可済みの範囲でmergeする。
