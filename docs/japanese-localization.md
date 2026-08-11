# Japanese localization

## Scope

The Japanese edition translates all shipped user-visible UI, accessibility text,
quests, generated responses, learning content, and catalogue display metadata.

## Preserved values

RDF/OWL URIs, internal IDs, JSON keys, routes, slugs, filenames, syntax keywords,
author names, licenses, trademarks, and imported or user-entered text remain unchanged.

## Terminology

| English | Japanese |
|---|---|
| ontology | オントロジー |
| entity type | エンティティ型 |
| property | プロパティ |
| relationship | リレーションシップ |
| data binding | データ バインディング |
| cardinality | カーディナリティ |
| source / destination | 始点 / 終点 |
| query | クエリ |
| catalogue | カタログ |
| designer | デザイナー |
| learning path | 学習パス |

## Writing style

Use concise です・ます prose for explanations and short noun or verb labels for controls.
Use Japanese punctuation in prose. Keep product, protocol, library, and specification
names in their established form when translation would reduce clarity.

## Source rules

- Put reusable UI text in `src/locales/ja.ts`; do not add new natural-language literals to components.
- Add an English-only exception only for a proper noun or standard name, with a focused catalog path.
- Keep imported RDF/OWL and user-entered values on the non-localized data path.
- Run `npm run qa:ja`, `npm test`, and `npm run build` before every localization PR.
