import { describe, expect, it } from 'vitest';
import { generateQuestsForOntology } from './questGenerator';
import type { Ontology } from './ontology';
import { extractQueryFromInstruction, validateQueryQuestSteps } from './questQueryValidator';
import { cosmicCoffeeOntology } from './ontology';
import { quests as defaultQuests } from './quests';

const ontology: Ontology = {
  name: 'Incident Management',
  description: 'Test ontology for quest generation.',
  entityTypes: [
    {
      id: 'service',
      name: 'Service',
      description: 'A service.',
      icon: '⚙️',
      color: '#E74C3C',
      properties: [
        { name: 'serviceId', type: 'string', isIdentifier: true },
        { name: 'name', type: 'string' },
        { name: 'status', type: 'string' },
      ],
    },
    {
      id: 'configurationitem',
      name: 'ConfigurationItem',
      description: 'A configuration item.',
      icon: '🧩',
      color: '#00A9E0',
      properties: [{ name: 'ciId', type: 'string', isIdentifier: true }],
    },
  ],
  relationships: [
    {
      id: 'service_supported_by_configuration_item',
      name: 'is supported by',
      from: 'service',
      to: 'configurationitem',
      cardinality: 'one-to-many',
    },
  ],
};

const JAPANESE_TEXT = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

describe('generateQuestsForOntology', () => {
  it('keeps default Fourth Coffee query quests executable in the live query engine', () => {
    const issues = validateQueryQuestSteps(defaultQuests, cosmicCoffeeOntology);

    expect(issues).toEqual([]);
  });

  it('generates query quest steps that resolve meaningfully in the NL engine', () => {
    const quests = generateQuestsForOntology(ontology);
    const issues = validateQueryQuestSteps(quests, ontology);

    expect(issues).toEqual([]);
  });

  it('does not invent a connection question for disconnected entities', () => {
    const disconnectedOntology: Ontology = {
      ...ontology,
      relationships: [],
    };

    const quests = generateQuestsForOntology(disconnectedOntology);
    const queryQuest = quests.find((quest) => quest.id === 'quest-5');

    expect(queryQuest?.steps).toHaveLength(1);
    expect(queryQuest?.steps[0].id).toBe('step-5-1');
    expect(validateQueryQuestSteps(quests, disconnectedOntology)).toEqual([]);
  });

  it('uses Japanese entity-based traversal wording for query steps', () => {
    const quests = generateQuestsForOntology(ontology);
    const queryQuest = quests.find((quest) => quest.id === 'quest-5');
    const traversalStep = queryQuest?.steps.find((step) => step.id === 'step-5-2');

    expect(traversalStep?.instruction).toBe('「ServiceはConfigurationItemとどうつながりますか？」と質問してください');
    expect(traversalStep?.instruction).not.toContain('Show me all is supported by connections');
  });

  it('uses display names in quest copy while retaining internal quest targets', () => {
    const localizedOntology: Ontology = {
      ...ontology,
      displayName: 'インシデント管理',
      entityTypes: ontology.entityTypes.map((entity) => ({
        ...entity,
        displayName: entity.id === 'service' ? 'サービス' : '構成アイテム',
        properties: entity.properties.map((property) =>
          property.name === 'serviceId' ? { ...property, displayName: 'サービス識別子' } : property,
        ),
      })),
      relationships: ontology.relationships.map((relationship) => ({
        ...relationship,
        displayName: 'サポートされる',
      })),
    };

    const generatedQuests = generateQuestsForOntology(localizedOntology);
    const entityQuest = generatedQuests.find((quest) => quest.id === 'quest-1');
    expect(entityQuest?.steps[0].instruction).toContain('サービス');
    expect(entityQuest?.steps[0].targetId).toBe('service');
    expect(entityQuest?.steps[1].instruction).toContain('構成アイテム');
    expect(entityQuest?.steps[1].targetId).toBe('configurationitem');

    const propertyQuest = generatedQuests.find((quest) => quest.id === 'quest-4');
    const identifierStep = propertyQuest?.steps.find((step) => step.targetType === 'property');
    expect(identifierStep?.instruction).toContain('サービス識別子');
    expect(identifierStep?.targetId).toBe('serviceId');

    const queryQuest = generatedQuests.find((quest) => quest.id === 'quest-5');
    expect(queryQuest?.steps[0].instruction).toContain('サービス');
    expect(queryQuest?.steps[1].instruction).toContain('構成アイテム');
    expect(queryQuest?.steps[2].instruction).toContain('サポートされる');
    expect(validateQueryQuestSteps(generatedQuests, localizedOntology)).toEqual([]);
  });

  it('generates Japanese authored quest content while preserving ontology values', () => {
    const generatedQuests = generateQuestsForOntology(ontology);
    const values = generatedQuests.flatMap((quest) => [
      quest.title,
      quest.description,
      quest.reward.badge,
      ...quest.steps.flatMap((step) => [step.instruction, ...(step.hint ? [step.hint] : [])]),
    ]);

    for (const value of values) {
      expect(value).toMatch(JAPANESE_TEXT);
    }
    expect(values.some((value) => value.includes('Service'))).toBe(true);
    expect(values.some((value) => value.includes('ConfigurationItem'))).toBe(true);
    expect(values.some((value) => value.includes('is supported by'))).toBe(true);
    expect(values.some((value) => value.includes('serviceId'))).toBe(true);
  });

  it('extracts queries enclosed in Japanese corner quotes', () => {
    expect(extractQueryFromInstruction('「Problemとは何ですか？」と質問してください')).toBe('Problemとは何ですか？');
  });

  it('classifies Japanese fallback responses as query-step failures', () => {
    const invalidQuest = [{
      id: 'invalid-query-quest',
      title: 'Temporary test quest',
      description: 'Temporary test quest.',
      difficulty: 'beginner' as const,
      category: 'query' as const,
      steps: [{
        id: 'invalid-query-step',
        instruction: '「まったく未知の質問」と質問してください',
        targetType: 'query' as const,
      }],
      reward: { badge: 'Temporary', badgeIcon: '🧪', points: 0 },
    }];

    const issues = validateQueryQuestSteps(invalidQuest, ontology);

    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toBe('Query step falls back to the generic uninterpretable-query response.');
  });
});
