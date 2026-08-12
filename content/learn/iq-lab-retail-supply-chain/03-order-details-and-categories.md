---
title: 注文明細とカテゴリー
slug: order-details-and-categories
description: OrderとProductをつなぐ中間エンティティとしてOrderLineを追加し、商品を分類するProductCategoryを導入します。
order: 3
embed: official/iq-lab-retail-step-2
---

## 多対多の課題

ステップ1では、OrderとProductを多対多のリレーションシップで直接接続しました。「この注文に含まれていた商品はどれですか？」という単純なクエリには対応できますが、**数量**と**明細金額**はどこに保持すればよいでしょうか。

多対多の直接的なリレーションシップには属性を持たせられません。Customer AがProduct Xを3個、Customer Bが1個注文した場合、その数量はどこに保持すればよいでしょうか。複数の商品を含むOrderにも、複数の注文に現れるProductにも保持できません。

## 中間エンティティのパターン

解決策は**中間エンティティ**です。2つのエンティティの間に置き、それぞれの関連付けに固有の属性を保持するエンティティ型です。

**OrderLine**はOrderとProductを接続し、次のプロパティを保持します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `orderLineId` | string | ✓ |
| `quantity` | integer | |
| `lineTotal` | decimal (USD) | |

### 新しいリレーションシップ

- **OrderHasLineItem** — `Order` → `OrderLine`（一対多）
  各注文には1つ以上の明細項目があります。

- **OrderLineReferencesProduct** — `OrderLine` → `Product`（多対一）
  各明細項目は必ず1つの商品を参照します。

これで、`Order` → `OrderLine` → `Product`とたどれるようになり、各明細項目が固有の`quantity`と`lineTotal`を保持します。

> **設計パターン：** 多対多のリレーションシップに数量、価格、日付などの属性が必要な場合は、中間エンティティを導入します。これは、リレーショナルデータベースにおける関連テーブルに相当するオントロジーの表現です。

## カテゴリーによる分類

商品は単独で存在することは少なく、「冷凍食品」「家庭用品」「電子機器」などの**カテゴリー**に属します。ProductCategoryエンティティを追加すると、商品を分類し、「返品が最も多いカテゴリーはどれですか？」といった質問に答えられます。

**ProductCategory**:

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `categoryId` | string | ✓ |
| `categoryName` | string | |

### 新しいリレーションシップ

- **ProductInCategory** — `Product` → `ProductCategory`（多対一）
  各商品は必ず1つのカテゴリーに属します。

## ステップ2のグラフ

<ontology-embed id="official/iq-lab-retail-step-2" diff="official/iq-lab-retail-step-1" height="400px"></ontology-embed>

*5つのエンティティ型が5つのリレーションシップで接続されています。OrderLineはOrderとProductの橋渡し役となって数量データを保持し、ProductCategoryは商品を分類します。*

## 学んだこと

- **中間エンティティ**は、多対多のリレーションシップに属性を持たせる際の課題を解決します
- リレーションシップ自体にデータが必要な場合は、それをエンティティとしてモデル化します
- **階層**（Product → ProductCategory）によってロールアップクエリが可能になります
- 新しいエンティティを既存のエンティティへ接続することで、グラフが成長します

```quiz
Q: 直接的なリレーションシップではなく、OrderLineのような中間エンティティを導入するのはどのような場合ですか？
- エンティティ型が4つ以上ある場合
- 2つのエンティティ間のリレーションシップ自体に属性が必要な場合 [correct]
- 両方のエンティティ型に識別子プロパティがある場合
- エンティティが異なる名前空間にある場合
> 多対多のリレーションシップ自体に数量や明細金額などのデータを持たせる必要がある場合は、中間エンティティが必要です。直接的なリレーションシップには属性を保持できません。
```

次は、RegionとStoreを使って地理構造を追加します。
