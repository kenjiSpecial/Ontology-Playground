# Ontology Playground Japanese Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all shipped English text in the application shell and common guidance surfaces with catalog-backed Japanese while preserving data-derived values and behavior.

**Architecture:** Extend the typed `jaMessages` catalog with `shell`, `commandPalette`, `welcome`, `tour`, `about`, `help`, `footer`, and `themes` groups plus dynamic formatters. Components import these values directly. The guided tour targets a stable non-linguistic `data-tour-target` attribute so localized tooltips are not internal selectors.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Testing Library, Zustand, Node.js 20

## Constraints

- Work on `feature/ja-shell` from external fork `origin/main` in the isolated worktree.
- Issue: `kenjiSpecial/Ontology-Playground#3`; parent: `kenjiSpecial/kura#644`.
- Keep `Ontology Playground`, `Microsoft Fabric IQ`, `GitHub`, `GitHub Copilot`, `RDF`, `AI Builder`, `URL`, and `K` only as explicit proper-name or standard-name exceptions. Standard keyboard labels such as `Esc`, `⌘K`, arrows, and Enter symbols may remain literal keycaps.
- Do not translate ontology names, badge names, or other values supplied by application data.
- Preserve route names, command IDs, theme IDs, storage keys, URLs, external links, and legal meaning.
- Do not edit graph, quest, query, inspector, designer, gallery, import/export, Fabric export, summary, data sources, AI builder internals, generated `public/**`, catalogue, or learning content.
- Use Node 20 for every npm command. Stage exact paths only and never push to `upstream`.

---

### Task 1: Add failing shell localization tests

**Files:**
- Create: `src/locales/ShellLocalization.test.tsx`
- Modify: `src/locales/ja.test.ts`

**Interfaces:**
- Tests the public render output of Header, CommandPalette, WelcomeModal, AboutModal, HelpModal, and AppFooter.
- Tests theme labels and catalog completeness without translating data-derived ontology names.

