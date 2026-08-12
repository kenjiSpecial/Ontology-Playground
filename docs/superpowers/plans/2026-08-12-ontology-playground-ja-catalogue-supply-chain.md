# サプライチェーン公式カタログoverlay 実装計画

## 目的

Issue #29のIQ Lab Retail step 1〜6とZava Grove-to-Shelf本体・step 1〜5、計12件を日本語表示overlay化し、進捗を36/71へ進める。

## Task 1: 12 overlay・QA・delivery準備

1. 実compiler QAを先に拡張し、12件のoverlay欠落でREDを確認する。
2. source metadata/RDFのtags、ontology、entity、property、relationship、attribute、enumをstable key完全coverageで日本語表示化する。
3. 物流・品質・在庫・需要の意味、内部ID/name/URI/endpoints/raw values/binding、段階差分を維持し、source由来key集合とcompiled outputを厳密比較する。
4. README/TODOを36/71・残35件・Issues #30〜#33へ更新する。
5. Node 20でfocused QA、catalogue build、qa:ja、全test、RDF validation、本番build、TypeScript、changed lint、diff checkを実行し、exact pathでcommitする。

## レビュー

日本語の意味・自然さと互換性を独立レビューし、Critical / Important / Mediumを修正後、Issue #29のPRをdeliveryする。
