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
    title: "エンティティとの出会い",
    description: "Fourth Coffeeオントロジーの中核となるエンティティ型を探索します。",
    difficulty: "beginner",
    category: "exploration",
    steps: [
      {
        id: "step-1-1",
        instruction: "Customerエンティティを選択して顧客について学びましょう",
        targetType: "entity",
        targetId: "customer",
        hint: "グラフで👤アイコンを探してください"
      },
      {
        id: "step-1-2",
        instruction: "次にProductエンティティを探索しましょう",
        targetType: "entity",
        targetId: "product",
        hint: "☕コーヒーカップのアイコンを探してください"
      },
      {
        id: "step-1-3",
        instruction: "最後にStoreエンティティを確認しましょう",
        targetType: "entity",
        targetId: "store",
        hint: "🏪店舗アイコンを見つけてください"
      }
    ],
    reward: {
      badge: "エンティティ探検家",
      badgeIcon: "🎖️",
      points: 100
    }
  },
  {
    id: "quest-2",
    title: "コーヒー豆の道のり",
    description: "リレーションシップをたどり、コーヒー豆がサプライヤーから顧客へ届くまでを追跡します。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-2-1",
        instruction: "豆の出発点となるSupplierエンティティから始めましょう",
        targetType: "entity",
        targetId: "supplier",
        hint: "🚚トラックのアイコンを探してください"
      },
      {
        id: "step-2-2",
        instruction: "sourcedFromリレーションシップをたどってProductへ進みましょう",
        targetType: "relationship",
        targetId: "product_sourced_from_supplier",
        hint: "SupplierとProductを結ぶ線を選択してください"
      },
      {
        id: "step-2-3",
        instruction: "containsリレーションシップを探索し、製品が注文に含まれる仕組みを確認しましょう",
        targetType: "relationship",
        targetId: "order_contains_product",
        hint: "OrderとProductの接続を確認してください"
      },
      {
        id: "step-2-4",
        instruction: "最後にplacesリレーションシップで誰が注文したか確認しましょう",
        targetType: "relationship",
        targetId: "customer_places_order",
        hint: "CustomerからOrderへのリレーションシップを探してください"
      }
    ],
    reward: {
      badge: "豆の探偵",
      badgeIcon: "🔍",
      points: 250
    }
  },
  {
    id: "quest-3",
    title: "サプライチェーン案内人",
    description: "出荷がサプライヤーと店舗をどのようにつなぐか理解します。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-3-1",
        instruction: "Shipmentエンティティを選択してください",
        targetType: "entity",
        targetId: "shipment",
        hint: "📦荷物のアイコンを探してください"
      },
      {
        id: "step-3-2",
        instruction: "SupplierへのsentByリレーションシップを探索しましょう",
        targetType: "relationship",
        targetId: "shipment_from_supplier",
        hint: "出荷元を確認してください"
      },
      {
        id: "step-3-3",
        instruction: "StoreへのdeliveredToリレーションシップをたどりましょう",
        targetType: "relationship",
        targetId: "shipment_to_store",
        hint: "出荷先を確認してください"
      }
    ],
    reward: {
      badge: "サプライチェーンの達人",
      badgeIcon: "🌐",
      points: 200
    }
  },
  {
    id: "quest-4",
    title: "クエリ探検家",
    description: "自然言語クエリで質問する方法を学びます。",
    difficulty: "advanced",
    category: "query",
    steps: [
      {
        id: "step-4-1",
        instruction: "「ゴールド会員の顧客を表示して」と質問してください",
        targetType: "query",
        hint: "クエリ入力欄に入力してください"
      },
      {
        id: "step-4-2",
        instruction: "次に「エチオピア産の製品はどれですか」と質問してください",
        targetType: "query",
        hint: "自然な言葉で原産地を指定してください"
      },
      {
        id: "step-4-3",
        instruction: "「Arif Ramadhanが行った注文は何ですか」とたどる質問をしてください",
        targetType: "query",
        hint: "Customer → Orderリレーションシップをたどります"
      }
    ],
    reward: {
      badge: "クエリの魔法使い",
      badgeIcon: "🧙",
      points: 300
    }
  },
  {
    id: "quest-5",
    title: "データ バインディングの発見",
    description: "オントロジーの概念と実際のデータプラットフォームの接続を学びます。",
    difficulty: "advanced",
    category: "exploration",
    steps: [
      {
        id: "step-5-1",
        instruction: "Customerエンティティを選択してデータ バインディングを確認してください",
        targetType: "entity",
        targetId: "customer",
        hint: "インスペクターの「データ バインディング」セクションを探してください"
      },
      {
        id: "step-5-2",
        instruction: "Customerのプロパティとソース列の対応を確認してください",
        targetType: "property",
        targetId: "name",
        hint: "ソースでnameがfull_nameに対応する点に注目してください"
      },
      {
        id: "step-5-3",
        instruction: "Productエンティティのバインディングを確認し、ソースとテーブルを把握してください",
        targetType: "entity",
        targetId: "product",
        hint: "Productの「データ バインディング」カードを確認してください"
      }
    ],
    reward: {
      badge: "バインディングの専門家",
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
