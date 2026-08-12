---
title: フルフィルメントと物流
slug: fulfillment-and-logistics
description: Shipment、Carrier、Warehouseを追加し、注文が倉庫から顧客へ届くまでの配送工程をモデル化します。
order: 5
embed: official/iq-lab-retail-step-4
---

## 配送工程

顧客が行った注文は、どのように顧客のもとへ届くのでしょうか。フルフィルメント層は、注文を物理的な物流基盤へ接続します。

- **Shipment** — 配送の記録
- **Carrier** — FedExやUPSなどの物流事業者
- **Warehouse** — 商品を保管して出荷するフルフィルメントセンター

## Shipmentエンティティ

各Shipmentは1回の配送を表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `shipmentId` | string | ✓ |
| `shipDate` | date | |
| `deliveryDate` | date | |
| `status` | string | |

## Carrierエンティティ

配送を担当する物流会社を表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `carrierId` | string | ✓ |
| `carrierName` | string | |
| `serviceType` | string | |

## Warehouseエンティティ

フルフィルメントセンターを表します。

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `warehouseId` | string | ✓ |
| `warehouseName` | string | |
| `capacity` | integer | |

## 新しいリレーションシップ

3つの新しいリレーションシップで物流エンティティを接続します。

- **ShipmentFulfillsOrder** — `Shipment` → `Order`（多対一）
  各出荷は1件の注文を履行します。同じ注文を複数の出荷で履行する分割出荷も可能です。

- **ShipmentByCarrier** — `Shipment` → `Carrier`（多対一）
  各出荷は1社の配送業者が担当します。

- **ShipmentDepartedFromWarehouse** — `Shipment` → `Warehouse`（多対一）
  各出荷は1か所の倉庫から発送されます。

## ハブパターン

**Shipment**が**ハブエンティティ**として機能していることに注目してください。Order、Carrier、Warehouseへ同時に接続します。これは、複数の概念を橋渡しする取引エンティティやイベントエンティティでよく使われるパターンです。

```
Carrier ← Shipment → Order → Customer
              ↓
          Warehouse
```

CarrierからShipment、Order、Customerへとグラフを一度たどるだけで、「CarrierXから出荷を受け取った顧客は誰ですか？」という質問に答えられます。

## ステップ4のグラフ

<ontology-embed id="official/iq-lab-retail-step-4" diff="official/iq-lab-retail-step-3" height="450px"></ontology-embed>

*10個のエンティティ型が、豊かに接続されたグラフを形成しています。Shipmentは物流層（Carrier、Warehouse）をコマース層（Order、Customer）へ接続します。グラフを使って、任意の倉庫から任意の顧客までたどれます。*

## 学んだこと

- Shipmentのような**ハブエンティティ**は複数のドメインを接続します
- 既存のエンティティを変更せずに、物流層でコマース層を拡張できます
- グラフ探索によって、ドメイン横断クエリを自然に表現できます。「南西地域へ出荷する倉庫はどれですか？」という質問にSQLのJOINは必要ありません
- オントロジーは10個のエンティティと10個のリレーションシップに成長しましたが、まだ読みやすい規模です

```quiz
Q: オントロジー内でShipmentエンティティはどのような役割を果たしますか？
- Orderエンティティの代わりになる
- 物流層とコマース層を接続するハブとして機能する [correct]
- 顧客の住所を保存する
- WarehouseとCarrierの間のカーディナリティを定義する
> Shipmentは複数のドメインを接続するハブエンティティです。Orderを物流基盤（Carrier、Warehouse）へ接続することで、既存のエンティティを変更せずにドメイン横断クエリを可能にします。
```

次は、在庫追跡と需要予測を追加します。
