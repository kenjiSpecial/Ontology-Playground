# Ontology Playground Japanese Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the typed Japanese message catalog, supported Node 20 baseline, localization QA command, and fork attribution required by later localization phases.

**Architecture:** Japanese UI text is split into a readonly string catalog and typed formatter functions. A pure validator traverses the catalog, rejects empty or unsupported English-only values, and rejects stale allowlist entries; Vitest exposes the validator through `npm run qa:ja`. This phase does not wire the catalog into visible UI components.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Node.js 20, npm 11

## Global Constraints

- Work on `feature/ja-foundation` from `origin/main` in the isolated external-repository worktree.
- Keep visible application behavior unchanged in phase A1.
- Use Node `20.20.2`; add `.nvmrc` with major version `20` and package engines `>=20 <21`.
- Use Japanese for user-facing catalog values except explicit proper nouns and standard names.
- Preserve `Ontology Playground`, `Microsoft Fabric IQ`, `GitHub`, `RDF`, and `OWL` as allowlisted English-only values.
- Preserve RDF/OWL identifiers, routes, slugs, filenames, imported user content, license, trademark notice, and upstream attribution.
- Do not change `.env*`, `api/**`, `.github/workflows/**`, `catalogue/**`, `content/learn/**`, `public/**`, or existing UI components outside `src/locales/**`.
- Stage exact paths only; do not force-push or push to the `upstream` remote.
- Issue: `kenjiSpecial/Ontology-Playground#1`.
- Parent: `kenjiSpecial/kura#644`.

---

### Task 1: Pin the supported runtime and stabilize the baseline suite

**Files:**
- Create: `.nvmrc`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: existing npm scripts and Vitest configuration.
- Produces: Node engine contract `>=20 <21`, `.nvmrc` value `20`, and Vitest `testTimeout: 15_000`.

- [ ] **Step 1: Record the baseline timeout failure**

With Node 20, run the generated-content build followed by the unmodified suite:

```bash
npm ci --ignore-scripts
npm run build
npm test
```

Expected: build passes; 393 of 394 tests pass; `scripts/compile-catalogue.test.ts` times out at the inherited 5,000ms while the real compile command takes longer than five seconds on this host.

- [ ] **Step 2: Add the Node runtime declarations**

Create `.nvmrc` containing exactly:

```text
20
```

Add this top-level object after `"type": "module"` in `package.json`:

```json
"engines": {
  "node": ">=20 <21"
},
```

Update the README prerequisite from `Node.js 18+` to exactly `Node.js 20` so the human-facing requirement matches the machine-readable range.

Run:

```bash
npm install --package-lock-only --ignore-scripts
```

Expected: the root package entry in `package-lock.json` contains the same `engines.node` range and dependency versions remain unchanged.

- [ ] **Step 3: Make the existing test timeout explicit**

Add this property to the `test` object in `vitest.config.ts`:

```ts
testTimeout: 15_000,
```

Do not change individual test logic, command execution, or catalogue fixtures.

- [ ] **Step 4: Verify the baseline suite**

Run:

```bash
npm test
```

Expected: 24 test files and 394 tests pass; no timeout failure remains.

- [ ] **Step 5: Commit the runtime baseline**

```bash
git add -- .nvmrc README.md package.json package-lock.json vitest.config.ts
git commit -m "chore(i18n): pin Japanese QA runtime"
```

Expected: one commit containing only the five runtime/documentation files.

### Task 2: Build the typed Japanese catalog validator with TDD

**Files:**
- Create: `src/locales/validateJa.ts`
- Create: `src/locales/validateJa.test.ts`

**Interfaces:**
- Produces: `MessageTree`, `CatalogProblem`, and `validateJapaneseCatalog(catalog, allowedEnglishOnlyPaths, allowedEmbeddedEnglishTerms)`.
- Consumed by: Task 3 catalog tests and every later localization phase.

- [ ] **Step 1: Write the failing validator tests**

