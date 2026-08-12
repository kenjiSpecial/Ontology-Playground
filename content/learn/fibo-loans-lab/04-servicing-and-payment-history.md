---
title: サービシングと支払履歴
slug: servicing-and-payment-history
description: FIBOのサービシング組織と監査可能な支払イベントを追加し、モデルを拡張します。
order: 4
embed: official/fibo-loans-step-3
reviewStatus: under-human-review
---

## 運用ライフサイクル

組成後のローンは、サービシング業務へ移行します。FIBOでは、この移行を2つのモジュールにまたがってモデル化します。

- **Servicer** — 支払を回収・処理する組織（[LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)の`fibo-loan-ln-ln:Servicer`を基に翻案）
- **PaymentHistory** — 支払記録の集合（[LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)の`fibo-loan-ln-ln:PaymentHistory`を基に翻案。この概念は[FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)の取引記録パターンを拡張しています）
- **PaymentTransaction** — 個々の支払イベント（`fibo-loan-ln-ln:IndividualPaymentTransaction`を基に翻案。この概念自体は`fibo-fbc-pas-caa:IndividualTransaction`を基礎としています）

これは、実際の融資プラットフォームが契約上の意図と実行記録を分けて扱う方法に対応しています。

## 新しいプロパティ

### Servicer

| プロパティ | 型 | 説明 |
|---|---|---|
| `servicerId` | string | 識別子 |
| `organizationName` | string | サービシング組織の名前 |

### PaymentHistory

| プロパティ | 型 | 説明 |
|---|---|---|
| `paymentHistoryId` | string | 識別子 |

### PaymentTransaction

| プロパティ | 型 | 説明 |
|---|---|---|
| `paymentTransactionId` | string | 識別子 |
| `amount` | decimal (USD) | 支払金額 |
| `postedAt` | datetime | 支払が記録された日時 |

## 新しいリレーションシップ

- **servicedBy**：`Loan` → `Servicer`（`many-to-one`）— 1つの組織が複数のローンをサービシングできます
- **hasPaymentHistory**：`LoanPaymentSchedule` → `PaymentHistory`（`one-to-one`）— 予定された支払と実際の記録を結び付けます
- **hasIndividualPayment**：`PaymentHistory` → `PaymentTransaction`（`one-to-many`）— 各支払履歴には複数の取引イベントが含まれます

## 監査証跡

これらのリンクにより、モデル内で次の明確な経路をたどれます。

`Loan` → `LoanPaymentSchedule` → `PaymentHistory` → `PaymentTransaction`

この経路は、監査クエリ、延滞分析、サービシング品質の指標に対応します。まさに、オントロジー駆動のデータ統合の価値を引き出すグラフ探索です。

> **FIBO参照**：実運用向けのFIBOでは、ローンのサービシングと支払履歴のパターンがLOANモジュールとFBCモジュールを橋渡しします。`Loan`はローン固有の口座に関連付けられ、支払履歴は取引記録としてモデル化され、個別の支払取引はイベント単位の事実を記録します。この簡略化したモデルでも、その中核パターンを表現しています。[LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)と[FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)を参照してください。

## ステップ3のグラフ（ステップ2との差分）

<ontology-embed id="official/fibo-loans-step-3" diff="official/fibo-loans-step-2" height="420px"></ontology-embed>

*3つの新しいエンティティ（Servicer、PaymentHistory、PaymentTransaction）により、ローンのライフサイクルイベントを追跡する運用層を構成します。*

```quiz
Q: amountやpostedAtなど、個々の支払イベントを保持するエンティティはどれですか？
- Loan
- Servicer
- PaymentHistory
- PaymentTransaction [correct]
> PaymentHistoryは集合を格納するコンテナーです。個々のイベントはPaymentTransactionに属し、照合や監査証跡に使用するイベント単位の詳細を保持します。この分離は、集合的な記録と個別取引を区別するFIBOのモデリングパターンに従っています。
```
