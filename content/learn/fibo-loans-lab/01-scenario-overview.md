---
title: シナリオ概要
slug: scenario-overview
description: FIBOとは何か、どこから生まれたのか、このラボで何を構築するのかを説明します。
order: 1
reviewStatus: under-human-review
---

## FIBOとは？

**Financial Industry Business Ontology**（FIBO）は、[EDM Council](https://edmcouncil.org/)と[Object Management Group](https://www.omg.org/)（OMG）が開発する業界標準のオントロジーファミリーです。金融商品、当事者、契約、規制上の概念を表す、形式的で機械可読な語彙を提供します。

FIBOには次の特徴があります。

- [MIT License](https://opensource.org/licenses/MIT)のもとで**オープンソース**として公開
- [edmcouncil/fibo](https://github.com/edmcouncil/fibo)で**GitHubにホスト**
- [spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)で**OWLオントロジーとして公開**
- 大手金融機関、規制当局、標準化団体からの貢献を受けて**2012年から開発**

> **出典**：このラボの概念は主に`LOAN/LoansGeneral/Loans`を基に翻案し、`FBC/DebtAndEquities/Debt`、`FBC/ProductsAndServices/ClientsAndAccounts`、`FND/OwnershipAndControl/Ownership`の概念で補っています。完全なソースモジュールについては、[FIBO GitHubリポジトリ](https://github.com/edmcouncil/fibo)を参照してください。

## このラボに取り組む理由

FIBOは大規模で、証券、デリバティブ、コーポレートアクション、指数などを扱う数百のオントロジーモジュールで構成されています。`LOAN`ドメインだけでも複数のサブモジュールにまたがります。

| FIBOモジュール | 対象領域 |
|---|---|
| `LOAN/LoansGeneral/Loans` | ローンのライフサイクル概念（ローン、サービシング、支払履歴、担保権順位および所有権の分類子） |
| `FBC/DebtAndEquities/Debt` | 借り手・貸し手のロール、担保、担保権設定契約、債務条件 |
| `FBC/ProductsAndServices/ClientsAndAccounts` | 支払履歴で使用する取引記録と個別取引 |
| `LOAN/RealEstateLoans/Mortgages` | 不動産固有の制約（不動産担保と住宅ローンの構成要素） |
| `FND/OwnershipAndControl/Ownership` | ローン所有権の分類子で再利用する所有権のセマンティクス |

*（出典：[FIBOのオントロジー構造](https://github.com/edmcouncil/fibo/tree/master/LOAN)）*

このラボでは、ローン契約と支払フローに焦点を当てた学習用のサブセットを取り出します。モジュール階層全体をたどらずに、FIBOのモデリングパターンを学べます。

## 構築するもの

4つの段階を通して、10個のエンティティ型と10個のリレーションシップを持つ**ローンオントロジー**をモデル化します。

1. **ローンの中核3要素** — `Loan`、`Borrower`、`Lender`
2. **担保と返済予定** — `Collateral`、`LoanPaymentSchedule`
3. **サービシングと支払履歴** — `Servicer`、`PaymentHistory`、`PaymentTransaction`
4. **リスク分類子** — `OwnershipInterest`、`LenderLienPosition`

## このモデルで答えられる実務上の問い

- 担保付ローンのうち、担保権順位が劣後しているものはどれですか？
- 元本金額が一定額を超える利息のみ返済型ローンを持つ借り手は誰ですか？
- 支払取引の傾向はサービサーごとにどう異なりますか？
- 返済上の問題と相関する所有構造はどれですか？

## ライセンスと帰属表示

このラボは、EDM CouncilのFIBOオントロジーを基に翻案しています。

- **著作権**：EDM Council, Inc.およびObject Management Group, Inc.（正確な年の範囲は各モジュールのヘッダーを参照）
- **ライセンス**：[MIT License](https://opensource.org/licenses/MIT)
- **ソースリポジトリ**：[github.com/edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- **仕様**：[spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)

このラボのオントロジーファイルは、授業で扱いやすいよう簡略化した翻案です。段階的に学習できるよう複雑さを抑えながら、FIBOの中核的なセマンティクスを維持しています。

```quiz
Q: FIBOを開発・保守している組織はどれですか？
- 世界銀行
- EDM CouncilとObject Management Group（OMG） [correct]
- 欧州中央銀行
- W3C Web Ontology Working Group
> FIBOは、EDM Council（Enterprise Data Management Council）がObject Management Groupと共同で開発しています。MIT Licenseのもとでオープンソースとして公開され、GitHubのedmcouncil/fiboでホストされています。
```
