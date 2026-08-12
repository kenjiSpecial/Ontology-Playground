---
title: "完成した大学モデル"
slug: complete-university
description: "Departmentを追加して大学オントロジーを完成させ、教員、科目、学生を教育課程ごとにまとめます。"
order: 4
embed: official/university-step-3
---

## 組織構造

大学は**Department**という、教員が所属し、科目を開講し、学位を授与する管理単位で構成されています。Departmentを追加すると、すべてを結び付ける組織階層を表現できます。

## Departmentエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `departmentId` | string | ✓ |
| `name` | string | |
| `building` | string | |
| `budget` | float | |
| `headOfDept` | string | |

浮動小数点数型の `budget` によって、資源配分に関するクエリを実行できます。`headOfDept` プロパティは、学部・学科を率いる教授を参照します。これは、組織階層でよく見られる自己参照パターンです。

## 新しいリレーションシップ

- **belongs_to** — `Professor` → `Department`（多対一）
  教授は1つの学部・学科に所属します。

- **offers** — `Department` → `Course`（一対多）
  学部・学科は、教育課程の一部として科目を開講します。

> **組織階層：** Departmentは大学オントロジーの最上位に位置し、下位のProfessor（教員）とCourse（カリキュラム）の両方につながります。このハブとしての位置付けにより、Departmentは「学部・学科単位の統計」を求める集約クエリに適しています。

## 完成したグラフ

<ontology-embed id="official/university-step-3" diff="official/university-step-2" height="500px"></ontology-embed>

*5つのエンティティと6つのリレーションシップからなる、完成した大学オントロジーです。Departmentが教員とカリキュラムの両方をまとめます。*

## 完成したモデルでできること

| 質問 | グラフの経路 |
|---|---|
| 学生の平均GPAが最も高い学部・学科はどこか？ | Department → Course ← Enrollment ← Student（GPA平均） |
| 所属する学部・学科以外の科目を担当している教授は誰か？ | Professor → DepartmentとProfessor → Course → Departmentを比較 |
| 学部・学科ごとの履修率はいくらか？ | Department → Course ← Enrollment（件数）/ Course.maxEnrollment |
| テニュア保有教員が最も多い学部・学科はどこか？ | Department ← Professor（tenured=true、件数） |

## GQLクエリの例

学生の成績が振るわない（平均成績がB未満の）学部・学科を検索します。

```gql
MATCH (d:Department)-[:offers]->(c:Course)<-[:for_course]-(e:Enrollment)<-[:enrolls_in]-(s:Student)
WHERE e.grade IN ['C', 'D', 'F']
RETURN d.name, c.title, COUNT(e) AS struggling_count
ORDER BY struggling_count DESC
```

## 構築したもの

| ステップ | 追加したエンティティ | 累計 | 重要な概念 |
|---|---|---|---|
| 1 | Student、Course、Enrollment | 3 | 中間エンティティ、多対多 |
| 2 | Professor | 4 | 複数ホップのクエリ、真偽値型のプロパティ |
| 3 | Department | 5 | 組織階層、ハブエンティティ |

## 重要なポイント

1. **中間エンティティ**（Enrollment）は、属性を伴う多対多リレーションシップを表します
2. **複数ホップのクエリ**は、複数の経路をたどって知見を引き出します
3. **真偽値型のプロパティ**（tenured）によって、カテゴリ別の絞り込みが可能になります
4. **組織階層**（Department）は、集約の単位を提供します
5. **ハブエンティティ**（Department）は、オントロジーの複数の枝をつなぎます

```quiz
Q: 大学オントロジーでDepartmentが「ハブエンティティ」と見なされるのはなぜですか？
- 最も多くのプロパティを持つため
- 組織階層の最上位に位置し、ProfessorとCourseの両方につながるため [correct]
- 最後に追加されたため
- ハブエンティティにはbudgetプロパティが必要なため
> Departmentは、belongs_toを介してProfessorに、offersを介してCourseに下向きにつながります。この2方向のつながりによって組織のハブとなり、学部・学科単位で教員とカリキュラムのデータを組み合わせる集約クエリに適した構造になります。
```

大学システムの学習パスはこれで完了です。[カタログ](#/catalogue)から任意のステップを読み込み、対話的に探索してみましょう。
