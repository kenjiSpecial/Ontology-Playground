// Dynamic Quest Generator - Creates quests based on the loaded ontology

import type { Ontology } from './ontology';
import type { Quest, QuestStep } from './quests';
import { getDisplayName } from '../lib/displayText';

/**
 * Generates a set of quests dynamically based on the current ontology structure.
 * Quests adapt to entity types, relationships, and properties in the loaded ontology.
 */
export function generateQuestsForOntology(ontology: Ontology): Quest[] {
  const quests: Quest[] = [];
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  // Quest 1: Meet the Entities (always generated)
  if (entities.length >= 2) {
    const explorationSteps: QuestStep[] = entities.slice(0, Math.min(4, entities.length)).map((entity, index) => ({
      id: `step-1-${index + 1}`,
      instruction: `${getDisplayName(entity)}エンティティを選択してプロパティを学びましょう`,
      targetType: 'entity' as const,
      targetId: entity.id,
      hint: `グラフで${entity.icon}アイコンを探してください`
    }));

    quests.push({
      id: "quest-1",
      title: "エンティティとの出会い",
      description: `${getDisplayName(ontology)}オントロジーの中核となるエンティティ型を見つけましょう。`,
      difficulty: "beginner",
      category: "exploration",
      steps: explorationSteps,
      reward: {
        badge: "エンティティ探検家",
        badgeIcon: "🎖️",
        points: 100
      }
    });
  }

  // Quest 2: Relationship Navigator
  if (relationships.length >= 2) {
    const relSteps: QuestStep[] = [];
    const usedEntities = new Set<string>();

    // Try to find a chain of relationships
    for (const rel of relationships.slice(0, 3)) {
      const sourceEntity = entities.find(e => e.id === rel.from);
      const targetEntity = entities.find(e => e.id === rel.to);

      if (sourceEntity && !usedEntities.has(sourceEntity.id)) {
        relSteps.push({
          id: `step-2-${relSteps.length + 1}`,
          instruction: `${getDisplayName(sourceEntity)}エンティティから始めましょう`,
          targetType: 'entity',
          targetId: sourceEntity.id,
          hint: `${sourceEntity.icon}アイコンを探してください`
        });
        usedEntities.add(sourceEntity.id);
      }

      relSteps.push({
        id: `step-2-${relSteps.length + 1}`,
        instruction: `${getDisplayName(rel)}リレーションシップをたどりましょう${targetEntity ? `（目的地: ${getDisplayName(targetEntity)}）` : ''}`,
        targetType: 'relationship',
        targetId: rel.id,
        hint: `「${getDisplayName(rel)}」と表示された線を選択してください`
      });
    }

    if (relSteps.length >= 2) {
      quests.push({
        id: "quest-2",
        title: "リレーションシップ案内人",
        description: `${getDisplayName(ontology)}のエンティティ間の接続をたどりましょう。`,
        difficulty: "intermediate",
        category: "traversal",
        steps: relSteps,
        reward: {
          badge: "接続の達人",
          badgeIcon: "🔗",
          points: 200
        }
      });
    }
  }

  // Quest 3: Find the Hub - identify the most connected entity
  const connectionCount: Record<string, number> = {};
  for (const entity of entities) {
    connectionCount[entity.id] = relationships.filter(
      r => r.from === entity.id || r.to === entity.id
    ).length;
  }
  
  const sortedByConnections = entities
    .map(e => ({ entity: e, connections: connectionCount[e.id] || 0 }))
    .sort((a, b) => b.connections - a.connections);

  if (sortedByConnections.length >= 2 && sortedByConnections[0].connections >= 2) {
    const hub = sortedByConnections[0].entity;
    const connectedRels = relationships.filter(
      r => r.from === hub.id || r.to === hub.id
    ).slice(0, 3);

    const hubSteps: QuestStep[] = [
      {
        id: "step-3-1",
        instruction: `このオントロジーで最も接続の多い${getDisplayName(hub)}エンティティを見つけてください`,
        targetType: 'entity',
        targetId: hub.id,
        hint: `${getDisplayName(hub)}には${connectionCount[hub.id]}件の接続があります`
      }
    ];

    connectedRels.forEach((rel, i) => {
      hubSteps.push({
        id: `step-3-${i + 2}`,
        instruction: `${getDisplayName(rel)}リレーションシップを探索してください`,
        targetType: 'relationship',
        targetId: rel.id,
        hint: `${rel.from === hub.id ? `${getDisplayName(hub)}から始まります` : `${getDisplayName(hub)}へ接続します`}`
      });
    });

    quests.push({
      id: "quest-3",
      title: "ハブを探せ",
      description: `${getDisplayName(ontology)}で最も接続の多いエンティティを見つけましょう。`,
      difficulty: "intermediate",
      category: "exploration",
      steps: hubSteps,
      reward: {
        badge: "ハブ探偵",
        badgeIcon: "🔍",
        points: 200
      }
    });
  }

  // Quest 4: Property Detective - explore entity properties
  const entitiesWithManyProps = entities
    .filter(e => e.properties.length >= 3)
    .slice(0, 2);

  if (entitiesWithManyProps.length >= 1) {
    const propSteps: QuestStep[] = [];
    
    for (const entity of entitiesWithManyProps) {
      propSteps.push({
        id: `step-4-${propSteps.length + 1}`,
        instruction: `${getDisplayName(entity)}エンティティを選択し、${entity.properties.length}件のプロパティを確認してください`,
        targetType: 'entity',
        targetId: entity.id,
        hint: `インスペクターでプロパティの詳細を確認してください`
      });

      const identifierProp = entity.properties.find(p => p.isIdentifier);
      if (identifierProp) {
        propSteps.push({
          id: `step-4-${propSteps.length + 1}`,
          instruction: `${getDisplayName(entity)}で識別子プロパティ${getDisplayName(identifierProp)}を見つけてください`,
          targetType: 'property',
          targetId: identifierProp.name,
          hint: `識別子を示す鍵アイコン🔑を探してください`
        });
      }
    }

    quests.push({
      id: "quest-4",
      title: "プロパティ探偵",
      description: `各エンティティ型を定義するプロパティを学びましょう。`,
      difficulty: "intermediate",
      category: "exploration",
      steps: propSteps,
      reward: {
        badge: "データ研究者",
        badgeIcon: "📊",
        points: 250
      }
    });
  }

  // Quest 5: Query Explorer (always available)
  const sampleEntities = entities.slice(0, 2);
  const querySteps: QuestStep[] = [
    {
      id: "step-5-1",
      instruction: `「${sampleEntities[0] ? getDisplayName(sampleEntities[0]) : 'エンティティ'}とは何ですか？」と質問してください`,
      targetType: 'query',
      hint: "自然言語クエリの入力欄に入力してください"
    }
  ];

  const connectedRelationship = relationships.find((relationship) =>
    entities.some((entity) => entity.id === relationship.from) &&
    entities.some((entity) => entity.id === relationship.to)
  );

  if (connectedRelationship) {
    const fromEntity = entities.find((entity) => entity.id === connectedRelationship.from)!;
    const toEntity = entities.find((entity) => entity.id === connectedRelationship.to)!;
    querySteps.push({
      id: "step-5-2",
      instruction: `「${getDisplayName(fromEntity)}は${getDisplayName(toEntity)}とどうつながりますか？」と質問してください`,
      targetType: 'query',
      hint: "エンティティ間のリレーションシップを探索してください"
    });
    querySteps.push({
      id: "step-5-3",
      instruction: `「${getDisplayName(connectedRelationship)}リレーションシップはどうつながりますか？」と質問してください`,
      targetType: 'query',
      hint: `「${getDisplayName(connectedRelationship)}」リレーションシップをたどります`
    });
  }

  quests.push({
    id: "quest-5",
    title: "クエリ探検家",
    description: "自然言語クエリで質問する方法を学びましょう。",
    difficulty: "advanced",
    category: "query",
    steps: querySteps,
    reward: {
      badge: "クエリの魔法使い",
      badgeIcon: "🧙",
      points: 300
    }
  });

  // Quest 6: Full Traversal - go through a chain of entities
  if (relationships.length >= 3) {
    // Try to find a chain: A -> B -> C
    let chain: { entities: typeof entities[0][], rels: typeof relationships[0][] } | null = null;

    for (const startRel of relationships) {
      const midEntity = entities.find(e => e.id === startRel.to);
      if (!midEntity) continue;

      const nextRel = relationships.find(r => r.from === midEntity.id && r.id !== startRel.id);
      if (!nextRel) continue;

      const endEntity = entities.find(e => e.id === nextRel.to);
      if (!endEntity) continue;

      const startEntity = entities.find(e => e.id === startRel.from);
      if (!startEntity) continue;

      chain = {
        entities: [startEntity, midEntity, endEntity],
        rels: [startRel, nextRel]
      };
      break;
    }

    if (chain) {
      const chainSteps: QuestStep[] = [
        {
          id: "step-6-1",
          instruction: `${getDisplayName(chain.entities[0])}から旅を始めましょう`,
          targetType: 'entity',
          targetId: chain.entities[0].id,
          hint: `${chain.entities[0].icon}アイコンを探してください`
        },
        {
          id: "step-6-2",
          instruction: `${getDisplayName(chain.rels[0])}をたどって${getDisplayName(chain.entities[1])}へ進みましょう`,
          targetType: 'relationship',
          targetId: chain.rels[0].id,
          hint: "接続する線を選択してください"
        },
        {
          id: "step-6-3",
          instruction: `${getDisplayName(chain.entities[1])}エンティティを探索してください`,
          targetType: 'entity',
          targetId: chain.entities[1].id,
          hint: `ここが旅の中間地点です`
        },
        {
          id: "step-6-4",
          instruction: `${getDisplayName(chain.rels[1])}をたどって${getDisplayName(chain.entities[2])}へ進みましょう`,
          targetType: 'relationship',
          targetId: chain.rels[1].id,
          hint: "あと1つの接続です！"
        },
        {
          id: "step-6-5",
          instruction: `到着しました！${getDisplayName(chain.entities[2])}を探索してください`,
          targetType: 'entity',
          targetId: chain.entities[2].id,
          hint: `旅は完了です！${chain.entities[2].icon}`
        }
      ];

      quests.push({
        id: "quest-6",
        title: "完全な旅路",
      description: `${getDisplayName(chain.entities[0])}から${getDisplayName(chain.entities[2])}までたどりましょう。`,
        difficulty: "advanced",
        category: "traversal",
        steps: chainSteps,
        reward: {
          badge: "経路の開拓者",
          badgeIcon: "🗺️",
          points: 350
        }
      });
    }
  }

  return quests;
}

/**
 * Get a domain-specific badge icon based on ontology category/name
 */
export function getOntologyThemeIcon(ontologyName: string): string {
  const name = ontologyName.toLowerCase();
  if (name.includes('health') || name.includes('medical') || name.includes('patient')) return '🏥';
  if (name.includes('commerce') || name.includes('retail') || name.includes('shop')) return '🛒';
  if (name.includes('bank') || name.includes('financ')) return '🏦';
  if (name.includes('manufactur') || name.includes('factory') || name.includes('production')) return '🏭';
  if (name.includes('university') || name.includes('education') || name.includes('school')) return '🎓';
  if (name.includes('coffee') || name.includes('cosmic')) return '☕';
  return '🔷';
}
