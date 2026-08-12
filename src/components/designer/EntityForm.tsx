import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Key } from 'lucide-react';
import { useDesignerStore, ENTITY_COLORS, ENTITY_ICONS, fabricIQNameError } from '../../store/designerStore';
import type { Property } from '../../data/ontology';
import { jaFormatters, jaMessages } from '../../locales/ja';
import { getDisplayName } from '../../lib/displayText';

const PROPERTY_TYPES: Property['type'][] = [
  'string', 'integer', 'decimal', 'double', 'date', 'datetime', 'boolean', 'enum',
];

export function EntityForm() {
  const {
    ontology,
    selectedEntityId,
    addEntity,
    updateEntity,
    removeEntity,
    selectEntity,
    addProperty,
    updateProperty,
    removeProperty,
    moveProperty,
  } = useDesignerStore();

  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // When an entity is selected externally (e.g. graph click), expand and scroll to it
  useEffect(() => {
    if (selectedEntityId && !expandedEntities.has(selectedEntityId)) {
      setExpandedEntities((prev) => new Set(prev).add(selectedEntityId));
    }
    if (selectedEntityId) {
      // Delay scroll slightly so the card expands first
      requestAnimationFrame(() => {
        cardRefs.current.get(selectedEntityId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [selectedEntityId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddEntity = () => {
    addEntity();
    // Auto-expand the new entity (prepended at index 0)
    const latest = useDesignerStore.getState().ontology.entityTypes;
    if (latest.length > 0) {
      const newId = latest[0].id;
      setExpandedEntities((prev) => new Set(prev).add(newId));
    }
  };

  return (
    <div className="designer-entity-list">
      <div className="designer-section-header">
        <h3>{jaFormatters.designerEntityCount(ontology.entityTypes.length)}</h3>
        <button className="designer-add-btn" onClick={handleAddEntity} title={jaMessages.designer.entity.addTitle}>
          <Plus size={14} /> {jaMessages.designer.entity.add}
        </button>
      </div>

      {ontology.entityTypes.length === 0 && (
        <div className="designer-empty">{jaMessages.designer.entity.empty}</div>
      )}

      {ontology.entityTypes.map((entity) => {
        const isExpanded = expandedEntities.has(entity.id);
        const isSelected = selectedEntityId === entity.id;

        return (
          <div
            key={entity.id}
            ref={(el) => { if (el) cardRefs.current.set(entity.id, el); else cardRefs.current.delete(entity.id); }}
            className={`designer-entity-card ${isSelected ? 'selected' : ''}`}
          >
            {/* Header row */}
            <div
              className="designer-entity-header"
              onClick={() => {
                selectEntity(entity.id);
                toggleExpand(entity.id);
              }}
            >
              <button className="designer-expand-btn" aria-label={isExpanded ? jaMessages.designer.entity.collapse : jaMessages.designer.entity.expand}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <span
                className="designer-entity-icon"
                style={{ backgroundColor: entity.color + '30', color: entity.color }}
              >
                {entity.icon}
              </span>
              <span className="designer-entity-name">{getDisplayName(entity, jaMessages.designer.entity.unnamed)}</span>
              <span className="designer-entity-badge">{jaFormatters.designerPropertyBadge(entity.properties.length)}</span>
              <button
                className="designer-delete-btn"
                onClick={(e) => { e.stopPropagation(); removeEntity(entity.id); }}
                title={jaMessages.designer.entity.delete}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="designer-entity-body">
                {/* Name */}
                <label className="designer-field">
                  <span>{jaMessages.designer.entity.name}</span>
                  <input
                    type="text"
                    value={entity.name}
                    onChange={(e) => updateEntity(entity.id, { name: e.target.value })}
                    placeholder={jaMessages.designer.entity.namePlaceholder}
                  />
                  {entity.name && fabricIQNameError('エンティティ型', entity.name) && (
                    <span className="designer-field-hint error">{fabricIQNameError('エンティティ型', entity.name)}</span>
                  )}
                </label>

                {/* Description */}
                <label className="designer-field">
                  <span>{jaMessages.designer.entity.description}</span>
                  <textarea
                    rows={2}
                    value={entity.description}
                    onChange={(e) => updateEntity(entity.id, { description: e.target.value })}
                    placeholder={jaMessages.designer.entity.descriptionPlaceholder}
                  />
                </label>

                {/* Icon picker */}
                <div className="designer-field">
                  <span>{jaMessages.designer.entity.icon}</span>
                  <div className="designer-icon-grid">
                    {ENTITY_ICONS.map((icon) => (
                      <button
                        key={icon}
                        className={`designer-icon-btn ${entity.icon === icon ? 'active' : ''}`}
                        onClick={() => updateEntity(entity.id, { icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div className="designer-field">
                  <span>{jaMessages.designer.entity.color}</span>
                  <div className="designer-color-grid">
                    {ENTITY_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`designer-color-btn ${entity.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateEntity(entity.id, { color })}
                        aria-label={jaFormatters.designerColorLabel(color)}
                      />
                    ))}
                  </div>
                </div>

                {/* Properties */}
                <div className="designer-field">
                  <div className="designer-section-header">
                    <span>{jaFormatters.designerPropertyCount(entity.properties.length)}</span>
                    <button
                      className="designer-add-btn small"
                      onClick={() => addProperty(entity.id)}
                    >
                      <Plus size={12} /> {jaMessages.designer.entity.add}
                    </button>
                  </div>

                  <div className="designer-property-list">
                    {entity.properties.map((prop, idx) => {
                      const propNameErr = prop.name ? fabricIQNameError('プロパティ', prop.name) : null;
                      const idTypeErr = prop.isIdentifier && prop.type !== 'string' && prop.type !== 'integer'
                        ? jaFormatters.designerIdentifierTypeError(prop.type)
                        : null;
                      return (
                      <div key={idx}>
                      <div className="designer-property-row">
                        <span
                          className="designer-grip"
                          title={jaMessages.designer.entity.reorderProperty}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(idx));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            if (!isNaN(fromIdx) && fromIdx !== idx) {
                              moveProperty(entity.id, fromIdx, idx);
                            }
                          }}
                        >
                          <GripVertical size={12} />
                        </span>
                        <input
                          className="designer-prop-name"
                          type="text"
                          value={prop.name}
                          onChange={(e) => updateProperty(entity.id, idx, { name: e.target.value })}
                          placeholder={jaMessages.designer.entity.propertyNamePlaceholder}
                        />
                        <select
                          className="designer-prop-type"
                          value={prop.type}
                          onChange={(e) =>
                            updateProperty(entity.id, idx, { type: e.target.value as Property['type'] })
                          }
                        >
                          {PROPERTY_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button
                          className={`designer-id-btn ${prop.isIdentifier ? 'active' : ''} ${idTypeErr ? 'warning' : ''}`}
                          onClick={() => updateProperty(entity.id, idx, { isIdentifier: !prop.isIdentifier })}
                          title={idTypeErr || (prop.isIdentifier ? jaMessages.designer.entity.removeIdentifier : jaMessages.designer.entity.markIdentifier)}
                        >
                          <Key size={12} />
                        </button>
                        <button
                          className="designer-delete-btn small"
                          onClick={() => removeProperty(entity.id, idx)}
                          title={jaMessages.designer.entity.removeProperty}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {(propNameErr || idTypeErr) && (
                        <span className="designer-field-hint error">{propNameErr || idTypeErr}</span>
                      )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
