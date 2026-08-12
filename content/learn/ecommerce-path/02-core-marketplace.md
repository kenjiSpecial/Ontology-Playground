---
title: "マーケットプレイスの基本"
slug: core-marketplace
description: "あらゆるEコマースプラットフォームの基盤となるBuyer、Product、Orderを定義します。"
order: 2
embed: official/ecommerce-step-1
---

## 購入フロー

すべてのマーケットプレイスは、次の3つの概念を中心に成り立ちます。

- **Buyer** — 購入者は誰か？
- **Product** — 何が販売されるのか？
- **Order** — 完了した取引は何か？

この3つのエンティティが、購入フローの本質を捉えます。後から追加するものはすべて、この基盤を豊かにします。

## エンティティを定義する

### Buyerエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `buyerId` | string | ✓ |
| `email` | string | |
| `memberSince` | date | |
| `loyaltyTier` | string | |
| `totalSpent` | decimal (USD) | |

実店舗の顧客とは異なり、Eコマースの購入者には主要な連絡手段として必ず `email` があります。`totalSpent` プロパティによって、顧客生涯価値に基づくセグメント分けができます。

### Productエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `sku` | string | ✓ |
| `name` | string | |
| `category` | string | |
| `price` | decimal (USD) | |
| `stockQty` | integer | |

ここでの識別子は `sku`（Stock Keeping Unit）です。Eコマースで標準的に使われる商品識別子であり、`stockQty` プロパティはリアルタイムの在庫数を追跡します。

### Orderエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `orderId` | string | ✓ |
| `orderDate` | datetime | |
| `status` | string | |
| `total` | decimal (USD) | |
| `shippingMethod` | string | |

## リレーションシップ

- **places** — `Buyer` → `Order`（一対多）
  購入者は時間の経過とともに複数の注文を行えます。

- **includes** — `Order` → `Product`（多対多）
  1つの注文には複数の商品を含められ、各商品は複数の注文に登場します。

## ここまでのグラフ

<ontology-embed id="official/ecommerce-step-1" height="350px"></ontology-embed>

*購入フローのリレーションシップでBuyer、Product、Orderがつながっています。*

## 学んだこと

- **SKU** はEコマース商品の標準的な識別子です
- `stockQty` の整数プロパティによって、在庫をクエリできます
- 基本的な購入フロー（Buyer → Order → Product）は、あらゆるマーケットプレイスの背骨です

```quiz
Q: Productの識別子として「productId」ではなく「sku」が使われるのはなぜですか？
- SKUのほうが短く入力できるため
- SKU（Stock Keeping Unit）はEコマースや小売システムで標準的な商品識別子だから [correct]
- productIdでは命名が衝突するため
- SKUは常に数値だから
> SKUはStock Keeping Unitの略です。在庫管理、倉庫管理、Eコマースシステムで広く使われ、各商品を一意に識別する業界標準の識別子です。
```

次はShopping Cartを追加して、購入前の体験をモデル化します。
