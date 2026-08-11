# Ontology Playground Japanese Query Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Japanese natural-language query UI and Japanese query engine responses while retaining English-input compatibility and preserving ontology-derived data verbatim.

**Architecture:** Extend `jaMessages.query` for static controls and `jaFormatters` for data-interpolated query copy. `queryEngine` recognizes both Japanese and legacy English intent patterns, returns Japanese authored prose, and continues to place ontology names, entity names, descriptions, property names, types, units, relationship names, and cardinalities into results without translation. The quest query validator uses an exported fallback predicate instead of coupling itself to an English sentence prefix.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Testing Library, Zustand, Node.js 20

## Constraints

- Work on `feature/ja-query` from external fork `origin/main` in the isolated worktree.
- Issue: `kenjiSpecial/Ontology-Playground#7`; parent: `kenjiSpecial/kura#644`.
- Preserve query/result interfaces, highlight arrays, entity/relationship/property IDs, ontology data values, and the UI's existing 600 ms processing behavior.
- Keep legacy English query recognition covered by tests; generated suggestions and authored output are Japanese-only.
- Edit only the `nlQueryResponses` section of `src/data/quests.ts`; quest titles, descriptions, steps, difficulty IDs, and badges belong to the next Issue.
- Do not edit NL Builder/Designer, speech recognition, graph, inspector, learning, catalogue, generated `public/**`, or deployment files.
- Use Node 20 for every npm command. Stage exact paths only and never push to `upstream`.

---

### Task 1: Record baseline and add failing Japanese query tests

**Files:**
- Create: `src/locales/QueryLocalization.test.tsx`
- Modify: `src/data/queryEngine.test.ts`
- Modify: `src/data/questGenerator.test.ts`
- Modify: `src/locales/ja.test.ts`

**Interfaces:**
- Tests QueryPlayground static Japanese UI and Japanese generated suggestions while retaining data-derived names.
- Tests Japanese intent recognition for conceptual, entity-definition, entity-listing, connection, property, counting, schema-overview, demo, and fallback paths.
- Retains representative legacy English query assertions.

