# Ontology Playground Japanese Graph Exploration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every shipped English label in the graph exploration, statistics, path-finding, search/filter, and inspector surfaces with catalog-backed Japanese while preserving ontology data and behavior.

**Architecture:** Extend the typed `jaMessages` catalog with an `exploration` group and add count/path/result formatters to `jaFormatters`. Each scoped component imports those messages directly. User-authored and ontology-derived entity names, relationship names, descriptions, identifiers, types, cardinalities, bindings, and units remain unchanged.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Testing Library, Zustand, Cytoscape, Node.js 20

## Constraints

- Work on `feature/ja-exploration` from external fork `origin/main` in the isolated worktree.
- Issue: `kenjiSpecial/Ontology-Playground#5`; parent: `kenjiSpecial/kura#644`.
- Preserve graph algorithms, control actions, highlight behavior, stable IDs, CSS classes, download format, and ontology/binding data values.
- Do not edit `src/data/**`, quests, query/NLP, designer, gallery, import/export, learning, catalogue, or generated `public/**`.
- Keep `PNG` and `ID` only as explicit standard-name exceptions in catalog-backed strings.
- Use Node 20 for every npm command. Stage exact paths only and never push to `upstream`.

---

### Task 1: Record the baseline and add failing localization tests

**Files:**
- Create: `src/locales/ExplorationLocalization.test.tsx`
- Modify: `src/components/InspectorPanel.test.tsx`
- Modify: `src/locales/ja.test.ts`

**Interfaces:**
- Exercises Japanese render output for statistics, path finder, search/filter, and empty/selected inspector states.
- Proves ontology-derived English values such as `Customer` remain unchanged.
- Tests graph-control messages and dynamic count/path/result formatters through the typed catalog.

