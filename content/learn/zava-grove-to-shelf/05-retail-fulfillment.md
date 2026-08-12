---
title: 小売フルフィルメント
slug: retail-fulfillment
description: RetailDC、Store、Orderを追加し、Zavaのサプライチェーンを小売パートナーと売上へ接続します。
order: 5
embed: official/zava-grove-to-shelf-step-4
---

## サプライチェーンと売上の接点

前のステップでは、出荷が輸送中の状態までを扱いました。このステップでは、その受取先を具体化します。対象となる小売チェーン、物流センター、店舗、注文を明らかにします。

次の三つの新しいエンティティで、Zavaの商流側を完成させます。

- **RetailDC** — Zavaからの出荷を受け取る小売業者の物流センターです。
- **Store** — 一つの物流センターから商品供給を受ける小売業者の店舗です。
- **Order** — 店舗が特定の果実品種について発注する注文です。

## エンティティ

### RetailDC

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `dcId` | string | ✓ |
| `name` | string | |
| `country` | string | |
| `city` | string | |
| `retailerCode` | string | |

### Store

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `storeId` | string | ✓ |
| `name` | string | |
| `retailerName` | string | |
| `country` | string | |
| `city` | string | |

### Order

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `orderId` | string | ✓ |
| `kilograms` | decimal (kg) | |
| `orderDate` | date | |
| `deliveryDate` | date | |
| `status` | string | |
| `unitPriceEur` | decimal (EUR) | |

## 新しいリレーションシップ

| 始点 | 動詞 | 終点 | カーディナリティ |
|---|---|---|---|
| Shipment | deliveredTo | RetailDC | 多対1 |
| RetailDC | supplies | Store | 1対多 |
| Store | places | Order | 1対多 |
| Order | forVariety | FruitVariety | 多対1 |

## コールドチェーン温度逸脱クエリの経路を完成

ステップ3の温度逸脱に関する問いを思い出してください。小売側を追加すると、完全な探索経路は次のようになります。

```
ColdChainSensor[breach]
   → Shipment
   → HarvestLot ─ ofVariety → FruitVariety
   → Shipment
   → RetailDC
   → Store
   → Order[forVariety = same variety, status = open]
```

これでFabric IQ Data Agentは、顧客への影響に関する問いに自然な言葉で答えられます。

> *「出荷SH-2026-04812のコールドチェーン温度逸脱によって、どの小売注文にリスクがあり、影響を受ける売上（kg × unitPriceEur）はいくらですか？」*

## ここまでのグラフ

<ontology-embed id="official/zava-grove-to-shelf-step-4" diff="official/zava-grove-to-shelf-step-3" height="480px"></ontology-embed>

*エンティティは11個です。小売側の枝（RetailDC → Store → Order）が`Order forVariety FruitVariety`を介してFruitVarietyハブに直接つながり、果樹園から店頭までの経路が完成します。*

```quiz
Q: 温度逸脱クエリで、`Shipment carries HarvestLot ofVariety FruitVariety`に*加えて*`Order forVariety FruitVariety`が必要なのはなぜですか？
- Fabric IQでは冗長性が必須だから
- 注文は特定のロットではなく品種に対して行われるため、リスクのあるロットを*同じ品種の未処理注文*と照合できるから [correct]
- 可視化だけを目的としているから
- これがなければグラフが分断されるから
> 小売業者はロット単位ではなく品種単位で注文します。特定ロットの温度逸脱によって*影響を受ける注文*を特定するには、そのロットの品種と`Order.forVariety`を照合します。この接続がなければ、出荷にリスクがあることは分かっても、影響を受ける未処理注文までは特定できません。
```

最後にもう一つ、ZavaのCSR活動をモデル上で生かすプログラムのエンティティを追加します。
