---
title: 果樹園の基盤
slug: orchard-foundation
description: Zavaの複数産地調達モデルを表す4つのエンティティ、Grower、Farm、Plot、FruitVarietyを定義します。
order: 2
embed: official/zava-grove-to-shelf-step-1
---

## Zavaのデータの起点

Zavaは提携生産者のネットワークから高級果実を調達しています。品質、出荷、小売注文を扱う前に、**誰が、どこで、何を栽培しているか**を表す語彙が必要です。

次の4つのエンティティで表現します。

- **Grower** — 提携企業（例：*Finca La Marina S.L.*）です。
- **Farm** — 生産者が所有または運営する地理的な農園です。
- **Plot** — 農園内で管理され、一つの品種が植えられている区画です。
- **FruitVariety** — 商用品種（例：*Nadorcott*マンダリン、*Sekoya Pop*ブルーベリー）です。

## エンティティ

### Grower

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `growerId` | string | ✓ |
| `name` | string | |
| `country` | string | |
| `partnerSince` | date | |
| `isMasterGrower` | boolean | |

`isMasterGrower`は、Zavaの戦略的な長期パートナーを示します。

### Farm

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `farmId` | string | ✓ |
| `name` | string | |
| `country` | string | |
| `region` | string | |
| `hectares` | decimal (ha) | |

### Plot

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `plotId` | string | ✓ |
| `hectares` | decimal (ha) | |
| `plantingYear` | integer | |

### FruitVariety

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `varietyId` | string | ✓ |
| `commercialName` | string | |
| `category` | string | |
| `shelfLifeDays` | integer (days) | |

## リレーションシップ

| 始点 | 動詞 | 終点 | カーディナリティ |
|---|---|---|---|
| Grower | owns | Farm | 1対多 |
| Farm | contains | Plot | 1対多 |
| Plot | grows | FruitVariety | 多対1 |

`Grower → Farm → Plot → FruitVariety`という連鎖により、店頭の一つの果実から、その果実が収穫された正確な区画までさかのぼる**エンドツーエンドのトレーサビリティ**が実現します。

## ここまでのグラフ

<ontology-embed id="official/zava-grove-to-shelf-step-1" height="380px"></ontology-embed>

*4つのエンティティと3つのリレーションシップだけで、「ZavaはスペインからNadorcottマンダリンを何ヘクタール分調達していますか？」といった問いに答えられます。*

```quiz
Q: Zavaのモデルで、`Plot`を`Farm`の単なるプロパティではなく、別のエンティティにするのはなぜですか？
- グラフを密に見せるため
- 一つの農園に、それぞれ異なる品種を植えた複数の区画が存在でき、トレーサビリティには区画単位の識別情報が必要だから [correct]
- 区画と農園では所有者が異なるから
- RDFで必須だから
> 通常、一つの農園では複数の品種を隣り合わせで栽培しています。Zavaは各収穫ロットを農園だけでなく特定の区画まで追跡する必要があるため、区画を第一級のエンティティとして扱います。
```

次は、**収穫イベント**とZavaで知られる**4段階の品質検査**を追加します。
