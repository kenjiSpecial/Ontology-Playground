import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DataSourcesModal } from '../components/DataSourcesModal';
import { FabricExportModal } from '../components/FabricExportModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { OntologySummaryModal } from '../components/OntologySummaryModal';
import { createOntology, listOntologies } from '../lib/fabric';
import { useAppStore } from '../store/appStore';

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

vi.mock('../lib/fabric', async () => {
  const actual = await vi.importActual<typeof import('../lib/fabric')>('../lib/fabric');
  return {
    ...actual,
    createOntology: vi.fn(),
    listOntologies: vi.fn(),
    updateOntologyDefinition: vi.fn(),
  };
});

const onClose = vi.fn();
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: { writeText: clipboardWriteText },
});

describe('Japanese data exchange modals', () => {
  beforeEach(() => {
    onClose.mockClear();
    useAppStore.getState().resetToDefault();
    clipboardWriteText.mockClear();
    vi.mocked(createOntology).mockReset();
    vi.mocked(listOntologies).mockReset();
  });

  it('renders Japanese import/export controls while preserving the loaded ontology name', () => {
    render(<ImportExportModal onClose={onClose} onFabricPush={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'オントロジーのインポート / エクスポート' })).toBeInTheDocument();
    expect(screen.getByText('Fourth Coffee')).toBeInTheDocument();
    expect(screen.getByText('6個のエンティティ型、7個のリレーションシップ')).toBeInTheDocument();
    expect(screen.getByText('オントロジーをインポート')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RDF/OWLをダウンロード' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Microsoft Fabricへ送信' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '閉じる' })).toHaveLength(2);
  });

  it('copies a Japanese Markdown summary without changing ontology values', async () => {
    render(<OntologySummaryModal onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'オントロジーの概要' })).toBeInTheDocument();
    expect(screen.getByText('エンティティ（6）')).toBeInTheDocument();
    expect(screen.getByText('リレーションシップ（7）')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'クリップボードにコピー' }));

    await waitFor(() => expect(clipboardWriteText).toHaveBeenCalled());
    const summary = clipboardWriteText.mock.calls[0][0];
    expect(summary).toContain('# Fourth Coffee');
    expect(summary).toContain('## エンティティ');
    expect(summary).toContain('## リレーションシップ');
    expect(summary).toContain('**プロパティ:**');
    expect(summary).toContain('Customer');
  });

  it('renders Japanese data-source framing while preserving source table and column values', () => {
    render(<DataSourcesModal onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'データソース' })).toBeInTheDocument();
    expect(screen.getByText(/Fourth Coffeeオントロジー/)).toBeInTheDocument();
    expect(screen.getAllByText('レイクハウス').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ソーステーブル:').length).toBeGreaterThan(0);
    expect(screen.getByText('lakehouse.bronze.customers')).toBeInTheDocument();
    expect(screen.getAllByText('customer_id').length).toBeGreaterThan(0);
    expect(screen.getByText('その他のエンティティ型:')).toBeInTheDocument();
    expect(screen.getByText(/Store、Supplier、Shipment/)).toBeInTheDocument();
  });

  it('renders Japanese Fabric credential guidance and local validation', () => {
    render(<FabricExportModal onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Microsoft Fabricへ送信' })).toBeInTheDocument();
    expect(screen.getByText('ワークスペースID')).toBeInTheDocument();
    expect(screen.getByText('アクセストークン')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Bearerトークンを貼り付けてください')).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'ワークスペースに接続' }));

    expect(screen.getByText('トークンとワークスペースIDの両方を入力してください。')).toBeInTheDocument();
  });

  it('renders Japanese Fabric create and completion states while preserving API values', async () => {
    const workspaceId = 'cfafbeb1-8037-4d0c-896e-a46fb27ff229';
    vi.mocked(listOntologies).mockResolvedValue([{
      id: 'existing-ontology',
      displayName: 'Existing Ontology',
      description: 'Existing API description',
      type: 'Ontology',
      workspaceId,
    }]);
    vi.mocked(createOntology).mockResolvedValue({
      id: 'created-ontology',
      displayName: 'Fourth Coffee',
      description: 'Created API description',
      type: 'Ontology',
      workspaceId,
    });

    render(<FabricExportModal onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('00000000-0000-0000-0000-000000000000'), {
      target: { value: workspaceId },
    });
    fireEvent.change(screen.getByPlaceholderText('Bearerトークンを貼り付けてください'), {
      target: { value: 'secret-token' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ワークスペースに接続' }));

    expect(await screen.findByText('操作')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '既存を更新（1）' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '作成して送信' }));

    expect(await screen.findByText('オントロジーを作成しました！')).toBeInTheDocument();
    expect(screen.getByText('created-ontology')).toBeInTheDocument();
    expect(screen.getByText(workspaceId)).toBeInTheDocument();
  });
});
