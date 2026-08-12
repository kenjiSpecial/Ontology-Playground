---
title: "リスク伝播モデル"
slug: risk-propagation-model
description: "サプライヤーへの影響から部品のリスク、製品のリスク、緩和策へと寸断が連鎖する仕組みを、7つのリレーションシップを通して理解します。"
order: 3
---

## 連鎖を表す7つのリレーションシップ

このオントロジーの力はリレーションシップにあります。リレーションシップは、サプライチェーン内で影響が伝わる仕組みを表します。データ エージェントはこれらの経路をたどり、**「このサプライヤーの供給停止によって、いくつの製品ラインがリスクにさらされていますか？」**といった質問に答えます。

### 1. **Supplier supplies Component**（一対多）

```
Supplier "ChipX Corp"
  supplies→ Component "GPUモジュール"
         → Component "メモリーボード"
         → Component "電源ユニット"
```

- **重要な理由**：1社のサプライヤーが寸断すると、そのサプライヤーに依存するすべての部品が影響を受けます
- **クエリ例**：**「台湾のサプライヤーから調達している部品をすべて示してください。」**

### 2. **Component used in ProductLine**（多対多）

```
Component "GPUモジュール"
  usedIn→ ProductLine "ゲーミング ノートPC 2024"
       → ProductLine "Workstation Pro"
       → ProductLine "Tablet Plus"
```

- **重要な理由**：1つの部品を供給できなくなるだけで、複数の製品ラインが停止する可能性があります
- **クエリ例**：**「この部品に依存する製品ラインはいくつありますか？」**

### 3. **DisruptionEvent affects Supplier**（多対多）

```
DisruptionEvent "台湾の停電 2024-05-01"
  affects→ Supplier "ChipX Corp"
        → Supplier "Memory Inc"
```

- **重要な理由**：1件の災害が複数のサプライヤーを同時に襲う可能性があります
- **クエリ例**：**「洪水区域内にあるサプライヤーはどれですか？」**

### 4. **DisruptionEvent triggers RiskAssessment**（一対多）

```
DisruptionEvent "台湾の停電"
  triggers→ RiskAssessment "ゲーミング ノートPC - 影響分析"
         → RiskAssessment "Workstation - 影響分析"
```

- **重要な理由**：各寸断によって、影響を受ける製品ラインごとの詳細な影響分析が開始されます
- **クエリ例**：**「この寸断によってリスクにさらされる売上の合計はいくらですか？」**

### 5. **RiskAssessment recommends MitigationAction**（一対多）

```
RiskAssessment "ゲーミング ノートPC - 影響分析"
  recommends→ MitigationAction "代替サプライヤーXを稼働"
           → MitigationAction "安全在庫を増やす"
           → MitigationAction "部品を再設計"
```

- **重要な理由**：各影響分析から、優先順位を付けた対策一覧が得られます
- **クエリ例**：**「寸断の影響を最小限に抑える最善の対策は何ですか？」**

### 6. **MitigationAction activates AlternativeSupplier**（多対多）

```
MitigationAction "代替サプライヤーXを稼働"
  activates→ AlternativeSupplier "ChipX Europe"
          → AlternativeSupplier "SemiCorp Japan"
```

- **重要な理由**：1件の対策で、複数の代替供給先を同時に稼働させられます
- **クエリ例**：**「供給を引き継げる事前認定済みサプライヤーはどれですか？」**

### 7. **AlternativeSupplier canReplace Supplier**（多対一）

```
AlternativeSupplier "ChipX Europe"
  canReplace→ Supplier "ChipX Corp"

AlternativeSupplier "SemiCorp Japan"
  canReplace→ Supplier "ChipX Corp"
```

- **重要な理由**：重要なサプライヤーに対して、認定済みの代替先を複数確保できます
- **クエリ例**：**「このサプライヤーには認定済みの代替先がありますか？」**

## 寸断が連鎖する完全な例

実際のシナリオに沿って影響をたどってみましょう。

```
寸断
│
├─ 台湾の停電（2024-05-01、深刻度Critical）
│
├─ 影響を与える
│  └─ Supplier "ChipX Corp" (singleSourced=true)
│     ├─ 供給する
│     │  ├─ Component "GPUモジュール" (daysOfSupplyOnHand=3)
│     │  │  ├─ 使用される
│     │  │  │  ├─ ProductLine "ゲーミング ノートPC 2024"（年間売上$50M）
│     │  │  │  ├─ ProductLine "Workstation Pro"（年間売上$30M）
│     │  │  │
│     │  │  └─ RiskAssessmentを開始
│     │  │     ├─ revenueAtRisk=$80M
│     │  │     ├─ timeToImpactDays=3
│     │  │     │
│     │  │     └─ 提案する
│     │  │        ├─ MitigationAction "ChipX Europeを稼働"
│     │  │        │  ├─ estimatedCost=$2M
│     │  │        │  ├─ leadTimeSavedDays=2
│     │  │        │  │
│     │  │        │  └─ 稼働させる
│     │  │        │     ├─ AlternativeSupplier "ChipX Europe" 
│     │  │        │     │  ├─ qualificationStatus=Approved
│     │  │        │     │  ├─ capacityAvailable=50,000単位/月
│     │  │        │     │  ├─ pricePremiumPercent=12%
│     │  │        │     │  │
│     │  │        │     │  └─ 代替できる
│     │  │        │     │     └─ Supplier "ChipX Corp"
│     │  │        │     │
│     │  │        │     └─ AlternativeSupplier "SemiCorp Japan"
│     │  │        │        └─ （第2候補）
│     │  │        │
│     │  │        └─ MitigationAction "安全在庫を増やす"
│     │  │           └─ estimatedCost=$500K
│     │  │
│     │  └─ Component "メモリーボード"
│     │     └─ （同様に連鎖）
```

## この構造で自動化できる理由

これでデータ エージェントは次の処理を実行できます。

1. **検知** — **「これらのサプライヤーとこの地域を監視してください。」**
2. **追跡** — **「ChipX Corpで問題が発生したら、影響を受ける14の製品ラインすべてへ自動的にたどってください。」**
3. **定量化** — **「リスクにさらされる売上の合計（8,000万ドル）と影響発生までの日数（3日）を計算してください。」**
4. **提案** — **「8,000万ドルの損失に対し、200万ドルの費用で2日短縮できる事前認定済みの代替先を稼働させてください。」**
5. **実行** — **「調達アラートを送信し、生産スケジュールを更新して、関係者へ通知してください。」**
6. **学習** — **「実際に効果があった対策と、影響の実績と見積もりの差を追跡してください。」**

## カーディナリティの規則

| リレーションシップ | カーディナリティ | 理由 |
|---|---|---|
| Supplier → Component | 1:N | 1社のサプライヤーが多数の部品を供給できるため |
| Component → ProductLine | M:N | 部品は再利用され、複数の製品が部品を共有するため |
| Disruption → Supplier | M:N | 1件の災害が複数のサプライヤーを襲い、1社も複数の脅威に直面するため |
| Disruption → Assessment | 1:N | 各寸断から、影響を受ける製品ラインごとの評価が作られるため |
| Assessment → Action | 1:N | 各評価が複数の対策を提案するため |
| Action → Alternative | M:N | 1件の対策で複数の代替先を稼働でき、1つの代替先も複数の状況へ対応できるため |
| Alternative → Supplier | M:1 | 1社の主要サプライヤーに対して、事前認定済みの代替先を複数用意できるため |

次に、このモデルを使って緩和ワークフローを実行する方法を見ていきます。
