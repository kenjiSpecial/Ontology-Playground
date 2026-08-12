import type { CatalogueEntry } from '../types/catalogue';
import type {
  CatalogueEntryLocalization,
  CatalogueLocalizationOverlay,
  CatalogueTagLocalization,
  EntityLocalization,
  EnumValueLocalization,
  LocalizedDisplayText,
  OntologyLocalization,
  PropertyLocalization,
  RelationshipAttributeLocalization,
  RelationshipLocalization,
  TechnicalDisplayText,
} from '../types/catalogueLocalization';

const JAPANESE_CHARACTER_RE = /[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/u;
const TECHNICAL_TOKEN_RE = /^(?=.*[\p{L}\p{N}])[\p{L}\p{N}._:/+#%()-]+$/u;
const TECHNICAL_TOKEN_REASON_RE =
  /(?:略称|識別子|規格|標準|コード|固有名|製品名|クラス名|URI|QName|分類記号|単位)/u;

type JsonObject = Record<string, unknown>;

export class CatalogueLocalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogueLocalizationError';
  }
}

function error(filePath: string, path: string, message: string): never {
  throw new CatalogueLocalizationError(`${filePath}: ${path}: ${message}`);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseObject(
  value: unknown,
  path: string,
  allowedFields: readonly string[],
  requiredFields: readonly string[],
  filePath: string,
): JsonObject {
  if (!isObject(value)) {
    error(filePath, path, 'must be an object');
  }

  const allowed = new Set(allowedFields);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      error(filePath, path, `unknown field "${key}"`);
    }
  }
  for (const key of requiredFields) {
    if (!Object.hasOwn(value, key)) {
      error(filePath, path, `missing required field "${key}"`);
    }
  }
  return value;
}

function parseArray(value: unknown, path: string, filePath: string): unknown[] {
  if (!Array.isArray(value)) {
    error(filePath, path, 'must be an array');
  }
  return value;
}

function parseNonEmptyString(value: unknown, path: string, filePath: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    error(filePath, path, 'must be a non-empty string');
  }
  return value;
}

function parseDisplayText(
  value: unknown,
  path: string,
  filePath: string,
): LocalizedDisplayText {
  if (typeof value === 'string') {
    if (value.trim().length === 0) {
      error(filePath, path, 'must be a non-empty string or technical token');
    }
    if (!JAPANESE_CHARACTER_RE.test(value)) {
      error(
        filePath,
        path,
        'must contain Japanese text or use a justified technical token object',
      );
    }
    return value;
  }

  if (!isObject(value)) {
    error(filePath, path, 'must be a string or technical token object');
  }
  const token = parseObject(
    value,
    path,
    ['text', 'technicalTokenReason'],
    ['text', 'technicalTokenReason'],
    filePath,
  );
  const text = parseNonEmptyString(token.text, `${path}.text`, filePath);
  const technicalTokenReason = parseNonEmptyString(
    token.technicalTokenReason,
    `${path}.technicalTokenReason`,
    filePath,
  );
  if (JAPANESE_CHARACTER_RE.test(text)) {
    error(filePath, `${path}.text`, 'Japanese display text must use the plain string form');
  }
  if (
    text !== text.trim() ||
    [...text].length > 40 ||
    !TECHNICAL_TOKEN_RE.test(text)
  ) {
    error(
      filePath,
      `${path}.text`,
      'must be a single technical token of at most 40 characters using letters, numbers, or ._:/+#%()-',
    );
  }
  if (!JAPANESE_CHARACTER_RE.test(technicalTokenReason)) {
    error(filePath, `${path}.technicalTokenReason`, 'must contain a Japanese reason');
  }
  if (!TECHNICAL_TOKEN_REASON_RE.test(technicalTokenReason)) {
    error(
      filePath,
      `${path}.technicalTokenReason`,
      'must state a reason category such as 略称, 識別子, 規格, 標準, コード, 固有名, 製品名, クラス名, URI, QName, 分類記号, or 単位',
    );
  }
  return { text, technicalTokenReason } satisfies TechnicalDisplayText;
}

