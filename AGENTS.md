# Coding Guidelines for AI Agents

This file is the short entry point for repository-specific agent guidance.
Use [`docs/agent-reference.md`](docs/agent-reference.md) for conditional
routing and verification details; read only the references that affect the
requested change.

## Invariants

- Treat the catalogue compiler as the authority for entry paths, metadata, and
  RDF/OWL discovery. Community entries use
  `catalogue/community/<github-username>/<slug>/`; external entries use
  `catalogue/external/<source>/<slug>/`.
- Do not invent person names in examples, tests, docs, catalogue content, or
  generated output. When names are needed, use the approved CSV through the
  [`name-generator`](.github/skills/name-generator/SKILL.md) skill.
- Keep TypeScript strict and preserve the existing React, Zustand, RDF, and
  catalogue patterns when application code is in scope. Do not introduce
  `any` unless the existing boundary makes it unavoidable.
- Keep secrets, `.env` files, runtime data, and production operations outside
  the repository change. Preserve existing working-tree changes; do not
  automatically checkout, restore, or discard files.
- Follow the active parent workflow for an isolated branch/worktree; do not
  commit directly to `main`. Authorized commits use a focused Conventional
  Commit message.
- Update user-facing README/TODO material only when the requested change
  changes that material. Do not turn a documentation-only change into an
  application build by default.

## Verification

Choose the smallest deterministic checks that cover the changed surface. The
router in [`docs/agent-reference.md`](docs/agent-reference.md) identifies the
commands for catalogue, learning-content, theme, and application changes.
For instruction-only edits, structural link/frontmatter checks and
`git diff --check` are sufficient unless a changed executable file requires a
focused test.
