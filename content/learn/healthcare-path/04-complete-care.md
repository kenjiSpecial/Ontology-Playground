---
title: "診療モデルの完成"
slug: complete-care
description: "Prescriptionを追加して診断と治療をつなぎ、診療サイクルを閉じて医療オントロジーを完成させます。"
order: 4
embed: official/healthcare-step-3
---

## 治療の連鎖

医療モデルを完成させる最後の要素が、診断に対する治療を表す**Prescription**です。これにより、予約 → 診断 → 治療という診療サイクルが閉じます。

## Prescriptionエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `rxNumber` | string | ✓ |
| `medication` | string | |
| `dosage` | string | |
| `frequency` | string | |
| `refillsRemaining` | integer | |

識別子には、薬局で標準的に使われる処方箋番号 `rxNumber` を使用します。整数の `refillsRemaining` により、再調剤の残り回数と服薬遵守状況を追跡できます。

## 新しいリレーションシップ

- **treated_by** — `Diagnosis` → `Prescription`（一対多）
  1つの診断から複数の処方箋が作成されることがあります（たとえば、同じ病状に対して複数の薬剤を使う場合）。

- **prescribes** — `Provider` → `Prescription`（一対多）
  医療提供者は患者の処方箋を発行します。

> **診療の連鎖：** 完成した経路は `Patient → Diagnosis → Prescription` です。`Provider` は、予約を担当し、診断を行い、処方箋を発行するというすべての段階に接続します。これは実際の臨床ワークフローを反映しています。

## 完成したグラフ

<ontology-embed id="official/healthcare-step-3" diff="official/healthcare-step-2" height="500px"></ontology-embed>

*完成した医療オントロジーには、5つのエンティティと6つのリレーションシップがあります。診療の連鎖はPatientからDiagnosisを経てPrescriptionへ続きます。*

## 完成したモデルでできること

| 質問 | グラフの経路 |
|---|---|
| 処方箋の再調剤が必要な患者は誰か？ | Patient → Diagnosis → Prescription (refillsRemaining=0) |
| 最も多くの薬剤を処方している医療提供者は誰か？ | Provider → Prescription (count) |
| まだ治療されていない重症の診断はどれか？ | Diagnosis (severity=severe) から Prescription へのリレーションシップなし |
| 自ら診断した病状に処方も行っている専門医は誰か？ | Provider → Diagnosis かつ Provider → Prescription |

## GQLクエリの例

重症の診断を受け、処方薬がなくなりそうな患者を検索します。

```gql
MATCH (p:Patient)-[:diagnosed_with]->(d:Diagnosis)-[:treated_by]->(rx:Prescription)
WHERE d.severity = 'severe' AND rx.refillsRemaining <= 1
RETURN p.patientId, d.description, rx.medication, rx.refillsRemaining
```

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 重要な概念 |
|---|---|---|---|
| 1 | Patient, Provider, Appointment | 3 | 共有エンティティ、予約管理 |
| 2 | Diagnosis | 4 | 標準化されたコード、2方向の接続 |
| 3 | Prescription | 5 | 診療の連鎖、治療の追跡 |

## 重要なポイント

1. **共有エンティティ**（Appointment、Diagnosis）は複数の主体をつなぎます
2. **標準化されたコード**（ICD、Rx）により、システム間の相互運用が可能になります
3. **診療の連鎖**（Patient → Diagnosis → Prescription）は臨床ワークフローをモデル化します
4. **Providerはすべての段階に接続します** — 医療提供における中心的な役割を反映しています
5. **整数プロパティ**（refillsRemaining、duration）により、業務上のクエリを実行できます

```quiz
Q: 完成した医療オントロジー全体で、Providerエンティティはどのようにつながっていますか？
- ProviderはAppointmentにだけつながる
- ProviderはAppointment、Diagnosis、Prescriptionにつながり、診療の全段階で担う役割を反映している [correct]
- ProviderはPatientに直接つながる
- ProviderはPrescriptionにだけつながる
> Providerはこのオントロジーで最も多くの接続を持つエンティティです。予約を担当し、診断を行い、処方箋を発行します。これは、医療提供者が診療の連鎖の全段階に関わる実際のワークフローを反映しています。
```

医療システムの学習パスはこれで完了です。[カタログ](#/catalogue)から任意のステップを読み込み、操作しながら確認してみましょう。
