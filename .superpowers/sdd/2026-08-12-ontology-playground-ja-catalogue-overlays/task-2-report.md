# Task 2 実装報告: カタログ表示 overlay の全 surface 接続

## 変更概要

Task 1 の `displayName` / `displayDescription` / `displayValues` を、表示専用の共通 helper `src/lib/displayText.ts` 経由で解決するよう接続した。overlay がない ontology、import データ、利用者作成データでは内部値へ fallback する。

### 変更 path

- `src/lib/displayText.ts`
- `src/lib/displayText.test.ts`
- `src/components/OntologyGraph.tsx`
- `src/components/InspectorPanel.tsx`
- `src/components/InspectorPanel.test.tsx`
- `src/components/SearchFilter.tsx`
- `src/components/SearchFilter.test.tsx`
- `src/components/PathFinderPanel.tsx`
- `src/components/OntologySummaryModal.tsx`
- `src/data/queryEngine.ts`
- `src/data/queryEngine.test.ts`
- `src/data/questGenerator.ts`
- `src/data/questGenerator.test.ts`
- `src/components/GalleryModal.tsx`
- `src/components/GalleryModal.test.tsx`
- `src/components/EmbedWidget.tsx`
- `src/components/LearnPage.tsx`
- `src/components/designer/DesignerPreview.tsx`
- `src/components/designer/EntityForm.tsx`
- `src/components/designer/RelationshipForm.tsx`
- `src/components/DataSourcesModal.tsx`
- `src/components/FabricExportModal.tsx`
- `src/components/ImportExportModal.tsx`
- `src/components/Header.tsx`
- `src/components/QueryPlayground.tsx`
- `src/components/NLBuilderModal.tsx`
- `src/lib/rdf/serializer.test.ts`
- `src/lib/fabric.test.ts`
- `src/store/appStore.test.ts`

## Consumer inventory

最初に `rg` で `src/components`, `src/data`, `src/lib`, `src/store` の ontology/catalogue 由来 name/description/property/value consumer を棚卸しした。

| surface | 対応内容 | 内部値を維持する境界 |
| --- | --- | --- |
| OntologyGraph / EmbedWidget / Learn inline embed / DesignerPreview | graph node、edge、legend、header、mini inspector の表示名・説明を display 優先 | Cytoscape の node/edge `id`, `source`, `target` は内部値 |
| InspectorPanel / Summary / DataSourcesModal | entity、relationship、attribute、property、binding mapping の表示名・説明を display 優先 | property click、binding mapping key、relationship endpoint lookup は内部 name/ID |
| SearchFilter / GalleryModal | 日本語表示名・説明・tag と内部名を検索対象に追加 | click handler は entity/relationship 内部 ID |
| PathFinderPanel / RelationshipForm / NLBuilder preview | 選択肢、path、relationship endpoint の表示名を display 優先 | select value、BFS、form の from/to は内部 ID |
| QueryPlayground / queryEngine | placeholder、suggestion、query 結果を display 優先し、自然言語 matching は display/internal 両対応 | highlight entity/relationship は内部 ID、SQL 例は内部 name |
| questGenerator | quest 文言を display 優先 | `targetId` と validator の照合は内部 ID/name |
| FabricExportModal / ImportExportModal / Header | 現在の ontology 名など画面表示のみ display 優先 | RDF/JSON/YAML/CSV/Fabric payload、download filename、share は従来内部値 |
| `src/lib/rdf/serializer.ts`, `src/lib/fabric.ts` | 実装は変更せず内部識別子を使用することを回帰検証 | URI、RDF label、Fabric name/endpoint/property matching は内部値 |

値については、現行 UI に enum instance value の直接表示 consumer がないため、`getDisplayValue()` の display value 優先/fallback 契約を helper unit test で固定した。新規 value consumer も同じ helper を使用する境界とする。

## TDD 証跡

### RED

Node 20 で、実装前に以下を実行した。

```text
PATH=/home/kenji/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin:$PATH npm test -- src/lib/displayText.test.ts src/data/queryEngine.test.ts src/components/GalleryModal.test.tsx --run
```

期待した failure は以下の通りで、実際に確認した。

- `src/lib/displayText.test.ts`: `./displayText` が未実装で import failure。
- localized query regression: 日本語 display name が結果に出ず assertion failure。
- localized gallery regression: localized card text が描画されず assertion failure。

### GREEN / verification

以下を Node 20 PATH で実行し、結果を確認した。

- `npm test -- src/lib/displayText.test.ts src/data/queryEngine.test.ts --run`: 2 files / 22 tests passed。
- `npm test -- src/components/GalleryModal.test.tsx --run`: 1 file / 12 tests passed。
- `npm test -- src/components/SearchFilter.test.tsx src/data/questGenerator.test.ts --run`: 2 files / 10 tests passed。
- `npm test -- src/components/InspectorPanel.test.tsx --run`: 1 file / 3 tests passed。
- `npm test -- src/lib/rdf/serializer.test.ts --run`: 1 file / 24 tests passed。
- `npm test -- src/lib/fabric.test.ts src/store/appStore.test.ts --run`: 2 files / 26 tests passed。
- `npm test -- --run`: 40 files / 504 tests passed。既存 EmbedWidget test の nested `vi.mock` warning のみ。
- `npm run qa:ja`: 11 files / 54 tests passed。
- `npm run catalogue:build`: 71 catalogue entries generated successfully。
- `npm run validate`: RDF validation all files OK。
- `npx vite build`: main bundle build successful。
- `npm run build:embed`: embed bundle build successful。
- `git diff --check`: clean。
- changed path に対する `npx eslint ...`: 0 errors / 1 existing warning（`OntologyGraph.tsx:357` の既存 `getCy` dependency warning）。

