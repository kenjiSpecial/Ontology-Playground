import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { X, Database, Table, BarChart3, Cloud } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { jaFormatters, jaMessages } from '../locales/ja';

interface DataSourcesModalProps {
  onClose: () => void;
}

export function DataSourcesModal({ onClose }: DataSourcesModalProps) {
  const { currentOntology, dataBindings } = useAppStore();
  
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 750, maxHeight: '85vh', overflow: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>{jaMessages.dataExchange.dataSources.title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
              {jaFormatters.dataExchangeSourceDescription(currentOntology.name)}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={jaMessages.common.close}>
            <X size={20} />
          </button>
        </div>

        {/* Data lakehouse overview */}
        <div style={{ 
          padding: 20, 
          background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.1), rgba(92, 45, 145, 0.1))',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            background: 'var(--ms-blue)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cloud size={28} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{jaMessages.dataExchange.dataSources.lakehouse}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {jaMessages.dataExchange.dataSources.overview}
            </div>
          </div>
        </div>

        {/* Bindings Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dataBindings.map((binding) => {
            const entity = currentOntology.entityTypes.find(e => e.id === binding.entityTypeId);
            if (!entity) return null;

            const sourceNormalized = binding.source.toLowerCase();
            const isLakehouse = sourceNormalized.includes('lakehouse') || binding.table.startsWith('lakehouse.');
            const isSemanticModel = sourceNormalized.includes('semantic') || binding.table.startsWith('semantic_model.');

            return (
              <div key={binding.entityTypeId} className="binding-card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      background: entity.color + '20',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22
                    }}>
                      {entity.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{entity.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {jaFormatters.dataExchangePropertiesMapped(entity.properties.length)}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    padding: '4px 10px',
                    background: isLakehouse ? 'rgba(0, 120, 212, 0.15)' : 'rgba(255, 185, 0, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: isLakehouse ? 'var(--ms-blue)' : 'var(--ms-yellow)'
                  }}>
                    {isSemanticModel ? <BarChart3 size={14} /> : <Table size={14} />}
                    {isSemanticModel ? jaMessages.dataExchange.dataSources.semanticModel : jaMessages.dataExchange.dataSources.lakehouse}
                  </div>
                </div>

                <div style={{ 
                  padding: 12, 
                  background: 'var(--bg-primary)', 
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Database size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{jaMessages.dataExchange.dataSources.sourceTable}</span>
                  </div>
                  <code style={{ 
                    fontSize: 13, 
                    color: 'var(--ms-cyan)', 
                    fontFamily: 'var(--font-mono)',
                    wordBreak: 'break-all'
                  }}>
                    {binding.table}
                  </code>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
                  {jaMessages.dataExchange.dataSources.columnMappings}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px 12px', fontSize: 13 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{jaMessages.dataExchange.dataSources.property}</div>
                  <div></div>
                  <div style={{ color: 'var(--text-tertiary)', fontWeight: 600, textAlign: 'right' }}>{jaMessages.dataExchange.dataSources.column}</div>
                  {Object.entries(binding.columnMappings).map(([prop, column]) => (
                    <Fragment key={prop}>
                      <div style={{ color: 'var(--text-primary)' }}>{prop}</div>
                      <div style={{ color: 'var(--text-tertiary)' }}>→</div>
                      <div style={{ color: 'var(--ms-cyan)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{column}</div>
                    </Fragment>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Unbound entities notice */}
          <div style={{ 
            padding: 16, 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <strong>{jaMessages.dataExchange.dataSources.otherEntities}</strong> Store、Supplier、Shipment
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {jaMessages.dataExchange.dataSources.demoBindingsBeforeValues}Customer、Order、Product
              {jaMessages.dataExchange.dataSources.demoBindingsAfterValues}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            {jaMessages.common.close}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
