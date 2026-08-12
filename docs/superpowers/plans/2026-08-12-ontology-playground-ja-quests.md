# Ontology Playground Japanese Quests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize the quest panel, five default quests, and all dynamically generated quests into Japanese without changing IDs, targets, scoring, progression, or ontology-derived values.

**Architecture:** Add a typed `quests` UI group and quest count/reward formatters to the Japanese locale catalog. Default and generated quest content is Japanese authored data. Difficulty enum values remain stable internal/CSS IDs and are mapped to Japanese only at render time. Query quest instructions use Japanese quoted questions supported by the merged Japanese query engine.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Testing Library, Zustand, Node.js 20

## Constraints

- Work on `feature/ja-quests` from external fork `origin/main` in the isolated worktree.
- Issue: `kenjiSpecial/Ontology-Playground#9`; parent: `kenjiSpecial/kura#644`.
- Preserve all quest IDs, step IDs, target types, target IDs, category IDs, difficulty IDs, badge icons, point values, selection/progression/completion behavior, and ontology data values.
- Edit only the `quests` array above `nlQueryResponses` in `src/data/quests.ts`; do not change the already-localized response table.
- Keep imported/generated ontology, entity, relationship, and property names verbatim inside Japanese sentences.
- Do not edit graph/query engine/designer/gallery/learning/catalogue/generated `public/**`/deployment files.
- Use Node 20 for every npm command. Stage exact paths only and never push to `upstream`.

---

### Task 1: Capture baseline and add failing quest localization tests

**Files:**
- Create: `src/locales/QuestLocalization.test.tsx`
- Modify: `src/data/questGenerator.test.ts`
- Modify: `src/data/questIntegrity.test.ts`
- Modify: `src/locales/ja.test.ts`

- [ ] **Step 1: Install and run baseline**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
```

Expected baseline: locale QA reports 28 tests and the full suite reports 438 tests.

- [ ] **Step 2: Test QuestPanel Japanese rendering**

Create `QuestLocalization.test.tsx` with a pass-through framer-motion mock. Require Japanese panel title, default quest title/description, Japanese difficulty badges, Japanese point suffix, active quest progress, and Japanese abandon action. Verify starting/abandoning a quest still changes store state.

- [ ] **Step 3: Test default quest content**

Add integrity expectations that every default title, description, instruction, hint, and badge includes Japanese text; all existing IDs/targets/points remain valid; and all Japanese query steps resolve through `validateQueryQuestSteps`.

- [ ] **Step 4: Test dynamic quest content**

Update generator expectations to Japanese wording, require every generated authored field to include Japanese text, and assert source ontology names such as `Service`, `ConfigurationItem`, relationship names, and property names remain present verbatim.

- [ ] **Step 5: Verify RED**

Run focused quest/localization tests. Expected: failures from English UI/default/generated content.

### Task 2: Add typed Japanese quest UI messages

**Files:**
- Modify: `src/locales/ja.ts`
- Modify: `src/locales/ja.test.ts`

- [ ] **Step 1: Add quest UI catalog**

Add Japanese values for title, abandon, earned badges, total, and beginner/intermediate/advanced display labels.

- [ ] **Step 2: Add dynamic formatters**

Add formatters for step progress, reward points, earned-badge count, and total points. Do not change internal enum values.

- [ ] **Step 3: Verify locale QA GREEN**

Run `npm run qa:ja`; expect no invalid or stale values.

### Task 3: Localize QuestPanel and default quests

**Files:**
- Modify: `src/components/QuestPanel.tsx`
- Modify: `src/data/quests.ts`
- Modify: `src/locales/QuestLocalization.test.tsx`
- Modify: `src/data/questIntegrity.test.ts`

- [ ] **Step 1: Migrate QuestPanel static and formatted copy**

Use catalog values/formatters for panel title, abandon, difficulty display, reward points, earned badges, and total. Keep `quest.difficulty` in CSS classes and IDs unchanged.

- [ ] **Step 2: Translate five default quests**

Translate title, description, instructions, hints, and badge names. Keep ontology-derived `Customer`, `Product`, `Store`, `Supplier`, `Shipment`, relationship names, property names, source columns, and target IDs verbatim.

- [ ] **Step 3: Convert default query steps to Japanese**

Use Japanese corner-quoted questions matching the Japanese demo query engine. Validate all steps return non-fallback ontology-specific results.

- [ ] **Step 4: Verify panel/default GREEN**

Run QuestPanel, integrity, query validator, and locale tests.

### Task 4: Localize dynamic quest generation

**Files:**
- Modify: `src/data/questGenerator.ts`
- Modify: `src/data/questGenerator.test.ts`

- [ ] **Step 1: Translate exploration/traversal/property quest templates**

Translate all generated titles, descriptions, instructions, hints, and badge names while interpolating source names/icons/counts unchanged.

- [ ] **Step 2: Generate executable Japanese query quests**

Generate corner-quoted Japanese entity-definition and connection questions. Preserve query step IDs/categories/points and validate them against the query engine.

- [ ] **Step 3: Translate full-journey templates**

Translate all five chain steps, hints, title, description, and badge. Preserve selected chain entities and relationships.

- [ ] **Step 4: Verify dynamic GREEN**

Run generator and integrity tests; ensure no authored English remains in generated user-visible content.

### Task 5: Verify, review, and deliver A3c

- [ ] **Step 1: Run supported suite**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
npx eslint src/components/QuestPanel.tsx src/data/quests.ts src/data/questGenerator.ts src/data/questGenerator.test.ts src/data/questIntegrity.test.ts src/locales
npm run build
git diff --check origin/main...HEAD
```

Restore generated `public/learn.json` after build.

- [ ] **Step 2: Audit exact scope and response-table boundary**

Confirm `quests.ts` changes stop before `nlQueryResponses`, all stable IDs/points are unchanged, source data remains verbatim, and no generated files are present.

- [ ] **Step 3: Request independent review**

Review `origin/main...HEAD` against Issue #9 for localization completeness, data boundary, query executability, behavior, tests, and scope.

- [ ] **Step 4: Commit, push, PR, merge, and clean up**

Stage exact paths, push, open a PR linked to #9/#644, verify current-head checks and independent review, then merge under explicit authorization. Synchronize resident main and remove only this agent-created worktree/branch.
