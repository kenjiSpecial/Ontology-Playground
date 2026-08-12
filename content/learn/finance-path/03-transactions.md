---
title: "取引"
slug: transactions
description: "Transactionレコードを追加し、口座で発生するすべての引き落とし、入金、振り替えを追跡します。"
order: 3
embed: official/finance-step-2
---

## 活動の追跡

取引履歴がない口座から分かるのは、ある時点の残高だけです。**Transaction** を追加すると、購入、入金、振り替え、手数料というすべての資金の流れを記録できます。

これにより、次のような問いに答えられます。
- 「この顧客は先月、飲食店でいくら使ったか？」
- 「異常な取引パターンがある口座はどれか？」
- 「口座の種類ごとの平均取引額はいくらか？」

## Transactionエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `transactionId` | string | ✓ |
| `amount` | decimal (USD) | |
| `type` | string | |
| `timestamp` | datetime | |
| `merchant` | string | |

金融取引には高い時刻精度が必要なため、`timestamp` には単なるdateではなくdatetimeを使用します。不正検知では、午後2時30分の購入と午後2時31分の購入を区別する必要があります。

`merchant` プロパティには取引先（加盟店）を記録し、支出カテゴリの分析に活用します。

## 新しいリレーションシップ

- **has_transaction** — `Account` → `Transaction`（一対多）
  各口座には時間の経過とともに多数の取引が発生しますが、各取引が属する口座は1つです。

これにより、所有関係の連鎖が `Customer → Account → Transaction` へと延びます。

## 成長するグラフ

<ontology-embed id="official/finance-step-2" diff="official/finance-step-1" height="400px"></ontology-embed>

*Transactionによって活動の層が加わり、所有関係の連鎖が Customer → Account → Transaction へと延びます。*

## 学んだこと

- **datetimeの精度**は、金融やコンプライアンスのシナリオで重要です
- **所有関係の連鎖**（Customer → Account → Transaction）によって、詳細へ掘り下げるクエリが可能になります
- `merchant` プロパティを使うと、Merchantエンティティを追加せずに支出を分析できます
- エンティティを追加するたびに、より深い問いへ答えられるようになります

```quiz
Q: Transactionのtimestampにdateではなくdatetime型を使用するのはなぜですか？
- datetimeが、時刻に関するすべての項目の既定プロパティ型であるため
- 金融取引では、不正検知や監査証跡のために時刻まで正確に記録する必要があるため [correct]
- 現代のオントロジーではdate型が非推奨であるため
- datetimeのほうがdateより必要な保存容量が少ないため
> 金融コンプライアンスと不正検知には、正確なタイムスタンプが必要です。同じ日でも数分違いで発生した2つの取引が、不正パターンを示すことがあります。datetimeは日付と時刻の両方を記録し、必要な精度を確保します。
```

次は Loan と Investment を追加し、銀行の商品体系を完成させます。
