---
title: 在庫と需要
slug: inventory-and-demand
description: Inventory、Forecast、DemandSignalを追加し、倉庫や地域をまたいで在庫水準を追跡し、将来の需要を予測します。
order: 6
embed: official/iq-lab-retail-step-5
---

## 取引から計画へ

ステップ1〜4では、注文、出荷、配送という**過去に起きたこと**をモデル化しました。ここでは、在庫水準や需要シグナルといった**現在起きていること**と、予測という**将来起きること**を表すエンティティを追加します。履歴データ、リアルタイムデータ、予測データを1つのモデルに統合できることが、オントロジーの大きな強みです。

## Inventoryエンティティ

各倉庫の在庫水準を表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `inventoryId` | string | ✓ |
| `stockLevel` | integer | |
| `reorderPoint` | integer | |

`reorderPoint`は、在庫がこの値を下回ったら補充を発注すべきしきい値を示します。サプライチェーン管理における重要な指標です。

## Forecastエンティティ

商品の予測需要を表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `forecastId` | string | ✓ |
| `forecastDate` | date | |
| `predictedDemand` | integer | |

## DemandSignalエンティティ

検索トレンド、ソーシャルメディアでの言及、気象パターンなど、顧客需要を示すリアルタイムの指標を表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `signalId` | string | ✓ |
| `signalDate` | datetime | |
| `signalStrength` | decimal | |

## 新しいリレーションシップ

5つの新しいリレーションシップで、在庫と需要を既存のエンティティへ接続します。

- **InventoryForProduct** — `Inventory` → `Product`（多対一）
  特定商品の在庫水準を表します。

- **InventoryAtWarehouse** — `Inventory` → `Warehouse`（多対一）
  在庫の保管場所を表します。InventoryForProductと組み合わせることで、「Warehouse YにProduct Xはいくつありますか？」という、商品と倉庫が交わる情報を表せます。

- **ForecastForProduct** — `Forecast` → `Product`（多対一）
  特定商品の予測需要を表します。

- **DemandSignalForProduct** — `DemandSignal` → `Product`（多対一）
  商品に対するリアルタイムの需要指標を表します。

- **DemandSignalInRegion** — `DemandSignal` → `Region`（多対一）
  需要シグナルが発生した地域を表します。

## データソース横断の統合

実際のFabric IQ環境では、これらのエンティティが大きく異なるデータソースから取得される場合があります。

| エンティティ | 一般的なデータソース |
|---|---|
| Inventory | Eventhouse（リアルタイム更新） |
| Forecast | Lakehouse（バッチ処理による機械学習予測） |
| DemandSignal | Eventhouse（ストリーミングデータ） |
| Product | Lakehouse（カタログ）とEventhouse（割引）の両方 |

オントロジーは、これらすべてを1つの接続グラフに**統合します**。「南西地域で需要シグナルが強い商品のうち、近隣倉庫の現在庫はいくつですか？」というクエリは、すべてのデータソースを継ぎ目なく横断します。

## ステップ5のグラフ

<ontology-embed id="official/iq-lab-retail-step-5" diff="official/iq-lab-retail-step-4" height="450px"></ontology-embed>

*13個のエンティティ型があります。InventoryはProductとWarehouseをつなぎ、DemandSignalはProductとRegionを接続します。グラフはコマース、物流、計画の各ドメインにまたがるようになりました。*

## 学んだこと

- オントロジーは**履歴、リアルタイム、予測**の各データを統合できます
- **Inventory**は代表的な交差エンティティで、ProductとWarehouseの間に位置します
- **DemandSignal**はProductとRegionの両方に接続し、複数の軸にまたがる分析を可能にします
- データソース横断の統合が中核的な価値です。1つのモデルで複数のデータエンジンを扱えます

```quiz
Q: Inventoryが「交差エンティティ」と呼ばれるのはなぜですか？
- ほかのエンティティより多くのデータを格納するため
- ProductとWarehouseの間に位置し、特定の場所にある特定商品の在庫を表すため [correct]
- オントロジー内で最も多くのリレーションシップを持つため
- Eventhouseをデータソースとする唯一のエンティティであるため
> InventoryはProductとWarehouseが交わる情報を表します。各在庫レコードが「Warehouse YにProduct Xはいくつありますか？」という問いに答えるため、代表的な交差エンティティ（またはジャンクションエンティティ）です。
```

残りは1ステップです。PromotionとReturnを追加して、全体像を完成させます。
