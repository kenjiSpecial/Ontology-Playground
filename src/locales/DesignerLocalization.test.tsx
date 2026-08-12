import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OntologyDesigner } from '../components/OntologyDesigner';
import { DesignerPreview } from '../components/designer/DesignerPreview';
import { EntityForm } from '../components/designer/EntityForm';
import { SubmitCatalogueModal } from '../components/designer/SubmitCatalogueModal';
import { TemplatePicker } from '../components/designer/TemplatePicker';
import { designerTemplates } from '../data/designerTemplates';
import { useAppStore } from '../store/appStore';
import { useDesignerStore } from '../store/designerStore';

vi.mock('cytoscape', () => {
  const collection = {
    data: vi.fn(),
    filter: vi.fn().mockReturnThis(),
    forEach: vi.fn(),
    length: 0,
    map: vi.fn(() => []),
    merge: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  };
  const core = {
    add: vi.fn(),
    collection: vi.fn(() => collection),
    destroy: vi.fn(),
    edges: vi.fn(() => collection),
    elements: vi.fn(() => collection),
    extent: vi.fn(() => ({ x1: 0, y1: 0, w: 100, h: 100 })),
    fit: vi.fn(),
    getElementById: vi.fn(() => collection),
    nodes: vi.fn(() => collection),
    on: vi.fn(),
  };
  const cytoscape = vi.fn(() => core);
  Object.assign(cytoscape, { use: vi.fn() });
  return { default: cytoscape };
});

vi.mock('cytoscape-fcose', () => ({ default: vi.fn() }));

describe('Japanese ontology designer', () => {
  beforeEach(() => {
    useDesignerStore.getState().resetDraft();
    useAppStore.getState().resetToDefault();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders Japanese shell, toolbar, and empty editor copy', () => {
    render(<OntologyDesigner route={{ page: 'designer' }} />);

    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('オントロジー名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('説明')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新規作成' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '検証' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'エンティティ型（0）' })).toBeInTheDocument();
    expect(screen.getByText('エンティティ型はまだありません。「追加」から作成してください。')).toBeInTheDocument();
  });

  it('renders Japanese entity editor labels while keeping technical property types', async () => {
    useDesignerStore.getState().addEntity();

    render(<EntityForm />);

    expect(await screen.findByText('名前')).toBeInTheDocument();
    expect(screen.getByText('アイコン')).toBeInTheDocument();
    expect(screen.getByText('色')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('エンティティ名')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'string' })).toBeInTheDocument();
    expect(screen.getByTitle('プロパティを削除')).toBeInTheDocument();
  });

  it('renders Japanese preview controls and local RDF import errors', () => {
    render(<DesignerPreview />);

    expect(screen.getByRole('button', { name: 'グラフ' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'RDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'RDFを編集' }));

    const source = screen.getByPlaceholderText('RDF/XMLの内容を貼り付けるか編集…');
    fireEvent.change(source, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'デザイナーに読み込む' }));

    expect(screen.getByText('先にRDF/XMLの内容を貼り付けてください')).toBeInTheDocument();
  });

  it('renders Japanese template cards without changing template payload names', () => {
    render(<TemplatePicker />);

    expect(screen.getByRole('heading', { name: 'テンプレートから始める' })).toBeInTheDocument();
    expect(screen.getByText('小売')).toBeInTheDocument();
    expect(screen.getByText('顧客、製品、注文')).toBeInTheDocument();
    expect(designerTemplates[0].id).toBe('retail');
    expect(designerTemplates[0].ontology.entityTypes[0].name).toBe('Customer');
    expect(designerTemplates[0].ontology.relationships[0].name).toBe('places');
  });

  it('renders Japanese catalogue submission guidance while preserving technical paths', () => {
    render(<SubmitCatalogueModal onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'カタログへ投稿' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '投稿方法' })).toBeInTheDocument();
    expect(screen.getByText('catalogue/community/your-username/')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RDFをダウンロード/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '閉じる' })).toHaveLength(2);
  });
});
