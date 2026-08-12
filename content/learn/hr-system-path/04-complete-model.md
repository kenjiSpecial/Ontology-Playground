---
title: "完成した人事モデル"
slug: complete-model
description: "PerformanceReviewを追加し、完成した人事オントロジーを実際の人員分析の問いに適用します。"
order: 4
embed: community/ravi-chandu/hr-system
---

## ピープルアナリティクス層を完成させる

最後に追加するエンティティは**PerformanceReview（業績評価）**です。評価期間ごとの評価結果を従業員に結び付けます。

リレーションシップは次のとおりです。

- `Employee` -> `PerformanceReview`（一対多）

### PerformanceReviewのプロパティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `reviewId` | string | ✓ |
| `reviewPeriod` | string | |
| `rating` | enum | |
| `reviewDate` | date | |

これで、日常業務と戦略の両方に関する人事の問いを、1つのグラフで扱えるようになります。

## 完成したグラフ

<ontology-embed id="community/ravi-chandu/hr-system" height="460px"></ontology-embed>

*Employee、Department、Position、Assignment、PerformanceReviewの5エンティティで構成される人事システムのオントロジー。*

## グラフで答えられる問いの例

| 問い | グラフの経路 |
|---|---|
| 上級従業員が最も多い部門はどこか | Department <- Assignment <- Employee（`jobLevel=senior`） |
| 過去1年間に役割を変更した従業員は誰か | Employee -> Assignment（日付ごとに複数の記録） -> Position |
| 最高評価を受けた従業員が多いチームはどこか | Department <- Assignment <- Employee -> PerformanceReview（`rating=outstanding`） |
| 現在は有効でない配属はどれか | Assignment（`endDate` が設定済み、または `isPrimary=false`） |

## 要点

1. **人**、**組織単位**、**役割**をそれぞれ独立したエンティティに分けます。
2. **Assignment**を中間エンティティとして使い、時間を考慮した人員配置履歴を表します。
3. **PerformanceReview**を使い、測定可能な評価結果を従業員エンティティに関連付けます。
4. 識別子を安定させ、状態は列挙値で統制します。

```quiz
Q: 時間の経過に伴う役割や部門の変更を履歴として分析できるのは、どのエンティティですか？
- Employee
- Department
- Assignment [correct]
- PerformanceReview
> Assignmentには、特定の従業員、部門、役職の組み合わせについて、開始日と終了日を記録します。Assignmentがなければ、人員配置の履歴を明確に追跡できません。
```

人事システム学習パスはこれで完了です。[カタログ](#/catalogue/community/ravi-chandu/hr-system)でモデルを開くか、[デザイナー](#/designer/community/ravi-chandu/hr-system)で引き続き改良してください。
