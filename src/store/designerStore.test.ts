import { describe, it, expect, beforeEach } from 'vitest';
import { designerRdfFilename, useDesignerStore, validateOntology, isValidFabricIQName, fabricIQNameError } from './designerStore';
import type { Ontology } from '../data/ontology';

// Reset store between tests
beforeEach(() => {
  useDesignerStore.getState().resetDraft();
});

// ─── validateOntology (pure function) ────────────────────────────────────────

describe('validateOntology', () => {
  it('reports empty ontology', () => {
    const errors = validateOntology({ name: '', description: '', entityTypes: [], relationships: [] });
    expect(errors).toEqual([{ message: 'オントロジーにエンティティ型を1つ以上追加してください。' }]);
  });

  it('reports missing identifier property', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [{
        id: 'e1', name: 'Foo', description: '', icon: '📦', color: '#000',
        properties: [{ name: 'name', type: 'string' }],
      }],
      relationships: [],
    };
    const errors = validateOntology(ontology);
    expect(errors.some((e) => e.message.includes('識別子'))).toBe(true);
  });

  it('reports duplicate entity IDs', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'A', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
        { id: 'e1', name: 'B', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('同じID'))).toBe(true);
  });

  it('reports duplicate relationship IDs', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'A', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
        { id: 'e2', name: 'B', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'x', from: 'e1', to: 'e2', cardinality: 'one-to-many' },
        { id: 'r1', name: 'y', from: 'e2', to: 'e1', cardinality: 'one-to-one' },
      ],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('同じID'))).toBe(true);
  });

  it('reports relationships referencing unknown entities', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'A', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'x', from: 'e1', to: 'missing', cardinality: 'one-to-many' },
      ],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('存在しません'))).toBe(true);
  });

  it('passes for a valid ontology', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: 'A valid ontology',
      entityTypes: [
        { id: 'e1', name: 'Customer', description: '', icon: '👤', color: '#0078D4', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
        { id: 'e2', name: 'Order', description: '', icon: '📋', color: '#107C10', properties: [{ name: 'orderId', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'places', from: 'e1', to: 'e2', cardinality: 'one-to-many' },
      ],
    };
    expect(validateOntology(ontology)).toEqual([]);
  });

  // §7.1 — Entity type name validation
  it('reports invalid entity type names (Fabric IQ rules)', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: '-BadStart', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('先頭は半角英数字'))).toBe(true);
  });

  it('reports entity type names exceeding 26 characters', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'A'.repeat(27), description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('26文字以内'))).toBe(true);
  });

  // §7.2 — Property name validation
  it('reports invalid property names', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'Foo', description: '', icon: '📦', color: '#000',
          properties: [{ name: 'bad name!', type: 'string', isIdentifier: true }] },
      ],
      relationships: [],
    };
    const errors = validateOntology(ontology);
    expect(errors.some((e) => e.message.includes('プロパティ名'))).toBe(true);
  });

  it('reports cross-entity property type conflict', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'Foo', description: '', icon: '📦', color: '#000',
          properties: [{ name: 'sharedProp', type: 'string', isIdentifier: true }] },
        { id: 'e2', name: 'Bar', description: '', icon: '📦', color: '#000',
          properties: [{ name: 'sharedProp', type: 'integer', isIdentifier: true }] },
      ],
      relationships: [],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('同名のプロパティには同じ型'))).toBe(true);
  });

  // §1 partial — Identifier key type validation
  it('reports non-string/integer identifier properties', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'Foo', description: '', icon: '📦', color: '#000',
          properties: [{ name: 'id', type: 'boolean', isIdentifier: true }] },
      ],
      relationships: [],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('string型またはinteger型'))).toBe(true);
  });

  // §7.3 — Self-referencing relationships are allowed (issue #64)
  it('allows self-referencing relationships (no validation error)', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'Employee', description: '', icon: '📦', color: '#000',
          properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'reportsTo', from: 'e1', to: 'e1', cardinality: 'many-to-one' },
      ],
    };
    const errors = validateOntology(ontology);
    expect(errors.some((e) => e.message.includes('self-referencing'))).toBe(false);
    expect(errors.some((e) => e.message.includes('source and target'))).toBe(false);
  });

  it('passes for a valid ontology containing a self-referencing relationship', () => {
    const ontology: Ontology = {
      name: 'Org',
      description: 'An org chart',
      entityTypes: [
        { id: 'e1', name: 'Employee', description: '', icon: '👤', color: '#0078D4',
          properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'reportsTo', from: 'e1', to: 'e1', cardinality: 'many-to-one' },
      ],
    };
    expect(validateOntology(ontology)).toEqual([]);
  });

  it('still flags a self-referencing relationship that points to a missing entity', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'Employee', description: '', icon: '📦', color: '#000',
          properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'reportsTo', from: 'ghost', to: 'ghost', cardinality: 'one-to-many' },
      ],
    };
    expect(validateOntology(ontology).some((e) => e.message.includes('存在しません'))).toBe(true);
  });

  it('allows multiple self-referencing relationships on the same entity', () => {
    const ontology: Ontology = {
      name: 'Test',
      description: '',
      entityTypes: [
        { id: 'e1', name: 'Person', description: '', icon: '👤', color: '#0078D4',
          properties: [{ name: 'id', type: 'string', isIdentifier: true }] },
      ],
      relationships: [
        { id: 'r1', name: 'manages', from: 'e1', to: 'e1', cardinality: 'one-to-many' },
        { id: 'r2', name: 'mentors', from: 'e1', to: 'e1', cardinality: 'one-to-many' },
      ],
    };
    expect(validateOntology(ontology)).toEqual([]);
  });
});

