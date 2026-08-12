import type { DataBinding, Ontology } from '../data/ontology';
import { jaMessages } from '../locales/ja';
import { escapeXml, serializeToRDF } from './rdf/serializer';

const LEGACY_DEFAULT_ONTOLOGY_NAME = 'My Ontology';

/**
 * Serializes a designer draft while preserving the pre-localization base URI
 * for the localized default name. The ontology label remains Japanese.
 */
export function serializeDesignerToRDF(
  ontology: Ontology,
  bindings: DataBinding[] = [],
): string {
  if (ontology.name !== jaMessages.designer.defaultOntologyName) {
    return serializeToRDF(ontology, bindings);
  }

  const rdf = serializeToRDF({ ...ontology, name: LEGACY_DEFAULT_ONTOLOGY_NAME }, bindings);
  return rdf.replace(
    `<rdfs:label>${escapeXml(LEGACY_DEFAULT_ONTOLOGY_NAME)}</rdfs:label>`,
    `<rdfs:label>${escapeXml(ontology.name)}</rdfs:label>`,
  );
}
