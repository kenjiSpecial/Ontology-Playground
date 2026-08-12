---
title: 収穫と品質
slug: harvest-and-quality
description: HarvestLotとQualityCheckを追加し、追跡可能なすべての収穫イベントとZavaの4段階品質管理体制を表現します。
order: 3
embed: official/zava-grove-to-shelf-step-2
---

## すべての箱をロットで追跡

区画で収穫された果実は、その重量分が**HarvestLot**になります。これは、以降のサプライチェーン全体を流れるトレーサビリティの単位です。後に発生する温度逸脱、小売業者からの返品、顧客からの申し立てといったすべてのイベントは、最終的にHarvestLotまでさかのぼれます。

Zavaは**「4段階品質管理」**も実施しています。同じロットを、圃場、選果梱包施設、配送先の物流センター、最後に店舗という4つの異なる段階で検査します。各検査は、それぞれ固有の段階番号を持つ個別の`QualityCheck`イベントです。

## エンティティ

### HarvestLot

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `lotId` | string | ✓ |
| `harvestDate` | date | |
| `kilograms` | decimal (kg) | |
| `qcGrade` | string | |

### QualityCheck

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `checkId` | string | ✓ |
| `stage` | integer (1–4) | |
| `passed` | boolean | |
| `defectRate` | decimal (%) | |
| `checkedAt` | datetime | |

`stage`フィールドによって、セマンティック レイヤーに4段階の管理体制が明示されます。そのため、*「ステージ3の検査に継続して不合格となっている生産者は誰ですか？」*というビジネス上の問いを、プロパティの直接的なフィルターとして表現できます。

## 新しいリレーションシップ

| 始点 | 動詞 | 終点 | カーディナリティ |
|---|---|---|---|
| HarvestLot | fromPlot | Plot | 多対1 |
| HarvestLot | ofVariety | FruitVariety | 多対1 |
| QualityCheck | checks | HarvestLot | 多対1 |

`fromPlot → grows → FruitVariety`があるため、`ofVariety`は冗長に見えるかもしれません。しかし、出荷に含まれる品種構成を調べるクエリで一つの経路を省略できます。さらに重要なのは、植え替え周期によって区画上の公称品種と異なる場合がある、*収穫時点の*品種を記録できることです。

## ここまでのグラフ

<ontology-embed id="official/zava-grove-to-shelf-step-2" diff="official/zava-grove-to-shelf-step-1" height="420px"></ontology-embed>

*エンティティは6つです。新しい二つの中心に注目してください。HarvestLotが来歴の基点となり、QualityCheckが横から接続されています。*

## 答えられるようになるビジネス上の問い

- *「過去30日間にブルーベリーの品質検査で不合格があった生産者は誰ですか？」*
  → `ofVariety.category = "berry"`で絞り込み、`QualityCheck[passed=false] → HarvestLot → Plot → Farm → Grower`をたどります。
- *「段階別、原産国別の品質検査合格率はどのくらいですか？」*
  → `QualityCheck.stage`と`HarvestLot → Plot → Farm.country`でグループ化します。

```quiz
Q: Zavaが`HarvestLot`に4つの真偽値列（`qc1Passed`、`qc2Passed`など）を設けるのではなく、`QualityCheck`を別のエンティティとしてモデル化するのはなぜですか？
- RDFが真偽値をサポートしていないから
- エンティティにすると、各検査に固有の`inspector`、`defectRate`、`checkedAt`を持たせ、`stage`ごとに検査を集計または絞り込めるから [correct]
- グラフ描画のパフォーマンスが向上するから
- Fabric IQが真偽値列をサポートしていないから
> 真偽値にすると、検査担当者、タイムスタンプ、不良率の情報が失われます。エンティティにすることで、QualityCheckは集計、絞り込み、結合が可能な第一級のイベントになります。これは「ステージ3で最も頻繁に不合格になる生産者は誰か」に答えるために必要な構造です。
```

次は、収穫ロットを事業のコールドチェーン側に接続します。
