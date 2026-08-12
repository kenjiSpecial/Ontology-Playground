---
title: "注文の基本"
slug: core-orders
description: "コーヒービジネスの基盤となるCustomer、Order、Productを定義し、リレーションシップで接続します。"
order: 2
embed: official/cosmic-coffee-step-1
---

## 基盤

すべての商取引システムは、3つの基本概念から始まります。

- **Customer** — だれが購入するのか？
- **Order** — どの取引が発生したのか？
- **Product** — 何が購入されたのか？

これら3つのエンティティ型が、Fourth Coffeeオントロジーの中心です。後から追加するものはすべて、ここにつながります。

## エンティティを定義する

### Customerエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `customerId` | string | ✓ |
| `name` | string | |
| `email` | string | |
| `loyaltyTier` | enum (Bronze, Silver, Gold, Platinum) | |
| `joinDate` | date | |
| `totalSpend` | decimal (USD) | |

`customerId` は各顧客を一意に識別します。`loyaltyTier` は enum を使って有効なティアだけに値を制限するため、後続の分析でデータ品質の問題を防げます。

### Orderエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `orderId` | string | ✓ |
| `timestamp` | datetime | |
| `total` | decimal (USD) | |
| `status` | enum (Pending, Preparing, Ready, Completed, Cancelled) | |
| `paymentMethod` | enum (Card, Cash, Mobile, Gift Card) | |

### Productエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `productId` | string | ✓ |
| `name` | string | |
| `category` | enum (Espresso, Brewed, Cold Brew, Tea, Food, Merchandise) | |
| `price` | decimal (USD) | |
| `origin` | string | |
| `isOrganic` | boolean | |

`isOrganic` フラグは boolean です。後でフィルタリングやコンプライアンスに関するクエリを行うときに役立ちます。

## リレーションシップで接続する

エンティティだけでは、孤立したテーブルにすぎません。**リレーションシップ**によって、エンティティがグラフになります。

- **places** — `Customer` → `Order`（一対多）
  各顧客は複数の注文を行えますが、各注文は1人の顧客に属します。

- **contains** — `Order` → `Product`（多対多）
  1つの注文には複数の商品を含められ、1つの商品は複数の注文に登場できます。

## ここまでのグラフ

<ontology-embed id="official/cosmic-coffee-step-1" height="350px"></ontology-embed>

*3つのエンティティと2つのリレーションシップ。これが、以降のすべてを支える基盤です。*

## 学んだこと

- すべてのエンティティには、**識別子プロパティ**（一意なキー）が必要です
- **enumプロパティ**は、値を有効な選択肢に制限します
- **booleanプロパティ**によって、簡単なフィルタリングができます
- **カーディナリティ**（一対多と多対多）によって、エンティティ同士の関係が決まります

```quiz
Q: OrderとProductの「contains」リレーションシップが一対多ではなく多対多に設定されているのはなぜですか？
- 各注文には1つの商品しか含められないため
- 商品は一度に1つの注文にしか登場できないため
- 1つの注文に複数の商品を含められ、1つの商品が複数の注文に登場できるため [correct]
- 多対多が常にデフォルトのリレーションシップ型だから
> 1つの注文には通常、ラテ、マフィン、豆の袋など複数の商品が含まれ、各商品はさまざまな注文に登場します。この双方向の多重性には多対多が必要です。
```

次はStoreを追加して、注文が処理される場所を追跡します。
