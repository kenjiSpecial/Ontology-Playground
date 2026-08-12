---
title: "顧客と口座"
slug: customer-accounts
description: "銀行業務の基礎となる Customer と Account を、所有関係と金融プロパティとともに定義します。"
order: 2
embed: official/finance-step-1
---

## 銀行業務の基礎

あらゆる金融機関のモデルは、2つの中核概念から始まります。

- **Customer** — 誰が口座を所有しているか？
- **Account** — どこで資金を保管し、管理しているか？

この組み合わせが、あらゆる銀行オントロジーの基礎になります。ほかのすべての金融商品は、この2つを介してつながります。

## エンティティの定義

### Customerエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `customerId` | string | ✓ |
| `name` | string | |
| `ssn` | string | |
| `creditScore` | integer | |
| `riskProfile` | string | |

`creditScore` は融資判断に使用する整数（300〜850）です。`riskProfile` プロパティには、コンプライアンスと監視のために銀行が行った評価を記録します。

> **機密データに関する注意：** `ssn` のようなプロパティは、オントロジー内ではメタデータとして表現されます。これはどのようなデータが*存在するか*を示すもので、実際の値ではありません。オントロジーはスキーマであり、データベースではありません。

### Accountエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `accountNumber` | string | ✓ |
| `type` | string | |
| `balance` | decimal (USD) | |
| `interestRate` | decimal (%) | |
| `openDate` | date | |

`type` プロパティで、当座口座、普通預金口座、証券口座を区別します。`interestRate` にはパーセント単位を使用します。

## 所有関係

- **owns** — `Customer` → `Account`（一対多）
  1人の顧客が複数の口座（当座、普通預金、証券）を所有できますが、各口座を所有する顧客は1人です。

## 現時点のグラフ

<ontology-embed id="official/finance-step-1" height="300px"></ontology-embed>

*Customer と Account が所有関係でつながっています。単純ですが、基礎となる構造です。*

## 学んだこと

- **整数プロパティ**は、スコアや評価（creditScore）に適しています
- **パーセント単位**（%）は、割合を表すプロパティであることを示します
- **owns** リレーションシップが、基本となる所有関係の連鎖を作ります
- オントロジーが表すのはデータ自体ではなくデータの*形*です。SSNのような機密項目もメタデータとして扱います

```quiz
Q: creditScoreをstringではなくintegerとしてモデル化するのはなぜですか？
- stringはデータベースへの保存が難しいため
- integer型なら数値比較や範囲クエリ（例：creditScore > 700）を実行できるため [correct]
- クレジットスコアは常に3桁ちょうどであるため
- integerのほうが必要な保存容量が少ないため
> integer型を使用することで、creditScoreが比較、範囲、平均、しきい値などの数値演算に対応していることをオントロジーで示せます。stringプロパティでは、この能力をクエリエンジンへ伝えられません。
```

次は Transaction を追加して、口座の活動を追跡します。
