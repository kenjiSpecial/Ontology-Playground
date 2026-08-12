import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './appStore';
import type { Ontology } from '../data/ontology';

const localizedOntology: Ontology = {
  name: 'Internal Ontology',
  displayName: '表示用オントロジー',
  description: 'Internal description',
  entityTypes: [
    {
      id: 'customer',
      name: 'Customer',
      displayName: '顧客',
      description: 'A customer',
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
  relationships: [
    {
      id: 'customer_places_order',
      name: 'places',
      displayName: '注文する',
      from: 'customer',
      to: 'order',
      cardinality: 'one-to-many',
    },
  ],
};

describe('appStore JSON export compatibility', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
  });

  it('keeps internal names, IDs, endpoints, and property names in JSON export', () => {
    useAppStore.getState().loadOntology(localizedOntology);
    const exported = JSON.parse(useAppStore.getState().exportOntology()) as { ontology: Ontology };

    expect(exported.ontology.name).toBe('Internal Ontology');
    expect(exported.ontology.entityTypes.map((entity) => ({ id: entity.id, name: entity.name }))).toEqual([
      { id: 'customer', name: 'Customer' },
      { id: 'order', name: 'Order' },
    ]);
    expect(exported.ontology.entityTypes[0].properties[0].name).toBe('customerId');
    expect(exported.ontology.relationships[0]).toMatchObject({
      id: 'customer_places_order',
      name: 'places',
      from: 'customer',
      to: 'order',
    });
  });
});
