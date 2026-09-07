---
name: community-ontology-contribution
description: "Add a contributor-authored RDF/OWL ontology under the repository's community owner/slug path with valid metadata and compiler checks. Use for original community submissions; route external-source imports to ontology-catalog-import."
---

# Community Ontology Contribution

Use this skill for an original community submission that should be listed
under the contributor's lowercased GitHub username. Do not use it for an
ontology imported from an external source; route that work to
[`ontology-catalog-import`](../ontology-catalog-import/SKILL.md).

## Catalogue contract

The compiler scans exactly:

```text
catalogue/community/<github-username>/<slug>/
```

Both directories are required. A file placed directly under
`catalogue/community/<github-username>/` is silently skipped. Put the source
in that directory as `ontology.rdf` or `ontology.owl`; the compiler accepts a
`.rdf` or `.owl` file and the repository convention keeps the filename clear.

Add `metadata.json` with the compiler's required string fields:

```json
{
  "name": "Human-Readable Ontology Name",
  "description": "One-sentence description of the domain.",
  "category": "general",
  "icon": "🏭",
  "tags": ["tag1", "tag2"],
  "author": "<github-username>"
}
```

The compiler derives the catalogue ID from the path. Do not add an `id` or
other fields unless the schema and compiler have been updated first. Confirm
the category against `scripts/compile-catalogue.ts` rather than copying a
stale list into the skill.

Accept submissions that add a reusable domain, workflow, teaching scenario, or
other community value. Reject vanity-only, placeholder, and duplicate entries.

## Person names

If the submission adds a person name to sample data, examples, docs, quests, or
RDF/OWL literals, use [`name-generator`](../name-generator/SKILL.md) and its
approved `FullName` CSV. Never invent a name.

## Validation

Run the focused catalogue checks when catalogue content is changed:

```bash
npm run catalogue:build
npm run validate
```

Run the full application build only when the requested change also changes
generated output or application behavior. Inspect the compiled entry for the
expected `community/<github-username>/<slug>` ID and `source: "community"`.

## Completion

- The path has both username and slug directories.
- The source and metadata files are regular files and metadata has the
  required fields.
- The entry compiles, validates, and remains materially useful to the
  community.
- Any introduced person names are present in the approved CSV.
