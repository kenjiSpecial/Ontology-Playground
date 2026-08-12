---
title: リスクと分類子
slug: risk-and-classifiers
description: FIBOの所有権と担保権順位の分類子を追加し、引受審査と担保リスクの分析に対応します。
order: 5
embed: official/fibo-loans-step-4
reviewStatus: under-human-review
---

## 分類層

FIBOでは、ほかのエンティティを分類することを主な役割とする明示的な分類子を多用します。最後のステップでは、住宅ローンや担保付融資のリスク分析に欠かせない2つの概念を追加します。

- **OwnershipInterest** — 担保に対する法的な所有権の種類を分類します（[LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)の`fibo-loan-ln-ln:OwnershipInterest`を基に翻案し、`fibo-fnd-oac-own:Ownership`を基礎としています）
- **LenderLienPosition** — 担保資産に対する貸し手の担保権順位を分類します（[LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)の`fibo-loan-ln-ln:LenderLienPosition`を基に翻案）

## 分類子が重要な理由

FIBOのMortgagesモジュール（[LOAN/RealEstateLoans/Mortgages](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)）では、担保権順位が差押え時の回収順位を決めます。第一順位抵当権付きの住宅ローンは、劣後担保権よりも高い回収を期待でき、次の項目へ直接影響します。

- 信用リスクのモデリング
- デフォルト時損失率の推定
- ポートフォリオリスクの集計
- 規制資本の計算

> **FIBO参照**：FIBOのMortgagesオントロジーでは、`owl:Restriction`ブロックを使用して不動産担保と契約のセマンティクスを制約します。LOANオントロジーでは、`SecurityAgreement`と`Loan`を、`LenderLienPosition`や`OwnershipInterest`などの分類子を使用してさらに制約します。[LOAN/RealEstateLoans/Mortgages.rdf](https://github.com/edmcouncil/fibo/blob/master/LOAN/RealEstateLoans/Mortgages.rdf)と[LOAN/LoansGeneral/Loans.rdf](https://github.com/edmcouncil/fibo/blob/master/LOAN/LoansGeneral/Loans.rdf)を参照してください。

## 新しいリレーションシップ

- **classifiesCollateralOwnership**：`OwnershipInterest` → `Collateral`（`one-to-many`）
- **hasLienPosition**：`Collateral` → `LenderLienPosition`（`many-to-one`）

## ステップ4のグラフ（ステップ3との差分）

<ontology-embed id="official/fibo-loans-step-4" diff="official/fibo-loans-step-3" height="460px"></ontology-embed>

*2つの分類子エンティティ（OwnershipInterestとLenderLienPosition）により、リスクと引受審査のセマンティクスを加えてモデルを完成させます。*

## 完成した翻案モデル

同じFIBOのソース概念から構築した完全な外部サブセットも確認できます。

<ontology-embed id="external/fibo/loans-general" height="420px"></ontology-embed>

## 構築したもの

ここまでで、次の領域を扱う段階的なFIBOベースのローンオントロジーを構築しました。

| 層 | エンティティ | FIBOソースモジュール |
|---|---|---|
| 契約当事者 | Loan, Borrower, Lender | [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) |
| 担保と返済予定 | Collateral, LoanPaymentSchedule | [FBC/DebtAndEquities/Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt) |
| サービシング業務 | Servicer, PaymentHistory, PaymentTransaction | [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) + [FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts) |
| リスク分類子 | OwnershipInterest, LenderLienPosition | [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) + [FND/OwnershipAndControl/Ownership](https://github.com/edmcouncil/fibo/tree/master/FND/OwnershipAndControl) |

これは、住宅ローンの種類、HELOC商品、自動車ローン、中小企業向け融資など、ドメイン固有のモジュールへ拡張するための確かな基礎になります。

## 関連資料

- **FIBOのGitHubリポジトリ**：[github.com/edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- **FIBO仕様**：[spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)
- **EDM Council**：[edmcouncil.org](https://edmcouncil.org/)
- **FIBO Loansモジュール**：[LOAN/LoansGeneral/Loansのソース](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)
- **FIBO Mortgagesモジュール**：[LOAN/RealEstateLoans/Mortgagesのソース](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)
- **FIBO Debtモジュール**：[FBC/DebtAndEquities/Debtのソース](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)
- **FIBO Clients and Accountsモジュール**：[FBC/ProductsAndServices/ClientsAndAccountsのソース](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)

## ライセンス

このラボで参照するすべてのFIBOオントロジーコンテンツには、次の条件が適用されます。

- **著作権**：EDM Council, Inc.およびObject Management Group, Inc.（正確な年の範囲は各モジュールのヘッダーを参照）
- **ライセンス**：[MIT License](https://opensource.org/licenses/MIT)

MIT Licenseでは、著作権表示を保持することを条件に、商用目的を含むオントロジーファイルの使用、変更、再配布が認められています。このラボのオントロジーファイルは、教育目的で作成した翻案サブセットです。

```quiz
Q: 担保モデルにLenderLienPositionを追加する主な価値は何ですか？
- 借り手情報が不要になること
- 貸し手の請求権の優先順位を表し、信用リスクと損失のモデリングに役立つこと [correct]
- 支払日時を保存すること
- ローン金利を自動的に決定すること
> 担保権順位は、請求権の優先順位（第一順位か劣後順位かなど）を表し、差押え時の回収見込みに直接影響します。これは引受審査、ポートフォリオリスクモデル、規制資本の計算に不可欠であり、FIBOの債務・資本モジュールにおける重要な概念です。
```
