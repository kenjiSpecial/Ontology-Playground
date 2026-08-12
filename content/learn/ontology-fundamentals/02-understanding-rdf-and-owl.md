---
title: RDFとOWLを理解する
slug: understanding-rdf-and-owl
description: セマンティックウェブでクラス、プロパティ、リレーションシップを記述する標準言語RDF/OWLで、オントロジーを表現する方法を学びます。
order: 2
embed: official/ecommerce
---

## RDFとは？

**RDF**（Resource Description Framework）は、つながったリソースのグラフとして情報を記述するW3C標準です。RDFでは、すべての情報を**トリプル**（主語 → 述語 → 目的語）で表します。

```
:Customer  rdf:type       owl:Class .
:name      rdf:type       owl:DatatypeProperty .
:name      rdfs:domain    :Customer .
:name      rdfs:range     xsd:string .
```

上のトリプルは、「Customerというクラスがあり、nameという文字列型のプロパティを持つ」と述べています。

## OWLはRDFを拡張する

**OWL**（Web Ontology Language）は、カーディナリティ制約、クラス階層、論理公理など、より豊かなモデル化機能でRDFを拡張します。オントロジー設計で重要なOWL構成要素は次のとおりです。

| OWLの概念 | 対応するもの | 例 |
|-------------|---------|---------|
| `owl:Class` | エンティティ型 | `Customer`、`Product` |
| `owl:DatatypeProperty` | プリミティブ値を持つプロパティ | `name`（string）、`price`（decimal） |
| `owl:ObjectProperty` | エンティティ間のリレーションシップ | `placedBy`（Order → Customer） |
| `rdfs:domain` / `rdfs:range` | プロパティが属するエンティティ／その型 | `price` は `Product` に属し、型は `xsd:decimal` |

## 名前空間で曖昧さをなくす

RDFのすべてのリソースには、グローバルに一意な**URI**があります。長いURIを毎回書かずに済むよう、RDF/XMLでは**名前空間プレフィックス**を使います。

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns="https://mycompany.com/ontology/">
```

`xmlns=`のデフォルト名前空間により、`<owl:Class rdf:about="Customer">`は実際には`https://mycompany.com/ontology/Customer`を意味します。

## RDF/OWLファイルを読む

次は、1つのエンティティ型と1つのプロパティを持つ最小限のオントロジーです。

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
         xmlns="https://example.com/shop/">

  <!-- Entity type: Product -->
  <owl:Class rdf:about="Product">
    <rdfs:label>Product</rdfs:label>
  </owl:Class>

  <!-- Property: productName (string, identifier) -->
  <owl:DatatypeProperty rdf:about="productName">
    <rdfs:domain rdf:resource="Product"/>
    <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#string"/>
    <rdfs:label>productName</rdfs:label>
  </owl:DatatypeProperty>
</rdf:RDF>
```

Ontology Playgroundでは、このようなファイルを直接インポートできます。また、視覚的に設計してRDFへエクスポートすることもできます。

<ontology-embed id="official/ecommerce" height="400px"></ontology-embed>

*E-Commerceオントロジーは、複数のエンティティ型と、それらを接続するオブジェクトプロパティを含む、より豊かな例です。*

## JSONとRDF――どちらをいつ使うか

| | JSON | RDF/OWL |
|---|------|---------|
| **人間による読みやすさ** | 読み書きしやすい | 冗長だが正確 |
| **ツール** | 任意のテキストエディター | セマンティックウェブツール、SPARQLエンドポイント |
| **相互運用性** | アプリケーション固有 | W3C標準で、広く理解されている |
| **適した用途** | 迅速なプロトタイピング、アプリ設定 | 形式的なデータモデル、システム間連携 |

Ontology Playgroundは両方の形式をサポートしています。ビジュアルエディターで設計し、手早く使うならJSON、正式に公開するならRDF/OWLとしてエクスポートできます。

## 要点

- RDFは知識を**主語 → 述語 → 目的語**のトリプルとして表現します
- OWLはRDFにクラス、データプロパティ、オブジェクトプロパティを追加します
- 名前空間によってURIを短く保ち、曖昧さをなくせます
- Playgroundは標準RDF/OWLをインポート・エクスポートできるため、手作業でのコーディングは不要です

```quiz
Q: RDFでは、情報はどのように表現されますか？
- 行と列を持つテーブル
- JSONのキーと値の組
- 主語 → 述語 → 目的語のトリプル [correct]
- バイナリデータストリーム
> RDFは、主語と目的語を述語でつなぐ3つ組の文であるトリプルを使い、つながったリソースのグラフとして情報を記述します。
```

```quiz
Q: owl:ObjectPropertyは何を表しますか？
- stringのようなプリミティブ値を持つプロパティ
- 2つのエンティティ型の間のリレーションシップ [correct]
- オントロジーの名前空間
- データ型に対する制約
> OWLでは、ObjectPropertyが2つのクラス（エンティティ型）の間のリレーションシップを定義します。たとえば、OrderとCustomerをつなぐ「placedBy」です。プリミティブ値にはDatatypePropertyを使います。
```
