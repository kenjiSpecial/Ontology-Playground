---
name: ontology-school-path-generator
description: "Turn source ontology material into an Ontology School course with progressive step ontologies, embeds, diffs, quizzes, and QA. Use when tutorialization is requested."
---

# Ontology School Path Generator

Use this skill only when the user asks to tutorialize ontology material into a
course. Read the references that affect the requested output:

- [`docs/authoring-guide.md`](../../../docs/authoring-guide.md)
- [`docs/learn-content-guide.md`](../../../docs/learn-content-guide.md)
- [`docs/embed-guide.md`](../../../docs/embed-guide.md)
- An existing lab under `content/learn/` and its step ontologies

## Course contract

Extract a teachable subset, choose a progressive step count appropriate to the
source (4–7 is the default), and place step ontologies under
`catalogue/official/<slug>-step-N/` with `"category": "school"`. Create the
course under `content/learn/<course-slug>/`, add `<ontology-embed>` elements and
progressive `diff` blocks, and include at least one quiz per article by
default. If the requested teaching design needs a different step or quiz
pattern, use that explicit configuration and keep it covered by the QA
validator.

If lesson content is pending approval, add
`reviewStatus: under-human-review` to its frontmatter. Open or create the
review Issue only when the user explicitly requests it or an authorized
workflow grants that action; otherwise report the review-needed handoff.

## Person names

When course text, step ontologies, examples, sample data, quests, quizzes, or
docs need person names, use [`name-generator`](../name-generator/SKILL.md) and
the approved CSV. Keep selected names consistent across source markdown, RDF,
generated output, and tests.

## Validation

When school content is changed, run:

```bash
npm run qa:tutorial-content
```

Run `npm run build` when generated catalogue/learning output or application
behavior is part of the requested change. Completion means the course renders,
step ontologies remain in the School category, embeds and quizzes pass QA, and
any introduced names come from the approved fixture.