Create `src/locales/validateJa.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateJapaneseCatalog } from './validateJa';

describe('validateJapaneseCatalog', () => {
  it('accepts Japanese values', () => {
    expect(validateJapaneseCatalog({ common: { close: '閉じる' } }, [])).toEqual([]);
  });

  it('rejects empty values', () => {
    expect(validateJapaneseCatalog({ common: { close: '   ' } }, [])).toContainEqual({
      path: 'common.close',
      reason: 'empty',
    });
  });

  it('rejects unsupported English-only UI sentences', () => {
    expect(validateJapaneseCatalog({ navigation: { catalogue: 'Open catalogue' } }, [])).toContainEqual({
      path: 'navigation.catalogue',
      reason: 'english-only',
    });
  });

  it('rejects unsupported English embedded in Japanese UI text', () => {
    expect(validateJapaneseCatalog({ navigation: { catalogue: 'Open catalogue を開く' } }, [], [])).toContainEqual({
      path: 'navigation.catalogue',
      reason: 'english-only',
    });
  });

  it('accepts an explicit embedded proper-noun exception', () => {
    expect(validateJapaneseCatalog({ actions: { open: 'GitHubで開く' } }, [], ['GitHub'])).toEqual([]);
  });

  it('accepts an explicit proper-noun exception', () => {
    expect(validateJapaneseCatalog({ meta: { productName: 'Ontology Playground' } }, ['meta.productName'])).toEqual([]);
  });

  it('rejects unused exceptions', () => {
    expect(validateJapaneseCatalog({ common: { close: '閉じる' } }, ['meta.productName'])).toContainEqual({
      path: 'meta.productName',
      reason: 'unused-allowlist',
    });
  });

  it('reports an empty allowlisted value only as empty', () => {
    expect(validateJapaneseCatalog({ meta: { productName: '   ' } }, ['meta.productName'])).toEqual([
      { path: 'meta.productName', reason: 'empty' },
    ]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```bash
npx vitest run src/locales/validateJa.test.ts
```

Expected: FAIL because `./validateJa` does not exist.

- [ ] **Step 3: Implement the pure validator**

Create `src/locales/validateJa.ts`:

```ts
export interface MessageTree {
  readonly [key: string]: string | MessageTree;
}

export type CatalogProblemReason = 'empty' | 'english-only' | 'unused-allowlist';

export interface CatalogProblem {
  path: string;
  reason: CatalogProblemReason;
}

const JAPANESE_TEXT = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const LATIN_TEXT = /\p{Script=Latin}/u;

function stripAllowedEnglishTerms(value: string, allowedTerms: readonly string[]): string {
  return [...allowedTerms]
    .filter((term) => term.length > 0)
    .sort((left, right) => right.length - left.length)
    .reduce((remaining, term) => remaining.split(term).join(''), value);
}

export function validateJapaneseCatalog(
  catalog: MessageTree,
  allowedEnglishOnlyPaths: readonly string[],
  allowedEmbeddedEnglishTerms: readonly string[] = [],
): CatalogProblem[] {
  const allowed = new Set(allowedEnglishOnlyPaths);
  const used = new Set<string>();
  const problems: CatalogProblem[] = [];

  const visit = (node: MessageTree, parentPath = ''): void => {
    for (const [key, value] of Object.entries(node)) {
      const path = parentPath ? `${parentPath}.${key}` : key;
      if (typeof value === 'string') {
        if (value.trim().length === 0) {
          problems.push({ path, reason: 'empty' });
          if (allowed.has(path)) used.add(path);
        } else if (!JAPANESE_TEXT.test(value)) {
          if (allowed.has(path)) used.add(path);
          else problems.push({ path, reason: 'english-only' });
        } else if (LATIN_TEXT.test(stripAllowedEnglishTerms(value, allowedEmbeddedEnglishTerms))) {
          problems.push({ path, reason: 'english-only' });
        }
      } else {
        visit(value, path);
      }
    }
  };

  visit(catalog);
  for (const path of allowed) {
    if (!used.has(path)) problems.push({ path, reason: 'unused-allowlist' });
  }
  return problems;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

```bash
npx vitest run src/locales/validateJa.test.ts
```

Expected: eight tests pass.

- [ ] **Step 5: Commit the validator**

```bash
git add -- src/locales/validateJa.ts src/locales/validateJa.test.ts
git commit -m "test(i18n): validate Japanese message values"
```

### Task 3: Add the Japanese message catalog and QA command

**Files:**
- Create: `src/locales/ja.ts`
- Create: `src/locales/ja.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `jaMessages`, `jaAllowedEnglishOnlyPaths`, `jaAllowedEmbeddedEnglishTerms`, `jaFormatters`, `JapaneseMessages`, and `npm run qa:ja`.
- Consumed by: A2-A4 component migrations and Q1 completeness checks.

- [ ] **Step 1: Write the failing catalog tests**

Create `src/locales/ja.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  jaAllowedEmbeddedEnglishTerms,
  jaAllowedEnglishOnlyPaths,
  jaFormatters,
  jaMessages,
} from './ja';
import { validateJapaneseCatalog } from './validateJa';

