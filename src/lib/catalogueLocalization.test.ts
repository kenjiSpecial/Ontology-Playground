import { describe, expect, it } from 'vitest';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { CatalogueEntry } from '../types/catalogue';
import type { CatalogueLocalizationOverlay } from '../types/catalogueLocalization';
import {
  applyCatalogueLocalization,
  CatalogueLocalizationError,
  parseCatalogueLocalization,
} from './catalogueLocalization';

function makeEntry(): CatalogueEntry {
  return {
    id: 'official/example',
    name: 'Example catalogue entry',
    description: 'An example entry used by the catalogue.',
    category: 'general',
    tags: ['demo', 'RDF'],
    author: 'Example Author',
    source: 'official',
    ontology: {
      name: 'Example Ontology',
      description: 'Models customers and accounts.',
      entityTypes: [
        {
          id: 'customer',
          name: 'Customer',
          description: 'A customer.',
          icon: '👤',
          color: '#0078D4',
          properties: [
            {
              name: 'status',
              type: 'enum',
              values: ['Active', 'Paused'],
              description: 'Current status.',
            },
          ],
        },
        {
          id: 'account',
          name: 'Account',
          description: '',
          icon: '📦',
          color: '#107C10',
          properties: [],
        },
      ],
      relationships: [
        {
          id: 'customer_has_account',
          name: 'has_account',
          from: 'customer',
          to: 'account',
          cardinality: 'one-to-many',
          description: 'Connects a customer to an account.',
          attributes: [{ name: 'priority', type: 'integer' }],
        },
      ],
    },
    bindings: [
      {
        entityTypeId: 'customer',
        source: 'Lakehouse',
        table: 'dbo.Customer',
        columnMappings: { status: 'customer_status' },
      },
    ],
  };
}

function makeOverlay(): CatalogueLocalizationOverlay {
  return {
    version: 1,
    entry: {
      displayName: 'サンプル カタログ項目',
      displayDescription: 'カタログで使用するサンプル項目です。',
      displayTags: [
        { tag: 'demo', displayName: 'デモ' },
        {
          tag: 'RDF',
          displayName: {
            text: 'RDF',
            technicalTokenReason: '標準規格の略称であるため原文を維持します。',
          },
        },
      ],
    },
    ontology: {
      displayName: 'サンプル オントロジー',
      displayDescription: '顧客と口座をモデル化します。',
    },
    entities: [
      {
        id: 'customer',
        displayName: '顧客',
        displayDescription: '顧客を表します。',
      },
      { id: 'account', displayName: '口座' },
    ],
    properties: [
      {
        entityId: 'customer',
        propertyName: 'status',
        displayName: '状態',
        displayDescription: '現在の状態です。',
      },
    ],
    relationships: [
      {
        id: 'customer_has_account',
        displayName: '口座を持つ',
        displayDescription: '顧客を口座へ接続します。',
      },
    ],
    relationshipAttributes: [
      {
        relationshipId: 'customer_has_account',
        attributeName: 'priority',
        displayName: '優先度',
      },
    ],
    enumValues: [
      {
        entityId: 'customer',
        propertyName: 'status',
        value: 'Active',
        displayValue: '有効',
      },
      {
        entityId: 'customer',
        propertyName: 'status',
        value: 'Paused',
        displayValue: '一時停止',
      },
    ],
  };
}

function parse(overlay: unknown): CatalogueLocalizationOverlay {
  return parseCatalogueLocalization(
    JSON.stringify(overlay),
    makeEntry(),
    'content/ja/catalogue/official/example.json',
  );
}

function validateWithSchema(overlay: unknown): boolean {
  const schema = JSON.parse(
    readFileSync(
      join(process.cwd(), 'content', 'ja', 'catalogue', 'schema.json'),
      'utf8',
    ),
  ) as object;
  const ajv = new Ajv({ allErrors: true, schemaId: 'auto' });
  return Boolean(ajv.compile(schema)(overlay));
}