// ─── isValidFabricIQName helper ──────────────────────────────────────────────

describe('isValidFabricIQName', () => {
  it('accepts valid names', () => {
    expect(isValidFabricIQName('Customer')).toBe(true);
    expect(isValidFabricIQName('A')).toBe(true);
    expect(isValidFabricIQName('My-Entity_01')).toBe(true);
    expect(isValidFabricIQName('A'.repeat(26))).toBe(true);
  });

  it('rejects invalid names', () => {
    expect(isValidFabricIQName('')).toBe(false);
    expect(isValidFabricIQName('-start')).toBe(false);
    expect(isValidFabricIQName('end-')).toBe(false);
    expect(isValidFabricIQName('has space')).toBe(false);
    expect(isValidFabricIQName('A'.repeat(27))).toBe(false);
    expect(isValidFabricIQName('a@b')).toBe(false);
  });
});

describe('fabricIQNameError', () => {
  it('returns null for valid names', () => {
    expect(fabricIQNameError('エンティティ型', 'Customer')).toBeNull();
  });

  it('returns null for empty names (caught elsewhere)', () => {
    expect(fabricIQNameError('エンティティ型', '')).toBeNull();
  });

  it('returns specific error messages', () => {
    expect(fabricIQNameError('エンティティ型', 'A'.repeat(27))).toContain('26文字以内');
    expect(fabricIQNameError('プロパティ', '-start')).toContain('先頭は半角英数字');
    expect(fabricIQNameError('プロパティ', 'end-')).toContain('末尾は半角英数字');
    expect(fabricIQNameError('プロパティ', 'has space')).toContain('半角英数字、ハイフン、アンダースコア');
  });
});

// ─── Store actions ───────────────────────────────────────────────────────────

