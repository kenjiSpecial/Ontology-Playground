export interface MessageTree {
  readonly [key: string]: string | MessageTree;
}

export type CatalogProblemReason =
  | 'empty'
  | 'english-only'
  | 'unused-allowlist'
  | 'unused-embedded-allowlist';

export interface CatalogProblem {
  path: string;
  reason: CatalogProblemReason;
}

const JAPANESE_TEXT = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const LATIN_TEXT = /\p{Script=Latin}/u;

interface EmbeddedEnglishScan {
  remaining: string;
  usedTerms: string[];
}

function stripAllowedEnglishTerms(value: string, allowedTerms: readonly string[]): EmbeddedEnglishScan {
  let remaining = value;
  const usedTerms: string[] = [];
  for (const term of [...allowedTerms].sort((left, right) => right.length - left.length)) {
    if (remaining.includes(term)) {
      usedTerms.push(term);
      remaining = remaining.split(term).join('');
    }
  }
  return { remaining, usedTerms };
}

export function validateJapaneseCatalog(
  catalog: MessageTree,
  allowedEnglishOnlyPaths: readonly string[],
  allowedEmbeddedEnglishTerms: readonly string[] = [],
): CatalogProblem[] {
  const allowed = new Set(allowedEnglishOnlyPaths);
  const embeddedTerms = [...new Set(allowedEmbeddedEnglishTerms.filter((term) => term.length > 0))];
  const used = new Set<string>();
  const usedEmbeddedTerms = new Set<string>();
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
        } else {
          const scan = stripAllowedEnglishTerms(value, embeddedTerms);
          for (const term of scan.usedTerms) usedEmbeddedTerms.add(term);
          if (LATIN_TEXT.test(scan.remaining)) problems.push({ path, reason: 'english-only' });
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
  for (const term of embeddedTerms) {
    if (!usedEmbeddedTerms.has(term)) problems.push({ path: term, reason: 'unused-embedded-allowlist' });
  }
  return problems;
}