- [ ] **Step 1: Install dependencies and capture clean baseline**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
```

Expected baseline: locale QA reports 25 tests and the full suite reports 419 tests. `catalogue:build` is required in a pristine worktree for quest integrity tests.

- [ ] **Step 2: Add QueryPlayground render expectations**

Create `src/locales/QueryLocalization.test.tsx` with a pass-through `framer-motion` mock. Require:

- heading `自然言語クエリ`;
- placeholder `<ontology name>について質問…` while preserving `Fourth Coffee`;
- Japanese run and clear accessible names;
- Japanese `質問例:` guidance;
- three Japanese suggestion buttons containing unchanged ontology entity names.

- [ ] **Step 3: Add Japanese engine expectations**

Extend `queryEngine.test.ts` to verify meaningful Japanese results and correct highlights for:

1. `Problemとは何ですか？`;
2. `すべてのProblemを表示して`;
3. `ServiceはConfigurationItemとどうつながりますか？`;
4. a property query containing `Problem` and `title`;
5. `Problemは何件ありますか？`;
6. `スキーマの概要を表示して`;
7. an unknown Japanese query fallback;
8. one Fourth Coffee Japanese demo query.

Assert Japanese authored surrounding prose and unchanged data-derived `Problem`, `Service`, `ConfigurationItem`, descriptions, property/type, and IDs.

- [ ] **Step 4: Add compatibility and validator expectations**

Keep the existing English definition and relationship-name tests. Update fallback assertions to Japanese. Add tests that Japanese corner quotes can be extracted from query quest instructions and the validator recognizes the Japanese fallback via an exported predicate.

- [ ] **Step 5: Add formatter expectations and verify RED**

Test representative query UI/result formatters in `ja.test.ts`, then run the four focused test files. Expected: failures because Japanese query catalog, rendering, recognition, and result copy do not yet exist.

### Task 2: Add typed Japanese query messages and formatters

**Files:**
- Modify: `src/locales/ja.ts`
- Modify: `src/locales/ja.test.ts`

**Interfaces:**
- Adds static `query` messages for heading, controls, example guidance, result labels, and generic terms.
- Adds typed dynamic formatters for placeholders, interpretations, result headings, counts, properties, schema totals, and fallback guidance.

- [ ] **Step 1: Add static UI messages**

Add exact Japanese values for title, run, clear, try-asking guidance, and common result vocabulary. Do not add English-only exceptions for ontology data because those values are passed to formatters at runtime rather than stored in the catalog.

- [ ] **Step 2: Add dynamic query formatters**

Add functions for the ontology placeholder; detected-intent text; entity/relationship/property/count/schema result framing; production-mode explanation; and fallback message. Ensure every authored phrase is Japanese while interpolated application data remains untouched.

- [ ] **Step 3: Verify catalog GREEN**

```bash
npm run qa:ja
```

Expected: no empty, unsupported-Latin, or stale-allowlist diagnostics.

### Task 3: Localize QueryPlayground and generated suggestions

**Files:**
- Modify: `src/components/QueryPlayground.tsx`
- Modify: `src/data/queryEngine.ts`
- Modify: `src/locales/QueryLocalization.test.tsx`

**Interfaces:**
- Static component text comes from `jaMessages.query`; placeholder uses `jaFormatters`.
- Suggestion templates are Japanese but interpolate original entity/property names.

- [ ] **Step 1: Migrate component copy and accessibility names**

Replace title, placeholder, clear title/aria-label, run aria-label, and example guidance. Preserve handlers, loading state, result rendering, quest advancement, and delay.

- [ ] **Step 2: Generate Japanese suggestions**

Return Japanese list, property, relationship, and conceptual suggestions. Retain the current unique/max-six behavior and raw ontology values.

- [ ] **Step 3: Verify component rendering GREEN**

Run `QueryLocalization.test.tsx` and catalog tests. Expected: all UI and suggestion assertions pass.

### Task 4: Support Japanese intents and return Japanese results

**Files:**
- Modify: `src/data/queryEngine.ts`
- Modify: `src/data/queryEngine.test.ts`
- Modify: `src/data/quests.ts`

**Interfaces:**
- Normalizes Japanese punctuation in addition to existing ASCII punctuation.
- Each intent accepts Japanese phrases and existing English patterns.
- Fourth Coffee demo canonical queries/results are Japanese; legacy English match aliases remain internal compatibility inputs.

- [ ] **Step 1: Add Japanese intent predicates**

Implement small, explicit predicates for Japanese conceptual, definition, list, relationship/connection, property, count, schema, and ontology-structure wording. Match ontology-derived names case-insensitively without rewriting them.

- [ ] **Step 2: Migrate generic results and interpretations**

Return Japanese authored prose for every successful and fallback branch through `jaFormatters`. Preserve Markdown emphasis, line breaks, data values, and highlight behavior.

- [ ] **Step 3: Migrate Fourth Coffee demo data**

Translate nine result strings and canonical Japanese queries in `nlQueryResponses`. Keep English aliases in `matches` so existing bookmarks/input continue to work. Preserve all names, IDs, monetary values, and highlight arrays.

- [ ] **Step 4: Verify engine GREEN**

Run query engine and QueryPlayground tests. Expected: Japanese paths, demo paths, and legacy English compatibility all pass.

### Task 5: Decouple quest validation from English fallback copy

**Files:**
- Modify: `src/data/queryEngine.ts`
- Modify: `src/data/questQueryValidator.ts`
- Modify: `src/data/questGenerator.test.ts`

**Interfaces:**
- Exports a locale-appropriate `isFallbackQueryResponse` predicate.
- Extracts quoted queries from straight, smart, and Japanese corner quotes.

- [ ] **Step 1: Export fallback detection**

Make the engine's fallback detection explicit and use it from the validator. Do not infer fallback from missing highlights because conceptual answers may intentionally highlight none.

- [ ] **Step 2: Support Japanese corner quotes**

Extend query extraction for `「…」` while preserving existing quote styles.

- [ ] **Step 3: Verify default and generated quest integrity**

Run `questGenerator.test.ts` and `questIntegrity.test.ts`. Existing English quest query instructions must remain executable until their dedicated localization Issue.

### Task 6: Verify, review, and deliver A3b

**Files:**
- Verify every Issue #7 scoped path.

- [ ] **Step 1: Run the supported suite**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
npx eslint src/components/QueryPlayground.tsx src/data/queryEngine.ts src/data/queryEngine.test.ts src/data/questQueryValidator.ts src/data/quests.ts src/data/questGenerator.test.ts src/locales
npm run build
git diff --check origin/main...HEAD
```

Restore generated `public/learn.json` after build if it is the only generated tracked change.

- [ ] **Step 2: Audit Japanese output, compatibility, and exact scope**

Review every authored string in QueryPlayground and every returned/generated query string. Confirm runtime ontology values remain unchanged and no generated files or quest copy outside `nlQueryResponses` changed.

- [ ] **Step 3: Request independent code review**

Ask a reviewer agent to compare `origin/main...HEAD` with Issue #7, covering localization completeness, Japanese intent correctness, English compatibility, data preservation, fallback validation, security/regression risk, tests, and scope.

- [ ] **Step 4: Commit, push, PR, and merge after gates**

Stage exact Issue #7 paths, commit with Conventional Commits + Japanese, push `feature/ja-query`, open a PR linked to Issue #7 and parent #644, verify current-head checks, and merge under explicit auto-merge authorization. Synchronize resident main and remove only this agent-created worktree/branch after merge is confirmed.
