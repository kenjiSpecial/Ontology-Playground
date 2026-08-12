import { designerTemplates } from '../../data/designerTemplates';
import { useDesignerStore } from '../../store/designerStore';
import { jaMessages } from '../../locales/ja';

export function TemplatePicker() {
  const loadDraft = useDesignerStore((s) => s.loadDraft);

  return (
    <div className="template-picker">
      <div className="template-picker-header">
        <h3>{jaMessages.designer.templates.title}</h3>
        <p>{jaMessages.designer.templates.description}</p>
      </div>
      <div className="template-picker-grid">
        {designerTemplates.map((t) => (
          <button
            key={t.id}
            className="template-card"
            onClick={() => loadDraft(t.ontology)}
          >
            <span className="template-card-icon">{t.icon}</span>
            <span className="template-card-label">{t.label}</span>
            <span className="template-card-desc">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
