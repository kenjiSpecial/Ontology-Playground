import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryPlayground } from '../components/QueryPlayground';
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

describe('Japanese natural-language query UI', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Japanese controls while preserving the ontology name', () => {
    render(<QueryPlayground />);

    expect(screen.getByText('自然言語クエリ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Fourth Coffeeについて質問…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'クエリを実行' })).toBeInTheDocument();
    expect(screen.getByText('質問例:')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '顧客' } });
    expect(screen.getByRole('button', { name: 'クエリをクリア' })).toBeInTheDocument();
  });

  it('offers Japanese suggestions with data-derived entity and property names', () => {
    render(<QueryPlayground />);

    expect(screen.getByRole('button', { name: 'すべてのCustomerを表示' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Orderを一覧表示' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Customerをemail別に表示' })).toBeInTheDocument();
  });

  it('renders untrusted query text as text instead of HTML', () => {
    vi.useFakeTimers();
    render(<QueryPlayground />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '<img src=x onerror=alert(1)>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'クエリを実行' }));
    act(() => vi.advanceTimersByTime(600));

    expect(document.querySelector('.query-result img')).toBeNull();
    expect(screen.getByText(/<img src=x onerror=alert\(1\)>/)).toBeInTheDocument();
  });
});
