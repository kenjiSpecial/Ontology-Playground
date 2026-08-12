import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilter } from './SearchFilter';
import { useAppStore } from '../store/appStore';
import type { Ontology } from '../data/ontology';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const htmlProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap'].includes(key)),
      );
      return <div {...htmlProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const localizedOntology: Ontology = {
  name: 'Incident Management',
  description: 'Incident model',
  entityTypes: [
    {
      id: 'customer',
      name: 'Customer',
      displayName: '顧客',
      description: 'A customer',
      displayDescription: '顧客を表します。',
      icon: '👤',
      color: '#0078D4',
      properties: [{ name: 'customerId', displayName: '顧客識別子', type: 'string', isIdentifier: true }],
    },
    {
      id: 'order',
      name: 'Order',
      displayName: '注文',
      description: 'An order',
      icon: '🧾',
      color: '#107C10',
      properties: [],
    },
  ],
  relationships: [{
    id: 'customer_places_order',
    name: 'places',
    displayName: '注文する',
    from: 'customer',
    to: 'order',
    cardinality: 'one-to-many',
  }],
};

describe('SearchFilter localized display behavior', () => {
  beforeEach(() => {
    useAppStore.getState().loadOntology(localizedOntology);
  });

  it('searches by display or internal name and selects the internal entity id', async () => {
    const user = userEvent.setup();
    render(<SearchFilter />);
    const input = screen.getByPlaceholderText('エンティティやプロパティを検索…');

    await user.type(input, '顧客');
    expect(screen.getByText('顧客')).toBeTruthy();
    await user.click(screen.getByText('顧客'));
    expect(useAppStore.getState().selectedEntityId).toBe('customer');

    await user.clear(input);
    await user.type(input, 'Customer');
    expect(screen.getByText('顧客')).toBeTruthy();
  });

  it('renders localized relationship endpoints while selecting by internal id', async () => {
    const user = userEvent.setup();
    render(<SearchFilter />);
    const input = screen.getByPlaceholderText('エンティティやプロパティを検索…');

    await user.type(input, '注文する');
    expect(screen.getByText('注文する')).toBeTruthy();
    expect(screen.getByText('顧客 → 注文')).toBeTruthy();
    await user.click(screen.getByText('注文する'));
    expect(useAppStore.getState().selectedRelationshipId).toBe('customer_places_order');
  });
});
