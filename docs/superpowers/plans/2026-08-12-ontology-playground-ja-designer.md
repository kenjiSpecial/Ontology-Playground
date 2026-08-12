# Ontology Playground Japanese Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize the complete ontology designer experience into Japanese while preserving its data model, stable IDs, RDF syntax, editing behavior, validation rules, and export/import behavior.

**Architecture:** Extend the typed Japanese message catalogue with a `designer` group and formatters for counts and validation messages. React components consume catalogue values instead of inline English. Store-level validation returns Japanese because those messages are directly user-visible. Template card metadata is Japanese, while template ontology entity/property/relationship names and stable IDs remain unchanged.

**Tech Stack:** React 19, TypeScript 5.9, Zustand, Vitest 4, Testing Library, Cytoscape, Node.js 20

## Constraints

- Work on `feature/ja-designer` from external fork `origin/main` in the isolated worktree.
- Issue: `kenjiSpecial/Ontology-Playground#11`; parent: `kenjiSpecial/kura#644`.
- Preserve route names, ontology IDs, entity/relationship/property IDs and technical names, RDF/XML syntax, JSON keys, type enum values, cardinality values, and imported data.
- Keep the localized default ontology label mapped to the legacy `my-ontology` URI/file seed, and create new entities with an empty display name while retaining the `new-entity-*` ID seed.
- Keep shared RDF serialization behavior unchanged; apply the legacy default-name mapping only through a designer-specific serialization wrapper.
- Translate template card labels/descriptions only; do not translate the template ontology payload.
- Do not edit gallery/import-export/Fabric/AI Builder/learning/catalogue/deployment files.
- Use Node 20 for every npm command. Stage exact paths only and never push to `upstream`.

---

### Task 1: Capture baseline and add failing designer localization tests

**Files:**
- Create: `src/locales/DesignerLocalization.test.tsx`
- Modify: `src/store/designerStore.test.ts`
- Modify: `src/components/designer/RelationshipForm.test.tsx`
- Modify: `src/locales/ja.test.ts`

- [ ] **Step 1: Install and run baseline**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
```

- [ ] **Step 2: Test designer shell and form rendering**

Render the designer page and focused forms with stable mocks. Require Japanese back action, placeholders, toolbar actions, section headings, empty states, field labels, aria labels, and relationship actions.

- [ ] **Step 3: Test preview and submission UI**

Require Japanese graph/RDF tabs, RDF edit/copy/import actions, input errors, template picker copy, and catalogue-submission instructions.

- [ ] **Step 4: Test Japanese validation**

Update store tests to require Japanese Fabric IQ naming errors and ontology validation messages without changing which invalid states are detected.

- [ ] **Step 5: Verify RED**

Run focused designer and locale tests. Expected failures come only from English user-facing content.

### Task 2: Add typed Japanese designer messages

**Files:**
- Modify: `src/locales/ja.ts`
- Modify: `src/locales/ja.test.ts`

- [ ] **Step 1: Add designer catalogue groups**

Add shell, toolbar, validation, entity form, relationship form, preview, template, and submission strings.

- [ ] **Step 2: Add count and validation formatters**

Add formatters for entity/property/relationship/attribute counts and all values interpolated into naming/validation errors.

- [ ] **Step 3: Verify locale QA**

Run `npm run qa:ja` and keep allowed English terms limited to technical/product names.

### Task 3: Localize designer shell, actions, forms, and validation

**Files:**
- Modify: `src/components/OntologyDesigner.tsx`
- Modify: `src/components/designer/DesignerActions.tsx`
- Modify: `src/components/designer/EntityForm.tsx`
- Modify: `src/components/designer/RelationshipForm.tsx`
- Modify: `src/store/designerStore.ts`
- Modify: `src/store/designerStore.test.ts`
- Modify: `src/components/designer/RelationshipForm.test.tsx`

- [ ] **Step 1: Migrate shell and toolbar copy**

Use catalogue values for navigation, placeholders, actions, titles, success feedback, and issue counts.

- [ ] **Step 2: Migrate entity and relationship form copy**

Translate headings, empty states, labels, placeholders, tooltips, color aria labels, identifier guidance, and add/remove controls. Keep property types and cardinality values stable.

- [ ] **Step 3: Return Japanese validation messages**

Keep validation branches and linked entity/relationship IDs unchanged while translating every returned message. Change the default draft display name to Japanese.

- [ ] **Step 4: Verify focused behavior**

Run form, store, and designer localization tests.

### Task 4: Localize preview, templates, and catalogue submission

**Files:**
- Create: `src/lib/designerRdf.ts`
- Modify: `src/components/designer/DesignerPreview.tsx`
- Modify: `src/components/designer/TemplatePicker.tsx`
- Modify: `src/data/designerTemplates.ts`
- Modify: `src/components/designer/SubmitCatalogueModal.tsx`
- Modify: `src/locales/DesignerLocalization.test.tsx`

- [ ] **Step 1: Localize preview controls and errors**

Translate tabs, incomplete-RDF comment, edit/copy/load/cancel actions, placeholders, and locally authored parse errors. Preserve parser-provided source errors verbatim.

- [ ] **Step 2: Localize template cards**

Translate only card `label` and `description`. Add assertions that template IDs and ontology payload technical names are unchanged.

- [ ] **Step 3: Localize catalogue-submission guidance**

Translate title, description, numbered instructions, download actions, link text, and close action. Preserve repository paths, filenames, branch names, and file content.

- [ ] **Step 4: Verify focused behavior**

Run locale and designer tests, including RDF import/copy and submission rendering.

### Task 5: Verify, review, and deliver

- [ ] **Step 1: Run supported suite**

```bash
npm run catalogue:build
npm run qa:ja
npm test
npx eslint src/components/OntologyDesigner.tsx src/components/designer src/store/designerStore.ts src/store/designerStore.test.ts src/data/designerTemplates.ts src/locales
npm run build
git diff --check origin/main...HEAD
```

Restore generated `public/learn.json` after build.

- [ ] **Step 2: Audit boundaries**

Confirm no imported values, IDs, template ontology payload technical names, RDF syntax, routes, or generated files changed and the Issue scope remains within 16 files.

- [ ] **Step 3: Request independent review**

Review `origin/main...HEAD` against Issue #11 for localization completeness, behavior, data boundaries, tests, security, and scope.

- [ ] **Step 4: Commit, push, PR, merge, and clean up**

Stage exact paths, push, open a PR linked to #11/#644, verify current-head state and independent review, then merge under explicit authorization. Synchronize resident main and remove only this agent-created worktree/branch.