describe('Japanese message catalog', () => {
  it('contains no invalid or stale values', () => {
    expect(
      validateJapaneseCatalog(jaMessages, jaAllowedEnglishOnlyPaths, jaAllowedEmbeddedEnglishTerms),
    ).toEqual([]);
  });

  it('formats counters in Japanese', () => {
    expect(jaFormatters.points(3)).toBe('3ポイント');
    expect(jaFormatters.badges(2)).toBe('2個のバッジ');
    expect(jaFormatters.loadFailed(404)).toBe('読み込みに失敗しました（404）');
  });
});
```

- [ ] **Step 2: Run the catalog test and verify RED**

```bash
npx vitest run src/locales/ja.test.ts
```

Expected: FAIL because `./ja` does not exist.

- [ ] **Step 3: Create the catalog and typed formatters**

Create `src/locales/ja.ts`:

```ts
import type { MessageTree } from './validateJa';

export const jaMessages = {
  meta: {
    productName: 'Ontology Playground',
    preview: 'プレビュー',
    description: 'オントロジーを学び、設計し、可視化するプレイグラウンド',
  },
  common: {
    close: '閉じる',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    loading: '読み込み中…',
    retry: '再試行',
    openInGithub: 'GitHubで開く',
  },
  navigation: {
    home: 'ホーム',
    catalogue: 'カタログ',
    designer: 'デザイナー',
    school: 'オントロジースクール',
  },
  terms: {
    fabricIq: 'Microsoft Fabric IQ',
    github: 'GitHub',
    rdf: 'RDF',
    owl: 'OWL',
  },
} as const satisfies MessageTree;

export type JapaneseMessages = typeof jaMessages;

export const jaAllowedEnglishOnlyPaths = [
  'meta.productName',
  'terms.fabricIq',
  'terms.github',
  'terms.rdf',
  'terms.owl',
] as const;

export const jaAllowedEmbeddedEnglishTerms = [
  'GitHub',
] as const;

