# 業務ドメイン学習コース日本語化計画

## 目的

Issue #22 の金融・医療・製造・大学・人事の5コース（メタデータと20記事）を、意味と実行可能な構文を維持したまま自然な日本語へ翻訳する。

## 全体制約

- 各タスクの対象コースと、明示したテスト・進捗文書だけを変更する。
- frontmatter の `title` / `description`、Markdown本文、見出し、表、画像代替文、クイズの質問・選択肢・解説を日本語化する。
- `slug`、`order`、`embed`、`reviewStatus`、ファイル名、URL、HTML属性、コード、RDF/OWL/SPARQL/JSON構文、識別子、`Q:`、`[correct]` は変更しない。
- クイズの選択肢順と正解、見出し階層、埋め込みIDとdiff、記事順を変更しない。
- `docs/japanese-localization.md` の用語を優先し、固有名・略語は必要に応じて保持する。
- 生成物 `public/learn.json` はcommitしない。

### Task 1: 金融コース

- `content/learn/finance-path/` の `_meta.md` と4記事を日本語化する。
- `src/locales/LearnContentLocalization.test.ts` に対象ファイルを追加する。
- 学習コンパイルと対象QAを実行し、exact pathでcommitする。

### Task 2: 医療コース

- `content/learn/healthcare-path/` の `_meta.md` と4記事を日本語化する。
- コンテンツQAの対象へ追加し、学習コンパイルと対象QAを実行してexact pathでcommitする。

### Task 3: 製造コース

- `content/learn/manufacturing-path/` の `_meta.md` と4記事を日本語化する。
- コンテンツQAの対象へ追加し、学習コンパイルと対象QAを実行してexact pathでcommitする。

### Task 4: 大学コース

- `content/learn/university-path/` の `_meta.md` と4記事を日本語化する。
- コンテンツQAの対象へ追加し、学習コンパイルと対象QAを実行してexact pathでcommitする。

### Task 5: 人事コースと進捗記録

- `content/learn/hr-system-path/` の `_meta.md` と4記事を日本語化する。
- コンテンツQAの対象へ追加する。
- READMEとTODOを、業務ドメイン5コースを含む34/61記事完了・残り27記事へ更新する。
- 学習コンパイルと対象QAを実行し、exact pathでcommitする。

## 各タスクのレビュー

- コード・識別子・URL・構文の意図しない変更がないことを確認する。
- 説明文の英語残存、意味の変化、不自然または誤解を招く訳を確認する。
- Critical / Important / Medium finding は同一タスク内で修正・再検証する。

## 最終検証

- 対象Markdownの英語残存スキャン
- `npm run learn:build`
- `npm test`
- `npm run qa:ja`
- `npm run build`
- TypeScriptと変更範囲ESLint
- 独立全体レビュー
