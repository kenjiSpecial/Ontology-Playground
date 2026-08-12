import { describe, expect, it } from 'vitest';
import { isFallbackQueryResponse, processQuery } from './queryEngine';
import type { Ontology } from './ontology';
import { cosmicCoffeeOntology } from './ontology';

const testOntology: Ontology = {
  name: 'Incident Management Ontology',
  description: 'Test ontology for query handling.',
  entityTypes: [
    {
      id: 'service',
      name: 'Service',
      description: 'Business or IT service being disrupted.',
      icon: '⚙️',
      color: '#E74C3C',
      properties: [
        { name: 'serviceId', type: 'string', isIdentifier: true },
      ],
    },
    {
      id: 'configurationitem',
      name: 'ConfigurationItem',
      description: 'Underlying asset or component causing the incident.',
      icon: '🧩',
      color: '#00A9E0',
      properties: [
        { name: 'ciId', type: 'string', isIdentifier: true },
      ],
    },
    {
      id: 'problem',
      name: 'Problem',
      description: 'Known error or root cause for recurring incidents.',
      icon: '⚡',
      color: '#FFB900',
      properties: [
        { name: 'problemId', type: 'string', isIdentifier: true },
        { name: 'title', type: 'string' },
      ],
    },
  ],
  relationships: [
    {
      id: 'service_supported_by_configuration_item',
      name: 'is supported by',
      from: 'service',
      to: 'configurationitem',
      cardinality: 'one-to-many',
      description: 'Service is supported by Configuration Item',
    },
  ],
};