function parseEntry(value: unknown, filePath: string): CatalogueEntryLocalization {
  const path = 'entry';
  const object = parseObject(
    value,
    path,
    ['displayName', 'displayDescription', 'displayTags'],
    ['displayName', 'displayDescription', 'displayTags'],
    filePath,
  );
  const displayTags: CatalogueTagLocalization[] = parseArray(
    object.displayTags,
    `${path}.displayTags`,
    filePath,
  ).map((item, index) => {
    const itemPath = `${path}.displayTags[${index}]`;
    const tag = parseObject(
      item,
      itemPath,
      ['tag', 'displayName'],
      ['tag', 'displayName'],
      filePath,
    );
    return {
      tag: parseNonEmptyString(tag.tag, `${itemPath}.tag`, filePath),
      displayName: parseDisplayText(tag.displayName, `${itemPath}.displayName`, filePath),
    };
  });

  return {
    displayName: parseDisplayText(object.displayName, `${path}.displayName`, filePath),
    displayDescription: parseDisplayText(
      object.displayDescription,
      `${path}.displayDescription`,
      filePath,
    ),
    displayTags,
  };
}

function parseOntology(value: unknown, filePath: string): OntologyLocalization {
  const path = 'ontology';
  const object = parseObject(
    value,
    path,
    ['displayName', 'displayDescription'],
    [],
    filePath,
  );
  return {
    ...(Object.hasOwn(object, 'displayName')
      ? { displayName: parseDisplayText(object.displayName, `${path}.displayName`, filePath) }
      : {}),
    ...(Object.hasOwn(object, 'displayDescription')
      ? {
          displayDescription: parseDisplayText(
            object.displayDescription,
            `${path}.displayDescription`,
            filePath,
          ),
        }
      : {}),
  };
}

function parseEntities(value: unknown, filePath: string): EntityLocalization[] {
  return parseArray(value, 'entities', filePath).map((item, index) => {
    const path = `entities[${index}]`;
    const object = parseObject(
      item,
      path,
      ['id', 'displayName', 'displayDescription'],
      ['id', 'displayName'],
      filePath,
    );
    return {
      id: parseNonEmptyString(object.id, `${path}.id`, filePath),
      displayName: parseDisplayText(object.displayName, `${path}.displayName`, filePath),
      ...(Object.hasOwn(object, 'displayDescription')
        ? {
            displayDescription: parseDisplayText(
              object.displayDescription,
              `${path}.displayDescription`,
              filePath,
            ),
          }
        : {}),
    };
  });
}

function parseProperties(value: unknown, filePath: string): PropertyLocalization[] {
  return parseArray(value, 'properties', filePath).map((item, index) => {
    const path = `properties[${index}]`;
    const object = parseObject(
      item,
      path,
      ['entityId', 'propertyName', 'displayName', 'displayDescription'],
      ['entityId', 'propertyName', 'displayName'],
      filePath,
    );
    return {
      entityId: parseNonEmptyString(object.entityId, `${path}.entityId`, filePath),
      propertyName: parseNonEmptyString(object.propertyName, `${path}.propertyName`, filePath),
      displayName: parseDisplayText(object.displayName, `${path}.displayName`, filePath),
      ...(Object.hasOwn(object, 'displayDescription')
        ? {
            displayDescription: parseDisplayText(
              object.displayDescription,
              `${path}.displayDescription`,
              filePath,
            ),
          }
        : {}),
    };
  });
}

function parseRelationships(value: unknown, filePath: string): RelationshipLocalization[] {
  return parseArray(value, 'relationships', filePath).map((item, index) => {
    const path = `relationships[${index}]`;
    const object = parseObject(
      item,
      path,
      ['id', 'displayName', 'displayDescription'],
      ['id', 'displayName'],
      filePath,
    );
    return {
      id: parseNonEmptyString(object.id, `${path}.id`, filePath),
      displayName: parseDisplayText(object.displayName, `${path}.displayName`, filePath),
      ...(Object.hasOwn(object, 'displayDescription')
        ? {
            displayDescription: parseDisplayText(
              object.displayDescription,
              `${path}.displayDescription`,
              filePath,
            ),
          }
        : {}),
    };
  });
}

