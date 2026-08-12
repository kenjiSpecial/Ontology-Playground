---
title: "緩和策の実行と自動化"
slug: mitigation-execution
description: "オントロジーをFabric IQエージェント、リアルタイム ダッシュボード、自動化と組み合わせ、寸断への対応時間を数日から数分へ短縮する方法を学びます。"
order: 4
---

## モデルから実行へ

これで、オントロジーをリアルタイムな意思決定の自動化に活用する準備が整いました。寸断の検知から緩和策の実行まで、次のように進みます。

### フェーズ1：検知（0分）

**入力**：外部シグナル（サプライヤーの停止、自然災害アラート、品質問題の報告）

**オントロジーで可能になること**：
```
データ エージェントのクエリ：
  「台湾の地震によって影響を受けるサプライヤーはどれですか？」
  ↓
  照合条件：Supplier.country="Taiwan" + DisruptionEvent.region="Taiwan"
             + DisruptionEvent.type="Natural Disaster"
  ↓
  結果：重要なサプライヤー3社を特定
```

### フェーズ2：影響の追跡（5分）

**入力**：影響を受けるサプライヤーの一覧

**オントロジーで可能になること**：
```
データ エージェントのクエリ：
  「この3社が供給する部品をすべて示してください。」
  ↓
  たどる経路：Supplier → supplies → Component
  ↓
  結果：47個の部品を特定
  
続けて：「この47個の部品を使用する製品ラインはどれですか？」
  ↓
  たどる経路：Component → usedIn → ProductLine
  ↓
  結果：リスクにさらされる12の製品ラインを特定
```

### フェーズ3：影響の定量化（15分）

**入力**：リスクにさらされる製品ラインの一覧

**オントロジーで可能になること**：
```
計算エンジン：
  リスクにさらされる各ProductLineについて：
    revenue_at_risk = annualRevenue / 365 * daysOfSupplyOnHand
    urgency = 100 - (daysOfSupplyOnHand * 10)
  
  集計：
    total_revenue_at_risk = SUM(revenue_at_risk)
    critical_product_lines = WHERE urgency > 70
    
  結果：
    リスクにさらされる合計額：$127M
    重大な影響まで：3日
    影響を受ける顧客：450,000人以上
```

### フェーズ4：対策の提案（20分）

**入力**：リスク評価の結果

**オントロジーで可能になること**：
```
提案エンジン：
  影響を受ける各製品ラインの各部品について：
    1. 次の条件を満たすAlternativeSupplierレコードを検索：
       - qualificationStatus="Approved"
       - capacityAvailable >= demand
       - country NOT IN earthquake_region
    
    2. 各代替先を次の基準で評価：
       - 短縮できるリードタイム（leadTimeSavedDays）
       - コストへの影響（pricePremiumPercent）
       - 信頼性（reliabilityScore）
    
    3. ROIを添えて上位3件の対策を提案：
       - 対策A：ChipX Europeを稼働（2日短縮、追加費用$2M）
       - 対策B：安全在庫を増加（費用$500K、2週間分を確保）
       - 対策C：部品を再設計（リードタイム不明）
```

### フェーズ5：実行（25分）

**オントロジーが自動ワークフローを起動します**：

```
IF RiskAssessment.revenueAtRisk > $50M AND 
   RiskAssessment.timeToImpactDays < 5:
   
   THEN:
     1. 提案されたAlternativeSupplierに対するPurchaseOrderを作成
     2. 新しい日程でProductionScheduleを更新
     3. 次の宛先へメールを送信：
        - 調達チーム（購入を実行）
        - オペレーション部門（スケジュールを調整）
        - 財務部門（$2Mの追加費用を予測へ反映）
        - CEO／取締役会（リスク状況を報告）
     4. エスカレーション ポリシー付きのActivatorアラートを作成
     5. MitigationAction.statusの監視を開始
```

## 現実のワークフロー：エンドツーエンド

### 1日目：寸断を検知

