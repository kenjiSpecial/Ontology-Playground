---
title: "診療提供"
slug: care-delivery
description: "医療の予約と診療提供を支える中核エンティティ、Patient、Provider、Appointmentを定義します。"
order: 2
embed: official/healthcare-step-1
---

## 診療提供の基盤

診療提供は、次の3つの概念を中心に成り立ちます。

- **Patient** — 誰が診療を受けるか？
- **Provider** — 誰が診療を提供するか？
- **Appointment** — いつ、どこで診療を行うか？

この3つのエンティティは、医療の予約と提供を表します。あらゆる診断と治療は予約を起点として進みます。

## エンティティの定義

### Patient

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `patientId` | string | ✓ |
| `mrn` | string | |
| `dateOfBirth` | date | |
| `bloodType` | string | |
| `allergies` | string | |

`mrn`（診療録番号）は、病院内部の識別子です。`patientId` をオントロジーの識別子として使用する一方、`mrn` はEHRシステムに対応付ける医療分野固有のプロパティです。

### Provider

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `providerId` | string | ✓ |
| `name` | string | |
| `specialty` | string | |
| `licenseNumber` | string | |
| `department` | string | |

`specialty` と `department` プロパティを使うと、医療提供者を臨床分野で絞り込めます。これは紹介先や患者の振り分けを調べるクエリに不可欠です。

### Appointment

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `appointmentId` | string | ✓ |
| `scheduledTime` | datetime | |
| `duration` | integer (minutes) | |
| `type` | string | |
| `status` | string | |

`duration` プロパティには分単位の整数を使用します。これにより、予約時間の計算や稼働率の分析が可能になります。

## リレーションシップ

- **has_appointment** — `Patient` → `Appointment`（一対多）
  1人の患者が時間の経過とともに複数の予約を持つことができます。

- **sees** — `Provider` → `Appointment`（一対多）
  1人の医療提供者が複数の予約を担当します。

> **共有エンティティのパターン：** AppointmentはPatientとProviderの*両方*につながります。これは、独立した2つのエンティティが関わる接点です。このパターンは、2者が同じイベントに参加する場面でよく使われます。

## 現時点のグラフ

<ontology-embed id="official/healthcare-step-1" height="350px"></ontology-embed>

*PatientとProviderの両方が、診療提供の接点となるAppointmentにつながっています。*

## 学んだこと

- **共有エンティティ**（Appointment）は、独立した2者（PatientとProvider）をつなぎます
- **期間プロパティ**には、単位（分、時間、日）を伴う整数を使用します
- **分野固有の識別子**（MRN）は、オントロジーの識別子（patientId）と併存できます
- 予約の三角形（Patient–Appointment–Provider）が医療モデルの基盤になります

```quiz
Q: AppointmentをPatientかProviderの一方だけでなく、両方につなぐのはなぜですか？
- グラフをより完全に見せるため
- Appointmentは2者の接点を表す共有エンティティだから [correct]
- すべてのエンティティには少なくとも2つのリレーションシップが必要だから
- PatientとProviderが同じプロパティを持つから
> 予約は本質的に、患者と医療提供者の両方が関わる共同イベントです。両方のリレーションシップをモデル化することで予約の全体像を表し、「患者の次回受診はいつか？」と「この医療提供者が1日に診る患者は何人か？」のどちらの視点からもクエリを実行できます。
```

次はDiagnosisを追加して、病状を追跡します。
