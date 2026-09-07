---
name: theme-authoring
description: "Add a registered Ontology Playground color theme across the picker and CSS token system, then verify contrast, persistence, and graph surfaces. Use for a new theme or palette."
---

# Theme Authoring

Use this skill when adding a new theme entry. Read the architecture and current
token blocks in:

1. [`docs/theme-authoring-guide.md`](../../../docs/theme-authoring-guide.md)
2. [`src/store/appStore.ts`](../../../src/store/appStore.ts)
3. [`src/styles/app.css`](../../../src/styles/app.css)

Ask only for theme decisions that are missing and materially affect the
implementation: the id/label, light or dark basis, accent, or any explicit
surface/text/graph colors. Reuse existing instructions and repository values
when they are already provided.

## Procedure

Keep the change in `src/store/appStore.ts` and `src/styles/app.css`:

1. Add the id to `ThemeId` and add its `{ id, label, swatch }` option.
2. Register dark-based themes in `DARK_BASED_THEMES`; leave light themes out.
3. Return `theme-<id>` for dark themes, or `light-theme theme-<id>` for light
   themes, from `themeClass()`.
4. Add the matching CSS token block by adapting the nearest existing theme.

## Non-negotiable visual rules

- Light themes must give `--chess-square-light` an opaque light value. The
  theme class is on `.app-container`, while `body` remains dark; translucency
  makes the graph canvas unreadable.
- Define `--graph-bg`, `--graph-node-text`, `--graph-edge-color`,
  `--graph-edge-text`, and `--graph-edge-label-bg` in the theme block so the
  graph and designer use the theme tokens.
- Meet WCAG 2.1 AA: text/labels need 4.5:1, non-text graph lines need 3:1,
  and edge text must clear 4.5:1 against its label background. Set
  `--on-accent` for the accent's actual luminance, keep stat and amber token
  contrast, and ensure progress-fill endpoints clear 3:1 against the track.
- Keep dark-theme membership correct for graph fallbacks, label backplates,
  and PNG export backgrounds.
- Use generic palette names; do not introduce brand names in ids, labels,
  comments, or commits.

## Verification

Run the checks appropriate to the changed surface:

```bash
npm run test:a11y
npx tsc --noEmit
npm run build
```

For a visual change, switch the theme in the running app and inspect the main
graph, designer preview, learn pages, picker persistence, and canvas backdrop.
Preserve existing working-tree changes when inspecting generated build output;
do not automatically checkout or restore files. Completion requires the new
theme to be registered, persistent, legible, contrast-compliant, and unable
to change the existing Dark, Light, Aurora, or Crimson behavior.
