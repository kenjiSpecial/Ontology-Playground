import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NLBuilderModal } from '../components/NLBuilderModal';
import type { Ontology } from '../data/ontology';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const htmlProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !['initial', 'animate', 'exit', 'transition'].includes(key)),
      );
      return <div {...htmlProps}>{children}</div>;
    },
  },
}));

const generatedOntology: Ontology = {
  name: 'Generated Business',
  description: 'API supplied description',
  entityTypes: [{
    id: 'customer',
    name: 'Customer',
    description: 'API supplied entity',
    icon: 'C',
    color: '#0078D4',
    properties: [
      { name: 'customerId', type: 'string', isIdentifier: true },
      { name: 'name', type: 'string' },
    ],
  }],
  relationships: [],
};

describe('Japanese AI builder', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined });
    Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: undefined });
  });

  it('renders Japanese input and preview states while preserving generated ontology values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ontology: generatedOntology }),
    } as unknown as Response);
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'オントロジーを説明' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ビジネスシナリオを入力してください…')).toBeInTheDocument();
    expect(screen.getByText(/病院を運営しています/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('ビジネスシナリオを入力してください…'), '顧客を管理する事業');
    await user.click(screen.getByRole('button', { name: 'オントロジーを生成' }));

    expect(await screen.findByRole('heading', { name: 'Generated Business' })).toBeInTheDocument();
    expect(screen.getByText('エンティティ（1）')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('2件のプロパティ')).toBeInTheDocument();
    expect(screen.getByText('リレーションシップ（0）')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'JSONを編集' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{invalid' } });
    await user.click(screen.getByRole('button', { name: 'オントロジーを適用' }));

    expect(screen.getByText('エディター内のJSONが無効です。')).toBeInTheDocument();
  });

  it('adds Japanese framing to an API generation error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Upstream unavailable' }),
    } as unknown as Response);
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    await user.type(screen.getByPlaceholderText('ビジネスシナリオを入力してください…'), 'テスト');
    await user.click(screen.getByRole('button', { name: 'オントロジーを生成' }));

    expect(await screen.findByText('生成に失敗しました')).toBeInTheDocument();
    expect(screen.getByText('オントロジーの生成に失敗しました: Upstream unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'もう一度試す' })).toBeInTheDocument();
  });

  it('uses Japanese speech recognition and Japanese voice controls', async () => {
    const instances: Array<{ lang: string; start: ReturnType<typeof vi.fn>; abort: ReturnType<typeof vi.fn> }> = [];
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult = null;
      onerror = null;
      onend = null;
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();

      constructor() {
        instances.push(this);
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      value: MockSpeechRecognition,
    });
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    const startButton = await screen.findByRole('button', { name: '音声入力を開始' });
    await user.click(startButton);

    await waitFor(() => expect(instances).toHaveLength(1));
    expect(instances[0].lang).toBe('ja-JP');
    expect(instances[0].start).toHaveBeenCalled();
    expect(screen.getByText('音声を聞き取っています。オントロジーの説明を話してください。')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '音声入力を停止' }));
    expect(instances[0].abort).toHaveBeenCalled();
  });
});
