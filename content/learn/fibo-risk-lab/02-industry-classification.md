---
title: "ステップ1：産業分類"
slug: industry-classification
description: Sector、Subsector、IndustryGroupに気候感応度と景気循環性の属性を加え、経済活動の階層をモデル化します。
order: 2
embed: official/fibo-risk-step-1
reviewStatus: under-human-review
---

## 産業を分類する理由

銀行は、経済セクターごとのエクスポージャーを把握する必要があります。ポートフォリオのローンの40%が建設会社向けであれば、住宅市場の低迷によって深刻な影響を受ける可能性があります。**NAICS**（North American Industry Classification System、北米産業分類システム）は、FIBOの基礎となる標準分類体系を提供しています。

このステップでは、リスクに関係する属性を持つ3階層、Sector → Subsector → IndustryGroupをモデル化します。

## エンティティ型

### Sector

最も大きな分類です。「製造業（Manufacturing）」「金融（Finance）」「医療（Healthcare）」などが該当します。

| プロパティ | 型 | 説明 |
|---|---|---|
| `sectorCode` | string | 識別子（例："31-33"） |
| `sectorName` | string | 表示名 |
| `description` | string | このセクターが対象とする範囲 |

### Subsector

セクターを細分化した分類です。たとえば「製造業（Manufacturing）」内の「食品製造業（Food Manufacturing）」が該当します。

| プロパティ | 型 | 説明 |
|---|---|---|
| `subsectorCode` | string | 識別子（例："311"） |
| `subsectorName` | string | 表示名 |

### IndustryGroup

最も細かい分類で、ポートフォリオ分析に重要なリスク属性を持ちます。

| プロパティ | 型 | 説明 |
|---|---|---|
| `naicsCode` | string | 識別子（公式NAICSコード） |
| `name` | string | 産業名 |
| `cyclicality` | string | 景気循環への感応度（例："high"、"low"、"counter-cyclical"） |
| `climateSensitivity` | string | 気候事象へのエクスポージャー（例："high"、"moderate"、"low"） |
| `essentialServices` | boolean | 産業が必須サービスを提供するかどうか（回復力の指標） |
| `description` | string | 産業の説明 |

## リレーションシップ

- **partOfSector**：`Subsector` → `Sector`（`many-to-one`）— 各サブセクターは、必ず1つのセクターに属します
- **belongsToSubsector**：`IndustryGroup` → `Subsector`（`many-to-one`）— 各産業グループは、1つのサブセクターに属します

これにより、`Sector` ← `Subsector` ← `IndustryGroup`という厳密な階層が形成されます。

## 設計パターン：分類階層

これはオントロジーで最も一般的なパターンの1つです。各子要素が親を1つだけ持つ、**厳密なツリー階層**です。次の分析が可能になります。

- **ロールアップ集計**：実運用のローンデータを`IndustryGroup`へ結んだ場合、ある`Subsector`に属する産業グループ向けのローンを合計し、サブセクターのエクスポージャーを算出します
- **ドリルダウン分析**：`Sector`階層から`Subsector`へ、さらに個々の`IndustryGroup`へと掘り下げます
- **上位区分の文脈を使った解釈**：`IndustryGroup`から`Subsector`、`Sector`へたどり、上位区分の景気循環性を集計や共通のリスク文脈として利用します。属性が子要素へ自動継承されるわけではありません

## ステップ1のグラフ

<ontology-embed id="official/fibo-risk-step-1" height="340px"></ontology-embed>

*3つのエンティティが分類ツリーを形成します。これは産業集中分析の基礎となるパターンです。*

```quiz
Q: IndustryGroupにclimateSensitivityプロパティがあるのはなぜですか？
- 産業の炭素排出量を追跡するため
- ハリケーンや山火事などの気候事象へのエクスポージャーで産業を絞り込む、ポートフォリオリスクのクエリを可能にするため [correct]
- ESG報告要件に準拠するため
- ローンの保険料を計算するため
> climateSensitivityプロパティにより、気候関連事象の影響を受けやすい産業を識別できます。貸出ポートフォリオの影響範囲を特定し、次のステップの地理データと横断して照会するには、実運用データ側でローンとIndustryGroup、Jurisdictionを結ぶ関係が必要です。
```
