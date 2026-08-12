# サプライチェーン学習コース日本語化計画

## 目的

Issue #23 の小売供給網、果樹園から店頭、サプライチェーン寸断リスクの3コース（メタデータと17記事）を自然で技術的に正確な日本語へ翻訳する。

## 共通契約

- frontmatter `title` / `description`、本文、見出し、表、画像代替文、クイズ質問・選択肢・解説を日本語化する。
- `slug`、`order`、`embed`、`reviewStatus`、URL、HTML属性、コード、RDF/OWL/SPARQL/JSON構文、識別子、`Q:`、`[correct]` は変更しない。
- クイズ選択肢順・正解、見出し階層、埋め込みIDとdiff、記事順を保持する。
- 物流、在庫、需要、品質、リスク伝播の因果関係と数量条件を正確に維持する。
- `docs/japanese-localization.md` の用語を優先する。
- 生成物 `public/learn.json` はcommitしない。

### Task 1: IQ Lab 小売サプライチェーン

- `content/learn/iq-lab-retail-supply-chain/` の `_meta.md` と7記事を翻訳する。
- `src/locales/LearnContentLocalization.test.ts` へ対象ファイルを追加する。
- Node 20で学習コンパイルと対象QAを実行し、exact pathでcommitする。

### Task 2: Zava 果樹園から店頭

- `content/learn/zava-grove-to-shelf/` の `_meta.md` と6記事を翻訳する。
- コンテンツQAへ対象を追加し、Node 20で検証してexact pathでcommitする。

### Task 3: サプライチェーン寸断リスクと進捗

- `content/learn/supply-chain-disruption-path/` の `_meta.md` と4記事を翻訳する。
- コンテンツQAへ対象を追加する。
- README / TODOを51/61記事完了・残り10記事へ更新する。
- Node 20で検証してexact pathでcommitする。

## 各タスクのレビュー

- 翻訳漏れ、誤訳、意味変化、対象外変更、識別子・コード・URL・埋め込み・クイズ構造の破損を独立レビューする。
- Critical / Important / Medium findingは同じタスク内で修正・再検証する。

## 最終検証

- 対象Markdownの英語残存スキャン
- `npm run learn:build`
- `npm test`
- `npm run qa:ja`
- `npm run build`
- TypeScriptと変更範囲ESLint
- 独立全体レビュー
