# Agent reference

This file holds conditional repository guidance that does not belong in the
short `AGENTS.md` entry point. Read only the section that matches the request.

## Route the request

- An original contributor-authored RDF/OWL submission goes to
  [community-ontology-contribution](../.github/skills/community-ontology-contribution/SKILL.md).
- An external or customer-provided RDF/OWL import goes to
  [ontology-catalog-import](../.github/skills/ontology-catalog-import/SKILL.md).
- A requested tutorial goes to
  [ontology-school-path-generator](../.github/skills/ontology-school-path-generator/SKILL.md),
  whether the source is a local ontology or a catalogue entry.
- A new palette or theme registration goes to
  [theme-authoring](../.github/skills/theme-authoring/SKILL.md).
- Use [name-generator](../.github/skills/name-generator/SKILL.md) only when a
  task needs fictional person names.

Do not infer an additional deliverable from an RDF/OWL file. Ask for a missing
choice only when it changes the requested result. Creating a school review
Issue requires an explicit request or an authorized workflow.

Goal/Issue handoff, candidate-SHA verification, current-head deterministic
policy lint, shipping, and merge follow the parent project workflow. The
repository-specific skills below do not authorize or replace those boundaries.

## Catalogue compiler contract

[`scripts/compile-catalogue.ts`](../scripts/compile-catalogue.ts) is the source
of truth for discovery and metadata validation:

- official entries are `catalogue/official/<slug>/`;
- community entries are `catalogue/community/<github-username>/<slug>/`;
- external entries are `catalogue/external/<source>/<slug>/`;
- community and external entries must have both nested directories;
- the entry directory must contain a `.rdf` or `.owl` source file and a
  `metadata.json` with non-empty `name`, `description`, and `category` strings.

`ontology.rdf` and `ontology.owl` are the repository filename conventions. The
compiler accepts any `.rdf` or `.owl` filename in the entry directory, so do
not claim a stricter filename requirement in a skill without changing the
compiler too. Confirm valid categories against the compiler at the time of the
change.

## Verification routing

Use focused deterministic checks:

| Changed surface | Verification |
| --- | --- |
| Instructions or skill Markdown only | Check local Markdown links and YAML frontmatter; run `git diff --check`. |
| Catalogue RDF/OWL or metadata | `npx tsx scripts/compile-catalogue.ts` and `npm run validate`. |
| Learning articles, quizzes, or embeds | `npm run qa:tutorial-content`; build when generated output or application behavior is in scope. |
| Theme or application TypeScript/CSS | `npm run test:a11y`, `npx tsc --noEmit`, and `npm run build` as applicable. |

Do not require the full application build for instruction-only edits. Preserve
existing user changes while inspecting generated files and choose a focused
test when only one executable path changed.

## Repository implementation notes

When application code is in scope, follow the existing strict TypeScript,
functional React, Zustand, RDF parser/serializer, and catalogue compiler
patterns. Keep source changes separate from generated `public/` output unless
the requested workflow explicitly regenerates it. User-facing behavior changes
may require a related README or TODO update; documentation-only routing edits
do not.
