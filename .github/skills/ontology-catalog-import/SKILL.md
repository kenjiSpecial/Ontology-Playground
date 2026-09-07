---
name: ontology-catalog-import
description: "Import externally sourced or customer-provided RDF/OWL into the repository's external source/slug path with metadata and compiler validation. Route original community submissions to community-ontology-contribution."
---

# Ontology Catalog Import

Use this skill when an external or customer-provided RDF/OWL file must become
a catalogue entry. For an original contributor submission, use
[`community-ontology-contribution`](../community-ontology-contribution/SKILL.md)
so the community acceptance and path rules have one owner.

## Route and file contract

External imports use:

```text
catalogue/external/<source>/<slug>/
```

Community submissions use `catalogue/community/<github-username>/<slug>/` and
are handled by the community skill. The compiler scans exactly those two
directory levels below `external` or `community`. It accepts a `.rdf` or
`.owl` source file in the entry directory; use the repository conventions
`ontology.rdf` or `ontology.owl` so the file role is unambiguous. Add
`metadata.json` with the required `name`, `description`, and `category` string
fields. Confirm the category against `scripts/compile-catalogue.ts`; do not
maintain a second hard-coded category list here.

Read [`docs/authoring-guide.md`](../../../docs/authoring-guide.md) for the
ontology authoring constraints and
[`scripts/compile-catalogue.ts`](../../../scripts/compile-catalogue.ts) for
the current discovery and metadata behavior. Inspect an existing external
entry when adapting the source. Preserve provenance and licensing information
needed for an external import.

## Intake

Ask only for a missing decision that changes the result: external source and
slug, category, author metadata, or whether a separate Ontology School course
is requested. Do not re-ask values already supplied or infer a school course
from an ordinary import. If the requested destination is community, route to
the community skill rather than duplicating the workflow.

## Person names

If cleanup, metadata examples, RDF/OWL, or optional course content needs human
names, use [`name-generator`](../name-generator/SKILL.md) and its approved
`FullName` CSV. Never invent names.

## Validation

For catalogue content changes, run:

```bash
npx tsx scripts/compile-catalogue.ts
npm run validate
```

Confirm the expected `external/<source>/<slug>` ID and `source: "external"`
in the compiled output. Run the full application build only when generated
output or application behavior is part of the requested change.
