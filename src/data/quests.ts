// Quest system for Ontology Playground demo

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'exploration' | 'traversal' | 'query';
  steps: QuestStep[];
  reward: {
    badge: string;
    badgeIcon: string;
    points: number;
  };
}

export interface QuestStep {
  id: string;
  instruction: string;
  targetType: 'entity' | 'relationship' | 'property' | 'query';
  targetId?: string;
  hint?: string;
}

export const quests: Quest[] = [
  {
    id: "quest-1",
    title: "Meet the Entities",
    description: "Discover the core building blocks of the Fourth Coffee ontology by exploring entity types.",
    difficulty: "beginner",
    category: "exploration",
    steps: [
      {
        id: "step-1-1",
        instruction: "Click on the Customer entity to learn about customers",
        targetType: "entity",
        targetId: "customer",
        hint: "Look for the 👤 icon in the graph"
      },
      {
        id: "step-1-2",
        instruction: "Now explore the Product entity",
        targetType: "entity",
        targetId: "product",
        hint: "Find the ☕ coffee cup icon"
      },
      {
        id: "step-1-3",
        instruction: "Finally, check out the Store entity",
        targetType: "entity",
        targetId: "store",
        hint: "Locate the 🏪 store icon"
      }
    ],
    reward: {
      badge: "Entity Explorer",
      badgeIcon: "🎖️",
      points: 100
    }
  },
  {
    id: "quest-2",
    title: "The Bean Trail",
    description: "Trace the journey of a coffee bean from supplier to customer by following relationships.",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-2-1",
        instruction: "Start at the Supplier entity - this is where beans originate",
        targetType: "entity",
        targetId: "supplier",
        hint: "Find the 🚚 truck icon"
      },
      {
        id: "step-2-2",
        instruction: "Follow the 'sourcedFrom' relationship to Product",
        targetType: "relationship",
        targetId: "product_sourced_from_supplier",
        hint: "Click the line connecting Supplier to Product"
      },
      {
        id: "step-2-3",
        instruction: "Explore the 'contains' relationship to see how products appear in orders",
        targetType: "relationship",
        targetId: "order_contains_product",
        hint: "Look at the connection between Order and Product"
      },
      {
        id: "step-2-4",
        instruction: "Finally, see the 'places' relationship showing who placed the order",
        targetType: "relationship",
        targetId: "customer_places_order",
        hint: "Find the relationship from Customer to Order"
      }
    ],
    reward: {
      badge: "Bean Detective",
      badgeIcon: "🔍",
      points: 250
    }
  },
  {
    id: "quest-3",
    title: "Supply Chain Navigator",
    description: "Understand how shipments connect suppliers to stores.",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-3-1",
        instruction: "Click on the Shipment entity",
        targetType: "entity",
        targetId: "shipment",
        hint: "Find the 📦 package icon"
      },
      {
        id: "step-3-2",
        instruction: "Explore the 'sentBy' relationship to Supplier",
        targetType: "relationship",
        targetId: "shipment_from_supplier",
        hint: "See where shipments come from"
      },
      {
        id: "step-3-3",
        instruction: "Follow the 'deliveredTo' relationship to Store",
        targetType: "relationship",
        targetId: "shipment_to_store",
        hint: "See where shipments go"
      }
    ],
    reward: {
      badge: "Supply Chain Master",
      badgeIcon: "🌐",
      points: 200
    }
  },
  {
    id: "quest-4",
    title: "Query Explorer",
    description: "Learn to ask questions using natural language queries.",
    difficulty: "advanced",
    category: "query",
    steps: [
      {
        id: "step-4-1",
        instruction: "Try asking: 'Show me all Gold tier customers'",
        targetType: "query",
        hint: "Type in the query playground"
      },
      {
        id: "step-4-2",
        instruction: "Now ask: 'Which products come from Ethiopia?'",
        targetType: "query",
        hint: "Use natural language to filter by origin"
      },
      {
        id: "step-4-3",
        instruction: "Try a traversal query: 'What orders did Arif Ramadhan place?'",
        targetType: "query",
        hint: "This follows the Customer → Order relationship"
      }
    ],
    reward: {
      badge: "Query Wizard",
      badgeIcon: "🧙",
      points: 300
    }
  },
  {
    id: "quest-5",
    title: "Data Binding Discovery",
    description: "Learn how ontology concepts connect to real data platform sources.",
    difficulty: "advanced",
    category: "exploration",
    steps: [
      {
        id: "step-5-1",
        instruction: "Select the Customer entity and view its data bindings",
        targetType: "entity",
        targetId: "customer",
        hint: "Look for the 'Data Bindings' section in the inspector"
      },
      {
        id: "step-5-2",
        instruction: "Examine how Customer properties map to source columns",
        targetType: "property",
        targetId: "name",
        hint: "Notice how 'name' maps to 'full_name' in the source"
      },
      {
        id: "step-5-3",
        instruction: "Check the Product entity's binding and note the source and table",
        targetType: "entity",
        targetId: "product",
        hint: "Look at the Data Bindings card under Product"
      }
    ],
    reward: {
      badge: "Binding Expert",
      badgeIcon: "🔗",
      points: 350
    }
  }
];

