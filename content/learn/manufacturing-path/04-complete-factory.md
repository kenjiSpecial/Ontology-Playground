---
title: "完成した工場モデル"
slug: complete-factory
description: "Quality-Checkを追加して製造オントロジーを完成させ、生産から検査までのループを完結させます。"
order: 4
embed: official/manufacturing-step-3
---

## 品質ループの完結

製造は、部品が完成した時点では終わりません。検査が必要です。**Quality-Check**は、部品が仕様を満たしていることを検証し、生産サイクルを完結させます。

## Quality-Checkエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `checkId` | string | ✓ |
| `inspector` | string | |
| `checkDate` | date | |
| `passed` | boolean | |
| `defectCode` | string | |

`passed` 真偽値は、部品を出荷するか、再加工するかを決める重要なプロパティです。`defectCode` プロパティは、不合格の原因を分類して根本原因分析に役立てます。

## 新しいリレーションシップ

- **inspects** — `Quality-Check` → `Part`（多対一）
  各品質検査は特定の部品を検査します。1つの部品が、初回検査や再加工後の再検査など、複数回の検査を受けることもあります。

> **フィードバックループ：** 品質検査で不合格になると、`Quality-Check (passed=false) → Part → Work-Order → Machine` の順に生産チェーンを遡れます。このフィードバックループにより、スマート工場は問題のある機械を特定し、時間をかけて生産品質を改善できます。

## 完成したグラフ

<ontology-embed id="official/manufacturing-step-3" diff="official/manufacturing-step-2" height="500px"></ontology-embed>

*5つのエンティティと5つのリレーションシップからなる、完成したスマート製造オントロジーです。Quality-Checkが、検査から生産へ戻るフィードバックループを完結させます。*

## 完成したモデルでできること

| 質問 | グラフの経路 |
|---|---|
| 検査で不合格となる部品を製造した機械はどれか？ | Machine → Part ← Quality-Check (passed=false) |
| 不良部品が製造されたとき、異常値を示していたセンサーはどれか？ | Sensor → Machine → Part ← Quality-Check (passed=false) |
| 作業指示の優先度別の不良率はいくらか？ | Work-Order (priority) → Part ← Quality-Check |
| 再検査が必要な部品はどれか？ | Part ← Quality-Check (passed=false, count > 1) |

## GQLクエリの例

センサー異常と品質上の不合格を関連付けます。

```gql
MATCH (s:Sensor)-[:monitors]->(m:Machine)-[:has_part]->(p:Part)<-[:inspects]-(qc:QualityCheck)
WHERE s.lastReading > s.threshold AND qc.passed = false
RETURN m.name, s.type, s.lastReading, p.name, qc.defectCode
```

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 重要な概念 |
|---|---|---|---|
| 1 | Machine、Sensor | 2 | IoT階層、テレメトリ |
| 2 | Work-Order、Part | 4 | 生産チェーン、公差 |
| 3 | Quality-Check | 5 | フィードバックループ、検査 |

## 重要なポイント

1. **IoT階層**はセンサーを機械の配下に整理し、テレメトリを集約します
2. **生産チェーン**は、スケジュールを表すエンティティを介して設備と生産物をつなぎます
3. **品質フィードバックループ**により、生産チェーン全体の根本原因分析が可能になります
4. **しきい値に基づく警告**が予知保全を支えます
5. **真偽値プロパティ**（passed）は、ワークフロー内に明確な判断点を作ります

```quiz
Q: Quality-Checkは、製造オントロジー内でどのようにフィードバックループを作りますか？
- Machineへ直接つながります
- 不合格となった検査からPart → Work-Order → Machineと遡り、不良の発生源を特定します [correct]
- Sensorエンティティへ戻るループを作ります
- 品質検査はフィードバックループを作りません
> 品質検査で不合格になると、Quality-Check → Part → Work-Order → Machineという経路で不良の発生源まで遡れます。このフィードバックループは、どの機械、作業指示、条件が不良部品を生み出したかを特定し、スマート製造を継続的に改善するための基礎です。
```

スマート製造の学習パスはこれで完了です。[カタログ](#/catalogue)から任意のステップを読み込み、対話的に探索してみましょう。
