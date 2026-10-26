# CLAUDE.md

This is **yanqikwok/prizm**, a public fork of `prizm-design/prizm` (PRIZM 4.0).
It is used to design new components and guidelines that will later be contributed back to PRIZM.
Read `PRIZM.md` first — it is the source of truth for PRIZM's conventions. This file only adds the
rules for contribution work.

## Repo and branches

- `origin` = `yanqikwok/prizm` (this fork, public — anything pushed is visible to everyone).
- `upstream` = `prizm-design/prizm` (the original). Never push to `upstream`.
- AI design system work (components, patterns and guidelines) happens on the `ai-design` branch, not `main`. Keep `main` identical to
  `upstream/main` so it can be synced cleanly (`gh repo sync` or `git pull upstream main`).
- The repo is worked on from two MacBooks. Start every session with `git pull`; end with a commit and
  `git push` so the other machine can continue.
- One commit per component step, with a message like `Proposed: <Name> — guideline doc`.

## The contribution workflow

The full workflow, the tracker, and the per-component checklist live in `contributions/README.md`.
In short, for each component:

1. **Source** — the source screen goes in `contributions/source-screens/<screen-name>/` (HTML export
   plus PNG). That folder is git-ignored and must stay that way: never commit screens, crops of
   screens, or screen text to this public fork. Guideline docs describe components in PRIZM terms
   rather than quoting product content.
2. **Reuse check** — before writing anything, apply PRIZM's "Reuse before you build" rule: name the
   existing PRIZM components that come closest (`llms.txt`, `lib/components-api.ts`, extension packs)
   and why each doesn't fit. If one fits with a new variant, propose the variant instead of a new
   component.
3. **Guideline doc** — copy `contributions/component-template.md` to `llms/<slug>.md` and fill it in.
4. **Code** — `components/ui/<slug>.tsx` (or `components/<pack>/<slug>.tsx` if it belongs to an
   extension pack), following PRIZM's component conventions exactly.
5. **Register** — add an entry to `lib/components-registry.ts` with `status: "alpha"`.
6. **Verify** — `pnpm verify` must pass before pushing.

## Rules specific to proposed components

- **Status is `alpha`** in both the registry and the doc frontmatter. PRIZM's statuses are only
  `stable | alpha | planned`; do not invent new ones.
- **Do not add alpha components to `lib/components-api.ts`.** `pnpm audit:components` requires every
  `COMPONENT_API` key to match a `stable` registry entry. Document props in the doc's
  "Props" table by hand instead; move them into `components-api.ts` when the component is
  promoted to stable.
- **Mark every addition as a proposal.** Each guideline doc carries `proposed-by` and `source-screen`
  in its frontmatter, so reviewers can tell fork additions from PRIZM's own.
- **Additions to guidelines go in clearly labelled sections** (see the template), never by editing
  PRIZM's existing docs. If an existing PRIZM guideline seems wrong or incomplete, note it in the
  relevant component doc's "Open questions" section rather than changing it.
- **Behaviour from Base UI, look from PRIZM.** For a component PRIZM doesn't
  have, build on the matching Base UI primitive (`@base-ui-components/react/<part>`, imported as
  `import { X as BaseX } from "@base-ui-components/react/x"`, as in `components/ui/dialog.tsx`) for
  structure, keyboard handling and accessibility. All styling — colours, radius, spacing, type,
  motion — comes from PRIZM's tokens and existing component patterns, never Base UI's demo styles.
  Note the primitive used in the doc's intro and in the registry's `builtOn` field. If no Base UI
  primitive fits, say so in the doc's reuse check.
- **Semantic tokens only** — no raw colours. If a component needs a token PRIZM doesn't have, note it
  in the doc's "Open questions" section instead of adding one to `styles/tokens/`.
- `pnpm check:links` scans code only, not Markdown — check links in guideline docs by hand and only
  link to pages that exist.
