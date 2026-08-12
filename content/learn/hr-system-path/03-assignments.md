---
title: "配属"
slug: assignments
description: "Assignmentを中間エンティティとして追加し、従業員、部門、役職にまたがる人員配置履歴をモデル化します。"
order: 3
---

## 人員配置履歴の課題

従業員は時間の経過とともに、部門間を異動したり、役職を変更したりします。1つの部門には多数の従業員が所属でき、1つの役職を時期によって異なる人が担当することもあります。

これは単純な一対一の構造ではありません。

## 中間エンティティとしてのAssignment

次のエンティティを接続する**Assignment（配属）**を作成します。

- `Employee` -> `Assignment`（一対多）
- `Assignment` -> `Department`（多対一）
- `Assignment` -> `Position`（多対一）

Assignmentは、これらのリレーションシップの文脈を保持します。

### Assignmentのプロパティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `assignmentId` | string | ✓ |
| `startDate` | date | |
| `endDate` | date | |
| `isPrimary` | boolean | |

`startDate` と `endDate` があれば、次のような過去に関する問いに答えられます。

- 「第2四半期に財務部門に所属していたのは誰か」
- 「今年、部門を異動した従業員は誰か」

## 設計パターンの実践

これは、多くのドメインで使われる共通のパターンです。

- Enrollmentを介したStudentとCourse
- Orderの明細項目を介したCustomerとProduct
- Assignmentを介したEmployee、Department、Position

リレーションシップ自体に属性が必要な場合は、中間エンティティを使います。

```quiz
Q: Assignmentを独立したエンティティにする主な理由は何ですか？
- グラフで選べるアイコンが増えるから
- startDateやendDateなど、リレーションシップ固有の属性を保持するから [correct]
- 識別子が不要になるから
- 多対一のリレーションシップを防ぐから
> Assignmentには、時間に伴う人員配置の文脈を保存します。これらのプロパティはEmployee、Department、Positionのいずれか1つではなく、エンティティ間のリレーションシップに属します。
```

次に業績評価を追加し、人事分析モデルを完成させます。
