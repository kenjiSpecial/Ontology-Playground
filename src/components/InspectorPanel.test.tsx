import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { InspectorPanel } from './InspectorPanel';
import { useAppStore } from '../store/appStore';

function setupDataBindingQuestStep() {
  useAppStore.getState().resetToDefault();
  useAppStore.getState().startQuest('quest-5');
  useAppStore.getState().advanceQuestStep(); // Move from step 1 to step 2 (property step)
  useAppStore.getState().selectEntity('customer');
}

describe('InspectorPanel quest progression', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
    vi.restoreAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('advances the property quest step when clicking the property row', () => {
    setupDataBindingQuestStep();

    render(<InspectorPanel />);

    expect(useAppStore.getState().currentStepIndex).toBe(1);

    const propertiesHeader = screen.getByText(/プロパティ（\d+）/);
    const propertiesSection = propertiesHeader.closest('.inspector-section');
    expect(propertiesSection).toBeTruthy();

    const propertyInList = within(propertiesSection as HTMLElement).getByText('name');
    fireEvent.click(propertyInList);

    expect(useAppStore.getState().currentStepIndex).toBe(2);
  });

  it('advances the property quest step when clicking the data binding mapping row', () => {
    setupDataBindingQuestStep();

    render(<InspectorPanel />);

    expect(useAppStore.getState().currentStepIndex).toBe(1);

    const bindingsHeader = screen.getByText('データ バインディング');
    const bindingsSection = bindingsHeader.closest('.inspector-section');
    expect(bindingsSection).toBeTruthy();

    const mappedColumn = within(bindingsSection as HTMLElement).getByText('full_name');
    fireEvent.click(mappedColumn);

    expect(useAppStore.getState().currentStepIndex).toBe(2);
  });

  it('renders localized names and descriptions while keeping property quest matching internal', () => {
    const ontology = useAppStore.getState().currentOntology;
    const localized = {
      ...ontology,
      entityTypes: ontology.entityTypes.map((entity) =>
        entity.id === 'customer'
          ? {
              ...entity,
              displayName: '顧客',
              displayDescription: '商品を購入する人です。',
              properties: entity.properties.map((property) =>
                property.name === 'name' ? { ...property, displayName: '氏名' } : property,
              ),
            }
          : entity,
      ),
    };
    useAppStore.getState().loadOntology(localized);
    useAppStore.getState().selectEntity('customer');

    render(<InspectorPanel />);

    expect(screen.getByText('顧客')).toBeTruthy();
    expect(screen.getByText('商品を購入する人です。')).toBeTruthy();
    expect(screen.getByText('氏名')).toBeTruthy();
    expect(useAppStore.getState().selectedEntityId).toBe('customer');
  });
});