describe('useDesignerStore actions', () => {
  it('starts with an empty draft', () => {
    const { ontology } = useDesignerStore.getState();
    expect(ontology.name).toBe('マイ オントロジー');
    expect(ontology.entityTypes).toEqual([]);
    expect(ontology.relationships).toEqual([]);
  });

  it('keeps safe legacy-compatible RDF filenames for Japanese designer names', () => {
    expect(designerRdfFilename('マイ オントロジー')).toBe('my-ontology.rdf');
    expect(designerRdfFilename('マイ オントロジー', true)).toBe('my-ontology-draft.rdf');
    expect(designerRdfFilename('日本語のモデル')).toBe('ontology.rdf');
  });

  it('addEntity adds an entity with a default identifier property', () => {
    useDesignerStore.getState().addEntity();
    const { ontology } = useDesignerStore.getState();
    expect(ontology.entityTypes).toHaveLength(1);
    expect(ontology.entityTypes[0].name).toBe('');
    expect(ontology.entityTypes[0].id).toMatch(/^new-entity-/);
    expect(ontology.entityTypes[0].properties).toHaveLength(1);
    expect(ontology.entityTypes[0].properties[0].isIdentifier).toBe(true);
  });

  it('updateEntity updates fields', () => {
    useDesignerStore.getState().addEntity();
    const id = useDesignerStore.getState().ontology.entityTypes[0].id;
    useDesignerStore.getState().updateEntity(id, { name: 'Customer', color: '#FF0000' });
    const entity = useDesignerStore.getState().ontology.entityTypes[0];
    expect(entity.name).toBe('Customer');
    expect(entity.color).toBe('#FF0000');
  });

  it('removeEntity removes the entity and its relationships', () => {
    const store = useDesignerStore.getState();
    store.addEntity();
    store.addEntity();
    const e1 = useDesignerStore.getState().ontology.entityTypes[0].id;
    const e2 = useDesignerStore.getState().ontology.entityTypes[1].id;
    useDesignerStore.getState().addRelationship(e1, e2);
    expect(useDesignerStore.getState().ontology.relationships).toHaveLength(1);

    useDesignerStore.getState().removeEntity(e1);
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(1);
    expect(useDesignerStore.getState().ontology.relationships).toHaveLength(0);
  });

  it('addProperty / removeProperty', () => {
    useDesignerStore.getState().addEntity();
    const id = useDesignerStore.getState().ontology.entityTypes[0].id;
    useDesignerStore.getState().addProperty(id);
    expect(useDesignerStore.getState().ontology.entityTypes[0].properties).toHaveLength(2);
    useDesignerStore.getState().removeProperty(id, 1);
    expect(useDesignerStore.getState().ontology.entityTypes[0].properties).toHaveLength(1);
  });

  it('moveProperty reorders properties', () => {
    useDesignerStore.getState().addEntity();
    const id = useDesignerStore.getState().ontology.entityTypes[0].id;
    // Add two more properties (already has "id")
    useDesignerStore.getState().addProperty(id);
    useDesignerStore.getState().updateProperty(id, 1, { name: 'name' });
    useDesignerStore.getState().addProperty(id);
    useDesignerStore.getState().updateProperty(id, 2, { name: 'email' });

    // Move "email" (index 2) to index 0
    useDesignerStore.getState().moveProperty(id, 2, 0);
    const names = useDesignerStore.getState().ontology.entityTypes[0].properties.map((p) => p.name);
    expect(names).toEqual(['email', 'id', 'name']);
  });

  it('addRelationship creates a relationship', () => {
    useDesignerStore.getState().addEntity();
    useDesignerStore.getState().addEntity();
    const e1 = useDesignerStore.getState().ontology.entityTypes[0].id;
    const e2 = useDesignerStore.getState().ontology.entityTypes[1].id;
    useDesignerStore.getState().addRelationship(e1, e2);
    const rel = useDesignerStore.getState().ontology.relationships[0];
    expect(rel.from).toBe(e1);
    expect(rel.to).toBe(e2);
    expect(rel.cardinality).toBe('one-to-many');
  });

  it('addRelationship can create a self-referencing relationship', () => {
    useDesignerStore.getState().addEntity();
    const e1 = useDesignerStore.getState().ontology.entityTypes[0].id;
    useDesignerStore.getState().addRelationship(e1, e1);
    const rel = useDesignerStore.getState().ontology.relationships[0];
    expect(rel.from).toBe(e1);
    expect(rel.to).toBe(e1);
    expect(validateOntology(useDesignerStore.getState().ontology).some((e) => e.message.includes('self-referencing'))).toBe(false);
  });

  it('updateRelationship updates fields', () => {
    useDesignerStore.getState().addEntity();
    useDesignerStore.getState().addEntity();
    const e1 = useDesignerStore.getState().ontology.entityTypes[0].id;
    const e2 = useDesignerStore.getState().ontology.entityTypes[1].id;
    useDesignerStore.getState().addRelationship(e1, e2);
    const relId = useDesignerStore.getState().ontology.relationships[0].id;
    useDesignerStore.getState().updateRelationship(relId, { name: 'has', cardinality: 'one-to-one' });
    const rel = useDesignerStore.getState().ontology.relationships[0];
    expect(rel.name).toBe('has');
    expect(rel.cardinality).toBe('one-to-one');
  });

  it('relationship attributes CRUD', () => {
    useDesignerStore.getState().addEntity();
    useDesignerStore.getState().addEntity();
    const e1 = useDesignerStore.getState().ontology.entityTypes[0].id;
    const e2 = useDesignerStore.getState().ontology.entityTypes[1].id;
    useDesignerStore.getState().addRelationship(e1, e2);
    const relId = useDesignerStore.getState().ontology.relationships[0].id;

    // Add
    useDesignerStore.getState().addRelationshipAttribute(relId);
    expect(useDesignerStore.getState().ontology.relationships[0].attributes).toHaveLength(1);

    // Update
    useDesignerStore.getState().updateRelationshipAttribute(relId, 0, { name: 'quantity', type: 'integer' });
    const attr = useDesignerStore.getState().ontology.relationships[0].attributes![0];
    expect(attr.name).toBe('quantity');
    expect(attr.type).toBe('integer');

    // Remove
    useDesignerStore.getState().removeRelationshipAttribute(relId, 0);
    expect(useDesignerStore.getState().ontology.relationships[0].attributes).toHaveLength(0);
  });

  it('loadDraft replaces the current draft', () => {
    const ontology = {
      name: 'Loaded',
      description: 'Loaded ontology',
      entityTypes: [{ id: 'x', name: 'X', description: '', icon: '📦', color: '#000', properties: [{ name: 'id', type: 'string' as const, isIdentifier: true }] }],
      relationships: [],
    };
    useDesignerStore.getState().loadDraft(ontology);
    expect(useDesignerStore.getState().ontology.name).toBe('Loaded');
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(1);
  });

  it('resetDraft clears to empty', () => {
    useDesignerStore.getState().addEntity();
    useDesignerStore.getState().resetDraft();
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(0);
    expect(useDesignerStore.getState().ontology.name).toBe('マイ オントロジー');
  });

  it('validate() populates validationErrors', () => {
    // Empty ontology → should have errors
    const errors = useDesignerStore.getState().validate();
    expect(errors.length).toBeGreaterThan(0);
    expect(useDesignerStore.getState().validationErrors.length).toBeGreaterThan(0);
  });

  it('setOntologyName / setOntologyDescription', () => {
    useDesignerStore.getState().setOntologyName('My Test');
    useDesignerStore.getState().setOntologyDescription('A test ontology');
    expect(useDesignerStore.getState().ontology.name).toBe('My Test');
    expect(useDesignerStore.getState().ontology.description).toBe('A test ontology');
  });
});

