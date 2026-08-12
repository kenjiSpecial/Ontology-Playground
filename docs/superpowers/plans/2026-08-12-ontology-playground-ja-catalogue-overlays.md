# カタログ日本語表示overlay基盤 実装計画

## 目的

Issue #36として、同梱RDF・内部識別子・データ バインディングを変更せず、stable IDをキーに日本語表示テキストだけを適用する型付きoverlay基盤を作る。

## 設計

- overlay正本は `content/ja/catalogue/<source>/<entry>.json` とする。
- カタログ名・説明・表示タグ、ontology、entity、property、relationship、relationship attribute、enum値の表示テキストを格納する。
- `Ontology`、`EntityType`、`Property`、`Relationship`、`RelationshipAttribute` に任意の表示専用fieldを追加する。既存の `name`、ID、URI由来値、enum値は内部値として保持する。
- 共通helperで `displayName ?? name` 等を解決し、overlayのないimport・利用者作成データは従来表示を保つ。
- serializer、binding、quest target、query matching、store selectionは内部fieldを使い続ける。

### Task 1: overlay schema・validation・compiler適用

対象:

- `src/types/catalogueLocalization.ts`
- `src/data/ontology.ts`
- `src/lib/catalogueLocalization.ts`
- `scripts/compile-catalogue.ts`
- `content/ja/catalogue/schema.json`
- 関連unit test

要件:

1. overlayのstrict parser / validatorを失敗テストから実装する。
2. entry/entity/property/relationship/attribute/enumのunknown・duplicate相当・missing coverage・禁止field・不正型をfail closedにする。
3. 表示用fieldは日本語を含むか、理由の明確なtechnical tokenであることを検証する。
4. compilerは対応overlayがあるentryだけに表示fieldを適用し、overlayなしentryは不変とする。
5. RDF round-trip検証はoverlay適用前の原本ontologyで行う。
6. URI由来ID、name、binding、slug、source、category、authorを変更しないことをtestする。
7. Node 20で関連test、catalogue build、TypeScriptを実行し、exact pathでcommitする。

### Task 2: 全表示surfaceをdisplay helperへ移行

対象:

- 新規 `src/lib/displayText.ts`
- graph、inspector、search、path finder、summary、query、quest、gallery/embed/designer preview等、同梱ontologyを表示するconsumer
- 関連test

要件:

1. 表示にはdisplay fieldを優先し、存在しなければ内部name/description/valueへfallbackする。
2. 検索と自然言語queryは日本語表示名と内部名の両方で見つけられる。
3. selection、quest target、relationship endpoints、property matching、data bindingは内部ID/nameを維持する。
4. RDF/JSON/Fabric exportは内部識別子の互換性を維持し、表示fieldを構文上のIDへ使用しない。
5. Node 20で関連test、日本語QA、TypeScript/ESLintを実行し、exact pathでcommitする。

### Task 3: 統合QA・文書化

対象:

- `src/locales/CatalogueLocalization.test.ts`
- `docs/japanese-localization.md`
- `README.md` / `TODO.md` のカタログoverlay基盤進捗
- 必要なcompiler / display regression test

要件:

1. 実際の一時fixtureまたは小さなtest fixtureでoverlayあり・なしをcompilerからUI objectまで検証する。
2. invalid overlay、coverage不足、内部field変更を検出する。
3. graph、inspector、search、query、quest、exportの主要回帰を自動化する。
4. overlay作成手順、stable key、翻訳禁止field、technical token境界を文書化する。
5. Node 20で全test、`qa:ja`、catalogue build、本番build、TypeScript/Lintを実行し、exact pathでcommitする。

## 最終レビュー

- Issue #36の互換性境界と全surface coverageを独立レビューする。
- Critical / Important / Medium findingは修正して再レビューする。
- 生成物 `public/catalogue.json` と `public/learn.json` はcommitしない。
