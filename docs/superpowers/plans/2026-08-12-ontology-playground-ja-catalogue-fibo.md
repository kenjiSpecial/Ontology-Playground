# FIBO公式カタログoverlay 実装計画

## 目的

Issue #30のFIBO Loans step 1〜4とFIBO Risk step 1〜4、計8件を日本語表示overlay化し、進捗を44/71へ進める。

## Task 1

1. 実compiler QAを拡張し、8件のoverlay欠落でREDを確認する。
2. metadata/RDFのstable keysを完全coverageし、金融・規制・分類の意味を日本語学習教材と一次資料レビュー結果に合わせて翻訳する。
3. FIBO URI/QName、分類コード、内部ID/name、raw values、出典・権利表示、段階差分は保持する。
4. source由来stable key集合・内部値とcompiled outputを厳密比較する。
5. README/TODOを44/71・残27・Issues #31〜#33へ更新し、Node 20で全検証後exact commitする。

## レビュー

金融・規制上の意味を重点に独立レビューし、Critical / Important / Mediumを修正後、Issue #30のPRをdeliveryする。