// ─── Undo / Redo ─────────────────────────────────────────────────────────────

describe('undo / redo', () => {
  it('undo restores the previous ontology state', () => {
    const store = useDesignerStore.getState();
    store.addEntity();
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(1);

    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(0);
  });

  it('redo re-applies the undone change', () => {
    const store = useDesignerStore.getState();
    store.addEntity();
    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(0);

    useDesignerStore.getState().redo();
    expect(useDesignerStore.getState().ontology.entityTypes).toHaveLength(1);
  });

  it('undo is a no-op when history is empty', () => {
    expect(useDesignerStore.getState()._past).toHaveLength(0);
    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState().ontology.name).toBe('マイ オントロジー');
  });

  it('redo is a no-op when future is empty', () => {
    expect(useDesignerStore.getState()._future).toHaveLength(0);
    useDesignerStore.getState().redo();
    expect(useDesignerStore.getState().ontology.name).toBe('マイ オントロジー');
  });

  it('new mutation after undo clears the redo stack', () => {
    const store = useDesignerStore.getState();
    store.addEntity();
    store.addEntity();
    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState()._future).toHaveLength(1);

    // New mutation should clear future
    useDesignerStore.getState().setOntologyName('Changed');
    expect(useDesignerStore.getState()._future).toHaveLength(0);
  });

  it('multiple undo steps walk back through history', () => {
    const store = useDesignerStore.getState();
    store.setOntologyName('Step 1');
    useDesignerStore.getState().setOntologyName('Step 2');
    useDesignerStore.getState().setOntologyName('Step 3');

    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState().ontology.name).toBe('Step 2');
    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState().ontology.name).toBe('Step 1');
    useDesignerStore.getState().undo();
    expect(useDesignerStore.getState().ontology.name).toBe('マイ オントロジー');
  });

  it('history is capped at 50 entries', () => {
    for (let i = 0; i < 60; i++) {
      useDesignerStore.getState().setOntologyName(`Step ${i}`);
    }
    expect(useDesignerStore.getState()._past.length).toBeLessThanOrEqual(50);
  });

  it('loadDraft clears history', () => {
    useDesignerStore.getState().addEntity();
    useDesignerStore.getState().addEntity();
    expect(useDesignerStore.getState()._past.length).toBeGreaterThan(0);

    useDesignerStore.getState().loadDraft({
      name: 'Loaded', description: '', entityTypes: [], relationships: [],
    });
    expect(useDesignerStore.getState()._past).toHaveLength(0);
    expect(useDesignerStore.getState()._future).toHaveLength(0);
  });

  it('resetDraft clears history', () => {
    useDesignerStore.getState().addEntity();
    expect(useDesignerStore.getState()._past.length).toBeGreaterThan(0);

    useDesignerStore.getState().resetDraft();
    expect(useDesignerStore.getState()._past).toHaveLength(0);
    expect(useDesignerStore.getState()._future).toHaveLength(0);
  });

  it('undo/redo preserves ontology data integrity (deep clone)', () => {
    useDesignerStore.getState().addEntity();
    const entityId = useDesignerStore.getState().ontology.entityTypes[0].id;
    useDesignerStore.getState().updateEntity(entityId, { name: 'Customer' });

    useDesignerStore.getState().undo();
    // Should be back to the empty localized-input state
    expect(useDesignerStore.getState().ontology.entityTypes[0].name).toBe('');

    // Mutating the current state shouldn't affect the redo stack
    useDesignerStore.getState().redo();
    expect(useDesignerStore.getState().ontology.entityTypes[0].name).toBe('Customer');
  });
});