function parseRelationshipAttributes(
  value: unknown,
  filePath: string,
): RelationshipAttributeLocalization[] {
  return parseArray(value, 'relationshipAttributes', filePath).map((item, index) => {
    const path = `relationshipAttributes[${index}]`;
    const object = parseObject(
      item,
      path,
      ['relationshipId', 'attributeName', 'displayName'],
      ['relationshipId', 'attributeName', 'displayName'],
      filePath,
    );
    return {
      relationshipId: parseNonEmptyString(
        object.relationshipId,
        `${path}.relationshipId`,
        filePath,
      ),
      attributeName: parseNonEmptyString(
        object.attributeName,
        `${path}.attributeName`,
        filePath,
      ),
      displayName: parseDisplayText(object.displayName, `${path}.displayName`, filePath),
    };
  });
}

function parseEnumValues(value: unknown, filePath: string): EnumValueLocalization[] {
  return parseArray(value, 'enumValues', filePath).map((item, index) => {
    const path = `enumValues[${index}]`;
    const object = parseObject(
      item,
      path,
      ['entityId', 'propertyName', 'value', 'displayValue'],
      ['entityId', 'propertyName', 'value', 'displayValue'],
      filePath,
    );
    return {
      entityId: parseNonEmptyString(object.entityId, `${path}.entityId`, filePath),
      propertyName: parseNonEmptyString(object.propertyName, `${path}.propertyName`, filePath),
      value: parseNonEmptyString(object.value, `${path}.value`, filePath),
      displayValue: parseDisplayText(object.displayValue, `${path}.displayValue`, filePath),
    };
  });
}

function internalKey(parts: readonly string[]): string {
  return JSON.stringify(parts);
}

function printableKey(parts: readonly string[]): string {
  return parts.join('/');
}

interface KeyedValue<T> {
  value: T;
  internal: string;
  printable: string;
  path: string;
}

function assertExactCoverage<T>(
  kind: string,
  expected: readonly KeyedValue<unknown>[],
  actual: readonly KeyedValue<T>[],
  filePath: string,
): Map<string, T> {
  const expectedMap = new Map<string, KeyedValue<unknown>>();
  for (const item of expected) {
    if (expectedMap.has(item.internal)) {
      error(filePath, item.path, `source contains duplicate ${kind} key "${item.printable}"`);
    }
    expectedMap.set(item.internal, item);
  }

  const actualMap = new Map<string, T>();
  for (const item of actual) {
    if (actualMap.has(item.internal)) {
      error(filePath, item.path, `duplicate ${kind} key "${item.printable}"`);
    }
    if (!expectedMap.has(item.internal)) {
      error(filePath, item.path, `unknown ${kind} key "${item.printable}"`);
    }
    actualMap.set(item.internal, item.value);
  }

  for (const item of expected) {
    if (!actualMap.has(item.internal)) {
      error(filePath, item.path, `missing ${kind} key "${item.printable}"`);
    }
  }
  return actualMap;
}

function assertDescriptionCoverage(
  sourceDescription: string | undefined,
  displayDescription: LocalizedDisplayText | undefined,
  path: string,
  filePath: string,
): void {
  const sourceHasDescription = (sourceDescription?.trim().length ?? 0) > 0;
  if (sourceHasDescription && displayDescription === undefined) {
    error(filePath, path, 'is required because the source has a description');
  }
  if (!sourceHasDescription && displayDescription !== undefined) {
    error(filePath, path, 'must be omitted because the source has no description');
  }
}

