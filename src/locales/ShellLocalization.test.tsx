import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';
import { CommandPalette } from '../components/CommandPalette';
import { WelcomeModal } from '../components/WelcomeModal';
import { AboutModal } from '../components/AboutModal';
import { HelpModal } from '../components/HelpModal';
import { AppFooter } from '../components/AppFooter';
import { THEME_OPTIONS, useAppStore } from '../store/appStore';

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

const noop = vi.fn();

describe('Japanese application shell', () => {
  beforeEach(() => {
    noop.mockClear();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    useAppStore.getState().resetToDefault();
    window.location.hash = '#/';
  });

  it('renders Japanese header controls while preserving the ontology name', () => {
    render(
      <Header
        onAboutClick={noop}
        onHelpClick={noop}
        onDataSourcesClick={noop}
        onImportExportClick={noop}
        onGalleryClick={noop}
        onDesignerClick={noop}
        onLearnClick={noop}
        onSummaryClick={noop}
      />,
    );

    expect(screen.getByText('Fourth Coffee')).toBeInTheDocument();
    expect(screen.getByText('0ポイント')).toBeInTheDocument();
    expect(screen.getByText('0個のバッジ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'カタログ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'テーマ' })).toBeInTheDocument();
  });

  it('renders Japanese command palette guidance', () => {
    render(<CommandPalette open onClose={noop} commands={[]} />);

    expect(screen.getByPlaceholderText('コマンドを入力…')).toBeInTheDocument();
    expect(screen.getByText('一致するコマンドはありません')).toBeInTheDocument();
    expect(screen.getByText('↑↓で移動')).toBeInTheDocument();
  });

  it('renders the Japanese welcome experience', () => {
    render(<WelcomeModal onClose={noop} />);

    expect(screen.getByRole('heading', { name: 'Ontology Playground（プレビュー）へようこそ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '探索を始める' })).toBeInTheDocument();
  });

  it('renders Japanese about content and close accessibility name', () => {
    render(<AboutModal onClose={noop} />);

    expect(screen.getByRole('heading', { name: 'Ontology Playgroundについて' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '概要ダイアログを閉じる' })).toBeInTheDocument();
    expect(screen.getByText('商標に関する通知')).toBeInTheDocument();
  });

  it('renders Japanese help content and close accessibility name', () => {
    render(<HelpModal onClose={noop} />);

    expect(screen.getByRole('heading', { name: 'Ontology Playground（プレビュー）の使い方' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ヘルプダイアログを閉じる' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'わかりました' })).toBeInTheDocument();
  });

  it('renders Japanese footer attribution', () => {
    render(<AppFooter />);

    expect(screen.getByText('GitHub Copilotで作成')).toBeInTheDocument();
    expect(screen.getByText('videlalvaroが監修')).toBeInTheDocument();
  });

  it('uses Japanese theme labels without changing theme IDs', () => {
    expect(THEME_OPTIONS.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: 'dark', label: 'ダーク' },
      { id: 'light', label: 'ライト' },
      { id: 'aurora', label: 'オーロラ' },
      { id: 'crimson', label: 'クリムゾン' },
    ]);
  });
});
