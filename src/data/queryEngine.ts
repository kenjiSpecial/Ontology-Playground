import type { Ontology } from './ontology';
import { nlQueryResponses } from './quests';
import { jaFormatters, jaMessages } from '../locales/ja';

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

function propertyList(ontology: Ontology, entityId: string): string {
  const entity = ontology.entityTypes.find(candidate => candidate.id === entityId);
  if (!entity) return '';
  return entity.properties
    .slice(0, 4)
    .map(property => `• **${property.name}** (${property.type})${property.isIdentifier ? ' 🔑' : ''}`)
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
    suggestions.push(jaFormatters.querySuggestionShowAll(entities[0].name));

    if (entities.length > 1) {
      suggestions.push(jaFormatters.querySuggestionListAll(entities[1].name));
    }
  }

  entities.forEach(entity => {
    entity.properties.forEach(property => {
      if (property.type === 'string' && !property.isIdentifier && property.name !== 'name') {
        suggestions.push(jaFormatters.querySuggestionByProperty(entity.name, property.name));
      }
    });
  });

  if (relationships.length > 0) {
    const relationship = relationships[0];
    const fromEntity = entities.find(entity => entity.id === relationship.from);
    const toEntity = entities.find(entity => entity.id === relationship.to);
    if (fromEntity && toEntity) {
      suggestions.push(jaFormatters.querySuggestionConnection(fromEntity.name, toEntity.name));
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
        result: demoResponse.result,
        highlightEntities: demoResponse.highlightEntities,
        highlightRelationships: demoResponse.highlightRelationships,
        interpretation: jaFormatters.queryDetectedSample(ontology.name),
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
      result: `**${ontology.name}**オントロジーの構成:\n\n• **${entities.length}個のエンティティ型** - ${entities.map(entity => entity.name).join('、')}\n• **${relationships.length}個のリレーションシップ** - エンティティ同士を接続\n\nオントロジーはデータプラットフォームのソースに結び付くセマンティック層として機能し、ビジネス概念を理解した自然言語クエリを可能にします。`,
      highlightEntities: entities.map(entity => entity.id),
      highlightRelationships: [],
      interpretation: jaMessages.query.ontologyStructureInterpretation,
    };
  }

  for (const entity of entities) {
    const entityNameLower = entity.name.toLowerCase();
    const entityNameSingular = singularize(entityNameLower);
    let isDefinitionQuery = false;

    if (normalizedNoPunctuation.startsWith('what is ')) {
      const subject = stripLeadingArticle(normalizedNoPunctuation.slice('what is '.length).trim());
      isDefinitionQuery =
        subject === entityNameLower ||
        subject === entityNameSingular ||
        singularize(subject) === entityNameSingular;
    }

    isDefinitionQuery ||= includesAny(normalizedNoPunctuation, [
      `${entityNameLower}とは`,
      `${entityNameLower}って何`,
      `${entityNameLower}は何ですか`,
    ]);

    if (isDefinitionQuery) {
      return {
        query,
        result: `**${entity.name}** ${entity.icon}\n${entity.description}\n\n**${jaFormatters.queryPropertiesHeading(entity.properties.length)}**\n${propertyList(ontology, entity.id)}`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedEntityDefinition(entity.name),
      };
    }
  }

  for (const entity of entities) {
    const entityNameLower = entity.name.toLowerCase();
    const entityNamePlural = `${entityNameLower}s`;
    const legacyListQuery = includesAny(normalizedQuery, [
      `show me all ${entityNameLower}`,
      `show me all ${entityNamePlural}`,
      `list all ${entityNameLower}`,
      `list all ${entityNamePlural}`,
      `show ${entityNamePlural}`,
      `list ${entityNamePlural}`,
    ]);
    const japaneseListQuery =
      normalizedQuery.includes(entityNameLower) &&
      includesAny(normalizedQuery, ['すべて', '全て', '全部', '一覧']) &&
      includesAny(normalizedQuery, ['表示', '見せ']);

    if (legacyListQuery || japaneseListQuery) {
      return {
        query,
        result: `**${entity.name}** ${entity.icon}\n${entity.description}\n\n**${jaFormatters.queryPropertiesHeading(entity.properties.length)}**\n${propertyList(ontology, entity.id)}\n\n${jaFormatters.queryEntityProductionNote(entity.name)}`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedEntityList(entity.name),
      };
    }
  }

  for (const relationship of relationships) {
    const relationshipName = relationship.name.toLowerCase().trim().replace(/\s+/g, ' ');
    const fromEntity = entities.find(entity => entity.id === relationship.from);
    const toEntity = entities.find(entity => entity.id === relationship.to);

    if (normalizedNoPunctuation.includes(relationshipName) && hasConnectionIntent(normalizedNoPunctuation)) {
      return {
        query,
        result: `**${relationship.name}**は**${fromEntity?.name ?? relationship.from}**から**${toEntity?.name ?? relationship.to}**を接続します（${relationship.cardinality}）。${relationship.description ? `\n\n${relationship.description}` : ''}`,
        highlightEntities: [relationship.from, relationship.to],
        highlightRelationships: [relationship.id],
        interpretation: jaFormatters.queryDetectedRelationship(relationship.name),
      };
    }
  }

  for (const entity of entities) {
    const entityNameLower = entity.name.toLowerCase();
    if (!normalizedQuery.includes(entityNameLower) || !hasConnectionIntent(normalizedNoPunctuation)) continue;

    const relatedRelationships = relationships.filter(
      relationship => relationship.from === entity.id || relationship.to === entity.id,
    );
    if (relatedRelationships.length === 0) continue;

    const relationshipList = relatedRelationships.map(relationship => {
      const isOutgoing = relationship.from === entity.id;
      const otherEntityId = isOutgoing ? relationship.to : relationship.from;
      const otherEntity = entities.find(candidate => candidate.id === otherEntityId);
      const direction = isOutgoing ? '→' : '←';
      return `• **${relationship.name}** ${direction} ${otherEntity?.icon} ${otherEntity?.name} (${relationship.cardinality})`;
    }).join('\n');

    return {
      query,
      result: `${jaFormatters.queryConnectionCount(entity.name, relatedRelationships.length)}\n\n${relationshipList}`,
      highlightEntities: [entity.id, ...relatedRelationships.map(relationship => relationship.from === entity.id ? relationship.to : relationship.from)],
      highlightRelationships: relatedRelationships.map(relationship => relationship.id),
      interpretation: jaFormatters.queryDetectedConnections(entity.name),
    };
  }

  for (const entity of entities) {
    for (const property of entity.properties) {
      if (!normalizedQuery.includes(property.name.toLowerCase()) || !normalizedQuery.includes(entity.name.toLowerCase())) continue;

      const details = [
        `• ${jaMessages.query.type}: ${property.type}`,
        property.unit ? `• ${jaMessages.query.unit}: ${property.unit}` : '',
        property.isIdentifier ? `• ${jaMessages.query.identifierProperty}` : '',
        property.description ? `• ${property.description}` : '',
      ].filter(Boolean).join('\n');

      return {
        query,
        result: `**${entity.name}.${property.name}**\n\n${details}\n\n${jaFormatters.queryPropertyProductionNote(entity.name)}`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedProperty(entity.name, property.name),
      };
    }
  }

  const asksForCount = normalizedQuery.includes('how many') || includesAny(normalizedQuery, ['何件', 'いくつ', '件数']);
  if (asksForCount) {
    for (const entity of entities) {
      if (!normalizedQuery.includes(entity.name.toLowerCase())) continue;

      return {
        query,
        result: `オントロジーには**${entity.name}**エンティティ型が定義されています。\n\n${jaFormatters.queryCountProductionNote(entity.name)}\n\n例: "SELECT COUNT(*) FROM ${entity.name.toLowerCase()}s"`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: jaFormatters.queryDetectedCount(entity.name),
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
      .map(entity => `• ${entity.icon} **${entity.name}** - ${entity.description.slice(0, 50)}...`)
      .join('\n');
    return {
      query,
      result: `**${ontology.name}** スキーマ概要\n\n${entityList}\n\n**${jaFormatters.querySchemaTotal(entities.length, relationships.length)}**`,
      highlightEntities: entities.map(entity => entity.id),
      highlightRelationships: [],
      interpretation: jaMessages.query.schemaInterpretation,
    };
  }

  const suggestions = generateQuerySuggestions(ontology).slice(0, 3);
  return {
    query,
    result: jaFormatters.queryFallback(query, ontology.name, suggestions),
    highlightEntities: [],
    highlightRelationships: [],
    interpretation: undefined,
  };
}