function validateCoverage(
  overlay: CatalogueLocalizationOverlay,
  entry: CatalogueEntry,
  filePath: string,
): void {
  assertExactCoverage(
    'tag',
    entry.tags.map((tag) => ({
      value: tag,
      internal: internalKey([tag]),
      printable: tag,
      path: 'entry.displayTags',
    })),
    overlay.entry.displayTags.map((tag, index) => ({
      value: tag,
      internal: internalKey([tag.tag]),
      printable: tag.tag,
      path: `entry.displayTags[${index}]`,
    })),
    filePath,
  );

  const entityMap = assertExactCoverage(
    'entity',
    entry.ontology.entityTypes.map((entity) => ({
      value: entity,
      internal: internalKey([entity.id]),
      printable: entity.id,
      path: 'entities',
    })),
    overlay.entities.map((entity, index) => ({
      value: entity,
      internal: internalKey([entity.id]),
      printable: entity.id,
      path: `entities[${index}]`,
    })),
    filePath,
  );

  const expectedProperties = entry.ontology.entityTypes.flatMap((entity) =>
    entity.properties.map((property) => ({
      value: property,
      internal: internalKey([entity.id, property.name]),
      printable: printableKey([entity.id, property.name]),
      path: 'properties',
    })),
  );
  const propertyMap = assertExactCoverage(
    'property',
    expectedProperties,
    overlay.properties.map((property, index) => ({
      value: property,
      internal: internalKey([property.entityId, property.propertyName]),
      printable: printableKey([property.entityId, property.propertyName]),
      path: `properties[${index}]`,
    })),
    filePath,
  );

  const relationshipMap = assertExactCoverage(
    'relationship',
    entry.ontology.relationships.map((relationship) => ({
      value: relationship,
      internal: internalKey([relationship.id]),
      printable: relationship.id,
      path: 'relationships',
    })),
    overlay.relationships.map((relationship, index) => ({
      value: relationship,
      internal: internalKey([relationship.id]),
      printable: relationship.id,
      path: `relationships[${index}]`,
    })),
    filePath,
  );

  assertExactCoverage(
    'relationship attribute',
    entry.ontology.relationships.flatMap((relationship) =>
      (relationship.attributes ?? []).map((attribute) => ({
        value: attribute,
        internal: internalKey([relationship.id, attribute.name]),
        printable: printableKey([relationship.id, attribute.name]),
        path: 'relationshipAttributes',
      })),
    ),
    overlay.relationshipAttributes.map((attribute, index) => ({
      value: attribute,
      internal: internalKey([attribute.relationshipId, attribute.attributeName]),
      printable: printableKey([attribute.relationshipId, attribute.attributeName]),
      path: `relationshipAttributes[${index}]`,
    })),
    filePath,
  );

  assertExactCoverage(
    'enum value',
    entry.ontology.entityTypes.flatMap((entity) =>
      entity.properties.flatMap((property) =>
        (property.values ?? []).map((value) => ({
          value,
          internal: internalKey([entity.id, property.name, value]),
          printable: printableKey([entity.id, property.name, value]),
          path: 'enumValues',
        })),
      ),
    ),
    overlay.enumValues.map((enumValue, index) => ({
      value: enumValue,
      internal: internalKey([enumValue.entityId, enumValue.propertyName, enumValue.value]),
      printable: printableKey([enumValue.entityId, enumValue.propertyName, enumValue.value]),
      path: `enumValues[${index}]`,
    })),
    filePath,
  );

  assertDescriptionCoverage(
    entry.ontology.name,
    overlay.ontology.displayName,
    'ontology.displayName',
    filePath,
  );
  assertDescriptionCoverage(
    entry.ontology.description,
    overlay.ontology.displayDescription,
    'ontology.displayDescription',
    filePath,
  );
  for (const [key, localization] of entityMap) {
    const entity = entry.ontology.entityTypes.find(
      (candidate) => internalKey([candidate.id]) === key,
    );
    if (entity) {
      const index = overlay.entities.indexOf(localization);
      assertDescriptionCoverage(
        entity.description,
        localization.displayDescription,
        `entities[${index}].displayDescription`,
        filePath,
      );
    }
  }
  for (const [key, localization] of propertyMap) {
    const property = expectedProperties.find((candidate) => candidate.internal === key)?.value;
    if (property) {
      const index = overlay.properties.indexOf(localization);
      assertDescriptionCoverage(
        property.description,
        localization.displayDescription,
        `properties[${index}].displayDescription`,
        filePath,
      );
    }
  }
  for (const [key, localization] of relationshipMap) {
    const relationship = entry.ontology.relationships.find(
      (candidate) => internalKey([candidate.id]) === key,
    );
    if (relationship) {
      const index = overlay.relationships.indexOf(localization);
      assertDescriptionCoverage(
        relationship.description,
        localization.displayDescription,
        `relationships[${index}].displayDescription`,
        filePath,
      );
    }
  }
}

