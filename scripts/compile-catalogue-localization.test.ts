import { afterEach, describe, expect, it } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serializeToRDF } from '../src/lib/rdf/serializer';
import type { Ontology } from '../src/data/ontology';
import type { CatalogueLocalizationOverlay } from '../src/types/catalogueLocalization';
import { compileCatalogue } from './compile-catalogue';

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

const ontology: Ontology = {
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
          values: ['Active'],
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
};

function overlay(): CatalogueLocalizationOverlay {
  return {
    version: 1,
    entry: {
      displayName: 'サンプル項目',
      displayDescription: 'カタログのサンプル項目です。',
      displayTags: [{ tag: 'demo', displayName: 'デモ' }],
    },
    ontology: {
      displayName: 'サンプル オントロジー',
      displayDescription: '顧客と口座をモデル化します。',
    },
    entities: [
      { id: 'customer', displayName: '顧客', displayDescription: '顧客を表します。' },
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
    ],
  };
}

function createFixture(includeOverlay: boolean): string {
  const root = mkdtempSync(join(tmpdir(), 'ontology-catalogue-localization-'));
  tempRoots.push(root);
  const entryDir = join(root, 'catalogue', 'official', 'example');
  mkdirSync(entryDir, { recursive: true });
  writeFileSync(join(entryDir, 'example.rdf'), serializeToRDF(ontology), 'utf8');
  writeFileSync(
    join(entryDir, 'metadata.json'),
    JSON.stringify({
      name: 'Example catalogue entry',
      description: 'An example entry used by the catalogue.',
      category: 'general',
      tags: ['demo'],
      author: 'Example Author',
    }),
    'utf8',
  );

  if (includeOverlay) {
    const overlayDir = join(root, 'content', 'ja', 'catalogue', 'official');
    mkdirSync(overlayDir, { recursive: true });
    writeFileSync(join(overlayDir, 'example.json'), JSON.stringify(overlay()), 'utf8');
  }

  return root;
}

const quietLogger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

describe('compileCatalogue localization integration', () => {
  it('loads an overlay from content/ja/catalogue/<source>/<entry>.json', () => {
    const root = createFixture(true);

    const catalogue = compileCatalogue({ rootDir: root, logger: quietLogger });

    expect(catalogue.count).toBe(1);
    const entry = catalogue.entries[0];
    expect(entry.displayName).toBe('サンプル項目');
    expect(entry.ontology.displayName).toBe('サンプル オントロジー');
    expect(entry.name).toBe('Example catalogue entry');
    expect(entry.ontology.name).toBe('Example Ontology');
    expect(entry.ontology.entityTypes[0]).toMatchObject({
      id: 'customer',
      name: 'Customer',
      displayName: '顧客',
    });
    expect(entry.ontology.entityTypes[0].properties[0]).toMatchObject({
      name: 'status',
      values: ['Active'],
      displayName: '状態',
      displayValues: { Active: '有効' },
    });
    expect(entry.source).toBe('official');
    expect(entry.category).toBe('general');
    expect(entry.author).toBe('Example Author');
  });

  it('leaves an entry without an overlay unchanged', () => {
    const root = createFixture(false);

    const catalogue = compileCatalogue({ rootDir: root, logger: quietLogger });

    expect(catalogue.entries[0]).not.toHaveProperty('displayName');
    expect(catalogue.entries[0].ontology).not.toHaveProperty('displayName');
    expect(catalogue.entries[0].ontology.entityTypes[0]).not.toHaveProperty('displayName');
  });

  it('fails closed when an overlay path does not identify a catalogue entry', () => {
    const root = createFixture(false);
    const overlayDir = join(root, 'content', 'ja', 'catalogue', 'official');
    mkdirSync(overlayDir, { recursive: true });
    writeFileSync(join(overlayDir, 'missing.json'), JSON.stringify(overlay()), 'utf8');

    expect(() => compileCatalogue({ rootDir: root, logger: quietLogger })).toThrow(
      /unknown catalogue entry "official\/missing"/i,
    );
  });

  it('rejects a localization overlay root that is a symbolic link', () => {
    const root = createFixture(false);
    const target = mkdtempSync(join(tmpdir(), 'ontology-catalogue-overlay-target-'));
    tempRoots.push(target);
    mkdirSync(join(root, 'content', 'ja'), { recursive: true });
    symlinkSync(target, join(root, 'content', 'ja', 'catalogue'), 'dir');

    expect(() => compileCatalogue({ rootDir: root, logger: quietLogger })).toThrow(
      /catalogue.*symlinks are not allowed in catalogue localization overlays/i,
    );
  });

  it('rejects a localization overlay root that is not a directory', () => {
    const root = createFixture(false);
    mkdirSync(join(root, 'content', 'ja'), { recursive: true });
    writeFileSync(join(root, 'content', 'ja', 'catalogue'), 'not a directory', 'utf8');

    expect(() => compileCatalogue({ rootDir: root, logger: quietLogger })).toThrow(
      /catalogue.*localization overlay root must be a directory/i,
    );
  });
});
