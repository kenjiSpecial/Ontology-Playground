---
title: "ステップ4：規制の文脈"
slug: regulatory-context
description: 銀行規制、集中限度、領域横断の接続を追加してモデルを完成させます。
order: 5
embed: official/fibo-risk-step-4
reviewStatus: under-human-review
---

## モデルを一巡させる

最初の3つのステップでは、産業、地理、ローン分類の参照データを構築しました。最後のステップでは、ポートフォリオの集中を制約する規制と定量的な限度からなる**規制執行層**を追加します。

これにより、オントロジーは実務で力を発揮します。個々のローンから、その集中区分、適用される規制上の限度までたどり、各限度がどの規制によって定められているかを把握できます。

## 新しいエンティティ型

### Regulation

銀行監督当局が発行する規制フレームワークです。

| プロパティ | 型 | 説明 |
|---|---|---|
| `regulationCode` | string | 識別子（例："OCC_CRE_2006"） |
| `name` | string | 規制名 |
| `issuingAuthority` | string | 発行主体（OCC、FDIC、Basel Committee） |
| `effectiveDate` | date | 発効日 |
| `scope` | string | 適用範囲 |
| `description` | string | 詳細な説明 |

### RegulatoryLimit

規制に定められた個別の定量的な閾値です。

| プロパティ | 型 | 説明 |
|---|---|---|
| `limitId` | string | 識別子 |
| `limitName` | string | 表示名 |
| `category` | string | 制約する軸 |
| `thresholdPct` | decimal (%) | 限度値 |
| `severity` | string | 違反時の措置（例："warning"、"action required"、"supervisory intervention"） |
| `description` | string | この限度の意味 |

主な例を示します。

| 限度 | 閾値 | 規制 |
|---|---|---|
| CRE集中限度 | 自己資本の300% | OCC Guidance 2006-46 |
| 気候・ハリケーン限度 | ポートフォリオの15% | 内部リスク方針 |
| 地理的集中限度 | ポートフォリオの20% | OCC Bulletin 2011-12 |
| 産業集中限度 | ポートフォリオの25% | FDIC Risk Management |

## 新しいリレーションシップ

- **mandatedBy**：`RegulatoryLimit` → `Regulation`（`many-to-one`）— 各限度を、それを定める特定の規制に対応付けます
- **limitAppliesToCategory**：`RegulatoryLimit` → `ConcentrationCategory`（`many-to-one`）— 限度を、その制約対象となる集中区分に結び付けます

## 設計パターン：領域横断の橋渡し

`limitAppliesToCategory`により、規制層は`ConcentrationCategory`を介してローン分類層に接続されます。これで、次の**領域横断クエリの経路**が完成します。

```
Jurisdiction (hurricaneZone=true)
  → [geographic dimension]
    → ConcentrationCategory
      → [regulatory dimension]
        → RegulatoryLimit (thresholdPct)
          → Regulation (issuingAuthority)
```

産業側からは、次のようにたどれます。

```
IndustryGroup (climateSensitivity="high")
  → [industry dimension]
    → Subsector → Sector
```

## 完成したモデル

最終的なオントロジーには、4つの領域にまたがる**11個のエンティティ型**と**10個のリレーションシップ**があります。

| 領域 | エンティティ | リレーションシップ |
|---|---|---|
| 産業 | Sector, Subsector, IndustryGroup | partOfSector, belongsToSubsector |
| 地理 | Region, Country, Jurisdiction | inCountry, inRegion |
| ローン分類 | ConcentrationCategory, LoanType, CollateralType | loanClassifiedAs, collateralClassifiedAs, typicallySecuredBy |
| 規制 | Regulation, RegulatoryLimit | mandatedBy, limitAppliesToCategory |

## ステップ4のグラフ（ステップ3との差分）

<ontology-embed id="official/fibo-risk-step-4" diff="official/fibo-risk-step-3" height="480px"></ontology-embed>

*2つの新しいエンティティ（RegulationとRegulatoryLimit）がモデルを完成させます。limitAppliesToCategoryリレーションシップが、規制執行とローン分類を橋渡しします。*

## 外部の完全な参照オントロジー

外部カタログでは、各領域を個別に確認することもできます。

- [FIBO産業分類](/#/catalogue/external/fibo/industry-classification)
- [FIBO地理的階層](/#/catalogue/external/fibo/geographic-hierarchy)
- [FIBOローン分類](/#/catalogue/external/fibo/loan-classification)
- [FIBO規制コンテキスト](/#/catalogue/external/fibo/regulatory-context)

## 構築したもの

これで、FIBOを参考にした包括的なリスク管理オントロジーが完成しました。このモデルでは、次の分析が可能です。

- **産業集中分析** — セクター、サブセクター、産業グループごとにエクスポージャーをロールアップします
- **地理的リスク評価** — 災害地域フラグで絞り込み、ポートフォリオデータと相互参照します
- **Basel III自己資本計算** — ローン種別に標準リスクウェイトを適用します
- **規制遵守の監視** — ポートフォリオの集中度を規制上の限度と照合します

このモデルを使えば、従来のデータウェアハウスでは複数テーブルの複雑なJOINが必要になる領域横断のリスククエリを、オントロジー駆動システムの単純なグラフ探索として表現できます。

## ライセンス

このラボで参照するすべてのFIBOオントロジーコンテンツには、次の条件が適用されます。

- **Copyright** (c) 2016-2025 EDM Council, Inc. and Object Management Group, Inc.
- [MIT License](https://opensource.org/licenses/MIT)のもとで**ライセンス許諾**されています

```quiz
Q: 完成したモデルでConcentrationCategoryはどのような役割を果たしますか？
- 地理座標を格納する
- ローン分類、担保種別、規制上の限度を領域横断で接続するハブエンティティとして機能する [correct]
- 各ローンのBaselリスクウェイトを定義する
- 規制遵守の追跡においてRegulationエンティティを置き換える
> ConcentrationCategoryは、ローン分類領域と規制領域を橋渡しする中心的なハブです。LoanTypeとCollateralTypeはどちらもこのエンティティに分類され、RegulatoryLimitはこのエンティティを制約します。そのため、領域横断の集中リスククエリで重要なノードになります。
```
