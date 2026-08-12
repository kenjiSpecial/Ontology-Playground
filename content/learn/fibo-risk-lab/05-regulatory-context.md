---
title: "ステップ4：規制の文脈"
slug: regulatory-context
description: 銀行規制、監督上の基準、内部集中限度、ローン分類との接続を追加してモデルを完成させます。
order: 5
embed: official/fibo-risk-step-4
reviewStatus: under-human-review
---

## モデルを一巡させる

最初の3つのステップでは、産業、地理、ローン分類の参照データを構築しました。最後のステップでは、規制、監督上のスクリーニング基準、銀行の内部リスク方針にある定量的な閾値を表す**規制・方針層**を追加します。

この参照モデルでは、`LoanType`から集中区分と、その区分に対応する規制・監督ガイダンス・内部方針までをたどれます。個々のローンやポートフォリオの集中度と照合するには、実運用データ側の接続が別途必要です。

## 新しいエンティティ型

### Regulation

銀行監督当局の規制・監督ガイダンス、または銀行内部のリスク方針を表すフレームワークです。このラボでは単純化のため、いずれも`Regulation`として扱います。

| プロパティ | 型 | 説明 |
|---|---|---|
| `regulationCode` | string | 識別子（例："OCC_CRE_2006"） |
| `name` | string | 規制名 |
| `issuingAuthority` | string | 発行主体（OCC、FDIC、Basel Committee、銀行のリスク管理部門など） |
| `effectiveDate` | date | 発効日 |
| `scope` | string | 適用範囲 |
| `description` | string | 詳細な説明 |

### RegulatoryLimit

規制、監督ガイダンス、または銀行の内部リスク方針に記録された定量的な閾値です。すべてが法定上限を表すわけではありません。

| プロパティ | 型 | 説明 |
|---|---|---|
| `limitId` | string | 識別子 |
| `limitName` | string | 表示名 |
| `category` | string | 制約する軸 |
| `thresholdPct` | decimal (%) | 限度値 |
| `severity` | string | 閾値到達・超過時の対応（例："warning"、"action required"、"supervisory intervention"） |
| `description` | string | この限度の意味 |

このラボで扱う例を示します。