describe('processQuery', () => {
  it('matches localized display names while keeping internal highlight identifiers', () => {
    const localizedOntology: Ontology = {
      ...testOntology,
      displayName: 'インシデント管理オントロジー',
      displayDescription: 'インシデントを管理するモデルです。',
      entityTypes: testOntology.entityTypes.map((entity) => ({
        ...entity,
        ...(entity.id === 'service'
          ? { displayName: 'サービス', displayDescription: '業務またはITサービスです。' }
          : { displayName: '構成アイテム' }),
        properties: entity.properties.map((property) =>
          property.name === 'serviceId'
            ? { ...property, displayName: 'サービス識別子' }
            : property,
        ),
      })),
      relationships: testOntology.relationships.map((relationship) => ({
        ...relationship,
        displayName: 'サポートされる',
        displayDescription: 'サービスと構成アイテムを接続します。',
      })),
    };

    const entityResponse = processQuery('サービスとは何ですか？', localizedOntology);
    expect(entityResponse.result).toContain('**サービス**');
    expect(entityResponse.result).toContain('業務またはITサービスです。');
    expect(entityResponse.highlightEntities).toEqual(['service']);

    const internalResponse = processQuery('What is a Service?', localizedOntology);
    expect(internalResponse.highlightEntities).toEqual(['service']);

    const relationshipResponse = processQuery('サービスは構成アイテムとどうつながりますか？', localizedOntology);
    expect(relationshipResponse.result).toContain('**サポートされる**');
    expect(relationshipResponse.highlightEntities).toEqual(['service', 'configurationitem']);
    expect(relationshipResponse.highlightRelationships).toEqual(['service_supported_by_configuration_item']);

    const propertyResponse = processQuery('サービスのサービス識別子について教えて', localizedOntology);
    expect(propertyResponse.result).toContain('**サービス.サービス識別子**');
    expect(propertyResponse.highlightEntities).toEqual(['service']);
  });

  it('answers definition-style entity questions', () => {
    const response = processQuery('What is a Problem?', testOntology);

    expect(response.interpretation).toContain('Problem');
    expect(response.interpretation).toContain('エンティティ定義');
    expect(response.result).toContain('**Problem**');
    expect(response.result).toContain('Known error or root cause for recurring incidents.');
    expect(response.highlightEntities).toEqual(['problem']);
  });

  it('does not duplicate ontology wording in fallback text', () => {
    const response = processQuery('Completely unknown question', testOntology);

    expect(response.result).toContain('**Incident Management Ontology**では解釈できませんでした。');
    expect(response.result).not.toContain('Ontology**オントロジー');
    expect(isFallbackQueryResponse(response.result)).toBe(true);
  });

  it('answers relationship-name connection queries', () => {
    const response = processQuery('Show me all is supported by connections', testOntology);

    expect(response.interpretation).toContain('is supported by');
    expect(response.interpretation).toContain('リレーションシップ名');
    expect(response.result).toContain('**Service**から**ConfigurationItem**を接続します');
    expect(response.highlightRelationships).toEqual(['service_supported_by_configuration_item']);
  });

  it('answers Japanese definition-style entity questions', () => {
    const response = processQuery('Problemとは何ですか？', testOntology);

    expect(response.result).toContain('**Problem**');
    expect(response.result).toContain('Known error or root cause for recurring incidents.');
    expect(response.result).toContain('プロパティ（2件）:');
    expect(response.highlightEntities).toEqual(['problem']);
  });

  it('answers Japanese entity-listing questions', () => {
    const response = processQuery('すべてのProblemを表示して', testOntology);

    expect(response.result).toContain('**Problem**');
    expect(response.result).toContain('データプラットフォームからProblemレコード');
    expect(response.highlightEntities).toEqual(['problem']);
  });

  it('answers concise Japanese entity-list requests', () => {
    const response = processQuery('Problemの一覧', testOntology);

    expect(response.result).toContain('**Problem**');
    expect(response.highlightEntities).toEqual(['problem']);
    expect(isFallbackQueryResponse(response.result)).toBe(false);
  });

  it('answers Japanese connection questions', () => {
    const response = processQuery('ServiceはConfigurationItemとどうつながりますか？', testOntology);

    expect(response.result).toContain('**Service**');
    expect(response.result).toContain('**is supported by**');
    expect(response.result).toContain('ConfigurationItem');
    expect(response.highlightRelationships).toEqual(['service_supported_by_configuration_item']);
  });

  it('answers Japanese property questions', () => {
    const response = processQuery('Problemのtitleについて教えて', testOntology);

    expect(response.result).toContain('**Problem.title**');
    expect(response.result).toContain('型: string');
    expect(response.highlightEntities).toEqual(['problem']);
  });

  it('answers Japanese counting questions', () => {
    const response = processQuery('Problemは何件ありますか？', testOntology);

    expect(response.result).toContain('**Problem**エンティティ型');
    expect(response.result).toContain('データプラットフォームからProblemレコード件数');
    expect(response.highlightEntities).toEqual(['problem']);
  });

  it('answers Japanese schema-overview questions', () => {
    const response = processQuery('スキーマの概要を表示して', testOntology);

    expect(response.result).toContain('**Incident Management Ontology** スキーマ概要');
    expect(response.result).toContain('合計: 3個のエンティティ、1個のリレーションシップ');
    expect(response.highlightEntities).toEqual(['service', 'configurationitem', 'problem']);
  });

  it('returns a Japanese fallback for unknown Japanese questions', () => {
    const response = processQuery('まったく未知の質問', testOntology);

    expect(response.result).toContain('「まったく未知の質問」');
    expect(response.result).toContain('質問例:');
    expect(response.result).toContain('グラフの要素を選択');
    expect(isFallbackQueryResponse(response.result)).toBe(true);
  });

  it('answers the Japanese Fourth Coffee demo query', () => {
    const response = processQuery('ゴールド会員の顧客を表示して', cosmicCoffeeOntology);

    expect(response.result).toContain('ゴールド会員の顧客が1人見つかりました');
    expect(response.result).toContain('Arif Ramadhan');
    expect(response.interpretation).toContain('Fourth Coffee');
    expect(response.highlightEntities).toEqual(['customer']);
  });

  it.each([
    ['Show me all Problems', testOntology, ['problem']],
    ['Show Problem by title', testOntology, ['problem']],
    ['How many Problems are there?', testOntology, ['problem']],
    ['Show schema overview', testOntology, ['service', 'configurationitem', 'problem']],
    ['Show me all Gold tier customers', cosmicCoffeeOntology, ['customer']],
  ])('keeps legacy English query compatibility for %s', (query, ontology, expectedEntities) => {
    const response = processQuery(query, ontology);

    expect(isFallbackQueryResponse(response.result)).toBe(false);
    expect(response.highlightEntities).toEqual(expectedEntities);
  });
});