describe('parseCatalogueLocalization', () => {
  it('accepts an exact Japanese overlay and an explicitly justified technical token', () => {
    expect(parse(makeOverlay())).toEqual(makeOverlay());
  });

  it('rejects duplicate JSON object fields before JSON.parse can discard them', () => {
    const json = JSON.stringify(makeOverlay()).replace(
      '"version":1',
      '"version":1,"version":1',
    );

    expect(() =>
      parseCatalogueLocalization(json, makeEntry(), 'duplicate.json'),
    ).toThrow(/duplicate JSON field "version"/i);
  });

  it('reports malformed JSON as a localization validation error', () => {
    const parseMalformed = (): CatalogueLocalizationOverlay =>
      parseCatalogueLocalization(
        '{"version":"\\uZZZZ"}',
        makeEntry(),
        'malformed.json',
      );

    expect(parseMalformed).toThrow(CatalogueLocalizationError);
    expect(parseMalformed).toThrow(/malformed\.json: invalid JSON/i);
  });

  it('rejects unknown and forbidden fields at every overlay level', () => {
    const overlay = makeOverlay() as CatalogueLocalizationOverlay & {
      source?: string;
    };
    overlay.source = 'community';

    expect(() => parse(overlay)).toThrow(/unknown field "source"/i);

    delete overlay.source;
    const entity = overlay.entities[0] as (typeof overlay.entities)[number] & {
      name?: string;
    };
    entity.name = 'Customer';

    expect(() => parse(overlay)).toThrow(/entities\[0\].*unknown field "name"/i);
  });

  it('rejects invalid field types', () => {
    const overlay = makeOverlay() as unknown as {
      version: number;
      entry: { displayName: unknown };
    };
    overlay.entry.displayName = 42;

    expect(() => parse(overlay)).toThrow(/entry\.displayName.*string or technical token/i);
  });

  it('rejects untranslated display prose', () => {
    const overlay = makeOverlay();
    overlay.entities[0].displayName = 'Customer';

    expect(() => parse(overlay)).toThrow(/entities\[0\]\.displayName.*Japanese/i);
  });

  it('rejects a technical token without a Japanese reason', () => {
    const overlay = makeOverlay();
    overlay.entry.displayTags[1].displayName = {
      text: 'RDF',
      technicalTokenReason: 'Standard acronym',
    };

    expect(() => parse(overlay)).toThrow(/technicalTokenReason.*Japanese/i);
  });

  it('rejects untranslated prose even when it has a formal-looking reason', () => {
    const overlay = makeOverlay();
    overlay.entry.displayName = {
      text: 'This entire sentence is untranslated',
      technicalTokenReason: '標準規格名として原文を維持します。',
    };

    expect(() => parse(overlay)).toThrow(/entry\.displayName\.text.*single technical token/i);
  });

  it('rejects whitespace anywhere in a technical token', () => {
    for (const text of [' RDF', 'RDF ', 'RDF token', 'RDF\n']) {
      const overlay = makeOverlay();
      overlay.entry.displayName = {
        text,
        technicalTokenReason: '標準規格の略称であるため原文を維持します。',
      };

      expect(() => parse(overlay), JSON.stringify(text)).toThrow(
        /entry\.displayName\.text.*single technical token/i,
      );
    }
  });

  it('rejects a Japanese but ambiguous technical-token reason', () => {
    const overlay = makeOverlay();
    overlay.entry.displayName = {
      text: 'RDF',
      technicalTokenReason: '日本語にしないため原文を維持します。',
    };

    expect(() => parse(overlay)).toThrow(
      /technicalTokenReason.*reason category/i,
    );
  });

  it('accepts compact standard and classification tokens with explicit reason categories', () => {
    const cases = [
      {
        text: 'RDF',
        technicalTokenReason: '標準規格の略称であるため原文を維持します。',
      },
      {
        text: 'NAICS',
        technicalTokenReason: '公式の分類記号であるため原文を維持します。',
      },
      {
        text: 'schema.org',
        technicalTokenReason: '標準URIの固有名であるため原文を維持します。',
      },
    ];

    for (const technicalToken of cases) {
      const overlay = makeOverlay();
      overlay.entry.displayName = technicalToken;
      expect(parse(overlay).entry.displayName).toEqual(technicalToken);
    }
  });

  it('keeps Ajv 6 schema validation compatible with runtime-approved ASCII technical tokens', () => {
    for (const text of ['RDF', 'schema.org']) {
      const overlay = makeOverlay();
      const technicalToken = {
        text,
        technicalTokenReason: '標準規格の略称であるため原文を維持します。',
      };
      overlay.entry.displayName = technicalToken;

      expect(validateWithSchema(overlay), text).toBe(true);
      expect(parse(overlay).entry.displayName).toEqual(technicalToken);
    }
  });

  it('uses Ajv 6 for structural constraints and runtime validation for technical-token semantics', () => {
    const cases = [
      {
        name: 'English sentence',
        text: 'This entire sentence is untranslated',
        schemaValid: false,
      },
      {
        name: 'whitespace',
        text: 'RDF token',
        schemaValid: false,
      },
      {
        name: 'overlength',
        text: 'A'.repeat(41),
        schemaValid: false,
      },
      {
        name: 'Japanese technical token',
        text: 'RDF日本語',
        schemaValid: true,
      },
    ];

    for (const testCase of cases) {
      const overlay = makeOverlay();
      overlay.entry.displayName = {
        text: testCase.text,
        technicalTokenReason: '標準規格の略称であるため原文を維持します。',
      };

      expect(validateWithSchema(overlay), testCase.name).toBe(testCase.schemaValid);
      expect(() => parse(overlay), testCase.name).toThrow();
    }
  });

  it('resolves documented schema references from each overlay path', () => {
    const documentation = readFileSync(
      join(process.cwd(), 'docs', 'japanese-localization.md'),
      'utf8',
    );
    const schemaPath = join(process.cwd(), 'content', 'ja', 'catalogue', 'schema.json');
    const samples = [
      {
        source: 'official',
        overlayPath: join(
          process.cwd(),
          'content',
          'ja',
          'catalogue',
          'official',
          'example.json',
        ),
        schemaReference: '../schema.json',
      },
      {
        source: 'community',
        overlayPath: join(
          process.cwd(),
          'content',
          'ja',
          'catalogue',
          'community',
          'alice',
          'retail.json',
        ),
        schemaReference: '../../schema.json',
      },
      {
        source: 'external',
        overlayPath: join(
          process.cwd(),
          'content',
          'ja',
          'catalogue',
          'external',
          'fibo',
          'loans.json',
        ),
        schemaReference: '../../schema.json',
      },
    ];

    for (const sample of samples) {
      expect(
        resolve(dirname(sample.overlayPath), sample.schemaReference),
        sample.source,
      ).toBe(schemaPath);
    }
    expect(documentation).toContain('"$schema": "../schema.json"');
    expect(documentation).toContain(
      '| `content/ja/catalogue/official/<entry>.json` | `../schema.json` |',
    );
    expect(documentation).toContain(
      '| `content/ja/catalogue/community/<author>/<entry>.json` | `../../schema.json` |',
    );
    expect(documentation).toContain(
      '| `content/ja/catalogue/external/<source>/<entry>.json` | `../../schema.json` |',
    );
  });

  it('treats $schema as opaque tooling metadata while enforcing runtime semantics', () => {
    const overlay = makeOverlay();
    overlay.$schema = 'https://example.invalid/catalogue-schema.json';

    expect(parse(overlay).$schema).toBe(overlay.$schema);

    const invalid = makeOverlay();
    invalid.$schema = 'not-a-resolvable-schema';
    invalid.entry.displayName = 'Customer';

    expect(() => parse(invalid)).toThrow(/entry\.displayName.*Japanese/i);
  });

  it('lets Ajv uniqueItems remain structural while runtime rejects semantic duplicate keys', () => {
    const overlay = makeOverlay();
    overlay.entities.push({ ...overlay.entities[0], displayName: '別の顧客' });

    expect(validateWithSchema(overlay)).toBe(true);
    expect(() => parse(overlay)).toThrow(/duplicate entity key "customer"/i);
  });

  it('rejects duplicate semantic keys', () => {
    const overlay = makeOverlay();
    overlay.properties.push({ ...overlay.properties[0] });

    expect(() => parse(overlay)).toThrow(/duplicate property key "customer\/status"/i);
  });

  it('rejects unknown stable keys', () => {
    const overlay = makeOverlay();
    overlay.entities[0].id = 'unknown';

    expect(() => parse(overlay)).toThrow(/unknown entity key "unknown"/i);
  });

  it('rejects missing coverage for every display-text collection', () => {
    const cases: Array<{
      name: string;
      remove: (overlay: CatalogueLocalizationOverlay) => void;
      message: RegExp;
    }> = [
      {
        name: 'tag',
        remove: (overlay) => overlay.entry.displayTags.pop(),
        message: /missing tag key "RDF"/i,
      },
      {
        name: 'entity',
        remove: (overlay) => overlay.entities.pop(),
        message: /missing entity key "account"/i,
      },
      {
        name: 'property',
        remove: (overlay) => overlay.properties.pop(),
        message: /missing property key "customer\/status"/i,
      },
      {
        name: 'relationship',
        remove: (overlay) => overlay.relationships.pop(),
        message: /missing relationship key "customer_has_account"/i,
      },
      {
        name: 'relationship attribute',
        remove: (overlay) => overlay.relationshipAttributes.pop(),
        message: /missing relationship attribute key "customer_has_account\/priority"/i,
      },
      {
        name: 'enum value',
        remove: (overlay) => overlay.enumValues.pop(),
        message: /missing enum value key "customer\/status\/Paused"/i,
      },
    ];

    for (const testCase of cases) {
      const overlay = makeOverlay();
      testCase.remove(overlay);
      expect(
        () => parse(overlay),
        `expected ${testCase.name} coverage to fail`,
      ).toThrow(testCase.message);
    }
  });

  it('requires descriptions exactly when the source contains display prose', () => {
    const missing = makeOverlay();
    delete missing.properties[0].displayDescription;
    expect(() => parse(missing)).toThrow(
      /properties\[0\]\.displayDescription.*required/i,
    );

    const unexpected = makeOverlay();
    unexpected.entities[1].displayDescription = '追加説明';
    expect(() => parse(unexpected)).toThrow(
      /entities\[1\]\.displayDescription.*must be omitted/i,
    );
  });
});

