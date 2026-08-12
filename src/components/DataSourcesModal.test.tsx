import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataSourcesModal } from './DataSourcesModal';
import { useAppStore } from '../store/appStore';
import { cosmicCoffeeOntology } from '../data/ontology';
import type { DataBinding, Ontology } from '../data/ontology';

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

const bindings: DataBinding[] = [
  {
    entityTypeId: 'customer',
    source: 'Demo Lakehouse',
    table: 'lakehouse.customer',
    columnMappings: { name: 'full_name' },
  },
  {
    entityTypeId: 'order',
    source: 'Demo Lakehouse',
    table: 'lakehouse.order',
    columnMappings: { orderId: 'order_id' },
  },
];

function makeOntology(withDisplayOverlay: boolean): Ontology {
  return {
    ...cosmicCoffeeOntology,
    ...(withDisplayOverlay ? { displayName: 'コーヒー業務モデル' } : {}),
    entityTypes: cosmicCoffeeOntology.entityTypes.map((entity) => {
      if (!withDisplayOverlay || !['customer', 'order'].includes(entity.id)) return entity;
      return {
        ...entity,
        displayName: entity.id === 'customer' ? '顧客' : '注文',
      };
    }),
  };
}

describe('DataSourcesModal binding entity labels', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
  });

  it('uses localized names for the currently bound entities', () => {
    useAppStore.getState().loadOntology(makeOntology(true), bindings);
    render(<DataSourcesModal onClose={vi.fn()} />);

    expect(screen.getByText(/このデモでは、顧客、注文のバインディングを表示しています/)).toBeTruthy();
    expect(screen.queryByText(/Customer、Order、Product/)).toBeNull();
  });

  it('falls back to internal names for the currently bound entities', () => {
    useAppStore.getState().loadOntology(makeOntology(false), bindings);
    render(<DataSourcesModal onClose={vi.fn()} />);

    expect(screen.getByText(/このデモでは、Customer、Orderのバインディングを表示しています/)).toBeTruthy();
    expect(screen.queryByText(/Customer、Order、Product/)).toBeNull();
  });
});
