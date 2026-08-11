import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OntologyStatsPanel } from '../components/OntologyStatsPanel';
import { PathFinderPanel } from '../components/PathFinderPanel';
import { SearchFilter } from '../components/SearchFilter';
import { InspectorPanel } from '../components/InspectorPanel';
import { OntologyGraph } from '../components/OntologyGraph';
import { useAppStore } from '../store/appStore';
import { jaMessages } from './ja';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const htmlProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'layout'].includes(key),
        ),
      );
      return <div {...htmlProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('cytoscape', () => {
  const collection = {
    addClass: vi.fn().mockReturnThis(),
    closedNeighborhood: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    removeClass: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    unselect: vi.fn().mockReturnThis(),
  };
  const core = {
    $: vi.fn(() => collection),
    center: vi.fn(),
    container: vi.fn(() => document.createElement('div')),
    destroy: vi.fn(),
    edges: vi.fn(() => collection),
    elements: vi.fn(() => collection),
    fit: vi.fn(),
    getElementById: vi.fn(() => collection),
    layout: vi.fn(() => ({ run: vi.fn() })),
    on: vi.fn(),
    png: vi.fn(() => 'data:image/png;base64,test'),
    zoom: vi.fn(() => 1),
  };
  const cytoscape = vi.fn(() => core);
  Object.assign(cytoscape, { use: vi.fn() });
  return { default: cytoscape };
});

vi.mock('cytoscape-fcose', () => ({ default: vi.fn() }));

describe('Japanese graph exploration UI', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders Japanese ontology statistics', () => {
    render(<OntologyStatsPanel />);

    expect(screen.getByText('オントロジーの概要')).toBeInTheDocument();
    expect(screen.getByText('エンティティ')).toBeInTheDocument();
    expect(screen.getByText('リレーションシップ')).toBeInTheDocument();
    expect(screen.getByText('プロパティ')).toBeInTheDocument();
  });

  it('renders Japanese path-finding controls', () => {
    render(<PathFinderPanel />);

    fireEvent.click(screen.getByRole('button', { name: /経路探索/ }));

    expect(screen.getByText('始点')).toBeInTheDocument();
    expect(screen.getByText('終点')).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'エンティティを選択…' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: '経路を探索' })).toBeInTheDocument();
  });

  it('renders Japanese search controls while preserving ontology data', () => {
    render(<SearchFilter />);

    expect(screen.getByText('検索と絞り込み')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('エンティティやプロパティを検索…')).toBeInTheDocument();
    expect(screen.getByLabelText('検索結果')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getAllByText(/件のプロパティ/).length).toBeGreaterThan(0);
  });

  it('renders Japanese empty inspector guidance', () => {
    render(<InspectorPanel />);

    expect(screen.getByRole('heading', { name: 'インスペクター' })).toBeInTheDocument();
    expect(screen.getByText('要素を選択')).toBeInTheDocument();
    expect(screen.getByText('グラフ上のエンティティ型またはリレーションシップを選択すると、プロパティ、データ バインディング、接続を確認できます。')).toBeInTheDocument();
  });

  it('renders Japanese entity sections while preserving ontology data', () => {
    useAppStore.getState().selectEntity('customer');

    render(<InspectorPanel />);

    expect(screen.getByRole('heading', { name: 'エンティティ型' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Customer' })).toBeInTheDocument();
    expect(screen.getByText(/プロパティ（\d+）/)).toBeInTheDocument();
    expect(screen.getByText(/リレーションシップ（\d+）/)).toBeInTheDocument();
    expect(screen.getByText('データ バインディング')).toBeInTheDocument();
  });

  it('defines Japanese graph controls and accessibility labels', () => {
    expect(jaMessages.exploration.graph).toMatchObject({
      canvasLabel: 'オントロジーグラフ',
      focusMode: 'フォーカスモード',
      exitFocus: '背景または✕を選択して終了',
      zoomIn: '拡大',
      zoomOut: '縮小',
      fitToView: '全体を表示',
      resetLayout: 'レイアウトをリセット',
      downloadPng: 'グラフをPNGでダウンロード',
      entityTypes: 'エンティティ型',
    });
  });

  it('renders Japanese graph controls while preserving legend data', () => {
    render(<OntologyGraph />);

    expect(screen.getByRole('img', { name: 'オントロジーグラフ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '拡大' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '縮小' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '全体を表示' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'レイアウトをリセット' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'グラフをPNGでダウンロード' })).toBeInTheDocument();
    expect(screen.getByText('エンティティ型')).toBeInTheDocument();
    expect(screen.getByText(/Customer/)).toBeInTheDocument();
  });
});
