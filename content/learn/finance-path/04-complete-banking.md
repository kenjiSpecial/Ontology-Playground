---
title: "銀行モデルの完成"
slug: complete-banking
description: "LoanとInvestmentを追加して、融資商品とポートフォリオの保有資産をつなぎ、銀行オントロジーを完成させます。"
order: 4
embed: official/finance-step-3
---

## 金融商品

銀行は基本的な口座と取引に加えて、大きく分けて2種類の商品を提供しています。

- **ローン（Loan）** — 銀行が資金を貸し出す融資商品
- **投資（Investment）** — 顧客が資産を増やすための保有商品

これらを追加すると全体像が完成し、複数の経路を持つ興味深いリレーションシップが生まれます。

## Loan（ローン）

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `loanId` | string | ✓ |
| `principal` | decimal (USD) | |
| `apr` | decimal (%) | |
| `term` | integer (months) | |
| `status` | string | |

`term` は月数を表す整数で、期間プロパティによく使われるパターンです。`apr`（年率）にはパーセント単位を使用します。

## Investment（投資）

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `holdingId` | string | ✓ |
| `symbol` | string | |
| `shares` | decimal | |
| `purchasePrice` | decimal (USD) | |
| `currentValue` | decimal (USD) | |

`symbol` プロパティ（例：MSFT、AAPL）は株式を識別します。`purchasePrice` と `currentValue` の両方を持たせることで、損益を計算できます。

## 新しいリレーションシップ

4つのリレーションシップで金融商品をつなぎます。

- **has_loan** — `Customer` → `Loan`（一対多）
  1人の顧客が複数のローンを持つことができます。

- **funds** — `Account` → `Loan`（一対多）
  口座をローン返済の支払元として使用します。

- **holds** — `Customer` → `Investment`（一対多）
  顧客の投資ポートフォリオを表します。

- **linked_to** — `Account` → `Investment`（一対多）
  証券口座と投資の保有資産をつなぎます。

> **複数経路のパターン：** Investmentは、`holds` による直接経路と `Account → linked_to` による間接経路という*2つ*の異なる経路でCustomerにつながります。この重複は意図したもので、所有者（誰が保有しているか？）と資金源（どの口座が裏付けとなるか？）の両方をモデル化します。

## 完成したグラフ

<ontology-embed id="official/finance-step-3" diff="official/finance-step-2" height="500px"></ontology-embed>

*完成した銀行・金融オントロジーには、5つのエンティティと6つのリレーションシップがあります。LoanとInvestmentは、CustomerとAccountの両方を介してつながります。*

## 完成したモデルでできること

| 質問 | グラフの経路 |
|---|---|
| 多額のローンがある高リスク顧客は誰か？ | Customer (riskProfile=high) → Loan (principal > 100K) |
| 主要顧客のポートフォリオ価値はいくらか？ | Customer → Investment (sum currentValue) |
| ローンと投資の両方に資金を提供している口座はどれか？ | Account → Loan かつ Account → Investment |
| 投資収益がローン費用を上回る顧客は誰か？ | Customer → Investment (currentValue) と Customer → Loan (principal × apr) を比較 |

## GQLクエリの例

投資ポートフォリオがローン元本の合計を上回る顧客を検索します。

```gql
MATCH (c:Customer)-[:holds]->(inv:Investment),
      (c)-[:has_loan]->(loan:Loan)
WITH c, SUM(inv.currentValue) AS portfolio, SUM(loan.principal) AS debt
WHERE portfolio > debt
RETURN c.name, portfolio, debt
```

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 重要な概念 |
|---|---|---|---|
| 1 | Customer, Account | 2 | 所有関係、金融識別子 |
| 2 | Transaction | 3 | 活動の追跡、datetimeの精度 |
| 3 | Loan, Investment | 5 | 金融商品、複数経路のリレーションシップ |

## 重要なポイント

1. **所有関係の連鎖**（Customer → Account → Transaction）によって、コンプライアンスに関するクエリが可能になります
2. **datetimeの精度**は金融データに不可欠です
3. **複数経路のリレーションシップ**は、同じつながりが持つ異なる側面をモデル化します
4. **期間プロパティ**（月単位のterm）には、単位を伴う整数を使用します
5. 金融オントロジーが表すのはデータの形であり、機密データは元のシステムに残します

```quiz
Q: InvestmentがCustomer（「holds」を介する）とAccount（「linked_to」を介する）の両方につながるのはなぜですか？
- 誤りであり、必要なリレーションシップは1つだけだから
- 各リレーションシップが、所有者と資金源という異なる側面をモデル化するから [correct]
- Investmentが有効になるには、少なくとも2つのリレーションシップが必要だから
- 一対多のリレーションシップは常に対で作られるから
> 「holds」リレーションシップは「この投資を所有しているのは誰か？」に答え、「linked_to」は「この投資の資金を提供する口座はどれか？」に答えます。この2つは異なる問いであり、答えも異なる場合があります（例：共同口座から1人の投資に資金を提供する場合）。
```

銀行・金融の学習パスはこれで完了です。[カタログ](#/catalogue)から任意のステップを読み込み、操作しながら確認してみましょう。
