export interface TechnicalDisplayText {
  text: string;
  technicalTokenReason: string;
}

export type LocalizedDisplayText = string | TechnicalDisplayText;

export interface CatalogueTagLocalization {
  tag: string;
  displayName: LocalizedDisplayText;
}

export interface CatalogueEntryLocalization {
  displayName: LocalizedDisplayText;
  displayDescription: LocalizedDisplayText;
  displayTags: CatalogueTagLocalization[];
}

export interface OntologyLocalization {
  displayName?: LocalizedDisplayText;
  displayDescription?: LocalizedDisplayText;
}

export interface EntityLocalization {
  id: string;
  displayName: LocalizedDisplayText;
  displayDescription?: LocalizedDisplayText;
}

export interface PropertyLocalization {
  entityId: string;
  propertyName: string;
  displayName: LocalizedDisplayText;
  displayDescription?: LocalizedDisplayText;
}

export interface RelationshipLocalization {
  id: string;
  displayName: LocalizedDisplayText;
  displayDescription?: LocalizedDisplayText;
}

export interface RelationshipAttributeLocalization {
  relationshipId: string;
  attributeName: string;
  displayName: LocalizedDisplayText;
}

export interface EnumValueLocalization {
  entityId: string;
  propertyName: string;
  value: string;
  displayValue: LocalizedDisplayText;
}

export interface CatalogueLocalizationOverlay {
  $schema?: string;
  version: 1;
  entry: CatalogueEntryLocalization;
  ontology: OntologyLocalization;
  entities: EntityLocalization[];
  properties: PropertyLocalization[];
  relationships: RelationshipLocalization[];
  relationshipAttributes: RelationshipAttributeLocalization[];
  enumValues: EnumValueLocalization[];
}
