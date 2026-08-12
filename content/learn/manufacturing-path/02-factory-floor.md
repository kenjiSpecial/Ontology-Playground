---
title: "工場内の設備"
slug: factory-floor
description: "工場設備をリアルタイムで監視するIoTの基盤として、MachineとSensorを定義します。"
order: 2
embed: official/manufacturing-step-1
---

## IoTの基盤

すべてのスマート工場は、次の2つの概念から始まります。

- **Machine** — 工場内にはどの設備があるか？
- **Sensor** — その設備からどのようなデータが生成されているか？

機械とセンサーは、テレメトリの基盤を形成します。生産や品質を追跡する前に、どの設備が稼働し、何を報告しているかを把握する必要があります。

## エンティティの定義

### Machine

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `machineId` | string | ✓ |
| `name` | string | |
| `type` | string | |
| `status` | string | |
| `installDate` | date | |

`status` プロパティは、`running`、`idle`、`maintenance`、`offline` などの稼働状態を追跡します。これにより、リアルタイムのダッシュボード表示と保全計画の作成が可能になります。

### Sensor

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `sensorId` | string | ✓ |
| `type` | string | |
| `unit` | string | |
| `lastReading` | float | |
| `threshold` | float | |

`threshold` プロパティは警告のしきい値を定義します。`lastReading` が `threshold` を超えると、システムがアラームを発します。このパターンは予知保全の基礎です。

## リレーションシップ

- **monitors** — `Sensor` → `Machine`（多対一）
  複数のセンサーが同じ機械を監視します。たとえば、一方は温度を、もう一方は振動を監視します。

> **所有階層：** IoTオントロジーでは、センサーは機械に属します。向きが重要であり、センサーが機械を監視します。その逆ではありません。IoTプラットフォームは、この親子階層を使ってテレメトリデータを整理します。

## 現時点のグラフ

<ontology-embed id="official/manufacturing-step-1" height="300px"></ontology-embed>

*センサーで監視される機械という、シンプルながら意味のある出発点です。*

## 学んだこと

- **IoT階層**では、親子のリレーションシップ（Sensor → Machine）を使用します
- **状態プロパティ**により、稼働状態をリアルタイムで追跡できます
- **しきい値プロパティ**により、予知保全の警告を発せられます
- 2つのエンティティだけでも、有用なテレメトリ基盤を構築できます

```quiz
Q: SensorエンティティがlastReadingとthresholdの両方のプロパティを持つのはなぜですか？
- 一方の値が誤っている場合に備えて、予備の値を保存するため
- thresholdが警告の境界を定義し、lastReadingがそれを超えたときに予知保全のアラームを発するため [correct]
- すべてのIoT規格で両方の値が必須だから
- センサーの精度を計算するためにthresholdを使用するから
> しきい値のパターンは、予知保全の基礎です。現在の測定値を既知の安全限界と比較することで、システムは異常を自動検出し、設備が故障する前に担当者へ警告できます。
```

次は、Work-OrderとPartによる生産追跡を追加します。
