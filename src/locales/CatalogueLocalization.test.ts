import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { compileCatalogue } from '../../scripts/compile-catalogue';
import { OntologyGraph } from '../components/OntologyGraph';
import { InspectorPanel } from '../components/InspectorPanel';
import { SearchFilter } from '../components/SearchFilter';
import { useAppStore } from '../store/appStore';
import type { Ontology } from '../data/ontology';
import { convertToFabricParts } from '../lib/fabric';
import { getDisplayDescription, getDisplayName } from '../lib/displayText';
import { processQuery } from '../data/queryEngine';
import { generateQuestsForOntology } from '../data/questGenerator';
import { parseRDF } from '../lib/rdf/parser';
import { serializeToRDF } from '../lib/rdf/serializer';
import type { CatalogueEntry } from '../types/catalogue';
import type { CatalogueLocalizationOverlay } from '../types/catalogueLocalization';

const tempRoots: string[] = [];
const originalCanvasGetContext = HTMLCanvasElement.prototype.getContext;

function installCanvasContextForCytoscape(): void {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: function getContext() {
      const context = {
        canvas: this,
        measureText: () => ({ width: 0 }),
        createLinearGradient: () => ({ addColorStop: () => undefined }),
        createRadialGradient: () => ({ addColorStop: () => undefined }),
        getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
      };
      return new Proxy(context, {
        get(target, property: string | symbol) {
          if (property in target) {
            return Reflect.get(target, property);
          }
          return () => undefined;
        },
      });
    },
  });
}

const quietLogger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

const REPOSITORY_ROOT = join(import.meta.dirname, '../..');
const COSMIC_COFFEE_ENTRIES = [
  'cosmic-coffee-step-1',
  'cosmic-coffee-step-2',
  'cosmic-coffee-step-3',
  'cosmic-coffee',
] as const;
const ECOMMERCE_ENTRIES = [
  'ecommerce-step-1',
  'ecommerce-step-2',
  'ecommerce-step-3',
  'ecommerce',
] as const;
const JAPANESE_DISPLAY_TEXT_RE = /[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/u;

function stripDisplayFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripDisplayFields);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('display'))
        .map(([key, nested]) => [key, stripDisplayFields(nested)]),
    );
  }
  return value;
}

function normalizedInternalValue(value: unknown): unknown {
  return JSON.parse(JSON.stringify(stripDisplayFields(value)));
}

function expectJapaneseDisplayText(value: string, path: string): void {
  expect(value, path).toMatch(JAPANESE_DISPLAY_TEXT_RE);
}

