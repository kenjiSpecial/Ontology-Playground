---
title: コマースの中核
slug: core-commerce
description: あらゆる小売オントロジーの基礎となるCustomer、Order、Productを定義し、リレーションシップで接続します。
order: 2
embed: official/iq-lab-retail-step-1
---

## 基礎

あらゆる小売システムは、次の3つの中核概念から始まります。

- **Customer** — 誰が購入するのか
- **Order** — どのような取引が発生したのか
- **Product** — 何が購入されたのか

この3つのエンティティ型がオントロジーの中心になります。後のステップで追加するすべての要素が、これらのエンティティにつながります。

## エンティティ型の定義

各エンティティ型には、次の要素が必要です。

1. **名前** — 単数形で内容が分かる名前（`Customer`など。`Customers`や`tbl_cust`は避けます）
2. **識別子プロパティ** — 各インスタンスを一意に識別するキー
3. **プロパティ** — 各インスタンスを記述する属性

### Customerエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `customerId` | string | ✓ |
| `name` | string | |
| `email` | string | |
| `loyaltyTier` | string | |
| `lifetimeValue` | decimal (USD) | |

`customerId`は各顧客を一意に識別します。`loyaltyTier`や`lifetimeValue`のようにビジネス上の意味が分かる名前を持つプロパティを、データソース内の分かりにくい列名へマッピングできます。

### Orderエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `orderId` | string | ✓ |
| `orderDate` | datetime | |
| `status` | string | |
| `totalAmount` | decimal (USD) | |

### Productエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `productId` | string | ✓ |
| `name` | string | |
| `unitCost` | decimal (USD) | |
| `discountPercent` | decimal (%) | |

## リレーションシップによる接続

エンティティだけでは、独立したテーブルにすぎません。**リレーションシップ**によって、エンティティを接続されたグラフに変えられます。

- **OrderPlacedByCustomer** — `Order` → `Customer`（多対一）
  各注文を行う顧客は必ず1人ですが、1人の顧客が複数の注文を行うことができます。

- **OrderContainsProduct** — `Order` → `Product`（多対多）
  1件の注文に複数の商品を含めることができ、1つの商品が複数の注文に含まれることもあります。

### カーディナリティの重要性

カーディナリティは、データの数え方と集計方法をシステムに伝えます。

| カーディナリティ | 意味 | 例 |
|---|---|---|
| 一対一 | 両側にそれぞれ1つだけ | Employee → Badge |
| 一対多 | 1つの親に複数の子 | Customer → Orders |
| 多対一 | 複数の子に1つの親 | Orders → Customer |
| 多対多 | 数の制約なし | Orders ↔ Products |

適切なカーディナリティを選ぶことで、「各顧客は何件注文しましたか？」のようなクエリが正しい件数を返せるようになります。

## ここまでのグラフ

わずか3つのエンティティと2つのリレーションシップで、すでに接続されたグラフができました。

<ontology-embed id="official/iq-lab-retail-step-1" height="350px"></ontology-embed>

*Customer、Order、Productが2つのリレーションシップで接続されています。これが、以降のすべての要素を構築する基礎です。*

## 学んだこと

- すべてのエンティティ型に識別子プロパティが必要です
- 内部列名ではなく、ビジネス上の意味が分かる名前を使います
- リレーションシップには、データの数え方に影響するカーディナリティがあります
- 3つのエンティティだけでも、役立つ接続グラフを作れます

```quiz
Q: 1人のCustomerが複数のOrderを行えますが、各Orderは1人のCustomerに属します。このカーディナリティはどれですか？
- 一対一
- 多対多
- 一対多 [correct]
- 多対一
> Customerから見ると一対多です。1人の顧客が複数の注文を行えます。Orderから見ると多対一です。このリレーションシップはCustomer → Orderの向きで、一対多のカーディナリティとして定義されます。
```

次は、注文に明細を追加し、商品をカテゴリーに分類します。
