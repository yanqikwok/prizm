# Contributions — proposed components

New components and guidelines designed in this fork, to be contributed back to
`prizm-design/prizm` once a contribution process exists. Conventions are in `/CLAUDE.md` at the
repo root; PRIZM's own rules are in `/PRIZM.md`.

## Folders

| Path | What goes there |
|---|---|
| `contributions/source-screens/` | Exported source screens, one folder per screen — **git-ignored, local only** |
| `contributions/component-template.md` | Template for a component's doc |
| `contributions/pattern-template.md` | Template for a pattern (includes the pattern-vs-component-vs-guideline test) |
| `contributions/guideline-template.md` | Template for a guideline |
| `llms/<slug>.md` | The finished doc for each component |
| `llms/patterns/<slug>.md` | The finished doc for each pattern |
| `llms/guidelines/<slug>.md` | The finished doc for each guideline |
| `components/ui/<slug>.tsx` | The component code |

## Per-component checklist

1. [ ] Source screen exported to `source-screens/`
2. [ ] Every state of the component extracted from the source screen, from the PNG and from the
   HTML export, which can carry states the PNG doesn't show (e.g. a bundled prototype's code). List them, agree
   which to keep, drop or add, and carry them into the doc's "States" section and the code
3. [ ] Reuse check written (which PRIZM components were considered, and why they don't fit)
4. [ ] Guideline doc at `llms/<slug>.md`, from the template
5. [ ] Code at `components/ui/<slug>.tsx`
6. [ ] Registry entry in `lib/components-registry.ts` with `status: "alpha"`
7. [ ] `pnpm verify` passes
8. [ ] Committed and pushed; tracker row and GitHub issue updated

## Tracker

| Component | Source screen | Status | Issue |
|---|---|---|---|
| Prompt Input (`prompt-input`) | `prompt-input/` | Alpha: doc, code, registry; verify passes | |
