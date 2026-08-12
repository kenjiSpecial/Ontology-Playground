---
title: "学籍情報の中核"
slug: academic-core
description: "Student、Course、Enrollmentを定義し、学籍情報の管理を支える中間エンティティのパターンを学びます。"
order: 2
embed: official/university-step-1
---

## 学籍情報の基盤

学籍情報の中心にあるのは、*どの学生がどの科目を履修し、どのような成績を収めているか？*という問いです。次の3つのエンティティでこの問いに答えます。

- **Student** — 誰が学んでいるか？
- **Course** — 何を教えているか？
- **Enrollment** — 学生と科目を成績情報とともにつなぐ履修登録

## エンティティの定義

### Student

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `studentId` | string | ✓ |
| `name` | string | |
| `gpa` | float | |
| `enrollmentYear` | integer | |
| `major` | string | |

`gpa` プロパティは浮動小数点数です。GPA（Grade Point Average）は0.0から4.0の範囲を取ります。この集約指標によって、学業状況のクエリや成績優秀者の判定が可能になります。

### Course

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `courseId` | string | ✓ |
| `title` | string | |
| `credits` | integer | |
| `level` | string | |
| `maxEnrollment` | integer | |

`level` プロパティ（100、200、300、400）は、科目の難易度と履修条件の目安を示します。整数型の `maxEnrollment` によって、定員を計画できます。

### Enrollment

| プロパティ | 型 | 識別子？ |
|---|---|---|
| `enrollmentId` | string | ✓ |
| `semester` | string | |
| `grade` | string | |
| `enrollDate` | date | |
| `status` | string | |

Enrollmentは**中間エンティティ**です。StudentとCourseを、成績、学期、状態という追加情報とともにつなぐために存在します。

## リレーションシップ

- **enrolls_in** — `Student` → `Enrollment`（一対多）
  1人の学生は、複数の学期にわたって複数の履修登録を持ちます。

- **for_course** — `Enrollment` → `Course`（多対一）
  各履修登録は、1つの特定の科目に対応します。

> **中間エンティティのパターン：** 属性を伴う多対多リレーションシップが2つのエンティティ間にある場合は、中間エンティティを作成します。1人の学生は複数の科目を履修し、1つの科目には複数の学生がいます。両者の間に置かれたEnrollmentが、成績、学期、状態を保持します。これは、オントロジー設計で最も一般的なパターンの1つです。

## 現時点のグラフ

<ontology-embed id="official/university-step-1" height="350px"></ontology-embed>

*Enrollmentを介してStudentとCourseをつなぐ、典型的な中間エンティティのパターンです。*

## 学んだこと

- **中間エンティティ**（Enrollment）は、属性を伴う多対多リレーションシップを表します
- **浮動小数点数型のプロパティ**（GPA）によって、集約計算としきい値による判定が可能になります
- **整数型のプロパティ**（credits、maxEnrollment）によって、定員と学習負荷を計画できます
- 学籍情報の中核は、Student → Enrollment → Courseという流れになります

```quiz
Q: StudentとCourseを直接つなぐのではなく、Enrollmentを独立したエンティティとしてモデル化するのはなぜですか？
- グラフのノード数を増やすため
- Enrollmentが、StudentにもCourseにも属さない固有の属性（成績、学期、状態）を保持するため [correct]
- オントロジーには少なくとも3つのエンティティが必要なため
- エンティティ間を直接つなぐリレーションシップが認められていないため
> StudentとCourseを直接つなぐリレーションシップでは、成績、学期、状態の情報を保持できません。中間エンティティのパターンでは、リレーションシップ自体を第一級のエンティティとして表します。これにより、両端のエンティティではなく、つながりに属性が必要となる「この学生は今学期、この科目でどの成績を取ったか？」といったクエリを実行できます。
```

次はProfessorを追加して、教員の担当を追跡します。
