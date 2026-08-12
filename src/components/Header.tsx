import { useState, useRef, useEffect } from 'react';
import { useAppStore, THEME_OPTIONS } from '../store/appStore';
import { useRoute } from '../hooks/useRoute';
import { routeToHash } from '../lib/router';
import { encodeSharePayload } from '../lib/shareCodec';
import { serializeToRDF } from '../lib/rdf/serializer';
import { jaFormatters, jaMessages } from '../locales/ja';
import { getDisplayName } from '../lib/displayText';
import { Palette, Check, Database, Trophy, HelpCircle, FileJson, LayoutGrid, Sparkles, FileText, Share2, PenTool, BookOpen, Menu, X, Download, Info } from 'lucide-react';

interface HeaderProps {
  onAboutClick: () => void;
  onHelpClick: () => void;
  onDataSourcesClick: () => void;
  onImportExportClick: () => void;
  onGalleryClick: () => void;
  onDesignerClick: () => void;
  onLearnClick: () => void;
  onNLBuilderClick?: () => void;
  onSummaryClick: () => void;
}

export function Header({ onAboutClick, onHelpClick, onDataSourcesClick, onImportExportClick, onGalleryClick, onDesignerClick, onLearnClick, onNLBuilderClick, onSummaryClick }: HeaderProps) {
  const { theme, setTheme, totalPoints, earnedBadges, currentOntology, dataBindings } = useAppStore();
  const route = useRoute();
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'downloaded'>('idle');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const ontologyDisplayName = getDisplayName(currentOntology, jaMessages.shell.untitledOntology);

  const shareableId = route.page === 'catalogue' && route.ontologyId ? route.ontologyId : null;

  const handleShare = async () => {
    if (shareStatus === 'copying') return;

    if (shareableId) {
      // Catalogue ontology — use the short deep link
      const url = `${window.location.origin}${window.location.pathname}#/catalogue/${shareableId}`;
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
      return;
    }

    // Custom ontology — compress and encode into a share URL
    setShareStatus('copying');
    const encoded = await encodeSharePayload(currentOntology, dataBindings);
    if (encoded) {
      const url = `${window.location.origin}${window.location.pathname}#/share/${encoded}`;
      await navigator.clipboard.writeText(url);
      history.replaceState(null, '', routeToHash({ page: 'share', data: encoded }));
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } else {
      // Too large for URL — download the RDF file instead
      const content = serializeToRDF(currentOntology, dataBindings);
      const blob = new Blob([content], { type: 'application/rdf+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentOntology.name.toLowerCase().replace(/\s+/g, '-')}-ontology.rdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShareStatus('downloaded');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const shareLabel = shareStatus === 'copied'
    ? jaMessages.shell.copied
    : shareStatus === 'downloaded'
      ? jaMessages.shell.downloadedRdf
      : shareStatus === 'copying'
        ? jaMessages.shell.encoding
        : jaMessages.shell.share;

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close theme menu when clicking outside
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [themeMenuOpen]);

  const menuAction = (fn: () => void) => () => { setMenuOpen(false); fn(); };

  return (
    <header className="header">
      <div className="header-logo">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="4" fill="#0078D4"/>
          <path d="M8 8H15V15H8V8Z" fill="white"/>
          <path d="M17 8H24V15H17V8Z" fill="white" opacity="0.7"/>
          <path d="M8 17H15V24H8V17Z" fill="white" opacity="0.7"/>
          <path d="M17 17H24V24H17V17Z" fill="white" opacity="0.5"/>
        </svg>
        <div>
          <span className="header-title">
            {jaMessages.meta.productName} <span className="header-title-preview">{jaMessages.shell.preview}</span>
          </span>
          <span className="header-context">{ontologyDisplayName}</span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-item">
          <Trophy size={18} />
          <span className="stat-value">{jaFormatters.points(totalPoints)}</span>
        </div>
        <div className="stat-item">
          <span style={{ fontSize: 18 }}>🏆</span>
          <span className="stat-value">{jaFormatters.badges(earnedBadges.length)}</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-text-btn"
          onClick={handleShare}
          title={shareableId ? jaMessages.shell.copyShareableLink : jaMessages.shell.shareViaUrl}
          style={shareStatus === 'copied' ? { color: 'var(--ms-green, #107C10)' } : shareStatus === 'downloaded' ? { color: 'var(--ms-blue, #0078D4)' } : undefined}
        >
          {shareStatus === 'downloaded' ? <Download size={16} /> : <Share2 size={16} />}
          <span>{shareLabel}</span>
        </button>
        <button className="header-text-btn" onClick={onSummaryClick} title={jaMessages.shell.viewSummary}>
          <FileText size={16} />
          <span>{jaMessages.shell.summary}</span>
        </button>
        {onNLBuilderClick && (
          <button className="icon-btn" onClick={onNLBuilderClick} data-tooltip={jaMessages.shell.aiBuilder} aria-label={jaMessages.shell.aiBuilder}>
            <Sparkles size={20} />
          </button>
        )}
        <button className="icon-btn" onClick={onGalleryClick} data-tooltip={jaMessages.shell.catalogue} aria-label={jaMessages.shell.catalogue}>
          <LayoutGrid size={20} />
        </button>
        <button className="icon-btn" onClick={onDesignerClick} data-tooltip={jaMessages.shell.designer} aria-label={jaMessages.shell.designer} data-tour-target="designer">
          <PenTool size={20} />
        </button>
        <button className="icon-btn" onClick={onLearnClick} data-tooltip={jaMessages.shell.ontologySchool} aria-label={jaMessages.shell.ontologySchool}>
          <BookOpen size={20} />
        </button>
        <button className="icon-btn" onClick={onImportExportClick} data-tooltip={jaMessages.shell.importExport} aria-label={jaMessages.shell.importExport}>
          <FileJson size={20} />
        </button>
        <button className="icon-btn" onClick={onHelpClick} data-tooltip={jaMessages.shell.help} aria-label={jaMessages.shell.help}>
          <HelpCircle size={20} />
        </button>
        <button className="icon-btn" onClick={onAboutClick} data-tooltip={jaMessages.shell.about} aria-label={jaMessages.shell.about}>
          <Info size={20} />
        </button>
        <button className="icon-btn" onClick={onDataSourcesClick} data-tooltip={jaMessages.shell.dataSources} aria-label={jaMessages.shell.dataSources}>
          <Database size={20} />
        </button>
        <div className="theme-picker" ref={themeMenuRef}>
          <button
            className="icon-btn"
            onClick={() => setThemeMenuOpen((o) => !o)}
            data-tooltip={jaMessages.shell.theme}
            aria-label={jaMessages.shell.theme}
            aria-haspopup="menu"
            aria-expanded={themeMenuOpen}
          >
            <Palette size={20} />
          </button>
          {themeMenuOpen && (
            <div className="theme-menu" role="menu">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`theme-menu-item ${theme === opt.id ? 'active' : ''}`}
                  onClick={() => { setTheme(opt.id); setThemeMenuOpen(false); }}
                  role="menuitemradio"
                  aria-checked={theme === opt.id}
                >
                  <span className="theme-swatch" style={{ background: opt.swatch }} />
                  {opt.label}
                  {theme === opt.id && <Check size={16} className="theme-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile hamburger menu */}
      <div className="header-mobile-menu" ref={menuRef}>
        <button className="icon-btn header-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label={jaMessages.shell.menu}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <div className="mobile-menu-dropdown">
            <div className="mobile-menu-stats">
              <Trophy size={16} />
              <span className="stat-value">{jaFormatters.points(totalPoints)}</span>
              <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>·</span>
              <span>🏆</span>
              <span className="stat-value">{jaFormatters.badges(earnedBadges.length)}</span>
            </div>
            <button className="mobile-menu-item" onClick={menuAction(handleShare)}>
              <Share2 size={18} /> {shareLabel}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onSummaryClick)}>
              <FileText size={18} /> {jaMessages.shell.summary}
            </button>
            {onNLBuilderClick && (
              <button className="mobile-menu-item" onClick={menuAction(onNLBuilderClick)}>
                <Sparkles size={18} /> {jaMessages.shell.aiBuilder}
              </button>
            )}
            <button className="mobile-menu-item" onClick={menuAction(onGalleryClick)}>
              <LayoutGrid size={18} /> {jaMessages.shell.catalogue}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onDesignerClick)}>
              <PenTool size={18} /> {jaMessages.shell.designer}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onLearnClick)}>
              <BookOpen size={18} /> {jaMessages.shell.ontologySchool}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onImportExportClick)}>
              <FileJson size={18} /> {jaMessages.shell.importExport}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onHelpClick)}>
              <HelpCircle size={18} /> {jaMessages.shell.help}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onAboutClick)}>
              <Info size={18} /> {jaMessages.shell.about}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onDataSourcesClick)}>
              <Database size={18} /> {jaMessages.shell.dataSources}
            </button>
            <div className="mobile-menu-themes">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`mobile-menu-item ${theme === opt.id ? 'active' : ''}`}
                  onClick={menuAction(() => setTheme(opt.id))}
                >
                  <span className="theme-swatch" style={{ background: opt.swatch }} />
                  {opt.label}
                  {theme === opt.id && <Check size={16} className="theme-check" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
