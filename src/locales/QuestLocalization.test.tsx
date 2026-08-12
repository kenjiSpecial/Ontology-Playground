import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuestPanel } from '../components/QuestPanel';
import { useAppStore } from '../store/appStore';

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

describe('Japanese quest experience', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
  });

  it('renders Japanese default quests, difficulty, and rewards', () => {
    render(<QuestPanel />);

    expect(screen.getByRole('heading', { name: 'クエスト' })).toBeInTheDocument();
    expect(screen.getByText('エンティティとの出会い')).toBeInTheDocument();
    expect(screen.getByText('Fourth Coffeeオントロジーの中核となるエンティティ型を探索します。')).toBeInTheDocument();
    expect(screen.getByText('初級')).toBeInTheDocument();
    expect(screen.getAllByText('中級')).toHaveLength(2);
    expect(screen.getAllByText('上級')).toHaveLength(2);
    expect(screen.getByText('+100ポイント')).toBeInTheDocument();
  });

  it('starts and abandons a quest using Japanese controls', () => {
    render(<QuestPanel />);

    const title = screen.getByText('エンティティとの出会い');
    fireEvent.click(title.closest('.quest-card') as HTMLElement);

    expect(useAppStore.getState().activeQuest?.id).toBe('quest-1');
    expect(screen.getByText('1/3ステップ')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '中止' }));
    expect(useAppStore.getState().activeQuest).toBeNull();
  });

  it('renders earned badges and totals in Japanese', () => {
    useAppStore.getState().startQuest('quest-1');
    useAppStore.getState().advanceQuestStep();
    useAppStore.getState().advanceQuestStep();
    useAppStore.getState().advanceQuestStep();

    render(<QuestPanel />);

    expect(screen.getByText('獲得バッジ（1）')).toBeInTheDocument();
    expect(screen.getByText('エンティティ探検家')).toBeInTheDocument();
    expect(screen.getByText('合計: 100ポイント')).toBeInTheDocument();
  });
});
