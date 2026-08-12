# Ontology Playground Japanese Data Exchange Modals Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Localize the import/export, ontology summary, data-source binding, and Microsoft Fabric push modals into Japanese without changing user data, serialized formats, API behavior, or credentials handling.

**Architecture:** Add typed `dataExchange` message groups and count/error formatters to the Japanese catalogue. The four React modals consume those messages. Locally authored errors receive Japanese framing while parser/API-provided detail remains verbatim. Stable file-format tokens, schema keys, IDs, table/column names, scopes, and ontology values remain unchanged.

**Tech Stack:** React 19, TypeScript 5.9, Zustand, Vitest 4, Testing Library, Node.js 20

## Constraints

- Work on `feature/ja-data-exchange` from external fork `origin/main` in the isolated worktree.
- Issue: `kenjiSpecial/Ontology-Playground#13`; parent: `kenjiSpecial/kura#644`.
- Preserve imported values, parser/API detail, IDs, UUIDs, tokens, scopes, JSON/YAML/CSV/RDF keys and syntax, MIME types, extensions, routes, and file contents.
- Do not persist credentials or log bearer tokens.
- Do not edit gallery, AI Builder, learning, embed, catalogue data, or deployment files.
- Use Node 20 for every npm command. Stage exact paths only and never push to `upstream`.

---

### Task 1: Baseline and failing localization tests

**Files:**
- Create: `src/locales/DataExchangeLocalization.test.tsx`
- Modify: `src/components/ImportExportModal.test.tsx`

- [ ] Run baseline catalogue build, locale QA, and full tests.
- [ ] Render all four modals and require Japanese headings, descriptions, actions, placeholders, accessibility names, counts, and technical data preservation.
- [ ] Exercise empty/invalid Fabric credentials and require Japanese local validation.
- [ ] Exercise summary copy and require Japanese Markdown headings while ontology values remain verbatim.
- [ ] Retain import/export tests for accepted extensions, RDF parsing, JSON compatibility flag behavior, and data-binding preservation.
- [ ] Run focused tests and confirm RED only on English content.

### Task 2: Typed Japanese data-exchange catalogue

**Files:**
- Modify: `src/locales/ja.ts`

- [ ] Add import/export, summary, data-sources, and Fabric push message groups.
- [ ] Add formatters for entity/relationship/property counts, parser/API error prefixes, existing-item counts, and result labels.
- [ ] Keep technical terms on the explicit embedded-English allowlist only when required.
- [ ] Run `npm run qa:ja`.

### Task 3: Import/export and summary localization

**Files:**
- Modify: `src/components/ImportExportModal.tsx`
- Modify: `src/components/ImportExportModal.test.tsx`
- Modify: `src/components/OntologySummaryModal.tsx`
- Modify: `src/locales/DataExchangeLocalization.test.tsx`

- [ ] Localize headings, loaded-state summary, reset/success UI, drop targets, export actions, schema-reference actions, and close accessibility names.
- [ ] Localize the JSON schema example values but preserve every key and technical enum value.
- [ ] Localize authored structure/format/parse error framing; preserve filenames and parser detail.
- [ ] Localize summary UI and generated Markdown headings/identifier annotation; preserve ontology content and Markdown structure.
- [ ] Run focused tests.

### Task 4: Data-source and Fabric push localization

**Files:**
- Modify: `src/components/DataSourcesModal.tsx`
- Modify: `src/components/FabricExportModal.tsx`
- Modify: `src/locales/DataExchangeLocalization.test.tsx`

- [ ] Localize data-source overview, binding counts, source-kind display labels, table/column headers, and unbound demo guidance while preserving source/table/column values.
- [ ] Localize Fabric credential guidance, local UUID/token validation, action selection, progress, result, and retry states.
- [ ] Preserve API error detail and Fabric response display values verbatim with Japanese labels/prefixes.
- [ ] Run focused tests, including create/update selection behavior where safely mockable.

### Task 5: Verify, review, and deliver

- [ ] Run `npm run catalogue:build`, `npm run qa:ja`, full tests, scoped ESLint, and `npm run build`.
- [ ] Restore generated `public/learn.json` and confirm no generated files remain.
- [ ] Audit static strings, data boundaries, exact file count, and diff budget.
- [ ] Request independent review of `origin/main...HEAD` against Issue #13.
- [ ] Stage exact paths, push, open PR linked to #13/#644, merge under explicit authorization, sync resident main, and clean only this agent-created branch/worktree.