describe('applyCatalogueLocalization', () => {
  it('keeps display tags aligned with the immutable source tag order', () => {
    const entry = makeEntry();
    const overlay = makeOverlay();
    overlay.entry.displayTags.reverse();

    const localized = applyCatalogueLocalization(entry, parse(overlay));

    expect(localized.tags).toEqual(['demo', 'RDF']);
    expect(localized.displayTags).toEqual(['デモ', 'RDF']);
  });

  it('adds display-only fields without changing identifiers, names, enum values, or bindings', () => {
    const entry = makeEntry();
    const original = structuredClone(entry);
    const overlay = parse(makeOverlay());

    const localized = applyCatalogueLocalization(entry, overlay);

    expect(entry).toEqual(original);
    expect(localized.displayName).toBe('サンプル カタログ項目');
    expect(localized.displayDescription).toBe('カタログで使用するサンプル項目です。');
    expect(localized.displayTags).toEqual(['デモ', 'RDF']);
    expect(localized.ontology.displayName).toBe('サンプル オントロジー');
    expect(localized.ontology.entityTypes[0].displayName).toBe('顧客');
    expect(localized.ontology.entityTypes[0].properties[0].displayName).toBe('状態');
    expect(localized.ontology.entityTypes[0].properties[0].displayValues).toEqual({
      Active: '有効',
      Paused: '一時停止',
    });
    expect(localized.ontology.relationships[0].displayName).toBe('口座を持つ');
    expect(localized.ontology.relationships[0].attributes?.[0].displayName).toBe('優先度');

    expect({ ...localized, displayName: undefined, displayDescription: undefined, displayTags: undefined })
      .toMatchObject({
        id: original.id,
        name: original.name,
        description: original.description,
        category: original.category,
        author: original.author,
        source: original.source,
        bindings: original.bindings,
      });
    expect(localized.ontology.name).toBe(original.ontology.name);
    expect(localized.ontology.entityTypes.map(({ id, name }) => ({ id, name }))).toEqual(
      original.ontology.entityTypes.map(({ id, name }) => ({ id, name })),
    );
    expect(localized.ontology.entityTypes[0].properties[0].values).toEqual(['Active', 'Paused']);
    expect(localized.ontology.relationships[0]).toMatchObject({
      id: 'customer_has_account',
      name: 'has_account',
      from: 'customer',
      to: 'account',
    });
  });
});
