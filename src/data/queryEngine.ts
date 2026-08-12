import type { Ontology } from './ontology';
import { nlQueryResponses } from './quests';
import { jaFormatters, jaMessages } from '../locales/ja';
import {
  getDisplayDescription,
  getDisplayName,
  getSearchableValues,
  matchesSearch,
} from '../lib/displayText';

export interface QueryResponse {
  query: string;
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
  interpretation?: string;
}

function normalizeQuery(text: string): string {
  return text.toLowerCase().trim();
}

function removePunctuation(text: string): string {
  return text.replace(/[?!.:,;！？。、，：；「」『』]+/g, '').trim();
}

function stripLeadingArticle(text: string): string {
  return text.replace(/^(a|an|the)\s+/, '').trim();
}

function singularize(text: string): string {
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

function includesAny(text: string, phrases: readonly string[]): boolean {
  return phrases.some(phrase => text.includes(phrase));
}

function hasConnectionIntent(text: string): boolean {
  return includesAny(text, [
    'connection',
    'connections',
    'relationship',
    'connect',
    'relate',
    'つなが',
    '接続',
    '関係',
    '関連',
  ]);
}

function matchesDemoQuery(normalizedQuery: string, demoQuery: string, matches: string[]): boolean {
  const canonical = removePunctuation(normalizeQuery(demoQuery));
  return normalizedQuery === canonical || matches.some(match => normalizedQuery.includes(removePunctuation(normalizeQuery(match))));
}

function searchableVariants(source: { name?: string; displayName?: string }): string[] {
  return getSearchableValues(source).map((value) => removePunctuation(normalizeQuery(value)));
}

function queryIncludesSource(query: string, source: { name?: string; displayName?: string }): boolean {
  const normalizedQuery = removePunctuation(normalizeQuery(query));
  return searchableVariants(source).some((variant) =>
    variant.length > 0 && (normalizedQuery.includes(variant) || matchesSearch(normalizedQuery, variant)),
  );
}

function queryMatchesEntityDefinition(query: string, entity: { name: string; displayName?: string }): boolean {
  const normalizedQuery = removePunctuation(normalizeQuery(query));
  return searchableVariants(entity).some((variant) => {
    const singular = singularize(variant);
    if (normalizedQuery.startsWith('what is ')) {
      const subject = stripLeadingArticle(normalizedQuery.slice('what is '.length).trim());
      if (subject === variant || subject === singular || singularize(subject) === singular) return true;
    }
    return [
      `${variant}とは`,
      `${variant}って何`,
      `${variant}は何ですか`,
    ].some((phrase) => normalizedQuery.includes(phrase));
  });
}

function displayizeQueryText(text: string, ontology: Ontology): string {
  const replacements = [
    ...ontology.entityTypes.flatMap((entity) => [
      [entity.name, getDisplayName(entity)] as const,
    ]),
    ...ontology.relationships.flatMap((relationship) => [
      [relationship.name, getDisplayName(relationship)] as const,
    ]),
    ...ontology.entityTypes.flatMap((entity) => entity.properties.map((property) => [
      property.name,
      getDisplayName(property),
    ] as const)),
  ].filter(([internal, display]) => internal !== display && internal.length > 0);

  return [...replacements]
    .sort(([left], [right]) => right.length - left.length)
    .reduce((result, [internal, display]) => result.split(internal).join(display), text);
}

function propertyList(ontology: Ontology, entityId: string): string {
  const entity = ontology.entityTypes.find(candidate => candidate.id === entityId);
  if (!entity) return '';
  return entity.properties
    .slice(0, 4)
    .map(property => `• **${getDisplayName(property)}** (${property.type})${property.isIdentifier ? ' 🔑' : ''}`)
    .join('\n');
}

export function isFallbackQueryResponse(result: string): boolean {
  return result.includes('**では解釈できませんでした。');
}

// Generate dynamic query suggestions based on the current ontology.
export function generateQuerySuggestions(ontology: Ontology): string[] {
  const suggestions: string[] = [];
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  if (entities.length > 0) {
    suggestions.push(jaFormatters.querySuggestionShowAll(getDisplayName(entities[0])));

    if (entities.length > 1) {
      suggestions.push(jaFormatters.querySuggestionListAll(getDisplayName(entities[1])));
    }
  }

  entities.forEach(entity => {
    entity.properties.forEach(property => {
      if (property.type === 'string' && !property.isIdentifier && property.name !== 'name') {
        suggestions.push(jaFormatters.querySuggestionByProperty(getDisplayName(entity), getDisplayName(property)));
      }
    });
  });

  if (relationships.length > 0) {
    const relationship = relationships[0];
    const fromEntity = entities.find(entity => entity.id === relationship.from);
    const toEntity = entities.find(entity => entity.id === relationship.to);
    if (fromEntity && toEntity) {
      suggestions.push(jaFormatters.querySuggestionConnection(getDisplayName(fromEntity), getDisplayName(toEntity)));
    }
  }

  suggestions.push('エンティティ型とは何ですか？');
  suggestions.push('リレーションシップとは何ですか？');
  suggestions.push('オントロジーはどのように機能しますか？');

  return [...new Set(suggestions)].slice(0, 6);
}

// Process a natural-language query against the ontology.
export function processQuery(query: string, ontology: Ontology): QueryResponse {
  const normalizedQuery = normalizeQuery(query);
  const normalizedNoPunctuation = removePunctuation(normalizedQuery);
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  if (ontology.name === 'Fourth Coffee') {
    const demoResponse = nlQueryResponses.find(response =>
      matchesDemoQuery(normalizedNoPunctuation, response.query, response.matches)
    );

    if (demoResponse) {
      return {
        query,
        result: displayizeQueryText(demoResponse.result, ontology),
        highlightEntities: demoResponse.highlightEntities,
        highlightRelationships: demoResponse.highlightRelationships,
        interpretation: jaFormatters.queryDetectedSample(getDisplayName(ontology)),
      };
    }
  }

  const asksEntityConcept =
    (normalizedQuery.includes('what is') && (normalizedQuery.includes('entity') || normalizedQuery.includes('ontology'))) ||
    includesAny(normalizedNoPunctuation, ['エンティティ型とは', 'エンティティとは', 'オントロジーとは']);

  if (asksEntityConcept) {
    return {
      query,
      result: jaMessages.query.conceptEntityResult,
      highlightEntities: entities.slice(0, 2).map(entity => entity.id),
      highlightRelationships: [],
      interpretation: jaMessages.query.conceptEntityInterpretation,
    };
  }

  const asksRelationshipConcept =
    (normalizedQuery.includes('what is') && normalizedQuery.includes('relationship')) ||
    includesAny(normalizedNoPunctuation, ['リレーションシップとは', '関係とは']);

  if (asksRelationshipConcept) {
    return {
      query,
      result: jaMessages.query.conceptRelationshipResult,
      highlightEntities: [],
      highlightRelationships: relationships.slice(0, 2).map(relationship => relationship.id),
      interpretation: jaMessages.query.conceptRelationshipInterpretation,
    };
  }

  const asksOntologyStructure =
    (normalizedQuery.includes('how') && (normalizedQuery.includes('ontology') || normalizedQuery.includes('work'))) ||
    (normalizedQuery.includes('オントロジー') && includesAny(normalizedQuery, ['仕組み', '構造', '機能', 'どのよう']));

  if (asksOntologyStructure) {
    return {
      query,
      result: `**${getDisplayName(ontology)}**オントロジーの構成:\n\n• **${entities.length}個のエンティティ型** - ${entities.map(entity => getDisplayName(entity)).join('、')}\n• **${relationships.length}個のリレーションシップ** - エンティティ同士を接続\n\nオントロジーはデータプラットフォームのソースに結び付くセマンティック層として機能し、ビジネス概念を理解した自然言語クエリを可能にします。`,
      highlightEntities: entities.map(entity => entity.id),
      highlightRelationships: [],
      interpretation: jaMessages.query.ontologyStructureInterpretation,
    };
  }

  for (const entity of entities) {
    if (queryMatchesEntityDefinition(query, entity)) {
      return {
        query,
        result: `**${getDisplayName(entity)}** ${entity.icon}\n${getDisplayDescription(entity) ?? ''}\n\n**${jaFormatters.queryPropertiesHeading(entity.properties.length)}**\n${propertyList(ontology, entity.id)}`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedEntityDefinition(getDisplayName(entity)),
      };
    }
  }

  for (const entity of entities) {
    const legacyListQuery = searchableVariants(entity).some((entityNameLower) => {
      const entityNamePlural = `${entityNameLower}s`;
      return includesAny(normalizedQuery, [
        `show me all ${entityNameLower}`,
        `show me all ${entityNamePlural}`,
        `list all ${entityNameLower}`,
        `list all ${entityNamePlural}`,
        `show ${entityNamePlural}`,
        `list ${entityNamePlural}`,
      ]);
    });
    const mentionsEntity = queryIncludesSource(query, entity);
    const japaneseListQuery = mentionsEntity && (
      normalizedQuery.includes('一覧') ||
      (includesAny(normalizedQuery, ['すべて', '全て', '全部']) && includesAny(normalizedQuery, ['表示', '見せ']))
    );

    if (legacyListQuery || japaneseListQuery) {
      return {
        query,
        result: `**${getDisplayName(entity)}** ${entity.icon}\n${getDisplayDescription(entity) ?? ''}\n\n**${jaFormatters.queryPropertiesHeading(entity.properties.length)}**\n${propertyList(ontology, entity.id)}\n\n${jaFormatters.queryEntityProductionNote(getDisplayName(entity))}`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedEntityList(getDisplayName(entity)),
      };
    }
  }

  for (const relationship of relationships) {
    const fromEntity = entities.find(entity => entity.id === relationship.from);
    const toEntity = entities.find(entity => entity.id === relationship.to);

    if (queryIncludesSource(query, relationship) && hasConnectionIntent(normalizedNoPunctuation)) {
      return {
        query,
        result: `**${getDisplayName(relationship)}**は**${fromEntity ? getDisplayName(fromEntity) : relationship.from}**から**${toEntity ? getDisplayName(toEntity) : relationship.to}**を接続します（${relationship.cardinality}）。${getDisplayDescription(relationship) ? `\n\n${getDisplayDescription(relationship)}` : ''}`,
        highlightEntities: [relationship.from, relationship.to],
        highlightRelationships: [relationship.id],
        interpretation: jaFormatters.queryDetectedRelationship(getDisplayName(relationship)),
      };
    }
  }

  for (const entity of entities) {
    if (!queryIncludesSource(query, entity) || !hasConnectionIntent(normalizedNoPunctuation)) continue;

    const relatedRelationships = relationships.filter(
      relationship => relationship.from === entity.id || relationship.to === entity.id,
    );
    if (relatedRelationships.length === 0) continue;

    const relationshipList = relatedRelationships.map(relationship => {
      const isOutgoing = relationship.from === entity.id;
      const otherEntityId = isOutgoing ? relationship.to : relationship.from;
      const otherEntity = entities.find(candidate => candidate.id === otherEntityId);
      const direction = isOutgoing ? '→' : '←';
      return `• **${getDisplayName(relationship)}** ${direction} ${otherEntity?.icon} ${otherEntity ? getDisplayName(otherEntity) : otherEntityId} (${relationship.cardinality})`;
    }).join('\n');

    return {
      query,
      result: `${jaFormatters.queryConnectionCount(getDisplayName(entity), relatedRelationships.length)}\n\n${relationshipList}`,
      highlightEntities: [entity.id, ...relatedRelationships.map(relationship => relationship.from === entity.id ? relationship.to : relationship.from)],
      highlightRelationships: relatedRelationships.map(relationship => relationship.id),
      interpretation: jaFormatters.queryDetectedConnections(getDisplayName(entity)),
    };
  }

  for (const entity of entities) {
    for (const property of entity.properties) {
      if (!queryIncludesSource(query, property) || !queryIncludesSource(query, entity)) continue;

      const details = [
        `• ${jaMessages.query.type}: ${property.type}`,
        property.unit ? `• ${jaMessages.query.unit}: ${property.unit}` : '',
        property.isIdentifier ? `• ${jaMessages.query.identifierProperty}` : '',
        getDisplayDescription(property) ? `• ${getDisplayDescription(property)}` : '',
      ].filter(Boolean).join('\n');

      return {
        query,
        result: `**${getDisplayName(entity)}.${getDisplayName(property)}**\n\n${details}\n\n${jaFormatters.queryPropertyProductionNote(getDisplayName(entity))}`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedProperty(getDisplayName(entity), getDisplayName(property)),
      };
    }
  }

  const asksForCount = normalizedQuery.includes('how many') || includesAny(normalizedQuery, ['何件', 'いくつ', '件数']);
  if (asksForCount) {
    for (const entity of entities) {
      if (!queryIncludesSource(query, entity)) continue;

      return {
        query,
        result: `オントロジーには**${getDisplayName(entity)}**エンティティ型が定義されています。\n\n${jaFormatters.queryCountProductionNote(getDisplayName(entity))}\n\n例: "SELECT COUNT(*) FROM ${entity.name.toLowerCase()}s"`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedCount(getDisplayName(entity)),
      };
    }
  }

  const asksForSchema = includesAny(normalizedQuery, [
    'entities',
    'schema',
    'overview',
    'エンティティ一覧',
    'スキーマ',
    '概要',
    '全体像',
  ]);

  if (asksForSchema) {
    const entityList = entities
      .map(entity => `• ${entity.icon} **${getDisplayName(entity)}** - ${(getDisplayDescription(entity) ?? '').slice(0, 50)}...`)
      .join('\n');
    return {
      query,
      result: `**${getDisplayName(ontology)}** スキーマ概要\n\n${entityList}\n\n**${jaFormatters.querySchemaTotal(entities.length, relationships.length)}**`,
      highlightEntities: entities.map(entity => entity.id),
      highlightRelationships: [],
      interpretation: jaMessages.query.schemaInterpretation,
    };
  }

  const suggestions = generateQuerySuggestions(ontology).slice(0, 3);
  return {
    query,
    result: jaFormatters.queryFallback(query, getDisplayName(ontology), suggestions),
    highlightEntities: [],
    highlightRelationships: [],
    interpretation: undefined,
  };
}
