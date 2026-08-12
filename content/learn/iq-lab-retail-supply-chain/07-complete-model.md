---
title: 完全なモデル
slug: complete-model
description: PromotionとReturnを追加して15個のエンティティからなる小売サプライチェーンのオントロジーを完成させ、グラフ全体を探索します。
order: 7
embed: official/iq-lab-retail-step-6
---

## 最後の2つのエンティティ

最後の2つのエンティティ型を追加して、小売ライフサイクルの循環を完成させます。

- **Promotion** — 売上を促進するマーケティングキャンペーン
- **Return** — 返品された商品を表し、注文と商品の両方に接続するエンティティ

## Promotionエンティティ

特定の商品を対象とするマーケティングキャンペーンを表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `promotionId` | string | ✓ |
| `promotionName` | string | |
| `isActivePromotion` | boolean | |

`isActivePromotion`フラグを使うと、現在実施中のキャンペーンに絞り込めます。「返品率の高い商品に関連する実施中のプロモーションはどれですか？」という質問では、Promotion → Product ← Returnとたどります。

## Returnエンティティ

返品された商品を注文と商品へ接続します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `returnId` | string | ✓ |
| `returnDate` | date | |
| `reason` | string | |

## 新しいリレーションシップ

最後に3つのリレーションシップを追加します。

- **PromotionForProduct** — `Promotion` → `Product`（多対一）
  プロモーションの対象商品を表します。

- **ReturnForOrder** — `Return` → `Order`（多対一）
  返品に関連する注文を表します。

- **ReturnOfProduct** — `Return` → `Product`（多対一）
  返品された商品を表します。

## 完成したグラフ

<ontology-embed id="official/iq-lab-retail-step-6" diff="official/iq-lab-retail-step-5" height="500px"></ontology-embed>

*15個のエンティティ型と18個のリレーションシップを持つ、完成した小売サプライチェーンのオントロジーです。すべてのエンティティが少なくとも1つの別のエンティティへ接続され、豊かで探索可能なグラフを形成しています。*

## 完全なモデルで可能になること

オントロジーが完成すると、次のような質問へ自然に答えられるようになります。

| 質問 | グラフの経路 |
|---|---|
| 返品につながったプロモーションはどれですか？ | Promotion → Product ← Return |
| 返品された商品の在庫はいくつですか？ | Return → Product ← Inventory → Warehouse |
| 需要が高い地域を担当する配送業者はどれですか？ | DemandSignal → Region ← Store、Shipment → Carrier |
| プロモーション対象の商品を注文した顧客は誰ですか？ | Customer ← Order → OrderLine → Product ← Promotion |
| 在庫が少ない商品の需要予測はいくつですか？ | Inventory → Product ← Forecast |

これらの質問に従来の方法で答えるには、複数テーブルをまたぐ複雑なSQLのJOINが必要です。オントロジーを使えばグラフ探索として表現でき、Fabric IQでは自然言語を扱うデータ エージェントがオントロジー構造に基づいて回答できます。

## GQLクエリの例

最初の質問「返品につながったプロモーションはどれですか？」は、GQLでは次のように表せます。

```gql
MATCH (r:Return)-[:ReturnOfProduct]->(p:Product)<-[:PromotionForProduct]-(promo:Promotion)
WHERE promo.isActivePromotion = true
RETURN promo.promotionName, p.name, r.reason
```

このGQLパターンは、設計したオントロジーのリレーションシップをそのまま反映しています。モデルとクエリの間に構造上のずれはありません。

## 構築したもの

6つのステップを通じて、完全なオントロジーを段階的に構築しました。

| ステップ | 追加したエンティティ | 累計 | 主要な概念 |
|---|---|---|---|
| 1 | Customer、Order、Product | 3 | エンティティ型、識別子、カーディナリティ |
| 2 | OrderLine、ProductCategory | 5 | 中間エンティティ、階層 |
| 3 | Region、Store | 7 | 地理構造、ブール型プロパティ |
| 4 | Shipment、Carrier、Warehouse | 10 | ハブエンティティ、ドメイン横断の接続 |
| 5 | Inventory、Forecast、DemandSignal | 13 | データソース横断の統合、計画データ |
| 6 | Promotion、Return | 15 | 循環の完成、GQLクエリ |

## 重要なポイント

1. **小さく始め、段階的に成長させる** — 3つのエンティティだけでも価値を生み出せます
2. **中間エンティティ**は、多対多のリレーションシップに属性を持たせる際の課題を解決します
3. Shipmentのような**ハブエンティティ**は、異なるドメインを橋渡しします
4. **データソース横断の統合**が中核的な価値です。1つのオントロジーで複数のデータエンジンを扱えます
5. **グラフ探索**により、複雑なSQLのJOINを直感的な経路パターンへ置き換えられます
6. **オントロジーがAPIになる** — GQLクエリとデータ エージェントへの質問は、どちらも同じ構造に従います

```quiz
Q: 完成した小売オントロジーで、「返品につながったプロモーションはどれですか？」というクエリをグラフ探索としてどう表しますか？
- Customer → Order → Product → Promotion
- Promotion → Product ← Return [correct]
- Return → Order → Customer → Promotion
- Promotion → Return → Product
> Promotion → Product ← Returnという経路は、PromotionForProductとReturnOfProductのリレーションシップをたどり、共通のProductエンティティを介してプロモーションと返品された商品を接続します。
```

これで「IQ Lab：小売サプライチェーン」は完了です。[カタログ](#/catalogue)から任意のステップのオントロジーを読み込み、プレイグラウンドで対話的に探索してみましょう。