```
10:30 AM：台湾でマグニチュード6.8の地震
          ↓
10:45 AM：システムが検知し、DisruptionEventを作成
          ├─ type = "Natural Disaster"
          ├─ severity = "Critical"
          ├─ region = "Taiwan"
          ├─ estimatedDurationDays = 7
          
10:46 AM：データ エージェントが影響を追跡
          ├─ 重要なサプライヤー3社が影響を受ける
          ├─ 47個の部品が供給停止
          ├─ 12の製品ラインがリスクにさらされる
          ├─ $127Mの売上がリスクにさらされる
          ├─ 生産停止まで3日
          
10:47 AM：RiskAssessmentを作成
          ├─ 製品ラインごとの影響を評価
          ├─ ROI順に対策を提案
          
10:48 AM：MitigationActionを自動作成
          ├─ 認定済み代替先ChipX Europeへ発注書を発行
          ├─ 安全在庫を発注
          ├─ 調達、オペレーション、財務部門へアラートを送信
          
10:50 AM：Activatorを起動
          ├─ リアルタイム ダッシュボードに影響と対策を表示
          ├─ エスカレーション ポリシーに従って経営陣へ通知
          ├─ 調達チームが通知を確認して受領
          
11:30 AM：MitigationAction.status = "In Progress"
          ├─ 発注処理が進行中
          ├─ ChipX Europeが48時間以内の出荷を確約
          ├─ 生産への影響を7日から3日へ短縮
```

### 2〜4日目：監視と調整

```
4時間ごと：
  - DisruptionEvent.estimatedDurationDaysを確認（復旧見込みが変わった場合は更新）
  - MitigationActionの進捗を監視
  - 最新の在庫データでRiskAssessmentを再計算
  - leadTimeSavedDaysが悪化した場合にアラート（代替サプライヤーの遅延）
  - 必要に応じて予備の対策を提案
  
3日目：ChipX Europeからの出荷を受領
  ├─ MitigationAction.status = "Completed"
  ├─ 47個の部品の在庫を回復
  ├─ 生産を再開（7日ではなく3日の遅延）
  ├─ 実費：$2.1M（見積もり$2M）
  ├─ 保護できた売上：リスク額$127Mのうち約$100M
```

## Fabric IQとの接続

このオントロジーはFabric IQデータ エージェントとシームレスに連携します。

```
ユーザー：「現在、サプライチェーンでどれだけのリスクにさらされていますか？」
  ↓
データ エージェントがオントロジーを基にクエリをグラウンディング：
  1. singleSourced=trueのSupplierレコードをすべて検索
  2. 各サプライヤーが供給するComponentを検索
  3. それらの部品を使用するProductLineまで追跡
  4. 各ProductLineのrevenueAtRiskを計算
  5. revenueAtRisk順の一覧を返す
  
エージェントの応答：
  「重要な単一調達先サプライヤーが3社あります。
   いずれかで寸断が起きると、4〜9日以内に約$180Mの
   損失が生じます。8社の代替サプライヤーを
   事前認定することを推奨します（一覧を添付）。」

ユーザー：「ChipXの代替先として認定済みなのはどのサプライヤーですか？」
  ↓
エージェントのクエリ：
  AlternativeSupplier WHERE:
    canReplace.Supplier.name = "ChipX Corp"
    AND qualificationStatus = "Approved"
  ↓
結果：
  - ChipX Europe（供給能力：50K/月、コスト+12%）
  - SemiCorp Japan（供給能力：30K/月、コスト+18%）
  - Semiconductor Direct USA（供給能力：25K/月、コスト+15%）
```

## 継続的な改善

緩和モデルの有効性を追跡します。

| 指標 | 計算方法 | 目標 |
|--------|-------------|------|
| 検知速度 | 寸断からRiskAssessmentまでの時間 | 1時間未満 |
| 追跡精度 | 実際に影響を受けた部品のうち特定できた割合 | 95%超 |
| 影響見積もり精度 | リスクにさらされる売上の見積もりと実績の差 | ±10% |
| 緩和策の実行時間 | 評価からMitigationAction実行までの時間 | 2時間未満 |
| コスト効率 | 対策の見積もり費用と実費の差 | ±5% |
| 売上保護率 | リスクにさらされた売上のうち対策で保護できた割合 | 80%超 |

寸断イベントの一つひとつが学習の機会になります。エージェントは、実際に期待どおり対応できた代替サプライヤー、実績と一致したリードタイム、最もレジリエンスの高い製品ラインを学習します。

## まとめ

「サプライチェーン寸断とリスク伝播」オントロジーは、本番運用へ移せる状態です。

- ✅ **7つのエンティティ型**で寸断のライフサイクル全体を表現
- ✅ **40個のプロパティ**で意思決定に必要な豊富な文脈を提供
- ✅ **7個のリレーションシップ**で現実的な影響の連鎖をモデル化
- ✅ 自然言語エージェントで使える**Fabric IQ互換性**
- ✅ enum分類とタイムスタンプによる**自動化対応**
- ✅ 寸断の影響を数日から数時間へ短縮する**測定可能な成果**

デプロイして監視を始め、サプライチェーンのレジリエンスが変わる様子を確かめてください。