- [ ] **Step 1: Install locked dependencies and record the clean baseline**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
```

Expected baseline: locale QA reports 18 tests and the full suite reports 412 tests. A pristine worktree needs `catalogue:build` because `questIntegrity.test.ts` reads the generated, gitignored `public/catalogue.json`.

- [ ] **Step 2: Add public-render localization tests**

Create `src/locales/ExplorationLocalization.test.tsx` with focused tests that:

1. render `OntologyStatsPanel` and require `オントロジーの概要`, `エンティティ`, `リレーションシップ`, and `プロパティ`;
2. expand `PathFinderPanel` and require `経路探索`, `始点`, `終点`, `エンティティを選択…`, and `経路を探索`;
3. render `SearchFilter`, require Japanese section/search/result accessibility labels and count format, and assert the data-derived `Customer` remains present;
4. render `InspectorPanel` empty and selected-entity states, require Japanese guidance/section labels, and assert the data-derived `Customer` remains present;
5. require the graph catalog to expose Japanese focus, control title, canvas accessibility, and legend labels.

Mock `framer-motion` with pass-through components and stub `HTMLElement.prototype.scrollIntoView` as in existing component localization tests. Reset the Zustand store between tests.

- [ ] **Step 3: Update existing inspector expectations**

Replace English `Properties` and `Data Bindings` assertions in `src/components/InspectorPanel.test.tsx` with their exact Japanese labels. Do not change quest-step or data-binding behavior assertions.

- [ ] **Step 4: Add formatter expectations and verify RED**

Add expectations for Japanese entity, relationship, property, no-result, and shortest-path formatters to `src/locales/ja.test.ts`, then run:

```bash
npx vitest run src/locales/ExplorationLocalization.test.tsx src/components/InspectorPanel.test.tsx src/locales/ja.test.ts
```

Expected: failures because the exploration catalog and Japanese component output do not yet exist.

### Task 2: Extend the typed Japanese catalog

**Files:**
- Modify: `src/locales/ja.ts`
- Modify: `src/locales/ja.test.ts`

**Interfaces:**
- Adds `exploration.graph`, `.stats`, `.pathFinder`, `.search`, and `.inspector` message groups.
- Adds count and result formatters without accepting raw translated ontology values.

- [ ] **Step 1: Add exact exploration messages**

Add catalog entries for graph focus mode/instructions, zoom/fit/reset/download controls, canvas accessibility, entity-type legend, statistics heading/metrics, path-finder controls/states, search/filter controls/results, and inspector empty/relationship/entity/binding sections.

- [ ] **Step 2: Add dynamic formatters**

Add formatters equivalent to:

```ts
entities: (count: number) => `エンティティ（${count}）`,
relationships: (count: number) => `リレーションシップ（${count}）`,
properties: (count: number) => `${count}件のプロパティ`,
propertiesHeading: (count: number) => `プロパティ（${count}）`,
searchNoResults: (query: string) => `「${query}」に一致する結果はありません`,
shortestPath: (hops: number) => `最短経路 — ${hops}ホップ`,
```

- [ ] **Step 3: Register only explicit standards**

Add catalog-backed `PNG` and `ID` occurrences to `jaAllowedEmbeddedEnglishTerms` / `jaAllowedEnglishOnlyPaths` as required by the validator. Do not allow ontology-derived English values through the static message catalog.

- [ ] **Step 4: Verify catalog GREEN**

```bash
npm run qa:ja
```

Expected: locale tests pass with no empty, unsupported-Latin, or stale-allowlist diagnostics.

### Task 3: Localize graph, statistics, path finding, and search/filter

**Files:**
- Modify: `src/components/OntologyGraph.tsx`
- Modify: `src/components/OntologyStatsPanel.tsx`
- Modify: `src/components/PathFinderPanel.tsx`
- Modify: `src/components/SearchFilter.tsx`
- Modify: `src/locales/ExplorationLocalization.test.tsx`

**Interfaces:**
- Static copy comes from `jaMessages.exploration`; counts and result messages use `jaFormatters`.
- Graph controls gain Japanese accessible names while retaining the same click handlers.
- Search clearing gains an explicit Japanese accessible name.

- [ ] **Step 1: Migrate graph labels and accessibility**

Replace focus mode, exit instruction, control titles/accessible names, legend title, and canvas accessible name with catalog values. Add `role="img"` and a Japanese `aria-label` to the graph canvas. Keep the PNG payload and filename construction unchanged.

- [ ] **Step 2: Migrate statistics and path finder**

Use catalog headings/labels for all static text and `jaFormatters.shortestPath` for hop counts. Preserve entity/relationship names and cardinalities from application data.

- [ ] **Step 3: Migrate search/filter**

Localize heading, input placeholder, toggle labels, result region, clear-control accessibility, no-result state, and property count. Keep search matching and data-derived result names unchanged.

- [ ] **Step 4: Verify focused rendering GREEN**

```bash
npx vitest run src/locales/ExplorationLocalization.test.tsx src/locales/ja.test.ts
```

Expected: graph catalog, statistics, path finder, and search/filter localization assertions pass.

### Task 4: Localize the inspector without translating ontology data

**Files:**
- Modify: `src/components/InspectorPanel.tsx`
- Modify: `src/components/InspectorPanel.test.tsx`
- Modify: `src/locales/ExplorationLocalization.test.tsx`

**Interfaces:**
- Localizes empty guidance and section headings.
- Leaves entity/relationship names, descriptions, properties, types, cardinality values, binding sources/tables/columns, units, and quest targets unchanged.

- [ ] **Step 1: Migrate empty and selected relationship views**

Use catalog values for inspector title, empty guidance, relationship heading, cardinality heading, and relationship-attributes heading.

- [ ] **Step 2: Migrate selected entity view**

Use catalog values/formatters for entity type, properties, relationships, data bindings, and identifier badge. Preserve all application data values and click-to-advance behavior.

- [ ] **Step 3: Verify inspector GREEN**

```bash
npx vitest run src/components/InspectorPanel.test.tsx src/locales/ExplorationLocalization.test.tsx
```

Expected: Japanese render assertions and existing quest/binding interactions all pass.

### Task 5: Verify, review, and deliver A3a

**Files:**
- Verify every Issue #5 scoped path.

- [ ] **Step 1: Run the supported suite**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
npx eslint src/components/OntologyGraph.tsx src/components/OntologyStatsPanel.tsx src/components/PathFinderPanel.tsx src/components/SearchFilter.tsx src/components/InspectorPanel.tsx src/components/InspectorPanel.test.tsx src/locales
npm run build
git diff --check origin/main...HEAD
```

Expected: locale QA, all tests, focused ESLint, TypeScript/build, and diff check pass. Restore generated `public/learn.json` if the build changes only generated content.

- [ ] **Step 2: Audit authored English and exact scope**

Search the scoped components for every original English phrase and review `git diff --stat`, `git status`, and `git diff --check`. Generated files and paths outside Issue #5 must remain untouched.

- [ ] **Step 3: Request an independent code review**

Ask a reviewer agent to compare `origin/main...HEAD` against Issue #5, covering Japanese completeness, static-vs-data boundary, behavior preservation, test adequacy, and scope. Resolve all valid findings before delivery.

- [ ] **Step 4: Commit, push, open PR, and merge after gates**

Stage only Issue #5 paths, commit with Conventional Commits + Japanese, push `feature/ja-exploration`, open a PR linked to Issue #5 and parent #644, wait for green CI/checks, then merge under the user's explicit auto-merge authorization. Synchronize the external resident checkout and remove only this agent-created worktree/branch after merge is confirmed.
