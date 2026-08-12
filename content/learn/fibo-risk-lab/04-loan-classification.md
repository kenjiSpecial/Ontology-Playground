---
title: "ステップ3：ローン分類"
slug: loan-classification
description: Baselリスクウェイトを持つローン種別、担保区分、OCC/FDICの集中区分を追加します。
order: 4
embed: official/fibo-risk-step-3
reviewStatus: under-human-review
---

## 商品の軸

ここまでに、リスクが*どこに*あるかを地理で、*どのセクター*にエクスポージャーがあるかを産業でモデル化しました。ここでは、ローンの種別、担保、該当する規制上の集中区分を表す**ローン商品の軸**を追加します。

ここで、Basel IIIのリスクウェイトがモデルに加わります。

## 新しいエンティティ型

### ConcentrationCategory

OCC/FDICのガイダンスで定義された規制上の区分です。銀行は区分ごとにエクスポージャーを監視する必要があります。

| プロパティ | 型 | 説明 |
|---|---|---|
| `categoryId` | string | 識別子（例："CRE"、"C&I"、"CONSUMER"） |
| `name` | string | 表示名 |
| `description` | string | この区分に含まれる対象 |
| `occGuidance` | string | 関連するOCC/FDICガイダンスへの参照 |

区分の例には、**CRE**（商業用不動産）、**C&I**（商工業）、**Consumer**（消費者向け）、**Agriculture**（農業）があります。

### LoanType

Basel IIIの自己資本要件が適用される個別のローン商品です。

| プロパティ | 型 | 説明 |
|---|---|---|
| `loanTypeCode` | string | 識別子（例："residential_mortgage"） |
| `name` | string | 表示名 |
| `baselRiskWeight` | decimal (%) | Basel III標準的手法のリスクウェイト |
| `regulatoryTreatment` | string | 監督当局による商品の分類 |
| `capitalTier` | string | 自己資本上の取扱区分 |
| `description` | string | 商品の説明 |

主な例を示します。

| ローン種別 | Baselリスクウェイト |
|---|---|
| 住宅ローン | 35% |
| 自動車ローン | 75% |
| SBAローン | 0%（政府保証付き） |
| 建設ローン | 150% |
| CREローン | 100% |

### CollateralType

ローンの担保となる資産の区分で、回収見込みを持ちます。

| プロパティ | 型 | 説明 |
|---|---|---|
| `collateralTypeCode` | string | 識別子 |
| `name` | string | 表示名 |
| `recoveryExpectation` | string | 予想回収率（例："high"、"moderate"、"low"） |
| `description` | string | 資産区分の説明 |

## 新しいリレーションシップ

- **loanClassifiedAs**：`LoanType` → `ConcentrationCategory`（`many-to-one`）— 各ローン種別を集中区分に対応付けます
- **collateralClassifiedAs**：`CollateralType` → `ConcentrationCategory`（`many-to-one`）— 担保種別も集中区分に対応付けます
- **typicallySecuredBy**：`CollateralType` → `LoanType`（`many-to-many`）— 通常どの担保種別がどのローン種別を裏付けるかを結び付けます

## 設計パターン：ハブエンティティ

**ConcentrationCategory**は、ローン分類のサブグラフをモデルの他の部分に接続する*ハブエンティティ*です。`LoanType`と`CollateralType`の両方がこのエンティティを参照し、規制分析に共通の参照点を形成します。

ステップ4では`RegulatoryLimit`も`ConcentrationCategory`に接続され、規制遵守クエリの中心ノードになります。

## Basel IIIリスクウェイトが重要な理由

Basel IIIでは、ローン種別ごとに銀行が備えるべき自己資本額を左右するリスクウェイトを割り当てます。住宅ローンのリスクウェイトが35%であれば、融資1ドル当たりに必要な自己資本は少なくなります。一方、建設ローンに150%のリスクウェイトが適用されると、必要な自己資本は大幅に増えます。

これは次の項目に直接影響します。

- **収益性**：リスクウェイトが低いほど拘束される自己資本が少なくなり、自己資本利益率が高くなります
- **ポートフォリオ戦略**：銀行はリスクウェイトを考慮してローン構成を最適化します
- **規制遵守**：リスク加重資産の限度を超えると、監督措置の対象になります

## ステップ3のグラフ（ステップ2との差分）

<ontology-embed id="official/fibo-risk-step-3" diff="official/fibo-risk-step-2" height="440px"></ontology-embed>

*3つの新しいエンティティがローン分類のクラスターを形成します。ConcentrationCategoryは、ローン種別と担保種別を結ぶハブです。*

```quiz
Q: 建設ローンのBaselリスクウェイトが150%である一方、SBAローンが0%なのはなぜですか？
- 建設ローンは手続きに時間がかかるため
- SBAローンには政府保証があり銀行が信用リスクを負わない一方、建設ローンはデフォルトリスクと完成リスクが高いため [correct]
- 建設会社の収益性が低いため
- SBAがSafe Banking Assetの略であるため
> Basel IIIのリスクウェイトは、銀行が負担する信用リスクを反映します。このモデルでは、米国政府の保証を受けるSBA（Small Business Administration）ローンを信用リスク0%として扱います。建設ローンには完成リスク、市場リスク、高いデフォルト率があるため、150%のリスクウェイトを適用したリスク加重資産に応じて自己資本を備える必要があります。
```
