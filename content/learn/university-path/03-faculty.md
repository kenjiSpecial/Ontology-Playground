---
title: "教員"
slug: faculty
description: "Professorを追加して誰が何を教えるかを追跡し、授業担当を介して教員を科目や学生につなぎます。"
order: 3
embed: official/university-step-2
---

## 教員の追加

科目を担当するのは誰でしょうか？**Professor**エンティティによって授業という観点が加わり、教員を科目に、さらに科目を介して学生につなげられます。

Professorを追加すると、次の問いに答えられます。
- 「400レベルの科目を最も多く担当している教授は誰か？」
- 「Smith教授の担当科目における平均GPAはいくらか？」
- 「入門科目を担当しているテニュア保有教員は誰か？」

## Professorエンティティ

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `professorId` | string | ✓ |
| `name` | string | |
| `rank` | string | |
| `tenured` | boolean | |
| `officeHours` | string | |

`rank` プロパティ（Assistant、Associate、Full）は、大学教員の職位階層を表します。真偽値型の `tenured` によって、雇用の安定性や教育機関による長期的な人材投資についてクエリを実行できます。

## 新しいリレーションシップ

- **teaches** — `Professor` → `Course`（一対多）
  1人の教授は、学期ごとに1つ以上の科目を担当します。

- **advises** — `Professor` → `Student`（一対多）
  1人の教授は、所属する教育課程の学生を指導します。

> **複数ホップのクエリ：** Professor → Course ← Enrollment ← Studentという経路を使うと、「テニュア保有教授の科目を履修している学生は誰か？」という、授業担当のリレーションシップを横断する問いに答えられます。そのためには、Professor → Course → Enrollment → Studentとたどる必要があります。

## 拡張されたグラフ

<ontology-embed id="official/university-step-2" diff="official/university-step-1" height="400px"></ontology-embed>

*Professorが授業担当と学生指導のリレーションシップとともに加わりました。差分には新しい要素が強調表示されます。*

## 学んだこと

- **真偽値型のプロパティ**（tenured）は、「はい」か「いいえ」で分類して絞り込めるようにします
- **複数ホップのクエリ**は、複数のリレーションシップをたどって離れたエンティティをつなぎます
- **大学教員の職位**には、定義された階層（Assistant → Associate → Full）があります
- このグラフでは、学生中心と教員中心のどちらのクエリも実行できます

```quiz
Q: 大学オントロジーを横断する複数ホップのクエリは、どのようなものですか？
- 1つのエンティティのプロパティを問い合わせるもの
- Professor → Course → Enrollment → Studentのように複数のリレーションシップをたどり、離れたエンティティをつなぐもの [correct]
- 教授をIDで検索するもの
- システム内の科目数を数えるもの
> 複数ホップのクエリは、グラフベースのオントロジーが持つ大きな強みの1つです。Professor → Course → Enrollment → Studentとたどることで、「テニュア保有教授の授業を履修している学生は誰か？」といった問いに答えられます。これは、直接のリレーションシップはないものの、中間ノードを介してつながるエンティティ同士を結び付けるものです。
```

次はDepartmentを追加して、教育組織の構造を表します。
