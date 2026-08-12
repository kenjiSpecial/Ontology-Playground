---
title: "中核エンティティとプロパティ"
slug: core-entities
description: "サプライヤーや部品からリスク評価、緩和策まで、サプライチェーンの寸断をモデル化する7つのエンティティ型と40個のプロパティを学びます。"
order: 2
---

## 7つのエンティティ型

このオントロジーは、引き金となる事象から、検知、評価、対応に至るサプライチェーン寸断のライフサイクル全体を表します。

### 第1層：供給網

**Supplier**
- 原材料や部品を供給する外部企業を表します
- 主要プロパティ：`supplierId`（一意）、`name`、`country`、`tier`（Tier 1/2/3）、`reliabilityScore`（0〜100）、`singleSourced`（boolean）
- ユースケース：リスクを増幅する、重要な単一調達先サプライヤーの特定

**Component**
- 1社以上のサプライヤーから調達する部品、材料、またはサブアセンブリです
- 主要プロパティ：`componentId`、`name`、`category`（Electronic/Mechanical/Chemical/Packaging/Raw Material）、`daysOfSupplyOnHand`、`criticalityLevel`（Critical/High/Medium/Low）
- ユースケース：安全在庫を基に、サプライヤーの供給停止に耐えられる部品の追跡

**ProductLine**
- 共通部品を使用する完成品のグループです
- 主要プロパティ：`productLineId`、`name`、`annualRevenue`、`marketSegment`、`productionStatus`（Active/At Risk/Halted/Discontinued）
- ユースケース：リスクにさらされる売上と、生産スケジュールへの影響の計算

### 第2層：寸断

**DisruptionEvent**
- 1社以上のサプライヤーからの通常供給を停止させる、または脅かす事象です
- 主要プロパティ：`eventId`、`type`（Natural Disaster/Geopolitical/Financial/Logistics/Quality Recall/Pandemic/Cyber Attack）、`severity`（Critical/High/Medium/Low）、`startDate`、`estimatedDurationDays`、`region`
- ユースケース：分類と深刻度に基づく、エスカレーション レベルと対応期限の決定

### 第3層：分析

**RiskAssessment**
- 寸断がサプライチェーンへ影響した場合の事業影響を分析します
- 主要プロパティ：`assessmentId`、`assessedDate`（datetime）、`revenueAtRisk`（USD）、`timeToImpactDays`、`confidenceLevel`（High/Medium/Low）、`recommendedAction`
- ユースケース：金額と時間という事業上の尺度で影響を定量化し、対応の優先順位を決定

**MitigationAction**
- 寸断の影響を軽減または解消する具体的な手段です
- 主要プロパティ：`actionId`、`type`（Activate Alternative Supplier/Increase Safety Stock/Redesign Component/Reduce Production/Expedite Shipment/Customer Communication）、`status`（Proposed/Approved/In Progress/Completed/Cancelled）、`estimatedCost`（USD）、`leadTimeSavedDays`
- ユースケース：実施済みの対策と、実績と見積もりを比較した有効性の追跡

### 第4層：代替供給源

**AlternativeSupplier**
- 主要サプライヤーを代替できる、認定済みの予備サプライヤーです
- 主要プロパティ：`altSupplierId`、`name`、`country`、`qualificationStatus`（Pre-qualified/Approved/Pending Audit/Not Qualified）、`capacityAvailable`（単位/月）、`pricePremiumPercent`（%）
- ユースケース：供給能力とコストへの影響が既知の代替先を迅速に稼働

## プロパティの型と検証

各プロパティには型があり、AIエージェントやダッシュボードでの扱い方が決まります。

| 型 | 例 | エージェントでの用途 |
|------|---------|---------------|
| `string` | サプライヤー名、部品カテゴリー | 検索、絞り込み、レポート作成 |
| `integer` | 在庫日数、供給能力、数量 | しきい値に基づくアラート |
| `decimal` | 売上、価格プレミアム、信頼性スコア | 費用対効果の計算 |
| `date` | 寸断の開始日 | 時系列の比較 |
| `datetime` | リスク評価のタイムスタンプ | 監査証跡、傾向分析 |
| `enum` | サプライヤー階層、寸断の種類、深刻度 | 分類、意思決定ツリー |
| `boolean` | 単一調達フラグ | リスクのフラグ付け |

## 識別子プロパティ

各エンティティには一意の識別子があります。

```
Supplier → supplierId（例："SUPP-00456"）
Component → componentId（例："COMP-SEM-0821"）
ProductLine → productLineId（例："PL-LAP-2024"）
DisruptionEvent → eventId（例："DISR-202405-TAIWAN-001"）
RiskAssessment → assessmentId（例："RA-20240501-SEM-001"）
MitigationAction → actionId（例："MA-20240501-ALT-SUPP"）
AlternativeSupplier → altSupplierId（例："ALTSUPP-00789"）
```

クエリやレポートでは、これらのIDを使って特定のインスタンスを参照します。

## カーディナリティとリレーションシップ

エンティティは、カーディナリティが定義されたリレーションシップで接続されます。

- **一対多**：1社のサプライヤーが多数の部品を供給し、1件の寸断が多数のサプライヤーに影響します
- **多対多**：部品は多数の製品ラインで使われ、緩和策は多数の代替サプライヤーを稼働させます
- **多対一**：複数の代替サプライヤーが1社の主要サプライヤーを代替できます

次に、リレーションシップの全体像を詳しく見ていきます。
