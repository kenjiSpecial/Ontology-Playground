---
title: ローンの中核三者
slug: core-loan-triad
description: FIBOローンの基礎となるLoan、Borrower、Lenderの三者を、プロパティとリレーションシップでモデル化します。
order: 2
embed: official/fibo-loans-step-1
reviewStatus: under-human-review
---

## 契約の中核

あらゆる融資システムは、FIBOのローンおよび債務モジュールにある次の3つの中核概念から始まります。

- **Loan** — 債務証書と契約の枠組み（`LOAN/LoansGeneral/Loans`）
- **Borrower** — 返済義務を負う当事者のロール（`FBC/DebtAndEquities/Debt`）
- **Lender** — 資金を当初提供する当事者のロール（`FBC/DebtAndEquities/Debt`）

FIBOのOWLオントロジーでは、これらは`fibo-loan-ln-ln:Loan`、`fibo-fbc-dae-dbt:Borrower`、`fibo-fbc-dae-dbt:Lender`としてモデル化されています。
LOANモジュールは、これらの当事者ロール概念をインポートし、ローン固有の用途に合わせて制約します。このラボではクラス階層を簡略化しますが、中核的なセマンティクスは維持します。

## 主要なプロパティ

### Loan

| プロパティ | 型 | 説明 |
|---|---|---|
| `loanId` | string | 識別子 |
| `principalAmount` | decimal (USD) | 当初の契約元本金額 |
| `isInterestOnly` | boolean | 当初期間中に借り手が利息のみを支払うかどうか |

### Borrower

| プロパティ | 型 | 説明 |
|---|---|---|
| `borrowerId` | string | 識別子 |
| `name` | string | 当事者名 |
| `creditScore` | integer | 引受審査の指標（例：FICOスコア） |

### Lender

| プロパティ | 型 | 説明 |
|---|---|---|
| `lenderId` | string | 識別子 |
| `name` | string | 組織名 |
| `lenderType` | string | 分類（例："銀行"、"信用組合"、"住宅ローン会社"） |

## リレーションシップ

FIBOでは、ローン当事者のロールを、契約オブジェクトから当事者へのリレーションシップとしてモデル化します。

- **owedBy**：`Loan` → `Borrower`（`many-to-one`）— 1件のローンに返済義務を負う借り手は1人ですが、1人の借り手は複数のローンを保有できます
- **originatedBy**：`Loan` → `Lender`（`many-to-one`）— 1件のローンを組成する貸し手は1者ですが、1者の貸し手は複数のローンを組成できます

> **FIBO参照**：完全なFIBOモデルでは、借り手と貸し手は債務およびローンのオントロジー全体で使用される契約当事者ロールの概念であり、そのロールのセマンティクスは当事者と契約のパターンに基づきます。ここでは分かりやすくするため、直接的なエンティティモデルに簡略化しています。[FBC Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)、[LOAN LoansGeneral](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)、[FND Parties](https://github.com/edmcouncil/fibo/tree/master/FND/Parties)を参照してください。

## ステップ1のグラフ

<ontology-embed id="official/fibo-loans-step-1" height="340px"></ontology-embed>

*3つのエンティティと2つのリレーションシップが、あらゆるFIBO融資モデルの基礎となるローンの中核三者を形成します。*

```quiz
Q: ローンの返済責任を最も適切に表すリレーションシップはどれですか？
- Borrower → Loan (originatedBy)
- Loan → Borrower (owedBy) [correct]
- Lender → Loan (owedBy)
- Loan → Lender (hasCollateral)
> このモデルでは、ローンから借り手へ`owedBy`で結ぶことで、契約オブジェクトを起点に返済義務を明示します。これは、証書から当事者へ方向を持たせて義務をモデル化するFIBOのパターンに従っています。
```