- [ ] **Step 1: Install the locked dependencies and record the clean baseline**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
```

Expected baseline: locale QA reports 11 tests and the full suite reports 405 tests. A pristine worktree needs `catalogue:build` first because `questIntegrity.test.ts` reads the generated, gitignored `public/catalogue.json`.

- [ ] **Step 2: Write component-level Japanese expectations**

Create `src/locales/ShellLocalization.test.tsx` with tests that:

1. reset the Zustand store, render `Header` with no-op callbacks, and require `0ポイント`, `0個のバッジ`, `aria-label="カタログ"`, `aria-label="テーマ"`, and the untouched data-derived ontology name `Fourth Coffee`;
2. render an open `CommandPalette` with no commands and require placeholder `コマンドを入力…` and empty state `一致するコマンドはありません`;
3. render `WelcomeModal`, `AboutModal`, and `HelpModal` and require their Japanese headings, primary action, and close accessibility names;
4. render `AppFooter` and require `GitHub Copilotで作成` and `videlalvaroが監修`;
5. require `THEME_OPTIONS.map(option => option.label)` to equal `['ダーク', 'ライト', 'オーロラ', 'クリムゾン']`.

Use Testing Library role/name queries for controls and text queries for visible content. Do not snapshot the components.

- [ ] **Step 3: Strengthen catalog expectations**

Update `src/locales/ja.test.ts` to require:

```ts
expect(jaFormatters.points(3)).toBe('3ポイント');
expect(jaFormatters.badges(2)).toBe('2個のバッジ');
expect(jaFormatters.questComplete('グラフ探索者')).toBe('クエスト完了！獲得: グラフ探索者');
expect(jaFormatters.deployedCommit('abc1234')).toBe('デプロイ済みコミット abc1234');
```

- [ ] **Step 4: Verify RED**

```bash
npx vitest run src/locales/ShellLocalization.test.tsx src/locales/ja.test.ts
```

Expected: failures because shell catalog groups/formatters and Japanese component output do not yet exist.

### Task 2: Extend the typed Japanese catalog

**Files:**
- Modify: `src/locales/ja.ts`
- Modify: `src/locales/ja.test.ts`

**Interfaces:**
- Produces catalog groups used one-to-one by the A2 component set.
- Extends `jaAllowedEmbeddedEnglishTerms` only with terms actually present in Japanese catalog values; stale terms remain a QA failure.

- [ ] **Step 1: Add exact shell messages**

Add nested catalog entries for:

- common controls: 戻る、次へ、閉じる、始める、ヘルプ、概要、共有、テーマ、メニュー;
- header/share states: 無題のオントロジー、コピーしました！、RDFをダウンロードしました、エンコード中…、このオントロジーへの共有リンクをコピー、このオントロジーをリンクで共有;
- navigation and command names: カタログを開く、デザイナーを開く、オントロジースクールを開く、インポート / エクスポート、概要を表示、概要と商標情報、データソース、テーマを切り替える;
- mobile tabs: グラフ、クエスト、インスペクター、クエリ;
- command palette: コマンドを入力…、一致するコマンドはありません、Kで開く、↑↓で移動、↵で選択;
- Welcome, five tour steps, About, Help, Footer, and Japanese theme labels matching Issue #3.

Use `（プレビュー）` for Preview. Translate Fourth Coffee as `フォース・コーヒー` only in authored explanatory prose; do not rewrite `currentOntology.name`.

- [ ] **Step 2: Add dynamic formatters**

Extend `jaFormatters` with:

```ts
questComplete: (badge: string): string => `クエスト完了！獲得: ${badge}`,
deployedCommit: (commit: string): string => `デプロイ済みコミット ${commit}`,
tourStep: (current: number, total: number): string => `${current}/${total}`,
```

- [ ] **Step 3: Allow only used embedded standard terms**

Add exact used values to `jaAllowedEmbeddedEnglishTerms`, including `Ontology Playground`, `Microsoft Fabric IQ`, `GitHub`, `GitHub Copilot`, `RDF`, `AI Builder`, `URL`, and `K`. Every entry must occur in at least one Japanese catalog string. Keep literal keyboard keycaps such as `Esc` outside this natural-language allowlist.

- [ ] **Step 4: Verify catalog GREEN**

```bash
npm run qa:ja
```

Expected: all locale tests other than still-unmigrated component rendering pass; no empty, unsupported Latin, or stale allowlist diagnostics.

### Task 3: Localize the header, application shell, and command palette

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/CommandPalette.tsx`
- Modify: `src/store/appStore.ts`

**Interfaces:**
- `App` supplies Japanese command labels, mobile tabs, drawer close text, and quest completion formatter.
- `Header` keeps ontology and badge values data-derived while localizing surrounding UI.
- `data-tour-target="designer"` replaces the English tooltip as the GuidedTour lookup contract.

- [ ] **Step 1: Migrate store theme labels**

Import `jaMessages` and map the existing IDs/swatches to `jaMessages.themes.dark`, `.light`, `.aurora`, and `.crimson`. Do not change IDs or theme behavior.

- [ ] **Step 2: Migrate Header**

Replace every authored label, tooltip, title, fallback, status, mobile item, and aria-label with catalog values or formatters. Keep:

```ts
const ontologyDisplayName = currentOntology.name || jaMessages.shell.untitledOntology;
```

Render point/badge counters with `jaFormatters.points(totalPoints)` and `jaFormatters.badges(earnedBadges.length)`. Add `data-tour-target="designer"` to the designer icon button.

- [ ] **Step 3: Migrate App shell**

Use `jaFormatters.questComplete(latestBadge.badge)` for the toast. Replace command labels, mobile tab labels, and drawer close label with catalog values. Keep command IDs and actions unchanged.

- [ ] **Step 4: Migrate CommandPalette**

