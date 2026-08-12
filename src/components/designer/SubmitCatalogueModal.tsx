import { useState } from 'react';
import { X, Github, ExternalLink, Download, Check } from 'lucide-react';
import { useDesignerStore } from '../../store/designerStore';
import { serializeToRDF } from '../../lib/rdf/serializer';
import { jaMessages } from '../../locales/ja';

interface SubmitCatalogueModalProps {
  onClose: () => void;
}

const REPO_URL = 'https://github.com/microsoft/Ontology-Playground';

export function SubmitCatalogueModal({ onClose }: SubmitCatalogueModalProps) {
  const ontology = useDesignerStore((s) => s.ontology);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadRdf = () => {
    const rdf = serializeToRDF(ontology, []);
    const slug = ontology.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ontology';
    const blob = new Blob([rdf], { type: 'application/rdf+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.rdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleDownloadMetadata = () => {
    const metadata = {
      name: ontology.name,
      description: ontology.description,
      icon: '📦',
      category: 'other',
      tags: [],
      author: '',
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content submit-catalogue-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={jaMessages.common.close}><X size={18} /></button>
        <h2 className="modal-title">
          <Github size={20} /> {jaMessages.designer.submit.title}
        </h2>

        <div className="submit-step">
          <p className="submit-description">
            {jaMessages.designer.submit.descriptionBeforeLink}{' '}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              {jaMessages.designer.submit.repositoryLink} <ExternalLink size={12} />
            </a>
            {jaMessages.designer.submit.descriptionAfterLink}
          </p>

          <div className="submit-instructions">
            <h3>{jaMessages.designer.submit.howTo}</h3>
            <ol>
              <li>{jaMessages.designer.submit.downloadFiles}</li>
              <li>
                <a href={`${REPO_URL}/fork`} target="_blank" rel="noopener noreferrer">
                  {jaMessages.designer.submit.forkRepository} <ExternalLink size={12} />
                </a>
              </li>
              <li>
                {jaMessages.designer.submit.addFilesBeforePath}
                <code>catalogue/community/your-username/</code>
              </li>
              <li><code>metadata.json</code>{jaMessages.designer.submit.editMetadataAfterFilename}</li>
              <li>{jaMessages.designer.submit.openPullRequestBeforeBranch}<code>main</code></li>
            </ol>
          </div>

          <div className="submit-download-actions">
            <button className="designer-action-btn primary" onClick={handleDownloadRdf}>
              <Download size={14} /> {jaMessages.designer.submit.downloadRdf}
              {downloaded && <Check size={14} style={{ marginLeft: 4 }} />}
            </button>
            <button className="designer-action-btn secondary" onClick={handleDownloadMetadata}>
              <Download size={14} /> {jaMessages.designer.submit.downloadMetadata}
            </button>
          </div>

          <div className="submit-form-actions">
            <button className="designer-action-btn secondary" onClick={onClose}>{jaMessages.common.close}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
