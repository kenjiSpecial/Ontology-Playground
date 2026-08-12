---
title: "ステップ2：地理的階層"
slug: geographic-hierarchy
description: 地理的集中を分析するため、災害地域フラグを持つ地域、国、管轄区域を追加します。
order: 3
embed: official/fibo-risk-step-2
reviewStatus: under-human-review
---

## リスクが存在する場所

産業分類からは、ポートフォリオが*どの*セクターにさらされているかが分かります。地理的階層からは、そのリスクが*どこに*あるかが分かります。フロリダ州に集中するポートフォリオとカリフォルニア州に集中するポートフォリオでは、直面するリスクが異なります。前者はハリケーン、後者は地震や山火事です。

このステップでは、地理的位置を段階的な粒度で表す3つのエンティティを追加し、自然災害フラグを付与します。

## 新しいエンティティ型

### Region

大陸規模またはマクロ経済上の地域です。「北米（North America）」「欧州（Europe）」「アジア太平洋（Asia-Pacific）」などが該当します。

| プロパティ | 型 | 説明 |
|---|---|---|
| `regionCode` | string | 識別子 |
| `regionName` | string | 表示名 |
| `description` | string | 地域の説明 |
| `disasterProfile` | string | その地域で主要な災害種別 |

### Country

経済属性と規制属性を持つ国家です。

| プロパティ | 型 | 説明 |
|---|---|---|
| `countryCode` | string | 識別子（ISO国コード） |
| `countryName` | string | 表示名 |
| `economicZone` | string | 経済区分（例："developed"、"emerging"） |
| `currency` | string | 国の通貨コード |
| `regulatoryFramework` | string | 主要な銀行監督当局 |

### Jurisdiction

州や県など、国より下位の管轄区域です。災害地域を表すbooleanフラグを持ちます。

| プロパティ | 型 | 説明 |
|---|---|---|
| `code` | string | 識別子（例："FL"、"CA"） |
| `name` | string | 表示名 |
| `hurricaneZone` | boolean | ハリケーンリスクへのエクスポージャー |
| `floodZone` | boolean | 洪水リスクへのエクスポージャー |
| `earthquakeZone` | boolean | 地震リスクへのエクスポージャー |
| `wildfireZone` | boolean | 山火事リスクへのエクスポージャー |
| `coastal` | boolean | 沿岸の管轄区域かどうか |
| `latitude` | decimal | 地理上の緯度 |
| `longitude` | decimal | 地理上の経度 |

## 新しいリレーションシップ

- **inCountry**：`Jurisdiction` → `Country`（`many-to-one`）— 各管轄区域は1つの国に属します
- **inRegion**：`Jurisdiction` → `Region`（`many-to-one`）— 各管轄区域は1つの地理的地域に対応します

## 設計パターン：booleanリスクフラグ

`Jurisdiction`では、単一の"riskType"列挙値ではなく、**booleanフラグ**を使っている点に注目してください。これは、1つの管轄区域が複数の災害地域に同時に該当し得るためです。フロリダ州は`hurricaneZone`と`floodZone`の両方に該当し、カリフォルニア州は`earthquakeZone`と`wildfireZone`の両方に該当します。

このパターンにより、次のような精密な絞り込みが可能になります。

- 「`hurricaneZone = true`かつ`coastal = true`であるすべての管轄区域を表示」
- 実運用のローンデータを`Jurisdiction`へ結んだ場合、「`earthquakeZone`に該当する管轄区域での総エクスポージャーはいくらか？」

## 2つの独立した階層

この時点で、モデルには2つの独立したサブグラフがあります。

1. **産業**：Sector ← Subsector ← IndustryGroup
2. **地理**：Region ← Country（Jurisdictionを介する）およびRegion ← Jurisdiction

後のステップでは「ローン分類＋規制」の第3クラスターを追加しますが、この産業・地理クラスターとは自動的には接続されません。領域横断分析には、実運用のポートフォリオデータ側で、ローンを`IndustryGroup`、`Jurisdiction`、`LoanType`、`ConcentrationCategory`へ結ぶ関係が必要です。

## ステップ2のグラフ（ステップ1との差分）

<ontology-embed id="official/fibo-risk-step-2" diff="official/fibo-risk-step-1" height="400px"></ontology-embed>

*強調表示された3つの新しいエンティティが地理の軸を追加します。産業と地理の2つのサブグラフは独立しており、このラボの後続ステップでも両者を直接結ぶ関係は追加されません。*

```quiz
Q: Jurisdictionが単一のriskTypeプロパティではなくbooleanフラグを使うのはなぜですか？
- booleanフラグの方がデータベースに保存しやすいため
- 1つの管轄区域が複数の災害地域に同時に該当する場合があり、単一の列挙値では表現できないため [correct]
- booleanフラグの方がグラフ可視化で見やすいため
- FIBOがすべての分類子にbooleanプロパティを要求しているため
> 1つの管轄区域が複数の自然災害リスクに同時に直面することがあります。フロリダ州はハリケーンと洪水の両方が発生しやすい地域です。booleanフラグを使えば、多次元で正確に絞り込めるため、「ハリケーン地域 AND 沿岸地域 AND 洪水地域」のような複合リスクのクエリに不可欠です。
```
