---
title: "サプライチェーンを完成させる"
slug: complete-supply-chain
description: "SupplierとShipmentを追加してFourth Coffeeのオントロジーを完成させ、調達、物流、小売をつなぎます。"
order: 4
embed: official/cosmic-coffee-step-3
---

## 全体像を完成させる

Fourth Coffeeはコーヒーを販売するだけではありません。世界中のサプライヤーから豆を調達し、店舗で出荷を受け取り、サプライチェーン全体を追跡します。**Supplier**と**Shipment**を追加して、この流れを完成させます。

## Supplierエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `supplierId` | string | ✓ |
| `name` | string | |
| `country` | string | |
| `certification` | enum (Fair Trade, Rainforest Alliance, Organic, Direct Trade, None) | |
| `rating` | decimal | |

`certification`プロパティは、持続可能性に関する認証を表す enum です。`rating`は品質評価用のdecimal（1～5）です。

## Shipmentエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `shipmentId` | string | ✓ |
| `dispatchDate` | date | |
| `arrivalDate` | date | |
| `status` | enum (In Transit, Delivered, Delayed) | |
| `weight` | decimal (kg) | |

Shipmentは**ハブエンティティ**として機能します。Productを介してSupplierとStoreをつなぎ、ビジネスの調達側と小売側を橋渡しします。

## 新しいリレーションシップ

4つの新しいリレーションシップで、サプライチェーンが完成します。

- **sourcedFrom** — `Product` → `Supplier`（多対一）
  各商品の豆は1つのサプライヤーから仕入れます。

- **sentBy** — `Shipment` → `Supplier`（多対一）
  各出荷は1つのサプライヤーから出発します。

- **deliveredTo** — `Shipment` → `Store`（多対一）
  各出荷は1つの店舗に到着します。

- **carries** — `Shipment` → `Product`（多対多）
  1つの出荷には複数の商品を載せられ、1つの商品は複数の出荷に含められます。

> **ハブエンティティパターン:** Shipmentは3つの異なるエンティティ（Supplier、Store、Product）をつなぎます。ハブエンティティは、そうでなければ分断されるグラフの部分を橋渡しできるため強力です。

## 完成したグラフ

<ontology-embed id="official/cosmic-coffee-step-3" diff="official/cosmic-coffee-step-2" height="500px"></ontology-embed>

*Fourth Coffeeの完全なオントロジーです。6つのエンティティ型と7つのリレーションシップで構成され、ShipmentがSupplier、Store、Productをつなぐハブとして機能します。*

## 完成したモデルでできること

| 質問 | グラフパス |
|---|---|
| オーガニック豆を提供するサプライヤーは？ | Product (isOrganic=true) → Supplier |
| 遅延した出荷を受け取った店舗は？ | Shipment (status=Delayed) → Store |
| 最上位のサプライヤーの評価は？ | Product → Supplier (sort by rating) |
| 最大規模の店舗に出荷する認証済みサプライヤーは？ | Supplier → Shipment → Store (sort by capacity) |

## GQLクエリの例

Fair Trade認証を取得し、カリフォルニア州の店舗へ出荷するサプライヤーを検索します。

```gql
MATCH (sup:Supplier)<-[:sentBy]-(s:Shipment)-[:deliveredTo]->(st:Store)
WHERE sup.certification = 'Fair Trade' AND st.state = 'CA'
RETURN sup.name, st.name, s.status
```

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 主要概念 |
|---|---|---|---|
| 1 | Customer, Order, Product | 3 | エンティティ型、識別子、カーディナリティ |
| 2 | Store | 4 | 位置情報のモデリング、多対一 |
| 3 | Supplier, Shipment | 6 | サプライチェーン、ハブエンティティ |

## 重要なポイント

1. **小さく始める** — 価値を生み出すには3つのエンティティで十分です
2. Shipmentのような**ハブエンティティ**は、異なるビジネスドメインを橋渡しします
3. **enumプロパティ**は、モデルのレベルでデータ品質を守ります
4. **グラフは段階的に拡張する** — 各ステップで新しいクエリ機能が加わります
5. **GQLクエリ**はオントロジーの構造に直接対応するため、インピーダンスミスマッチがありません

```quiz
Q: このオントロジーでShipmentが「ハブエンティティ」と見なされるのはなぜですか？
- どのエンティティよりも多くのプロパティを持つため
- 3つの異なるエンティティ（Supplier、Store、Product）をつなぐため [correct]
- 最も頻繁にクエリされるエンティティだから
- モデルに最後に追加されたエンティティだから
> ShipmentはSupplier（sentBy）、Store（deliveredTo）、Product（carries）とリレーションシップを持ち、1つのエンティティで調達、物流、小売の各ドメインを橋渡しするため、ハブとなります。
```

Fourth Coffeeの学習パスを完了しました！[カタログ](#/catalogue)から任意のステップを読み込んで、インタラクティブに探索してみましょう。