class DuplicateJsonKeyScanner {
  private index = 0;
  private readonly text: string;
  private readonly filePath: string;

  constructor(text: string, filePath: string) {
    this.text = text;
    this.filePath = filePath;
  }

  scan(): void {
    this.skipWhitespace();
    this.scanValue();
  }

  private scanValue(): void {
    this.skipWhitespace();
    const char = this.text[this.index];
    if (char === '{') {
      this.scanObject();
    } else if (char === '[') {
      this.scanArray();
    } else if (char === '"') {
      this.scanString();
    } else {
      this.scanPrimitive();
    }
  }

  private scanObject(): void {
    this.index++;
    const keys = new Set<string>();
    this.skipWhitespace();
    if (this.text[this.index] === '}') {
      this.index++;
      return;
    }

    while (this.index < this.text.length) {
      this.skipWhitespace();
      if (this.text[this.index] !== '"') return;
      const key = this.scanString();
      if (keys.has(key)) {
        throw new CatalogueLocalizationError(
          `${this.filePath}: duplicate JSON field "${key}"`,
        );
      }
      keys.add(key);
      this.skipWhitespace();
      if (this.text[this.index] !== ':') return;
      this.index++;
      this.scanValue();
      this.skipWhitespace();
      if (this.text[this.index] === '}') {
        this.index++;
        return;
      }
      if (this.text[this.index] !== ',') return;
      this.index++;
    }
  }

  private scanArray(): void {
    this.index++;
    this.skipWhitespace();
    if (this.text[this.index] === ']') {
      this.index++;
      return;
    }
    while (this.index < this.text.length) {
      this.scanValue();
      this.skipWhitespace();
      if (this.text[this.index] === ']') {
        this.index++;
        return;
      }
      if (this.text[this.index] !== ',') return;
      this.index++;
    }
  }

  private scanString(): string {
    const start = this.index;
    this.index++;
    while (this.index < this.text.length) {
      const char = this.text[this.index];
      if (char === '\\') {
        this.index += 2;
        continue;
      }
      this.index++;
      if (char === '"') {
        return JSON.parse(this.text.slice(start, this.index)) as string;
      }
    }
    return '';
  }

  private scanPrimitive(): void {
    while (this.index < this.text.length && !/[\s,}\]]/.test(this.text[this.index])) {
      this.index++;
    }
  }

  private skipWhitespace(): void {
    while (this.index < this.text.length && /\s/.test(this.text[this.index])) {
      this.index++;
    }
  }
}

export function parseCatalogueLocalization(
  json: string,
  entry: CatalogueEntry,
  filePath = entry.id,
): CatalogueLocalizationOverlay {
  try {
    new DuplicateJsonKeyScanner(json, filePath).scan();
  } catch (cause) {
    if (cause instanceof CatalogueLocalizationError) throw cause;
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new CatalogueLocalizationError(`${filePath}: invalid JSON: ${detail}`);
  }

  let value: unknown;
  try {
    value = JSON.parse(json) as unknown;
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new CatalogueLocalizationError(`${filePath}: invalid JSON: ${detail}`);
  }

  const object = parseObject(
    value,
    '$',
    [
      '$schema',
      'version',
      'entry',
      'ontology',
      'entities',
      'properties',
      'relationships',
      'relationshipAttributes',
      'enumValues',
    ],
    [
      'version',
      'entry',
      'ontology',
      'entities',
      'properties',
      'relationships',
      'relationshipAttributes',
      'enumValues',
    ],
    filePath,
  );

  if (object.version !== 1) {
    error(filePath, 'version', 'must be 1');
  }

  const overlay: CatalogueLocalizationOverlay = {
    ...(Object.hasOwn(object, '$schema')
      ? { $schema: parseNonEmptyString(object.$schema, '$schema', filePath) }
      : {}),
    version: 1,
    entry: parseEntry(object.entry, filePath),
    ontology: parseOntology(object.ontology, filePath),
    entities: parseEntities(object.entities, filePath),
    properties: parseProperties(object.properties, filePath),
    relationships: parseRelationships(object.relationships, filePath),
    relationshipAttributes: parseRelationshipAttributes(
      object.relationshipAttributes,
      filePath,
    ),
    enumValues: parseEnumValues(object.enumValues, filePath),
  };

  validateCoverage(overlay, entry, filePath);
  return overlay;
}