function expectLocalizedEntry(entry: CatalogueEntry, path: string): void {
  expect(entry.displayName, `${path}.displayName`).toBeDefined();
  expect(entry.displayDescription, `${path}.displayDescription`).toBeDefined();
  expect(entry.displayTags, `${path}.displayTags`).toHaveLength(entry.tags.length);
  expectJapaneseDisplayText(entry.displayName!, `${path}.displayName`);
  expectJapaneseDisplayText(entry.displayDescription!, `${path}.displayDescription`);
  entry.displayTags!.forEach((displayTag, index) => {
    expectJapaneseDisplayText(displayTag, `${path}.displayTags[${index}]`);
  });

  const ontology = entry.ontology;
  const propertyCount = ontology.entityTypes.reduce(
    (count, entity) => count + entity.properties.length,
    0,
  );
  const relationshipAttributeCount = ontology.relationships.reduce(
    (count, relationship) => count + (relationship.attributes?.length ?? 0),
    0,
  );
  const enumValueCount = ontology.entityTypes.reduce(
    (count, entity) =>
      count +
      entity.properties.reduce(
        (propertyCountForEntity, property) =>
          propertyCountForEntity + (property.values?.length ?? 0),
        0,
      ),
    0,
  );

  expect(ontology.displayName, `${path}.ontology.displayName`).toBeDefined();
  expect(ontology.displayDescription, `${path}.ontology.displayDescription`).toBeDefined();
  expect(ontology.entityTypes.every((entity) => entity.displayName !== undefined)).toBe(true);
  expect(propertyCount).toBe(
    ontology.entityTypes.flatMap((entity) => entity.properties).length,
  );
  expect(relationshipAttributeCount).toBe(
    ontology.relationships.flatMap((relationship) => relationship.attributes ?? []).length,
  );
  expect(enumValueCount).toBe(
    ontology.entityTypes.flatMap((entity) =>
      entity.properties.flatMap((property) => property.values ?? []),
    ).length,
  );

  expectJapaneseDisplayText(ontology.displayName!, `${path}.ontology.displayName`);
  expectJapaneseDisplayText(ontology.displayDescription!, `${path}.ontology.displayDescription`);
  ontology.entityTypes.forEach((entity, entityIndex) => {
    expectJapaneseDisplayText(
      entity.displayName!,
      `${path}.ontology.entities[${entityIndex}].displayName`,
    );
    if (entity.description.trim().length > 0) {
      expect(entity.displayDescription).toBeDefined();
      expectJapaneseDisplayText(
        entity.displayDescription!,
        `${path}.ontology.entities[${entityIndex}].displayDescription`,
      );
    }
    entity.properties.forEach((property, propertyIndex) => {
      expect(property.displayName).toBeDefined();
      expectJapaneseDisplayText(
        property.displayName!,
        `${path}.ontology.entities[${entityIndex}].properties[${propertyIndex}].displayName`,
      );
      if (property.description?.trim()) {
        expect(property.displayDescription).toBeDefined();
        expectJapaneseDisplayText(
          property.displayDescription!,
          `${path}.ontology.entities[${entityIndex}].properties[${propertyIndex}].displayDescription`,
        );
      }
      if (property.values) {
        expect(Object.keys(property.displayValues ?? {})).toEqual(property.values);
        property.values.forEach((value) => {
          expectJapaneseDisplayText(
            property.displayValues![value],
            `${path}.ontology.entities[${entityIndex}].properties.${property.name}.values.${value}`,
          );
        });
      }
    });
  });
  ontology.relationships.forEach((relationship, relationshipIndex) => {
    expectJapaneseDisplayText(
      relationship.displayName!,
      `${path}.ontology.relationships[${relationshipIndex}].displayName`,
    );
    if (relationship.description?.trim()) {
      expect(relationship.displayDescription).toBeDefined();
      expectJapaneseDisplayText(
        relationship.displayDescription!,
        `${path}.ontology.relationships[${relationshipIndex}].displayDescription`,
      );
    }
    relationship.attributes?.forEach((attribute, attributeIndex) => {
      expectJapaneseDisplayText(
        attribute.displayName!,
        `${path}.ontology.relationships[${relationshipIndex}].attributes[${attributeIndex}]`,
      );
    });
  });
}

const fixtureOntology: Ontology = {
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
};

const fixtureBindings = [
  {
    entityTypeId: 'customer',
    source: 'Lakehouse',
    table: 'dbo.Customer',
    columnMappings: { status: 'customer_status' },
  },
];

function makeOverlay(): CatalogueLocalizationOverlay {
  return {
    version: 1,
    entry: {
      displayName: 'サンプル項目',
      displayDescription: 'カタログで使用するサンプル項目です。',
      displayTags: [{ tag: 'demo', displayName: 'デモ' }],
    },
    ontology: {
      displayName: 'サンプルオントロジー',
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
      {
        entityId: 'customer',
        propertyName: 'status',
        value: 'Paused',
        displayValue: '一時停止',
      },
    ],
  };
}

function createFixture(
  mutateOverlay?: (overlay: CatalogueLocalizationOverlay) => void,
): string {
  const root = mkdtempSync(join(tmpdir(), 'ontology-catalogue-localization-qa-'));
  tempRoots.push(root);

  for (const slug of ['example', 'plain']) {
    const entryDir = join(root, 'catalogue', 'official', slug);
    mkdirSync(entryDir, { recursive: true });
    writeFileSync(
      join(entryDir, `${slug}.rdf`),
      serializeToRDF(fixtureOntology, fixtureBindings),
      'utf8',
    );
    writeFileSync(
      join(entryDir, 'metadata.json'),
      JSON.stringify({
        name: slug === 'example' ? 'Example catalogue entry' : 'Plain catalogue entry',
        description: 'An example entry used by the catalogue.',
        category: 'general',
        tags: slug === 'example' ? ['demo'] : ['plain'],
        author: 'Example Author',
      }),
      'utf8',
    );
  }

  const overlayDir = join(root, 'content', 'ja', 'catalogue', 'official');
  mkdirSync(overlayDir, { recursive: true });
  const overlay = makeOverlay();
  mutateOverlay?.(overlay);
  writeFileSync(join(overlayDir, 'example.json'), JSON.stringify(overlay), 'utf8');

  return root;
}

function compileFixture(
  mutateOverlay?: (overlay: CatalogueLocalizationOverlay) => void,
) {
  return compileCatalogue({ rootDir: createFixture(mutateOverlay), logger: quietLogger });
}

