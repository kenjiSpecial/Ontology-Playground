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
