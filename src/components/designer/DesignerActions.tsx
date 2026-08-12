import { useState, useEffect } from 'react';
import { Download, AlertTriangle, CheckCircle, Upload, Github, FilePlus, Undo2, Redo2 } from 'lucide-react';
import { designerRdfFilename, useDesignerStore } from '../../store/designerStore';
import type { ValidationError } from '../../store/designerStore';
import { useAppStore } from '../../store/appStore';
import { serializeToRDF } from '../../lib/rdf/serializer';
import { navigate } from '../../lib/router';
import { SubmitCatalogueModal } from './SubmitCatalogueModal';
import { jaFormatters, jaMessages } from '../../locales/ja';

/**
 * Toolbar buttons — rendered in the designer topbar.
 */
export function DesignerToolbar() {
  const { ontology, validate, resetDraft, undo, redo, _past, _future } = useDesignerStore();
  const loadOntology = useAppStore((s) => s.loadOntology);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const canUndo = _past.length > 0;
  const canRedo = _future.length > 0;

  const handleValidate = () => {
    validate();
  };

  const handleExportRDF = () => {
    const errors = validate();
    // Allow download even with validation errors (user sees warnings in sidebar)
    try {
      const rdf = serializeToRDF(ontology, []);
      const blob = new Blob([rdf], { type: 'application/rdf+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = designerRdfFilename(ontology.name, errors.length > 0);
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // serialization failed — validation errors are shown in sidebar
    }
  };

  const handleLoadInPlayground = () => {
    const errors = validate();
    if (errors.length > 0) return;
    loadOntology(ontology, []);
    navigate({ page: 'home' });
  };

  const handleNewOntology = () => {
    resetDraft();
  };

  const handleSubmitToCatalogue = () => {
    const errors = validate();
    if (errors.length > 0) return;
    setShowSubmitModal(true);
  };

  return (
    <>
      <div className="designer-toolbar">
        <button className="designer-toolbar-btn" onClick={undo} disabled={!canUndo} title={jaMessages.designer.toolbar.undo}>
          <Undo2 size={14} />
        </button>
        <button className="designer-toolbar-btn" onClick={redo} disabled={!canRedo} title={jaMessages.designer.toolbar.redo}>
          <Redo2 size={14} />
        </button>
        <div className="designer-toolbar-sep" />
        <button className="designer-toolbar-btn" onClick={handleNewOntology} title={jaMessages.designer.toolbar.newOntology}>
          <FilePlus size={14} /> {jaMessages.designer.toolbar.newOntology}
        </button>
        <button className="designer-toolbar-btn" onClick={handleValidate} title={jaMessages.designer.toolbar.validate}>
          <CheckCircle size={14} /> {jaMessages.designer.toolbar.validate}
        </button>
        <div className="designer-toolbar-sep" />
        <button className="designer-toolbar-btn" onClick={handleExportRDF} title={jaMessages.designer.toolbar.exportRdf}>
          <Download size={14} /> {jaMessages.designer.toolbar.exportRdf}
        </button>
        <button className="designer-toolbar-btn" onClick={handleLoadInPlayground} title={jaMessages.designer.toolbar.loadInPlayground}>
          <Upload size={14} /> {jaMessages.designer.toolbar.loadInPlayground}
        </button>
        <button className="designer-toolbar-btn submit" onClick={handleSubmitToCatalogue} title={jaMessages.designer.toolbar.submitToCatalogue}>
          <Github size={14} /> {jaMessages.designer.toolbar.submitToCatalogue}
        </button>
      </div>

      {showSubmitModal && (
        <SubmitCatalogueModal onClose={() => setShowSubmitModal(false)} />
      )}
    </>
  );
}

/**
 * Validation feedback — rendered in the sidebar.
 */
export function DesignerValidation() {
  const validationErrors = useDesignerStore((s) => s.validationErrors);
  const lastValidatedAt = useDesignerStore((s) => s._lastValidatedAt);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success banner for 3 seconds when validation runs with 0 errors
  useEffect(() => {
    if (lastValidatedAt > 0 && validationErrors.length === 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowSuccess(false);
  }, [lastValidatedAt, validationErrors.length]);

  if (validationErrors.length === 0) {
    if (!showSuccess) return null;
    return (
      <div className="designer-validation-success">
        <div className="designer-validation-header" style={{ color: 'var(--ms-green, #16c60c)' }}>
          <CheckCircle size={14} /> {jaMessages.designer.validation.noIssues}
        </div>
      </div>
    );
  }

  return (
    <div className="designer-validation-errors">
      <div className="designer-validation-header">
        <AlertTriangle size={14} /> {jaFormatters.designerValidationIssueCount(validationErrors.length)}
      </div>
      <ul>
        {validationErrors.map((err, i) => (
          <li key={i}>
            <ErrorItem error={err} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorItem({ error }: { error: ValidationError }) {
  const selectEntity = useDesignerStore((s) => s.selectEntity);
  const selectRelationship = useDesignerStore((s) => s.selectRelationship);

  const handleClick = () => {
    if (error.entityId) {
      selectEntity(error.entityId);
    } else if (error.relationshipId) {
      selectRelationship(error.relationshipId);
    }
  };

  const isClickable = error.entityId || error.relationshipId;

  return (
    <span
      className={isClickable ? 'designer-error-link' : ''}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') handleClick(); } : undefined}
    >
      {error.message}
    </span>
  );
}
