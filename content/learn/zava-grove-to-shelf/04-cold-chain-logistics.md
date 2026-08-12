---
title: コールドチェーン物流
slug: cold-chain-logistics
description: ShipmentとColdChainSensorを追加し、生鮮品物流レイヤーと、Zavaで最も重要なアラート ルールを動かすリアルタイム温度テレメトリをモデル化します。
order: 4
embed: official/zava-grove-to-shelf-step-3
---

## Zavaにとって最も損失の大きい数分間

HarvestLotが選果梱包施設を出た瞬間から、時間との勝負が始まります。果実は傷みやすく、品種ごとの安全温度を15分間超過しただけで冷蔵コンテナ全体が廃棄対象となり、売上損失は容易に6桁へ達します。コールドチェーン レイヤーは、Zavaのセマンティクスへの投資が最も大きな効果を生む領域です。

この領域を次の二つの新しいエンティティで表現します。

- **Shipment** — 一つ以上のHarvestLotを小売物流センターへ運ぶ冷蔵コンテナまたはトラックです。
- **ColdChainSensor** — 出荷に取り付けられ、温度と湿度のテレメトリをストリーミングするセンサーです。

## エンティティ

### Shipment

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `shipmentId` | string | ✓ |
| `departureDate` | datetime | |
| `etaDate` | datetime | |
| `modality` | string | |
| `containerId` | string | |

### ColdChainSensor

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `sensorId` | string | ✓ |
| `sensorModel` | string | |
| `temperatureC` | decimal (°C) | |
| `humidityPct` | decimal (%) | |

Microsoft Fabric IQでは、`ColdChainSensor`は**時系列エンティティ**の代表例です。センサーの読み取り値はLakehouseのテーブルではなくEventhouseにバインドされます。オントロジーがこの違いを隠すため、利用者は基盤となるエンジンを意識せずに、クエリで`Sensor → Shipment`をたどれます。

## 新しいリレーションシップ

| 始点 | 動詞 | 終点 | カーディナリティ |
|---|---|---|---|
| Shipment | carries | HarvestLot | 1対多 |
| Shipment | monitoredBy | ColdChainSensor | 1対多 |

`Shipment`が**ハブ**として機能している点に注目してください。静的なLakehouseの世界（HarvestLotの来歴）と、ストリーミングを扱うEventhouseの世界（センサー テレメトリ）を橋渡しします。

## コールドチェーン温度逸脱クエリ

Zavaの代表的なデモでは、次のように質問します。

> *「出荷SH-2026-04812の温度が9°Cを超えました。どの小売注文が影響を受けますか？」*

現在、この問いに答えるには5つのシステムを手作業で追跡する必要があります。オントロジーを使えば、次の経路を一度たどるだけです。

```
ColdChainSensor[temperatureC > FruitVariety.maxStorageTempC + 2]
   → Shipment
   → HarvestLot
   → (later) Order → Store → Retailer
```

次のステップで小売側を接続します。

## ここまでのグラフ

<ontology-embed id="official/zava-grove-to-shelf-step-3" diff="official/zava-grove-to-shelf-step-2" height="450px"></ontology-embed>

*エンティティは8つです。右側の枝（Sensor → Shipment）がリアルタイム テレメトリ側、左側の枝（HarvestLot → Plot → Farm → Grower）が来歴側です。オントロジーが両者を統合します。*

```quiz
Q: `Shipment`を「ハブ」エンティティと呼ぶのは、どういう意味ですか？
- グラフ内で最大のエンティティであるという意味
- 本来は分離している来歴（収穫ロット）とテレメトリ（センサー）の二つの領域を、一つの共通概念で接続するという意味 [correct]
- 他のすべてのエンティティがShipmentを経由しなければならないという意味
- RDF準拠にハブが必要であるという意味
> ハブ エンティティは、本来なら別々のシステムに存在する領域を結び付けます。ShipmentはHarvestLot（Lakehouseの来歴）とColdChainSensor（Eventhouseのテレメトリ）を接続するため、一度のグラフ探索で両方を横断できます。
```

次は、小売物流センター、店舗、リスクのある注文を接続して、小売までの経路を完成させます。
