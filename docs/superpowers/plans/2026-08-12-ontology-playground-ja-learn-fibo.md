# FIBO学習ラボ日本語化計画

## 目的

Issue #24のFIBOローンラボとFIBOリスクラボ（メタデータと10記事）を、FIBOの金融概念と標準識別子を維持したまま自然な日本語へ翻訳し、全61記事の日本語化を完了する。

## 共通契約

- frontmatter `title` / `description`、本文、見出し、表、画像代替文、クイズ質問・選択肢・解説を日本語化する。
- `slug`、`order`、`embed`、`reviewStatus`、URL、HTML属性、コード、RDF/OWL/SPARQL/JSON構文、FIBO URI・QName・クラス名・識別子、`Q:`、`[correct]` は変更しない。
- クイズ選択肢順・正解、見出し階層、埋め込みIDとdiff、記事順を保持する。
- FIBO用語、ローン当事者・担保・返済・サービシング、産業・地理・ローン分類・規制文脈の意味を正確に維持する。
- `docs/japanese-localization.md` の用語を優先する。
- 生成物 `public/learn.json` はcommitしない。

### Task 1: FIBOローンラボ

- `content/learn/fibo-loans-lab/` の `_meta.md` と5記事を翻訳する。
- `src/locales/LearnContentLocalization.test.ts` へ対象ファイルを追加する。
- Node 20で学習コンパイルと対象QAを実行し、exact pathでcommitする。

### Task 2: FIBOリスクラボと完了進捗

- `content/learn/fibo-risk-lab/` の `_meta.md` と5記事を翻訳する。
- コンテンツQAへ対象を追加する。
- README / TODOを全13コース・61/61記事完了へ更新する。
- Node 20で検証し、exact pathでcommitする。

## レビューと最終検証

- 各タスクで翻訳漏れ、金融用語の誤訳、意味変化、対象外変更、識別子・コード・URL・埋め込み・クイズ構造の破損を独立レビューする。
- Critical / Important / Medium findingは同じタスク内で修正・再検証する。
- 最終的に英語残存スキャン、`npm run learn:build`、`npm test`、`npm run qa:ja`、`npm run build`、TypeScript、変更範囲ESLint、独立全体レビューを実行する。