export function displayTextValue(value: LocalizedDisplayText): string {
  return typeof value === 'string' ? value : value.text;
}

export function applyCatalogueLocalization(
  entry: CatalogueEntry,
  overlay: CatalogueLocalizationOverlay,
): CatalogueEntry {
  const tagLocalizations = new Map(
    overlay.entry.displayTags.map((tag) => [tag.tag, tag.displayName]),
  );
  const entityLocalizations = new Map(
    overlay.entities.map((entity) => [internalKey([entity.id]), entity]),
  );
  const propertyLocalizations = new Map(
    overlay.properties.map((property) => [
      internalKey([property.entityId, property.propertyName]),
      property,
    ]),
  );
  const relationshipLocalizations = new Map(
    overlay.relationships.map((relationship) => [
      internalKey([relationship.id]),
      relationship,
    ]),
  );
  const attributeLocalizations = new Map(
    overlay.relationshipAttributes.map((attribute) => [
      internalKey([attribute.relationshipId, attribute.attributeName]),
      attribute,
    ]),
  );
  const enumLocalizations = new Map(
    overlay.enumValues.map((enumValue) => [
      internalKey([enumValue.entityId, enumValue.propertyName, enumValue.value]),
      enumValue,
    ]),
  );

  return {
    ...entry,
    displayName: displayTextValue(overlay.entry.displayName),
    displayDescription: displayTextValue(overlay.entry.displayDescription),
    displayTags: entry.tags.map((tag) => displayTextValue(tagLocalizations.get(tag)!)),
    ontology: {
      ...entry.ontology,
      ...(overlay.ontology.displayName === undefined
        ? {}
        : { displayName: displayTextValue(overlay.ontology.displayName) }),
      ...(overlay.ontology.displayDescription === undefined
        ? {}
        : {
            displayDescription: displayTextValue(overlay.ontology.displayDescription),
          }),
      entityTypes: entry.ontology.entityTypes.map((entity) => {
        const localization = entityLocalizations.get(internalKey([entity.id]));
        return {
          ...entity,
          displayName: displayTextValue(localization!.displayName),
          ...(localization!.displayDescription === undefined
            ? {}
            : {
                displayDescription: displayTextValue(localization!.displayDescription),
              }),
          properties: entity.properties.map((property) => {
            const propertyLocalization = propertyLocalizations.get(
              internalKey([entity.id, property.name]),
            );
            const displayValues = (property.values ?? []).map((value) => {
              const enumLocalization = enumLocalizations.get(
                internalKey([entity.id, property.name, value]),
              );
              return [value, displayTextValue(enumLocalization!.displayValue)] as const;
            });
            return {
              ...property,
              displayName: displayTextValue(propertyLocalization!.displayName),
              ...(propertyLocalization!.displayDescription === undefined
                ? {}
                : {
                    displayDescription: displayTextValue(
                      propertyLocalization!.displayDescription,
                    ),
                  }),
              ...(displayValues.length === 0
                ? {}
                : { displayValues: Object.fromEntries(displayValues) }),
            };
          }),
        };
      }),
      relationships: entry.ontology.relationships.map((relationship) => {
        const localization = relationshipLocalizations.get(
          internalKey([relationship.id]),
        );
        return {
          ...relationship,
          displayName: displayTextValue(localization!.displayName),
          ...(localization!.displayDescription === undefined
            ? {}
            : {
                displayDescription: displayTextValue(localization!.displayDescription),
              }),
          ...(relationship.attributes === undefined
            ? {}
            : {
                attributes: relationship.attributes.map((attribute) => ({
                  ...attribute,
                  displayName: displayTextValue(
                    attributeLocalizations.get(
                      internalKey([relationship.id, attribute.name]),
                    )!.displayName,
                  ),
                })),
              }),
        };
      }),
    },
  };
}
