export interface MessageTree {
  readonly [key: string]: string | MessageTree;
}

export type CatalogProblemReason = 'empty' | 'english-only' | 'unused-allowlist';

export interface CatalogProblem {
  path: string;
  reason: CatalogProblemReason;
}

const JAPANESE_TEXT = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

export function validateJapaneseCatalog(
  catalog: MessageTree,
  allowedEnglishOnlyPaths: readonly string[],
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
        } else if (!JAPANESE_TEXT.test(value)) {
          if (allowed.has(path)) used.add(path);
          else problems.push({ path, reason: 'english-only' });
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