全体 verification として以下も実行した。

- `npm run lint -- --no-warn-ignored`: 既存 `src/lib/router.ts:114,117,120` の `no-case-declarations` 3 errors と、上記 graph warning。Task 2 差分由来の新規 error はなし。
- `npx tsc -b --pretty false`: Task 1 既存 `src/lib/catalogueLocalization.ts:567-568` の `TS1294`（constructor parameter properties）2 errors のみ。
- `npm run build`: `catalogue:build` / `learn:build` は成功後、上記 Task 1 既存 TS1294 2 errors で停止。build が生成した tracked `public/learn.json` は brief 指定の `git diff --binary -- public/learn.json | git apply -R` で復元した。

## 内部識別子不変の根拠

- `src/lib/rdf/serializer.test.ts`: localized display fields が存在しても RDF URI、`rdfs:label`、relationship/property URI は `Internal Ontology`、`Customer`、`customerId`、`places` の内部値を維持し、日本語 display text を含めないことを検証。
- `src/lib/fabric.test.ts`: Fabric definition の entity/property/relationship name、source/target entity ID が内部値で、display text を含めないことを検証。
- `src/store/appStore.test.ts`: JSON export の ontology/entity/property/relationship の name、ID、from/to が内部値であることを検証。
- `src/components/SearchFilter.test.tsx`: 日本語表示で検索・描画しても click 後の `selectedEntityId` / `selectedRelationshipId` が `customer` / `customer_places_order` の内部 ID であることを検証。
- `src/data/questGenerator.test.ts`: quest 文言は display name を使う一方、entity、relationship、identifier property の `targetId` は `service`、`configurationitem`、`service_supported_by_configuration_item`、`serviceId` の内部値であることを検証。query quest validator も localized ontology で pass。
- `src/components/DataSourcesModal.tsx` / `src/components/InspectorPanel.tsx`: 表示 label のみ helper で解決し、mapping object key と quest matching には内部 property name を渡す。
- serializer/export 実装（`src/lib/rdf/serializer.ts`, `src/lib/fabric.ts`, `appStore.exportOntology()`）へ display field を渡す変更はしていない。

## Commit

- 実装 commit: `3b05833ea3b7664503d271f53a044adf9619fe68` (`feat(i18n): カタログ表示overlayを全surfaceへ接続`)
- report は実装 commit 後の別 docs commit として追加する。

## 懸念

1. Task 1 既存 `src/lib/catalogueLocalization.ts` の constructor parameter properties が Node 20 の `erasableSyntaxOnly` で TS1294 になるため、TypeScript を clean にできない。Task 2 の scope 外として未変更。
2. 既存 `src/lib/router.ts` の `no-case-declarations` 3件と `OntologyGraph.tsx` の `getCy` dependency warning が残る。Task 2 の変更ではない。
3. 現在の `content/ja/catalogue` には schema のみで実際の localized entry がないため、consumer regression は synthetic overlay fixture で検証した。overlay compiler の実データ生成自体は `npm run catalogue:build` で 71 entries 成功。

## Fix round 1/5

### Review finding 1: DataSources の bound entity 表示

- covering test: `src/components/DataSourcesModal.test.tsx`
- RED command:

  ```text
  PATH=/home/kenji/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin:$PATH npm test -- src/components/DataSourcesModal.test.tsx --run
  ```

  実装前は `Test Files 1 failed (1)` / `Tests 2 failed (2)`。overlay fixture の `顧客、注文` と fallback fixture の `Customer、Order` を見つけられず、consumer に残った固定 `Customer、Order、Product` が原因だった。

- implementation: `dataBindings[].entityTypeId` を `currentOntology.entityTypes` へ解決し、解決できた entity のみ `getDisplayName()` で順序どおり join して demo binding notice に表示。unknown entityTypeId は表示しない。
- GREEN command:

  ```text
  PATH=/home/kenji/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin:$PATH npm test -- src/components/DataSourcesModal.test.tsx src/components/InspectorPanel.test.tsx --run
  ```

  `Test Files 2 passed (2)` / `Tests 5 passed (5)`。

### Review finding 2: Inspector property quest の実証不足

- covering test: `src/components/InspectorPanel.test.tsx`
- test hardening: localized `氏名`（internal name `name`）を表示する ontology を load し、generated `quest-4` を `startQuest()` して entity step を進め、active property step が `targetId: 'name'` であることを確認してから `氏名` の実際の property row を click。click 後の `currentStepIndex === 2` と selected entity の内部 ID を assert する。
- RED note: この finding はテスト不足のみで、既存 `InspectorPanel.tsx` は以前から `tryAdvancePropertyQuestStep(prop.name)` と内部 property name を使用していた。そのため production behavior を変更せず、強化テストは追加直後から `Test Files 1 passed (1)` / `Tests 3 passed (3)` となった。誤った mock/実装を通すテストではないことを、表示された `氏名` の row click と active quest target assertion で確認した。
- GREEN command:

  ```text
  PATH=/home/kenji/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin:$PATH npm test -- src/components/InspectorPanel.test.tsx --run
  ```

  `Test Files 1 passed (1)` / `Tests 3 passed (3)`。

### Fix round verification

- `PATH=/home/kenji/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin:$PATH npm test -- src/components/DataSourcesModal.test.tsx src/components/InspectorPanel.test.tsx --run`: 2 files / 5 tests passed。
- `git diff --check`: clean。
- fix round changed paths: `src/components/DataSourcesModal.tsx`, `src/components/DataSourcesModal.test.tsx`, `src/components/InspectorPanel.test.tsx`, this report。