| 基準・限度 | 閾値 | 根拠と位置づけ |
|---|---|---|
| CRE監督スクリーニング基準 | 総CRE貸出が自己資本の300%以上、かつ直近36か月でCRE貸出残高が50%以上増加 | [OCC Bulletin 2006-46](https://www.occ.gov/news-issuances/bulletins/2006/bulletin-2006-46.html)に示された監督上の基準であり、法定上限ではありません |
| 気候・ハリケーン集中限度 | ポートフォリオの15% | このラボで例示する銀行内部のリスク方針 |
| 地理的集中限度 | ポートフォリオの20% | このラボで例示する銀行内部のリスク方針 |
| 産業集中限度 | ポートフォリオの25% | このラボで例示する銀行内部のリスク方針 |

## 新しいリレーションシップ

- **mandatedBy**：`RegulatoryLimit` → `Regulation`（`many-to-one`）— 閾値を、その出典となる規制・監督ガイダンス・内部方針のレコードに対応付けます。内部方針もこのラボでは簡略化のため`Regulation`で表します
- **limitAppliesToCategory**：`RegulatoryLimit` → `ConcentrationCategory`（`many-to-one`）— 閾値を、その対象となる集中区分に結び付けます

## 設計パターン：規制層への橋渡しと実運用での拡張

`limitAppliesToCategory`により、規制・方針層は`ConcentrationCategory`を介してローン分類層に接続されます。一方、産業クラスターと地理クラスターをローン分類へ結ぶ関係は、このラボのRDFにはありません。

領域横断クエリを実行するには、ポートフォリオのローン実データを追加し、ローンの所在地を`Jurisdiction`へ、借り手の産業を`IndustryGroup`へ、商品分類を`LoanType`または`ConcentrationCategory`へ結ぶ関係が必要です。たとえば、実運用側で接続を追加すると、概念上は次のようにたどれます。

```
Jurisdiction (hurricaneZone=true)
  ← [実運用データ側のローン所在地の関係] ← PortfolioLoan
  → [実運用データ側の商品分類の関係] → LoanType
  → loanClassifiedAs → ConcentrationCategory
  ← limitAppliesToCategory ← RegulatoryLimit (thresholdPct)
  → mandatedBy → Regulation (issuingAuthority)
```

産業側でも同様に、実運用データ側の借り手産業の関係が必要です。

```
IndustryGroup (climateSensitivity="high")
  ← [実運用データ側の借り手産業の関係] ← PortfolioLoan
  → [実運用データ側の商品分類の関係] → LoanType
  → loanClassifiedAs → ConcentrationCategory
```

`PortfolioLoan`と角括弧内の関係は拡張例であり、現在のRDFに含まれるクラスやリレーションシップではありません。

## 完成したモデル

最終的なオントロジーには、4つの領域にまたがる**11個のエンティティ型**と**9個のリレーションシップ**があります。

| 領域 | エンティティ | リレーションシップ |
|---|---|---|
| 産業 | Sector, Subsector, IndustryGroup | partOfSector, belongsToSubsector |
| 地理 | Region, Country, Jurisdiction | inCountry, inRegion |
| ローン分類 | ConcentrationCategory, LoanType, CollateralType | loanClassifiedAs, collateralClassifiedAs, typicallySecuredBy |
| 規制 | Regulation, RegulatoryLimit | mandatedBy, limitAppliesToCategory |

## ステップ4のグラフ（ステップ3との差分）

<ontology-embed id="official/fibo-risk-step-4" diff="official/fibo-risk-step-3" height="480px"></ontology-embed>

*2つの新しいエンティティ（RegulationとRegulatoryLimit）が参照モデルを完成させます。limitAppliesToCategoryリレーションシップが規制・方針層とローン分類を橋渡ししますが、産業・地理クラスターとの接続には実運用データ側の拡張が必要です。*

## 外部の完全な参照オントロジー

外部カタログでは、各領域を個別に確認することもできます。

- [FIBO産業分類](/#/catalogue/external/fibo/industry-classification)
- [FIBO地理的階層](/#/catalogue/external/fibo/geographic-hierarchy)
- [FIBOローン分類](/#/catalogue/external/fibo/loan-classification)
- [FIBO規制コンテキスト](/#/catalogue/external/fibo/regulatory-context)

## 構築したもの

これで、FIBOを参考にしたリスク管理の参照オントロジーが完成しました。実運用のポートフォリオデータを前述の関係で接続すると、次の分析を構成できます。

- **産業集中分析** — セクター、サブセクター、産業グループごとにエクスポージャーをロールアップします
- **地理的リスク評価** — 災害地域フラグで絞り込み、ポートフォリオデータと相互参照します
- **Basel III自己資本計算** — ローン種別に標準リスクウェイトを適用します
- **規制・内部方針の監視** — ポートフォリオの集中度を、監督上の基準や銀行の内部集中限度と照合します

参照モデル単体では、産業、地理、「ローン分類＋規制」の3クラスター間を横断できません。実運用データ側で不足する関係を追加すれば、従来のデータウェアハウスでは複数テーブルの複雑なJOINが必要になるリスククエリを、オントロジー駆動システムのグラフ探索として表現できます。

## ライセンス

このラボで参照するすべてのFIBOオントロジーコンテンツには、次の条件が適用されます。

- **Copyright** (c) 2016-2025 EDM Council, Inc. and Object Management Group, Inc.
- [MIT License](https://opensource.org/licenses/MIT)のもとで**ライセンス許諾**されています

```quiz
Q: 完成したモデルでConcentrationCategoryはどのような役割を果たしますか？
- 地理座標を格納する
- ローン種別、担保種別、規制・内部方針の基準を接続するハブエンティティとして機能する [correct]
- 各ローンのBaselリスクウェイトを定義する
- 規制遵守の追跡においてRegulationエンティティを置き換える
> ConcentrationCategoryは、ローン分類領域と規制・方針領域を橋渡しする中心的なハブです。LoanTypeとCollateralTypeはどちらもこのエンティティに分類され、RegulatoryLimitはこのエンティティを対象にします。産業・地理を含む横断クエリには、実運用データ側の追加関係が必要です。
```
