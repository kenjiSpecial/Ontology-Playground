---
title: "生産追跡"
slug: production
description: "製造対象を追跡するWork-OrderとPartを追加し、機械とその生産物をつなぎます。"
order: 3
embed: official/manufacturing-step-2
---

## 監視から生産へ

センサーからは機械が*どのように*稼働しているかが分かりますが、*何を*製造しているかも把握する必要があります。**Work-Order**と**Part**のエンティティにより、工場モデルへ生産追跡を追加します。

生産追跡を追加すると、次の問いに答えられます。
- 「このシフトで最も多くの部品を製造している機械はどれか？」
- 「予定より遅れている作業指示はいくつあるか？」
- 「現在CNC-01で製造されている部品は何か？」

## Work-Orderエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `workOrderId` | string | ✓ |
| `priority` | string | |
| `status` | string | |
| `startDate` | date | |
| `dueDate` | date | |

作業指示は `startDate` と `dueDate` の両方を持つため、スケジュール遵守状況を計算できます。`priority` と組み合わせることで、生産計画のクエリに活用できます。

## Partエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `partId` | string | ✓ |
| `name` | string | |
| `material` | string | |
| `weight` | float | |
| `tolerance` | float | |

`tolerance` プロパティは、許容できる製造上の偏差を定義します。公差が厳しい部品には、より高精度な機械が必要です。これは生産計画における重要な制約です。

## 新しいリレーションシップ

- **assigned_to** — `Work-Order` → `Machine`（多対一）
  作業指示は、生産を行う特定の機械に割り当てられます。

- **produces** — `Work-Order` → `Part`（一対多）
  1件の作業指示で、1つ以上の部品を製造します。

- **has_part** — `Machine` → `Part`（一対多）
  機械が部品を製造します（生産物から見た関係です）。

> **生産チェーン：** `Machine ← Work-Order → Part` というチェーンは、スケジュールを表すエンティティを介して設備と生産物をつなぎます。医療分野でAppointmentがPatientとProviderをつなぐ構造と同様に、中央のエンティティがイベントを表します。

## 拡張されたグラフ

<ontology-embed id="official/manufacturing-step-2" diff="official/manufacturing-step-1" height="400px"></ontology-embed>

*Work-OrderとPartがグラフに加わり、IoT基盤へ生産追跡が追加されました。差分表示では、新しく追加された要素を確認できます。*

## 学んだこと

- **生産チェーン**は、スケジュールを表すエンティティ（Work-Order）を介して設備と生産物をつなぎます
- **2つの日付プロパティ**（startDate/dueDate）により、スケジュール遵守状況を追跡できます
- **公差プロパティ**は、製造精度の要件を表現します
- 工場モデルで、監視（センサー）と生産（作業指示）の両方を扱えるようになりました

```quiz
Q: Partエンティティのtoleranceプロパティは何を表しますか？
- 不良になってもよい部品数の上限
- 許容できる製造上の偏差。公差を外れる部品には、より高精度な機械が必要です [correct]
- 部品の製造に許される時間
- 部品が耐えられる温度範囲
> 公差は、部品の実寸が仕様からどの程度までずれてもよいかを定義します。厳しい公差には、より高精度な機械と慎重な品質管理が必要になるため、生産計画における重要な制約です。
```

次は、Quality-Checkを追加して生産ループを完結させます。
