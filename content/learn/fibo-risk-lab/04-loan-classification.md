---
title: "ステップ3：ローン分類"
slug: loan-classification
description: 適用条件に応じたBaselリスクウェイトを持つエクスポージャー分類、担保区分、OCC/FDICの集中区分を追加します。
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

Basel IIIの自己資本要件が適用されるローン商品の分類です。実際のリスクウェイトは商品名だけで一律に決まらず、適用する法域・制度、LTV、保証、引受条件などによって異なります。

| プロパティ | 型 | 説明 |
|---|---|---|
| `loanTypeCode` | string | 識別子（例："residential_mortgage"） |
| `name` | string | 表示名 |
| `baselRiskWeight` | decimal (%) | Basel III標準的手法のリスクウェイト |
| `regulatoryTreatment` | string | 監督当局による商品の分類 |
| `capitalTier` | string | 自己資本上の取扱区分 |
| `description` | string | 商品の説明 |

このラボで扱う代表例を示します。数値はそれぞれ記載した条件に対応するもので、同じ商品区分のすべてのエクスポージャーに一律に適用されるわけではありません。

| エクスポージャーの例 | リスクウェイトの例 |
|---|---|
| LTVなど所定の適格要件を満たす住宅ローン | 35%の例（適用制度・条件により異なる） |
| 規制上のリテール要件を満たす自動車ローン | 75%の例 |
| SBAローンの米国政府による無条件保証部分 | 0% |
| 所定の要件を満たすHVCRE ADCエクスポージャー | 150% |
| その他のCREエクスポージャー | 適用制度、LTV、案件構造などにより異なる |

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

Basel IIIの標準的手法では、エクスポージャー区分と適格要件に応じてリスクウェイトを割り当てます。住宅ローンは一律35%ではなく、LTVなどの条件と適用制度によってウェイトが変わります。所定の要件を満たすHVCRE ADC（high-volatility commercial real estate acquisition, development, or construction）エクスポージャーには、150%のウェイトが適用される場合があります。

同じエクスポージャー額なら、リスクウェイトが高いほどリスク加重資産（RWA）が増え、最低自己資本比率を維持するために必要な自己資本も増えます。自己資本が変わらないままRWAが増えると、自己資本比率が最低基準を下回る可能性があります。

これは次の項目に直接影響します。

- **収益性**：他の条件が同じなら、リスクウェイトが低いほど必要自己資本が少なくなり、自己資本利益率を高めやすくなります
- **ポートフォリオ戦略**：銀行はリスクウェイトを考慮してローン構成を最適化します
- **規制遵守**：リスクウェイトの上昇でRWAが増えると、必要自己資本が増え、自己資本が十分でなければ最低自己資本比率を下回る可能性があります

## ステップ3のグラフ（ステップ2との差分）

<ontology-embed id="official/fibo-risk-step-3" diff="official/fibo-risk-step-2" height="440px"></ontology-embed>

*3つの新しいエンティティがローン分類のクラスターを形成します。ConcentrationCategoryは、ローン種別と担保種別を結ぶハブです。*

```quiz
Q: 所定の要件を満たすHVCRE ADCエクスポージャーが150%となり得る一方、SBAローンの米国政府による無条件保証部分が0%となり得るのはなぜですか？
- HVCRE ADCエクスポージャーは手続きに時間がかかるため
- 米国政府による無条件保証部分では信用リスクが政府へ移転する一方、適格なHVCRE ADCエクスポージャーには高い取得・開発・建設リスクがあるため [correct]
- HVCRE ADCの借り手は必ず収益性が低いため
- SBAがSafe Banking Assetの略であるため
> リスクウェイトは、銀行が負担する信用リスクと規制上の適格要件を反映します。SBA（Small Business Administration）ローンのうち米国政府による無条件保証の対象部分では、信用リスクが政府へ移転するため0%となり得ます。一方、規制上の要件を満たすHVCRE ADCエクスポージャーには150%が適用される場合があり、同じ残高でもRWAと必要自己資本が増えます。
```