Replace placeholder, empty state, and footer instructions with catalog values. Preserve filtering, keyboard commands, and visible command labels supplied by `App`.

- [ ] **Step 5: Run focused render tests**

```bash
npx vitest run src/locales/ShellLocalization.test.tsx
```

Expected: Header and CommandPalette assertions pass; remaining modal/footer assertions still fail.

### Task 4: Localize guidance, legal information, and footer

**Files:**
- Modify: `src/components/GuidedTour.tsx`
- Modify: `src/components/WelcomeModal.tsx`
- Modify: `src/components/AboutModal.tsx`
- Modify: `src/components/HelpModal.tsx`
- Modify: `src/components/AppFooter.tsx`

**Interfaces:**
- All static prose comes from `jaMessages`.
- External URLs and data-driven commit SHA remain unchanged.

- [ ] **Step 1: Migrate GuidedTour**

Build `tourSteps` from `jaMessages.tour.steps`; change the designer target to `[data-tour-target="designer"]`; localize close aria-label, back/next/start, and skip text; use `jaFormatters.tourStep`.

- [ ] **Step 2: Migrate WelcomeModal**

Use catalog values for heading, subtitle, four feature cards, primary action, and closing guidance. Keep `Ontology Playground` and `Microsoft Fabric IQ` as explicit embedded terms.

- [ ] **Step 3: Migrate AboutModal and HelpModal**

Translate headings, controls, explanations, query examples, shortcut descriptions, and the trademark notice faithfully into Japanese. Keep product names and URLs unchanged. Add a Japanese close aria-label to HelpModal.

- [ ] **Step 4: Migrate AppFooter**

Use Japanese attribution labels and `jaFormatters.deployedCommit(shortCommit)` while leaving links and SHA titles unchanged.

- [ ] **Step 5: Verify component GREEN and source boundary**

```bash
npx vitest run src/locales/ShellLocalization.test.tsx src/locales/ja.test.ts
rg -n "Open Catalogue|Type a command|Welcome to|Navigation & Actions|About Ontology|How to Use|Built with|Supervised by|Node.js 18" src/App.tsx src/components/Header.tsx src/components/CommandPalette.tsx src/components/GuidedTour.tsx src/components/WelcomeModal.tsx src/components/AboutModal.tsx src/components/HelpModal.tsx src/components/AppFooter.tsx src/store/appStore.ts
```

Expected: tests pass and `rg` has no matches.

### Task 5: Verify, review, and deliver A2

**Files:**
- Verify every Issue #3 scoped path.

- [ ] **Step 1: Run the supported suite**

```bash
npm ci --ignore-scripts
npm run catalogue:build
npm run qa:ja
npm test
npx eslint src/App.tsx src/components/Header.tsx src/components/AppFooter.tsx src/components/CommandPalette.tsx src/components/GuidedTour.tsx src/components/WelcomeModal.tsx src/components/AboutModal.tsx src/components/HelpModal.tsx src/store/appStore.ts src/locales
npm run build
git diff --check origin/main...HEAD
```

Expected: locale QA, all tests, focused ESLint, TypeScript/build, and diff check pass. Restore generated `public/learn.json` if the build changes only its timestamp/stale generated category.

- [ ] **Step 2: Review exact scope**

Expected changed paths are the 13 paths listed in Issue #3. Perform an independent current-head review for untranslated shell text, accessibility names, data preservation, internal identifiers, legal meaning, and unintended generated files. Fix all Critical/Important findings and re-review.

- [ ] **Step 3: Push and open PR**

Create a PR titled `feat(i18n): localize application shell and common UI` with a body summarizing surfaces, preserved data/identifiers, exact test counts, and `Closes #3`. Require local/remote/PR head equality and all available checks successful.

- [ ] **Step 4: Merge and synchronize**

After the pre-authorized squash merge, verify Issue #3 closes, fast-forward the external resident `main`, verify `HEAD == origin/main` and clean status, then remove only the owned A2 worktree and feature branch.