export const jaFormatters = {
  points: (count: number): string => `${count}ポイント`,
  badges: (count: number): string => `${count}個のバッジ`,
  loadFailed: (status: number): string => `読み込みに失敗しました（${status}）`,
} as const;
```

- [ ] **Step 4: Add the QA command**

Add this script to `package.json` after `"lint"`:

```json
"qa:ja": "vitest run src/locales",
```

Run:

```bash
npm install --package-lock-only --ignore-scripts
```

- [ ] **Step 5: Verify the catalog and command**

```bash
npm run qa:ja
```

Expected: both locale test files pass, including rejection tests for empty and unsupported English-only strings.

- [ ] **Step 6: Commit the catalog**

```bash
git add -- package.json package-lock.json src/locales/ja.ts src/locales/ja.test.ts
git commit -m "feat(i18n): add typed Japanese message catalog"
```

### Task 4: Document the fork and localization contract

**Files:**
- Modify: `README.md`
- Create: `docs/japanese-localization.md`

**Interfaces:**
- Consumes: approved Kura design and Task 3 message catalog.
- Produces: public fork attribution and contributor rules for A2-Q1.

- [ ] **Step 1: Add the fork notice to README**

Insert this block after the AI-assisted coding note:

```markdown
> [!IMPORTANT]
> This repository is the Japanese edition maintained by `kenjiSpecial`, forked from
> [`microsoft/Ontology-Playground`](https://github.com/microsoft/Ontology-Playground).
> The Japanese edition preserves the upstream MIT License, copyright, trademark
> notice, technical identifiers, and attribution. Japanese UI migration is being
> delivered in dependency-ordered phases tracked in this repository's Issues.
```

Do not remove the existing upstream live demo, screenshot, license, trademark, or AI-assisted coding note.

- [ ] **Step 2: Add the localization contract**

Create `docs/japanese-localization.md` with these sections and rules:

```markdown
# Japanese localization

## Scope

The Japanese edition translates all shipped user-visible UI, accessibility text,
quests, generated responses, learning content, and catalogue display metadata.

## Preserved values

RDF/OWL URIs, internal IDs, JSON keys, routes, slugs, filenames, syntax keywords,
author names, licenses, trademarks, and imported or user-entered text remain unchanged.

## Terminology

| English | Japanese |
|---|---|
| ontology | オントロジー |
| entity type | エンティティ型 |
| property | プロパティ |
| relationship | リレーションシップ |
| data binding | データ バインディング |
| cardinality | カーディナリティ |
| source / destination | 始点 / 終点 |
| query | クエリ |
| catalogue | カタログ |
| designer | デザイナー |
| learning path | 学習パス |

## Writing style

Use concise です・ます prose for explanations and short noun or verb labels for controls.
Use Japanese punctuation in prose. Keep product, protocol, library, and specification
names in their established form when translation would reduce clarity.

## Source rules

- Put reusable UI text in `src/locales/ja.ts`; do not add new natural-language literals to components.
- Add an English-only exception only for a proper noun or standard name, with a focused catalog path.
- Keep imported RDF/OWL and user-entered values on the non-localized data path.
- Run `npm run qa:ja`, `npm test`, and `npm run build` before every localization PR.
```

- [ ] **Step 3: Verify attribution and contract text**

```bash
rg -n 'Japanese edition|microsoft/Ontology-Playground|MIT License|trademark' README.md
rg -n 'imported or user-entered|src/locales/ja.ts|npm run qa:ja|エンティティ型|データ バインディング' docs/japanese-localization.md
```

Expected: all attribution, preservation, terminology, and contributor rules are present.

- [ ] **Step 4: Commit the documentation**

```bash
git add -- README.md docs/japanese-localization.md docs/superpowers/plans/2026-08-11-ontology-playground-ja-foundation.md
git commit -m "docs(i18n): define Japanese localization contract"
```

### Task 5: Verify and deliver phase A1

**Files:**
- Verify all files listed in Issue #1 scope.

**Interfaces:**
- Produces: merged A1 foundation for phase A2.

- [ ] **Step 1: Run the complete supported suite with Node 20**

```bash
npm ci --ignore-scripts
npm run qa:ja
npm test
npm run build
git diff --check origin/main...HEAD
```

Expected: all commands pass; `npm test` reports 26 files and 404 tests; build produces the app and embed widget.

- [ ] **Step 2: Verify scope and identifiers**

```bash
git status --short
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

Expected changed paths:

```text
.nvmrc
README.md
docs/japanese-localization.md
docs/superpowers/plans/2026-08-11-ontology-playground-ja-foundation.md
package-lock.json
package.json
src/locales/ja.test.ts
src/locales/ja.ts
src/locales/validateJa.test.ts
src/locales/validateJa.ts
vitest.config.ts
```

- [ ] **Step 3: Push and open the implementation PR**

Use `apply_patch` to create `/tmp/ontology-playground-a1-pr.md` with exactly:

```markdown
## Summary

- pin the supported Node.js 20 runtime and make the catalogue test timeout explicit
- add a typed Japanese message catalog, formatter functions, and strict localization QA validator
- document the fork attribution, preserved-value boundary, terminology, and contributor workflow

## Baseline

With Node.js 20.20.2, the unmodified application build passed and 393 of 394 tests passed. The only failure was `scripts/compile-catalogue.test.ts`, which exceeded Vitest's inherited 5-second timeout while the real compile completed successfully in about 5.9 seconds. This PR sets the suite timeout explicitly to 15 seconds without changing the compile test or fixtures.

## Preserved boundary

RDF/OWL URIs, internal IDs, JSON keys, routes, slugs, filenames, syntax, licenses, trademarks, attribution, imported RDF/OWL, and user-entered text remain unchanged.

## Verification

- `npm ci --ignore-scripts`
- `npm run qa:ja`
- `npm test` — 26 files / 404 tests passed
- `npm run build`
- `git diff --check origin/main...HEAD`

Closes #1
```

```bash
git push -u origin feature/ja-foundation
gh pr create --repo kenjiSpecial/Ontology-Playground --base main --head feature/ja-foundation --title "feat(i18n): establish Japanese localization foundation" --body-file /tmp/ontology-playground-a1-pr.md
```

- [ ] **Step 4: Re-read current-head evidence before merge**

Verify local branch, remote branch, and PR head SHA are equal. Require every available GitHub check to be successful and perform a current-head diff self-review for Issue #1 scope, security, identifier preservation, test coverage, and unintended generated files.

- [ ] **Step 5: Squash merge and synchronize**

After the pre-authorized merge, verify the PR merge commit, update the external repository's resident `main` with `git pull --ff-only origin main`, verify clean `main` and `HEAD == origin/main`, then remove only the owned A1 worktree and local feature branch. Do not delete unrelated worktrees or branches.
