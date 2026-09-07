---
name: name-generator
description: "Select fictional person names from this repository's approved CSV for examples, demos, tests, docs, quests, and sample data. Use only when a task needs a human name."
---

# Name Generator

Use the repository fixture as the only source of fictional person names:

```text
data/reference/FNF-2026-06-01-01002-0268.csv
```

Read the `FullName` column by default. Use `FullNameNative` only when the user
explicitly requests native-script or locale-specific display text. If the
task does not specify a quantity, select the minimum number needed and keep
each chosen name stable across its coupled examples, expected results, tests,
and generated content.

For a quick inspection:

```bash
awk -F, 'NR > 1 { print $3 }' data/reference/FNF-2026-06-01-01002-0268.csv | head
```

Use a proper CSV parser if the fixture gains quoted fields containing commas.
Choose distinct names for distinct entities and preserve the spelling in the
fixture. Email addresses and IDs may remain generic.

When replacing a name, update the dependent sample instances, prompts,
expected strings, docs, and generated sources that belong to the same task.
Regenerate catalogue or learning output only when those sources changed.

## Validation

- Verify each selected name is in the chosen CSV column: `FullName` by default,
  or `FullNameNative` only when that display was explicitly requested.
- Search for stale removed names when this is a replacement task.
- Run focused tests for changed code paths.
- Run the relevant build when generated catalogue or learning output changed.
