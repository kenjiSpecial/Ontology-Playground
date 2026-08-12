---
title: "組織の中核"
slug: organization-core
description: "Employee、Department、Positionを定義し、組織の中核構造をモデル化します。"
order: 2
---

## 組織構造の基盤を構築する

人事オントロジーは、次の3つの中核エンティティから始まります。

- **Employee（従業員）** — 組織で働く人
- **Department（部門）** — 業務を編成する事業単位
- **Position（役職）** — 責任範囲と職位を表す役割の定義

この3つのエンティティが、採用、報告、人員計画に必要な最小限の構造になります。

## エンティティ設計

### Employee

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `employeeId` | string | ✓ |
| `name` | string | |
| `hireDate` | date | |
| `employmentStatus` | enum | |
| `jobLevel` | enum | |

`employeeId` は、安定した業務上の識別子です。メールアドレスのように変更される可能性がある属性を主キーに使わないでください。

### Department

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `departmentId` | string | ✓ |
| `name` | string | |
| `budget` | decimal | |
| `status` | enum | |

部門予算を含めることで、同じグラフからリソース計画とコストセンター分析を行えます。

### Position

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `positionId` | string | ✓ |
| `title` | string | |
| `level` | enum | |
| `salaryBand` | string | |

Positionは、役割の定義と、その役割に現在配属されている人を分離します。

## 分離が重要な理由

これらの概念を1つの「EmployeeProfile」エンティティにまとめると、次のような場面に柔軟に対応できなくなります。

- 過去の人員配置の変更
- 役割の異動
- 採用前から存在する空き役職

エンティティを分けることで、モデルを明快かつ拡張可能に保てます。

```quiz
Q: 役割のフィールドをEmployeeだけに直接保存せず、Positionを独立したエンティティとしてモデル化するのはなぜですか？
- オントロジーツールでは3つ以上のエンティティが必要だから
- Positionは、特定の従業員から独立して存在できる再利用可能な役割の定義だから [correct]
- リレーションシップの数を減らすため
- 識別子プロパティを使わないようにするため
> Positionは役割自体（役職名、職位、給与等級）を表し、Employeeは人を表します。両者を分離することで、空き役職、異動、明快な人員配置分析に対応できます。
```

次にAssignmentを追加し、誰が、どこで、どの役割を、いつ担ったかを記録します。
