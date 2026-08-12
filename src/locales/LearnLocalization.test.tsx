import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LearnPage } from '../components/LearnPage';
import type { LearnCourse, LearnManifest } from '../types/learn';
import type { Catalogue } from '../types/catalogue';

const mockCy = {
  nodes: () => [] as Array<{ id: () => string; position: () => { x: number; y: number } }>,
  resize: vi.fn(),
  fit: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('cytoscape', () => {
  const cytoscape = vi.fn(() => mockCy);
  Object.assign(cytoscape, { use: vi.fn() });
  return { default: cytoscape };
});

vi.mock('cytoscape-fcose', () => ({ default: vi.fn() }));

const pathCourse: LearnCourse = {
  slug: 'sample-path',
  title: 'Sample Path',
  description: 'Data supplied path description',
  type: 'path',
  icon: '📘',
  articles: [
    {
      slug: 'first-article',
      title: 'First Article',
      description: 'First data supplied article',
      order: 1,
      html: '<p>Data supplied body</p><h2>Second Slide</h2><p>More data</p>',
    },
    {
      slug: 'second-article',
      title: 'Second Article',
      description: 'Second data supplied article',
      order: 2,
      html: '<p>Second body</p>',
    },
  ],
};

const labCourse: LearnCourse = {
  slug: 'sample-lab',
  title: 'Sample Lab',
  description: 'Data supplied lab description',
  type: 'lab',
  icon: '🧪',
  articles: [
    {
      slug: 'overview',
      title: 'Lab Overview',
      description: 'Overview data',
      order: 1,
      html: '<p>Overview</p>',
      reviewStatus: 'under-human-review',
    },
    {
      slug: 'step-one',
      title: 'First Lab Step',
      description: 'Step data',
      order: 2,
      html: '<p>Step</p>',
    },
  ],
};

const manifest: LearnManifest = {
  generatedAt: '2026-08-12T00:00:00.000Z',
  courses: [pathCourse, labCourse],
};

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('Japanese learning UI', () => {
  beforeEach(() => {
    window.location.hash = '#/learn';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Japanese loading and failure states', async () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}));
    const { unmount } = render(<LearnPage route={{ page: 'learn' }} />);
    expect(screen.getByText('学習コンテンツを読み込み中…')).toBeInTheDocument();
    unmount();

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(null, false, 503));
    render(<LearnPage route={{ page: 'learn' }} />);
    expect(await screen.findByText('学習コンテンツの読み込みに失敗しました（503）')).toBeInTheDocument();
  });

  it('localizes course catalogue chrome while preserving course data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(manifest));
    render(<LearnPage route={{ page: 'learn' }} />);

    expect(await screen.findByText('Sample Path')).toBeInTheDocument();
    expect(screen.getByText('オントロジースクール')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Fabric IQ向けのオントロジーを理解し、構築するための学習パスと実践ラボです。')).toBeInTheDocument();
    expect(screen.getByText('Data supplied path description')).toBeInTheDocument();
    expect(screen.getByText('学習パス')).toBeInTheDocument();
    expect(screen.getByText('ラボ')).toBeInTheDocument();
    expect(screen.getByText('2件の記事')).toBeInTheDocument();
    expect(screen.getByText('2ステップ')).toBeInTheDocument();
    expect(screen.getByText('学習を開始')).toBeInTheDocument();
    expect(screen.getByText('ラボを開始')).toBeInTheDocument();
    expect(screen.getByTitle('「プレイグラウンド」へ戻る')).toBeInTheDocument();
    expect(screen.getByTitle('テーマを切り替える')).toBeInTheDocument();
  });

  it('localizes lab course navigation and review status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(manifest));
    render(<LearnPage route={{ page: 'learn', courseSlug: labCourse.slug }} />);

    expect(await screen.findByRole('heading', { name: 'Sample Lab' })).toBeInTheDocument();
    expect(screen.getByText('Data supplied lab description')).toBeInTheDocument();
    expect(screen.getByText('概要')).toBeInTheDocument();
    expect(screen.getByText('ステップ1')).toBeInTheDocument();
    expect(screen.getByText('🔍 人によるレビュー中')).toBeInTheDocument();
    expect(screen.getAllByText('ステップを開く')).toHaveLength(2);
    expect(screen.getByTitle('「すべてのコース」へ戻る')).toBeInTheDocument();
  });

  it('localizes article navigation and presentation controls', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(manifest));
    const user = userEvent.setup();
    render(
      <LearnPage
        route={{ page: 'learn', courseSlug: pathCourse.slug, articleSlug: pathCourse.articles[0].slug }}
      />,
    );

    expect(await screen.findByRole('heading', { name: 'First Article' })).toBeInTheDocument();
    expect(screen.getByText('Data supplied body')).toBeInTheDocument();
    expect(screen.getByText('次へ')).toBeInTheDocument();
    expect(screen.getByText('Second Article')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '発表' }));
    expect(screen.getByTitle('発表モードを終了（エスケープキー）')).toBeInTheDocument();
    expect(screen.getAllByTitle('テーマを切り替える')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '前のスライド' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '次のスライド' }));
    expect(screen.getByText('— 次: Second Article')).toBeInTheDocument();
  });

  it('localizes missing ontology errors inside an article', async () => {
    const articleCourse: LearnCourse = {
      ...pathCourse,
      articles: [{
        ...pathCourse.articles[0],
        html: '<ontology-embed id="official/missing"></ontology-embed>',
      }],
    };
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ ...manifest, courses: [articleCourse] }))
      .mockResolvedValueOnce(jsonResponse({ generatedAt: '', count: 0, entries: [] } satisfies Catalogue));

    render(
      <LearnPage
        route={{ page: 'learn', courseSlug: articleCourse.slug, articleSlug: articleCourse.articles[0].slug }}
      />,
    );

    expect(await screen.findByText('カタログにオントロジー「official/missing」が見つかりません。')).toBeInTheDocument();
  });

  it('localizes article ontology diff controls while preserving ontology names', async () => {
    const articleCourse: LearnCourse = {
      ...pathCourse,
      articles: [{
        ...pathCourse.articles[0],
        html: '<ontology-embed id="official/current" diff="official/previous"></ontology-embed>',
      }],
    };
    const catalogue: Catalogue = {
      generatedAt: '',
      count: 2,
      entries: [
        {
          id: 'official/current', name: 'Current Ontology', description: '', icon: '📘', category: 'general', tags: [], author: '', source: 'official', bindings: [],
          ontology: { name: 'Current Ontology', description: '', entityTypes: [{ id: 'new', name: 'New Entity', description: '', icon: 'N', color: '#000', properties: [] }], relationships: [] },
        },
        {
          id: 'official/previous', name: 'Previous Ontology', description: '', icon: '📘', category: 'general', tags: [], author: '', source: 'official', bindings: [],
          ontology: { name: 'Previous Ontology', description: '', entityTypes: [], relationships: [] },
        },
      ],
    };
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ ...manifest, courses: [articleCourse] }))
      .mockResolvedValueOnce(jsonResponse(catalogue));

    render(
      <LearnPage
        route={{ page: 'learn', courseSlug: articleCourse.slug, articleSlug: articleCourse.articles[0].slug }}
      />,
    );

    expect(await screen.findByText('Current Ontology')).toBeInTheDocument();
    expect(screen.getByText('1件追加')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '変更前' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '変更後' })).toBeInTheDocument();
    expect(screen.getByTitle('全画面表示を切り替える')).toBeInTheDocument();
  });
});
