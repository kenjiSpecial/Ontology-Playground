---
title: "完全なプラットフォーム"
slug: complete-platform
description: "Reviewを追加して購入者のフィードバックループを閉じ、Eコマースのオントロジーを完成させます。"
order: 4
embed: official/ecommerce-step-3
---

## フィードバックループを閉じる

Eコマースのパズルを完成させる最後のピースは、**カスタマーレビュー**です。レビューは購入者と商品を再びつなぎ、将来の購入に影響するフィードバックループを作ります。

## Reviewエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `reviewId` | string | ✓ |
| `rating` | integer | |
| `title` | string | |
| `body` | string | |
| `verified` | boolean | |

`verified` のboolean値は、レビュアーが実際に商品を購入したかどうかを示します。これは他の購入者にとっても分析にとっても重要な信頼シグナルです。

## 新しいリレーションシップ

- **writes** — `Buyer` → `Review`（一対多）
  購入者は時間の経過とともに複数のレビューを書けます。

- **reviews** — `Review` → `Product`（多対一）
  各レビューはちょうど1つの商品についてのものですが、1つの商品には複数のレビューが付くことがあります。

> **フィードバックループ:** `Buyer → writes → Review → reviews → Product` のパスがProductへ戻るサイクルを作ります。購入者は商品を利用した後にレビューを書き、それが他の購入者に影響を与えます。

## 完成したグラフ

<ontology-embed id="official/ecommerce-step-3" diff="official/ecommerce-step-2" height="500px"></ontology-embed>

*Eコマースオントロジーの全体像です。5つのエンティティと6つのリレーションシップからなり、Reviewが購入者のフィードバックループを閉じます。*

## 完成したモデルでできること

| 質問 | グラフパス |
|---|---|
| 最も評価の高い認証済みレビューが付いている商品はどれか？ | Review (verified=true) → Product |
| カートが満杯なのに注文がない購入者は誰か？ | Buyer → Cart (itemCount > 0)、Buyer → Orderなし |
| あるカテゴリの商品に対する平均評価はいくつか？ | Review → Product（カテゴリでグループ化） |
| ロイヤルティの高い購入者のうち、最も多くレビューを書くのは誰か？ | Buyer (loyaltyTier=Gold) → Review (件数) |

## GQLクエリの例

誰かのカートに現在入っている商品について、認証済みのレビューを検索します。

```gql
MATCH (b:Buyer)-[:has_cart]->(c:Cart)-[:contains]->(p:Product)<-[:reviews]-(r:Review)
WHERE r.verified = true
RETURN p.name, r.rating, r.title
```

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 主要概念 |
|---|---|---|---|
| 1 | Buyer, Product, Order | 3 | 購入フロー、SKU識別子 |
| 2 | Shopping-Cart | 4 | セッションエンティティ、一対一 |
| 3 | Review | 5 | フィードバックループ、認証による信頼 |

## 重要なポイント

1. **セッションエンティティ**（Cart）は進行中の状態を捉えます
2. **一対一**のリレーションシップは、排他的な所有関係をモデル化します
3. **booleanプロパティ**（verified）によって、信頼性に基づくフィルタリングができます
4. **フィードバックループ**は、直線的な連鎖より豊かなクエリパスを作ります
5. 完成したグラフによって、閲覧からレビューまでの**ファネル分析**が可能になります

```quiz
Q: このオントロジーでReviewエンティティが「フィードバックループ」を作るのはなぜですか？
- グラフ内の他のすべてのエンティティとつながるため
- 購入パスとは異なる経路でBuyerからProductへ戻るパスを作るため [correct]
- どのエンティティよりも多くのプロパティを持つため
- boolean型のverifiedプロパティを使うため
> Reviewがなければ、BuyerからProductへのパスはOrderだけを通ります。Reviewは2つ目のパス、つまりBuyer → Review → Productを作り、ループを形成します。この2経路の構造によって、「購入したがレビューしていない」と「レビューしたが購入していない」を比較するクエリが可能になります。
```

Eコマースプラットフォームの学習パスを完了しました！[カタログ](#/catalogue)から任意のステップを読み込んで、インタラクティブに探索してみましょう。
