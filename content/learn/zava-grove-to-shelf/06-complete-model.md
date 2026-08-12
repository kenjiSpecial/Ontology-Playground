---
title: 完全なモデル
slug: complete-model
description: SustainabilityProgramを追加して、12個のエンティティと13個のリレーションシップからなる果樹園から店頭までのモデルを完成させ、デモに備えます。
order: 6
embed: official/zava-grove-to-shelf-step-5
---

## 最後のエンティティ：サステナビリティ

Zavaは、社内コードネームを**Dreams**とする生産者育成プログラムを運営しており、提携農園は任意で参加できます。このプログラムは、水利用の効率化、公正な報酬、生物多様性に関する取り組みに資金を提供します。現在、このデータはマーケティング システムにあり、サプライチェーンから切り離されています。

一つのエンティティと一つのリレーションシップを追加し、この情報をモデルへ取り込みます。

### SustainabilityProgram

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `programId` | string | ✓ |
| `name` | string | |
| `focusArea` | string | |
| `startYear` | integer | |

### 新しいリレーションシップ

| 始点 | 動詞 | 終点 | カーディナリティ |
|---|---|---|---|
| Farm | participatesIn | SustainabilityProgram | 多対多 |

一つの農園が複数のプログラム（例：*Dreams Water*と*Dreams Biodiversity*）に参加でき、一つのプログラムにも多数の農園が参加するため、多対多になります。

## 完成したグラフ

<ontology-embed id="official/zava-grove-to-shelf-step-5" diff="official/zava-grove-to-shelf-step-4" height="520px"></ontology-embed>

*12個のエンティティと13個のリレーションシップです。Zavaにとって重要なすべてのビジネス領域が第一級の概念となり、名前付きのエッジで接続されました。*

## デモで答えられるようになる問い

以前は複数のシステムを使い、何日もかけなければ答えられなかった次の5つの問いに、一つのオントロジーから答えられるようになります。

| 問い | 経路 |
|---|---|
| *「前四半期のマンダリンによる売上を、小売チェーン別、原産国別に示してください。」* | `Order forVariety FruitVariety[category=citrus]`をたどり、`Store.retailerName`と`HarvestLot → Plot → Farm.country`でグループ化 |
| *「過去30日間にブルーベリーの品質検査で不合格があった生産者は誰ですか？」* | `QualityCheck[passed=false] → HarvestLot[ofVariety.category=berry] → Plot → Farm ← owns ← Grower` |
| *「輸送中の出荷のうち、品種ごとの安全しきい値を温度が超えているものはどれですか？」* | `Shipment monitoredBy ColdChainSensor[temperatureC > carries.harvestLot.ofVariety.maxStorageTempC]` |
| *「出荷SH-2026-04812の温度逸脱によって、どの小売注文にリスクがあり、影響を受ける売上はいくらですか？」* | `Shipment[id=SH-2026-04812] → RetailDC supplies Store places Order[forVariety = breached variety, status=open]`をたどり、`kilograms × unitPriceEur`を合計 |
| *「今季のベリー取扱量のうち、Dreamsプログラム参加農園からの仕入れは何パーセントですか？」* | `HarvestLot[ofVariety.category=berry, harvestDate∈season]`を対象に、`fromPlot → Farm participatesIn SustainabilityProgram[name~"Dreams"]`を満たすかどうかでグループ化 |

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 主要な概念 |
|---|---|---|---|
| 1 | Grower、Farm、Plot、FruitVariety | 4 | 複数産地からの調達、トレーサビリティの基点 |
| 2 | HarvestLot、QualityCheck | 6 | 来歴イベント、4段階の品質管理体制 |
| 3 | Shipment、ColdChainSensor | 8 | ハブ エンティティ、時系列バインディング |
| 4 | RetailDC、Store、Order | 11 | 売上までの経路を完成 |
| 5 | SustainabilityProgram | 12 | 多対多のCSR情報を重ね合わせる |

## 重要なポイント

1. **一つの語彙で5つのシステムを横断できます。** 農業ERP、選果梱包施設の品質管理アプリ、IoT Eventhouse、小売EDIフィード、CSR記録はすべて、同じ12エンティティのモデルに対するバインディングになります。
2. **ハブ エンティティが重要です。** `HarvestLot`は来歴のハブ、`Shipment`はLakehouseとEventhouseを結ぶハブ、`FruitVariety`は供給と需要を結ぶハブです。
3. **時系列テレメトリを第一級の概念として扱います。** `ColdChainSensor`はオントロジー内の他のエンティティと同じように見えます。質問する人からは、基盤のストレージとしてEventhouseを選んでいることが見えません。
4. **サステナビリティを独立したスプレッドシートに閉じ込めません。** `SustainabilityProgram`を追加することで、CSRに関する問いでも売上に関する問いと同じグラフをたどれます。
5. **オントロジーが契約になります。** GQLクエリ、Fabric Data Agentのプロンプト、Activatorルールはすべて、同じエンティティ名とリレーションシップ名を参照します。

```quiz
Q: Zavaの完全なモデルで、*「今季のベリー取扱量のうち、Dreamsプログラム参加農園からの仕入れは何パーセントですか？」*という問いに答えるには、どの経路が必要ですか？
- Order → Store → RetailDC → Farm
- HarvestLot → Plot → Farm → SustainabilityProgram [correct]
- ColdChainSensor → Shipment → Farm → SustainabilityProgram
- FruitVariety → SustainabilityProgram
> 取扱量はHarvestLotに記録されています。そのロットがDreamsプログラム参加農園から来たかどうかを確認するには、HarvestLot → fromPlot → Plot →（その区画を含む）Farm → participatesIn → SustainabilityProgramとたどり、プログラム名で絞り込みます。
```

これでZavaの「果樹園から店頭まで」ラボは完了です。プレイグラウンドで[ステップ5のオントロジー](#/catalogue/official/zava-grove-to-shelf-step-5)を開き、クエリ、拡張、エクスポートを試してください。