// Pre-defined NL query responses for demo
export interface QueryResponse {
  query: string;
  matches: string[];
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
}

export const nlQueryResponses: QueryResponse[] = [
  {
    query: "ゴールド会員の顧客を表示して",
    matches: ["ゴールド会員", "ゴールドの顧客", "顧客 ゴールド", "gold tier", "gold customers", "customers gold"],
    result: "ゴールド会員の顧客が1人見つかりました:\n• Arif Ramadhan (CUST-001) - 2024年からゴールド会員",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "エチオピア産の製品はどれですか",
    matches: ["エチオピア産", "エチオピアの製品", "products ethiopia", "ethiopian", "from ethiopia"],
    result: "エチオピア産の製品が1件見つかりました:\n• Ethiopian Single Origin (☕ Brewed) - $4.50\n  仕入先: Ethiopia Highlands Farm",
    highlightEntities: ["product", "supplier"],
    highlightRelationships: ["product_sourced_from_supplier"]
  },
  {
    query: "Arif Ramadhanが行った注文は何ですか",
    matches: ["arif ramadhanの注文", "arif ramadhan 注文", "what orders did arif ramadhan place", "orders arif", "arif ramadhan orders", "arif placed"],
    result: "Arif Ramadhanの注文:\n• ORD-2025-001 - $12.50 (完了)\n  商品: Ethiopian Single Origin ×2、Colombian Latte ×1\n  店舗: Downtown Seattle",
    highlightEntities: ["customer", "order", "store"],
    highlightRelationships: ["customer_places_order", "order_processed_at_store"]
  },
  {
    query: "シアトルには店舗が何店ありますか",
    matches: ["シアトルの店舗", "シアトル 店舗", "stores seattle", "seattle stores", "how many stores"],
    result: "Seattleに2店舗見つかりました:\n• Fourth Coffee - Downtown Seattle (45席)\n• Fourth Coffee - Capitol Hill (32席)",
    highlightEntities: ["store"],
    highlightRelationships: []
  },
  {
    query: "Colombian Latteのサプライチェーンを表示して",
    matches: ["サプライチェーン", "colombian latte", "supply chain", "where does colombian latte come from"],
    result: "Colombian Latteのサプライチェーン:\n• 豆の原産地: Colombia 🇨🇴\n• サプライヤー: Colombian Mountain Roasters\n• 認証: Rainforest Alliance 🌿\n• 最新の出荷: SHIP-001 (1月27日配達済み)",
    highlightEntities: ["product", "supplier", "shipment"],
    highlightRelationships: ["product_sourced_from_supplier", "shipment_from_supplier"]
  },
  {
    query: "エンティティ型とは何ですか",
    matches: ["エンティティ型とは", "エンティティとは", "what is entity", "entity type", "define entity"],
    result: "エンティティ型は、Customer、Product、Orderなど、現実世界の概念を表す再利用可能な論理モデルです。名前、説明、識別子、プロパティを標準化し、すべてのチームが同じ用語を同じ意味で利用できるようにします。",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "リレーションシップとは何ですか",
    matches: ["リレーションシップとは", "関係とは", "what is relationship", "define relationship", "relationships"],
    result: "リレーションシップは、エンティティ型を結ぶ、型と方向を持つリンクです。たとえば「Customer places Order」は、顧客と注文のつながりを定義します。数量や信頼度などの属性を持たせることもできます。",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "プラチナ会員の顧客を表示して",
    matches: ["プラチナ会員", "プラチナの顧客", "platinum", "platinum customers", "customers platinum"],
    result: "プラチナ会員の顧客が1人見つかりました:\n• Jaroslav Cerny (CUST-002) - プラチナ会員\n  累計利用額: $3,420.00\n  登録時期: 2023年1月",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "オーガニック製品をすべて表示して",
    matches: ["オーガニック製品", "有機製品", "organic", "organic products", "is organic"],
    result: "オーガニック製品が2件見つかりました:\n• Ethiopian Single Origin (Brewed) - $4.50 🌱\n• Nebula Cold Brew (Cold Brew) - $5.25 🌱",
    highlightEntities: ["product"],
    highlightRelationships: []
  }
];