describe('catalogue localization integration', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
    installCanvasContextForCytoscape();
    HTMLElement.prototype.scrollIntoView = () => undefined;
    window.scrollTo = () => undefined;
  });

  afterEach(() => {
    cleanup();
    useAppStore.getState().resetToDefault();
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: originalCanvasGetContext,
    });
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('localizes every Cosmic Coffee entry while preserving source keys and internal values', () => {
    const catalogue = compileCatalogue({ rootDir: REPOSITORY_ROOT, logger: quietLogger });

    for (const slug of COSMIC_COFFEE_ENTRIES) {
      const entry = catalogue.entries.find((candidate) => candidate.id === `official/${slug}`);
      expect(entry, `official/${slug}`).toBeDefined();
      expectLocalizedEntry(entry!, `official/${slug}`);

      const metadata = JSON.parse(
        readFileSync(join(REPOSITORY_ROOT, 'catalogue', 'official', slug, 'metadata.json'), 'utf8'),
      ) as {
        name: string;
        description: string;
        icon?: string;
        category: string;
        tags?: string[];
        author?: string;
      };
      const { ontology, bindings } = parseRDF(
        readFileSync(join(REPOSITORY_ROOT, 'catalogue', 'official', slug, `${slug}.rdf`), 'utf8'),
      );
      const sourceEntry = {
        id: `official/${slug}`,
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        category: metadata.category,
        tags: metadata.tags ?? [],
        author: metadata.author ?? 'unknown',
        source: 'official' as const,
        ontology,
        bindings,
      };
      expect(normalizedInternalValue(entry)).toEqual(normalizedInternalValue(sourceEntry));
    }
  });

  it('localizes every E-commerce entry while preserving source keys and internal values', () => {
    const catalogue = compileCatalogue({ rootDir: REPOSITORY_ROOT, logger: quietLogger });

    for (const slug of ECOMMERCE_ENTRIES) {
      const entry = catalogue.entries.find((candidate) => candidate.id === `official/${slug}`);
      expect(entry, `official/${slug}`).toBeDefined();
      expectLocalizedEntry(entry!, `official/${slug}`);

      const metadata = JSON.parse(
        readFileSync(join(REPOSITORY_ROOT, 'catalogue', 'official', slug, 'metadata.json'), 'utf8'),
      ) as {
        name: string;
        description: string;
        icon?: string;
        category: string;
        tags?: string[];
        author?: string;
      };
      const { ontology, bindings } = parseRDF(
        readFileSync(join(REPOSITORY_ROOT, 'catalogue', 'official', slug, `${slug}.rdf`), 'utf8'),
      );
      const sourceEntry = {
        id: `official/${slug}`,
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        category: metadata.category,
        tags: metadata.tags ?? [],
        author: metadata.author ?? 'unknown',
        source: 'official' as const,
        ontology,
        bindings,
      };
      expect(normalizedInternalValue(entry)).toEqual(normalizedInternalValue(sourceEntry));
    }
  });

  it('carries compiler overlays into the UI object and keeps overlayless entries on internal text', () => {
    const catalogue = compileFixture();
    const localized = catalogue.entries.find((entry) => entry.id === 'official/example');
    const plain = catalogue.entries.find((entry) => entry.id === 'official/plain');

    expect(localized).toBeDefined();
    expect(plain).toBeDefined();
    expect(getDisplayName(localized)).toBe('サンプル項目');
    expect(getDisplayDescription(localized)).toBe('カタログで使用するサンプル項目です。');
    expect(getDisplayName(localized?.ontology)).toBe('サンプルオントロジー');
    expect(getDisplayName(localized?.ontology.entityTypes[0])).toBe('顧客');
    expect(getDisplayName(localized?.ontology.entityTypes[0].properties[0])).toBe('状態');
    expect(localized?.ontology.entityTypes[0].properties[0].displayValues).toEqual({
      Active: '有効',
      Paused: '一時停止',
    });
    expect(getDisplayName(localized?.ontology.relationships[0])).toBe('口座を持つ');
    expect(getDisplayName(localized?.ontology.relationships[0].attributes?.[0])).toBe('優先度');

    expect(getDisplayName(plain)).toBe('Plain catalogue entry');
    expect(plain).not.toHaveProperty('displayName');
    expect(plain?.ontology.entityTypes[0]).not.toHaveProperty('displayName');
  });

  it('renders compiler-produced display names in graph, inspector, and search while selecting by stable IDs', async () => {
    const catalogue = compileFixture();
    const localized = catalogue.entries.find((entry) => entry.id === 'official/example');
    expect(localized).toBeDefined();

    useAppStore.getState().loadOntology(localized!.ontology, localized!.bindings);

    render(createElement(OntologyGraph));
    await waitFor(() => expect(window.__ONTOLOGY_PREVIEW_CY__).toBeDefined());
    const graph = window.__ONTOLOGY_PREVIEW_CY__!;
    expect(graph.getElementById('customer').data('label')).toBe('👤 顧客');
    expect(graph.getElementById('customer_has_account').data('label')).toBe('口座を持つ');
    expect(graph.getElementById('customer').id()).toBe('customer');

    cleanup();
    useAppStore.getState().selectEntity('customer');
    render(createElement(InspectorPanel));
    expect(screen.getByText('顧客')).toBeTruthy();
    expect(screen.getByText('顧客を表します。')).toBeTruthy();
    expect(screen.getAllByText('状態')).toHaveLength(2);
    expect(screen.queryByText('顧客ステータス')).toBeNull();

    cleanup();
    useAppStore.getState().selectEntity(null);
    const user = userEvent.setup();
    render(createElement(SearchFilter));
    const input = screen.getByPlaceholderText('エンティティやプロパティを検索…');
    await user.type(input, '顧客');
    expect(screen.getByText('顧客')).toBeTruthy();
    fireEvent.click(screen.getByText('顧客'));
    expect(useAppStore.getState().selectedEntityId).toBe('customer');
  });

  it('keeps query, quest, graph export, and data binding boundaries on internal identifiers', () => {
    const catalogue = compileFixture();
    const localized = catalogue.entries.find((entry) => entry.id === 'official/example');
    expect(localized).toBeDefined();
    const ontology = localized!.ontology;

    const query = processQuery('顧客とは何ですか？', ontology);
    expect(query.result).toContain('顧客');
    expect(query.highlightEntities).toEqual(['customer']);

    const quests = generateQuestsForOntology(ontology);
    expect(quests[0].steps[0]).toMatchObject({ targetType: 'entity', targetId: 'customer' });
    expect(quests[0].steps[0].instruction).toContain('顧客');

    const rdf = serializeToRDF(ontology, localized!.bindings);
    expect(rdf).toContain('Customer');
    expect(rdf).toContain('customer_has_account');
    expect(rdf).not.toContain('顧客');
    expect(rdf).not.toContain('口座を持つ');

    const { definition } = convertToFabricParts(ontology);
    const fabricPayload = definition.parts
      .map((part) => Buffer.from(part.payload, 'base64').toString('utf8'))
      .join('\n');
    expect(fabricPayload).toContain('Customer');
    expect(fabricPayload).toContain('has_account');
    expect(fabricPayload).not.toContain('顧客');
    expect(fabricPayload).not.toContain('口座を持つ');

    useAppStore.getState().loadOntology(ontology, localized!.bindings);
    const exported = JSON.parse(useAppStore.getState().exportOntology()) as {
      ontology: Ontology;
      bindings: typeof fixtureBindings;
    };
    expect(exported.ontology.entityTypes.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 'customer', name: 'Customer' },
      { id: 'account', name: 'Account' },
    ]);
    expect(exported.ontology.relationships[0]).toMatchObject({
      id: 'customer_has_account',
      name: 'has_account',
      from: 'customer',
      to: 'account',
    });
    expect(exported.bindings[0].columnMappings).toEqual({ status: 'customer_status' });
  });

  it('fails closed when an overlay attempts to mutate an internal field', () => {
    expect(() =>
      compileFixture((overlay) => {
        (overlay.entities[0] as unknown as Record<string, unknown>).name = '内部名';
      }),
    ).toThrow(/official\/example\.json: entities\[0\]: unknown field "name"/i);
  });

  it('fails closed when overlay coverage omits a source entity', () => {
    expect(() =>
      compileFixture((overlay) => {
        overlay.entities = overlay.entities.slice(1);
      }),
    ).toThrow(/official\/example\.json: entities: missing entity key "customer"/i);
  });

  it('fails the build on semantic duplicate stable keys even when records differ', () => {
    expect(() =>
      compileFixture((overlay) => {
        overlay.entities.push({ ...overlay.entities[0], displayName: '別の顧客' });
      }),
    ).toThrow(/official\/example\.json: entities\[2\]: duplicate entity key "customer"/i);
  });

  it('keeps the fixture contract explicit and reviewable', () => {
    const catalogue = compileFixture();
    const localized = catalogue.entries.find((entry) => entry.id === 'official/example');
    expect(localized).toBeDefined();

    const sourceRdf = readFileSync(
      join(tempRoots[0], 'catalogue', 'official', 'example', 'example.rdf'),
      'utf8',
    );
    expect(sourceRdf).toContain('Customer');
    expect(localized!.id).toBe('official/example');
    expect(localized!.source).toBe('official');
    expect(localized!.bindings[0].entityTypeId).toBe('customer');
  });
});
