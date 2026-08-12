---
title: 担保と返済予定
slug: collateral-and-schedules
description: FIBOの担保と支払予定の概念を用いて、担保権設定契約と返済周期を追加します。
order: 3
embed: official/fibo-loans-step-2
reviewStatus: under-human-review
---

## 契約から構造へ

FIBOの次の2つの概念を追加すると、ローンを実務で扱える構造になります。

- **Collateral** — 返済を担保するもの（[FBC/DebtAndEquities/Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)の`fibo-fbc-dae-dbt:Collateral`を基に翻案）
- **LoanPaymentSchedule** — 返済が時間の経過に沿ってどのように予定されているか（[LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)の`fibo-loan-ln-ln:LoanPaymentSchedule`を基に翻案）

これらを追加することで、FIBOの中核的な関心事である**担保権設定契約**と**時間的な義務**を表現できます。

## 新しいプロパティ

### Collateral

| プロパティ | 型 | 説明 |
|---|---|---|
| `assetType` | string | 識別子 — 資産の種類（例："不動産"、"車両"、"有価証券"） |
| `appraisedValue` | decimal (USD) | 査定時点の市場価値 |

> **FIBO参照**：完全なオントロジーでは、債務の担保を`fibo-fbc-dae-dbt:Collateral`としてモデル化し、差し入れられた有形・無形の資産を表現できます。FIBOのMortgagesモジュール（[LOAN/RealEstateLoans/Mortgages](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)）では、`LoanSecuredByRealEstate`が担保を`fibo-fnd-plc-rp:RealProperty`に制約し、`SecurityAgreement`へ`owl:Restriction`ブロックを介して結び付けます。

### LoanPaymentSchedule

| プロパティ | 型 | 説明 |
|---|---|---|
| `scheduleId` | string | 識別子 |
| `expectedPayments` | integer | 予定される支払回数 |

## 新しいリレーションシップ

- **securedBy**：`Loan` → `Collateral`（`one-to-many`）— 1件のローンに複数の資産を担保として設定できます
- **repaidBySchedule**：`Loan` → `LoanPaymentSchedule`（`one-to-one`）— 各ローンには1つの主要な返済予定があります

## ステップ2のグラフ（ステップ1との差分）

<ontology-embed id="official/fibo-loans-step-2" diff="official/fibo-loans-step-1" height="380px"></ontology-embed>

*新しいエンティティを強調表示しています。CollateralとLoanPaymentScheduleにより、ローンモデルへ担保構造と時間構造を追加します。*

```quiz
Q: FIBOのCollateral概念は、どのモジュールで定義されていますか？
- LOAN/LoansGeneral/Loans
- FBC/DebtAndEquities/Debt [correct]
- FND/Agreements/Contracts
- FND/Places/RealProperty
> Collateralは、FIBOのFBC（Financial Business and Commerce）ドメインにあるDebtAndEquities/Debtで定義されています。返済義務を担保するために差し入れられた資産を表す概念であり、住宅ローンだけでなく、あらゆる担保付融資で共通して使用されます。
```
