# 基礎・コーヒー・EC 学習コース日本語化計画

## 目的

Issue #21 の対象である3コースのメタデータと14記事を、技術的な意味と実行可能な構文を維持したまま自然な日本語へ翻訳する。

## 全体制約

- 変更対象は各タスクで指定した `content/learn/<course>/` と、明示したテスト・進捗文書だけ。
- frontmatterの `title` と `description`、Markdown本文、見出し、表の説明、画像代替文、クイズの質問・選択肢・解説を日本語化する。
- `slug`、`order`、`embed`、`reviewStatus`、ファイル名、URL、リンク先、HTMLタグ・属性、コードフェンス言語、コード、RDF/OWL/SPARQL/JSON構文、識別子、`Q:`、`[correct]` は変更しない。
- クイズの選択肢順と正解指定、見出し階層、埋め込みIDとdiff、記事順を変更しない。
- `Ontology Playground`、`Microsoft Fabric IQ`、`RDF`、`OWL`、`SPARQL`、`JSON`、`SQL`、APIなど定着した固有名・略語は必要に応じて保持する。
- エンティティ型・リレーションシップ・プロパティ・データ バインディング・学習パスなど、`docs/japanese-localization.md` の用語を優先する。
- 生成物 `public/learn.json` はcommitしない。

### Task 1: オントロジー基礎コースを翻訳し、コンテンツQAを追加

対象:

- `content/learn/ontology-fundamentals/` の `_meta.md` と6記事
- 新規 `src/locales/LearnContentLocalization.test.ts`

要件:

1. 対象コースの表示用メタデータと説明文をすべて自然な日本語へ翻訳する。
2. コード例、識別子、リンク、埋め込み、クイズ正解を保持する。
3. 新規テストは翻訳済みコースの全Markdownを列挙し、各ファイルのfrontmatter `title` / `description`、すべての `##` 見出し、クイズの `Q:` と `>` 解説が日本語文字を含むことを検証する。対象コース配列を後続タスクが拡張できる構造にする。
4. `npm run learn:build` と新規テストを実行する。
5. exact pathでstageし、Conventional Commits + 日本語でcommitする。

### Task 2: コーヒー学習パスを翻訳

対象:

- `content/learn/cosmic-coffee-path/` の `_meta.md` と4記事
- `src/locales/LearnContentLocalization.test.ts` の対象コース配列

要件:

1. 全体制約に従って表示用メタデータと説明文を日本語化する。
2. テストの翻訳済みコース配列へ `cosmic-coffee-path` を追加する。
3. `npm run learn:build` とコンテンツQAテストを実行する。
4. exact pathでstageし、Conventional Commits + 日本語でcommitする。

### Task 3: EC学習パスを翻訳し進捗を記録

対象:

- `content/learn/ecommerce-path/` の `_meta.md` と4記事
- `src/locales/LearnContentLocalization.test.ts` の対象コース配列
- `README.md`
- `TODO.md`

要件:

1. 全体制約に従って表示用メタデータと説明文を日本語化する。
2. テストの翻訳済みコース配列へ `ecommerce-path` を追加する。
3. READMEの日本語fork説明へ、この3コースのメタデータと記事が日本語化済みであることを追記する。
4. TODOの61記事翻訳項目を、14/61記事完了・残り47記事と分かる進捗表現へ更新する。
5. `npm run learn:build` とコンテンツQAテストを実行する。
6. exact pathでstageし、Conventional Commits + 日本語でcommitする。

## 最終検証

- 対象Markdownの説明文を英語残存スキャンし、コード・識別子・URL・固有名以外の英語文がないことを確認する。
- `npm run learn:build`
- `npm test`
- `npm run qa:ja`
- `npm run build`
- 対象LintとTypeScript
- 独立全体レビュー
