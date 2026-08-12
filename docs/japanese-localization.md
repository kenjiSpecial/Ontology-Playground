# Japanese localization

## Scope

The Japanese edition translates shipped user-visible UI, accessibility text,
quests, generated responses, learning content, and catalogue display metadata.
The catalogue overlay is display-only: it never rewrites RDF/OWL source data,
stable identifiers, bindings, or values used by matching and export.

Per-entry catalogue translations are still tracked as unfinished work in Issues
#27–#33. The overlay schema, compiler validation, display helpers, and consumer
regression coverage are complete and ready for those translations.

## Catalogue overlay source and entry path

The source of truth for an overlay is a JSON file at:

```text
content/ja/catalogue/<source>/<entry>.json
```

The path mirrors the catalogue ID derived from the RDF directory. Examples:

```text
catalogue/official/cosmic-coffee/            → content/ja/catalogue/official/cosmic-coffee.json
catalogue/community/alice/retail/            → content/ja/catalogue/community/alice/retail.json
catalogue/external/fibo/loans/               → content/ja/catalogue/external/fibo/loans.json
```

`schema.json` in `content/ja/catalogue/` is documentation/schema metadata and
is skipped by the compiler. The overlay file itself does not contain a mutable
catalogue ID; the compiler derives it from the relative path and rejects an
unknown path.

Start from this shape and fill every source key:

```json
{
  "$schema": "./schema.json",
  "version": 1,
  "entry": {
    "displayName": "日本語のカタログ名",
    "displayDescription": "日本語のカタログ説明。",
    "displayTags": [
      { "tag": "source-tag", "displayName": "日本語のタグ" }
    ]
  },
  "ontology": {
    "displayName": "日本語のオントロジー名",
    "displayDescription": "日本語のオントロジー説明。"
  },
  "entities": [
    { "id": "stable-entity-id", "displayName": "日本語のエンティティ名" }
  ],
  "properties": [
    {
      "entityId": "stable-entity-id",
      "propertyName": "internalPropertyName",
      "displayName": "日本語のプロパティ名"
    }
  ],
  "relationships": [
    { "id": "stable-relationship-id", "displayName": "日本語の関係名" }
  ],
  "relationshipAttributes": [
    {
      "relationshipId": "stable-relationship-id",
      "attributeName": "internalAttributeName",
      "displayName": "日本語の属性名"
    }
  ],
  "enumValues": [
    {
      "entityId": "stable-entity-id",
      "propertyName": "internalPropertyName",
      "value": "InternalEnumValue",
      "displayValue": "日本語の表示値"
    }
  ]
}
```

## Stable keys and complete coverage

Stable keys are copied exactly from the catalogue source. They are lookup keys,
not translation targets.

| Overlay collection | Stable key(s) | Coverage rule |
|---|---|---|
| `entry.displayTags` | `tag` | Every metadata tag exactly once |
| `entities` | `id` | Every entity ID exactly once |
| `properties` | `entityId` + `propertyName` | Every entity/property pair exactly once |
| `relationships` | `id` | Every relationship ID exactly once |
| `relationshipAttributes` | `relationshipId` + `attributeName` | Every relationship-attribute pair exactly once |
| `enumValues` | `entityId` + `propertyName` + `value` | Every enum value exactly once |

The parser rejects missing keys, unknown keys, duplicate semantic keys, and
duplicate JSON object fields. Arrays may be ordered differently, because the
compiler applies entries back in source order using their stable keys.

`entry.displayName` and `entry.displayDescription` are required. The ontology
display fields are optional only when the corresponding source field is empty;
when the source ontology name or description has prose, its display field is
required. Entity, property, and relationship descriptions follow the same
rule: translate a non-empty source description and omit the display description
when the source has none. Empty source collections must use empty overlay arrays.

## Fields that must not be translated or changed

Do not copy or invent source fields in an overlay. In particular, never replace
or translate:

- RDF/OWL URIs, namespace prefixes, routes, slugs, filenames, JSON keys, or
  catalogue paths;
- entity/property/relationship IDs, internal `name` values, relationship
  endpoints (`from`/`to`), cardinality, property types, units, or raw enum
  `value` strings;
- binding `entityTypeId`, source/table/column names, author names, licenses,
  trademarks, imported text, or user-entered text.

The overlay schema permits only the `display*` fields plus the stable key fields
listed above. Fields such as `name`, `description`, `from`, `to`, `type`, and
`value` are forbidden inside localized records; unknown fields fail closed.
JSON duplicate fields, symlinks in the overlay tree, malformed JSON, and an
overlay path with no catalogue entry also fail the build.

## Display text and technical tokens

Use a plain JSON string when the display text contains at least one Japanese
character. Do not use an English-only prose string as a translation.

An unchanged technical token is allowed only as an explicit object:

```json
{
  "text": "RDF",
  "technicalTokenReason": "標準規格の略称であるため原文を維持します。"
}
```

The validator enforces all of these boundaries:

- `text` is one non-empty token of at most 40 characters;
- `text` contains no Japanese characters, whitespace, or punctuation outside
  letters, numbers, `. _ : / + # % ( ) -`, and contains at least one letter or
  number;
- `technicalTokenReason` is non-empty Japanese prose and names a reason
  category: `略称`, `識別子`, `規格`, `標準`, `コード`, `固有名`, `製品名`,
  `クラス名`, `URI`, `QName`, `分類記号`, or `単位`.

Use the shortest applicable category. A technical token is not a way to retain
an untranslated sentence or a label that could be translated naturally.

## Compiler and internal-value boundary

`npm run catalogue:build` parses and validates the RDF entry first, performs its
RDF round-trip check, then loads matching overlays from `content/ja/catalogue/`.
Any validation error aborts compilation instead of producing a partially
localized catalogue. An entry without an overlay remains unchanged.

On success, the compiler adds display-only fields (`displayName`,
`displayDescription`, `displayTags`, and nested display values) beside the
original fields. `getDisplayName`, `getDisplayDescription`, and
`getDisplayValue` use these fields only for user-facing rendering. Search and
natural-language query accept both display and internal text, while selection,
quest targets, relationship endpoints, property matching, data bindings, RDF,
Fabric, and JSON export continue to use the original internal identifiers and
values.

## Authoring and verification procedure

1. Inspect the source RDF and `metadata.json`; copy every stable key exactly.
2. Create the matching path under `content/ja/catalogue/` and fill the complete
   overlay, including every description and enum value required by coverage.
3. Run the compiler and Japanese QA:

   ```bash
   npm run catalogue:build
   npm run qa:ja
   npm test
   npm run build
   ```

4. Review the generated entry for Japanese display fields and verify that IDs,
   names, endpoints, bindings, and raw values are unchanged.
5. Do not commit generated `public/catalogue.json` or `public/learn.json`.

## Preserved values and general terminology

RDF/OWL URIs, internal IDs, JSON keys, routes, slugs, filenames, syntax
keywords, author names, licenses, trademarks, and imported or user-entered text
remain unchanged.

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

Use concise です・ます prose for explanations and short noun or verb labels
for controls. Keep product, protocol, library, and specification names in
their established form when translation would reduce clarity.

Reusable UI text belongs in `src/locales/ja.ts`; imported RDF/OWL and
user-entered values stay on the non-localized data path.
