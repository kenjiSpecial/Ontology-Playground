---
title: カタログに貢献する
slug: contributing-to-the-catalogue
description: コミュニティとオントロジーを共有する方法を、フォーク、RDFとメタデータの追加、PRの送信、カタログへの公開まで順に説明します。
order: 6
embed: official/university
---

## コミュニティカタログ

Ontology Playgroundにはオントロジーの[カタログ](#/catalogue)があります。プロジェクトチームが管理する「official」と、コミュニティから提供されたものが掲載されています。誰でもプルリクエストを作成してオントロジーを送信できます。

## 2つの貢献方法

### 方法A：デザイナーからワンクリックでPRを作成

最も速い方法は次のとおりです。

1. [デザイナー](#/designer)を開いてオントロジーを構築する（または既存のものを読み込む）
2. ツールバーの**カタログに送信**をクリックする
3. 名前、説明、カテゴリ、タグなどのメタデータを入力する
4. GitHubでサインインする（デバイスフロー。パスワードは保存されません）
5. ツールが自動的にリポジトリをフォークし、ブランチを作成してRDFとメタデータをコミットし、プルリクエストを開く

これで完了です。CIパイプラインがRDFを検証し、メタデータスキーマを確認してテストを実行します。その後、メンテナーがレビューしてマージします。

### 方法B：手動でPRを作成

Gitを直接操作したい場合は、次の手順で行います。

1. GitHubでリポジトリを**フォーク**する
2. `catalogue/community/<your-github-username>/<ontology-slug>/`の下にディレクトリを作成する
3. 次の2つのファイルを追加する：
   - `ontology.rdf` — RDF/OWLファイル
   - `metadata.json` — オントロジーを説明するファイル

## メタデータの形式

```json
{
  "name": "Library System",
  "description": "A public library with books, authors, members, and loans.",
  "icon": "📚",
  "category": "education",
  "tags": ["library", "books", "lending"],
  "author": "your-github-username"
}
```

| フィールド | 必須 | 説明 |
|-------|----------|-------------|
| `name` | はい | カタログに表示する名前 |
| `description` | はい | 1文の概要 |
| `category` | はい | `retail`、`healthcare`、`finance`、`manufacturing`、`education`、`technology`、`general`のいずれか |
| `icon` | いいえ | カードに表示する1つの絵文字 |
| `tags` | いいえ | 検索用の小文字キーワード配列 |
| `author` | いいえ | GitHubユーザー名（ワンクリックフローで自動入力） |

## 検証ルール

PRは次のルールに基づいて自動検証されます。

- **有効なRDF/OWL** — エラーなく解析できること
- **ラウンドトリップの忠実性** — `parse(serialize(ontology))`が同等の出力を生成すること
- **メタデータスキーマ** — 必須フィールドがすべて存在し、カテゴリが有効であること
- **ディレクトリ名** — 小文字の英数字、ハイフン、アンダースコアのみを使うこと
- **シンボリックリンク禁止** — セキュリティのため、カタログ内のシンボリックリンクは拒否されます

## マージ後の流れ

マージされると、ビルドパイプラインが次を実行します。

1. `npm run catalogue:build`を実行する — すべてのRDFファイルを`catalogue.json`にコンパイルします
2. 更新されたサイトをデプロイする — オントロジーが[ギャラリー](#/catalogue)に表示されます
3. Playgroundでの埋め込み、ディープリンク、読み込みがすぐに利用可能になります

<ontology-embed id="official/university" height="400px"></ontology-embed>

*University Systemオントロジーは、officialカタログエントリの1つです。コミュニティからの提供も同じ形式なので、ギャラリーではあなたのオントロジーもこのように表示されます。*

## スムーズなレビューのためのヒント

- **良い説明を書く** — オントロジーがモデル化する領域と対象ユーザーを説明します
- **意味のあるタグを追加する** — ユーザーが検索でオントロジーを見つけやすくなります
- **ローカルでテストする** — プッシュする前に`npm run validate -- catalogue/community/<you>/<slug>/ontology.rdf`を実行します
- **焦点を絞る** — エンティティ型が3～8個の適切な範囲のオントロジーは、30個以上に広がったものより役立ちます

## 要点

- 誰でもワンクリックPRフローまたは手動のプルリクエストでオントロジーを提供できます
- 各提出にはRDFファイルと`metadata.json`が必要です
- CIがRDFを自動検証するため、レビュー前にエラーを修正します
- マージされたオントロジーは、デプロイ後すぐにライブカタログへ表示されます

```quiz
Q: すべてのカタログ提供に必要な2つのファイルは何ですか？
- ontology.jsonとREADME.md
- schema.rdfとconfig.yaml
- ontology.rdfとmetadata.json [correct]
- index.htmlとstyle.css
> 各カタログエントリには、ontology.rdfファイル（RDF/OWLオントロジー）とmetadata.jsonファイル（カタログ掲載用の名前、説明、カテゴリ、タグ）が必要です。
```
