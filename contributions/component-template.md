---
component: [slug]
slug: [slug]
status: alpha
source: components/ui/[slug].tsx
built-on: [PRIZM component, or Base UI Primitive]
---

<!--
  Copy this file to llms/[slug].md and fill it in. Everything above "Proposed additions" mirrors
  PRIZM's own component docs (llms/dialog.md, llms/button.md, llms/rc3/safety-actions.md): keep
  that order and wording style. Keep that shape: the docs site reads this file. Delete these comments and every italic instruction
  line when done.

  Reuse check (do it before writing, nothing to write up as a section): look through llms.txt,
  lib/components-api.ts and the extension packs for the PRIZM components that come closest. Name
  each one in "When NOT to use" with the reason it doesn't fit. Build from PRIZM components first,
  and say in the intro and in `built-on` what this is built on; use a Base UI primitive only for
  a part PRIZM has no component for, and if none fits, say so in the intro.

  Need more guidance than the sections below (streaming, density, motion, localisation)? Add a
  "## Supplementary guidelines" section with one ### per topic. If a topic applies to more than
  this component, write a guideline and link to it instead.

  Is this really a component? A component is ONE code-backed UI unit with its own props API.
  If it only works by composing several components, it's a pattern (contributions/pattern-template.md).
  If it's rules with no UI of its own, it's a guideline (contributions/guideline-template.md).

  Links: while this is alpha, link to other docs by file path (/llms/[slug].md), because alpha
  components have no docs-site page. When the component is promoted to stable, change those links
  to docs-site routes (/components/[slug]), as PRIZM's own docs do.

  Placeholders use [square brackets] because <angle brackets> are hidden by Markdown previews.
  Inside code fences and backticks, angle brackets are fine.
-->

# [Component name]

*One sentence: what the component does. Then one sentence on where it sits in PRIZM (primitive, composite, or extension-pack organism) and its role in the AI design system. End with what it is built on: a PRIZM component, or a Base UI primitive when PRIZM has none.*

[What the component does.] [Where it sits in PRIZM and its role in the AI design system.] Built on [PRIZM `Component` or Base UI `Primitive`].

## Sub-components

*List each part a consumer can import, one bullet each in the form "`Name` — description". The docs-site page reads these bullets, so keep that form. Delete this section if the component is a single element.*

- `[Name]` — root provider
- `[NameTrigger]` — [purpose]
- `[NameContent]` — [purpose]

## When to use

*The situations this component is for.*

- [The situation this component is for.]

## When NOT to use

*Name the existing PRIZM component to use instead for each "not" case.*

- [Situation]: use `[ExistingPrizmComponent]` instead.

## Variants

*One row per variant, with when to use it.*

| variant | When to use |
|---------|-------------|
| `[name]` | [When] |

## Sizes

*Delete this section if the component has a single size.*

| size | Use case |
|------|----------|
| `md` | Default |

## States

*Keep only the states that apply to this component.*

- **Default** — [description]
- **Hover** — [description]
- **Focus** — [description]
- **Active / pressed** — [description]
- **Disabled** — [description]
- **Loading** — [description]
- **Error** — [description]
- **Empty** — [description]
- **Selected** — [description]

## Visual treatment

*Which semantic tokens it uses (`bg-bg`, `text-fg`, `border-border`, `bg-accent`…) and any zone differences between C3 and Enterprise. No raw colour values.*

- [Tokens used, and where.]

## Accessibility

*What a developer needs to know or do to make this component accessible, and what it already does for them. Delete points that don't apply. Delete the whole section if the component is purely presentational.*

- **Name and role**
  - [The role, and the PRIZM component or Base UI part it wraps.]
  - [What gives it an accessible name. Icon-only controls need an `aria-label`.]
- **Keyboard and focus**
  - [Keys and what they do (Tab, Enter, Space, Escape, arrows). Every action works without a mouse.]
  - [Where focus goes when an overlay opens or closes or an action completes. Overlays return focus to the trigger on close.]
  - [The focus ring stays visible. Never remove the outline without a replacement.]
- **State and announcements**
  - [States assistive technology can tell: errors (`aria-invalid` with `aria-describedby`), disabled, busy, pressed or expanded. Never rely on colour alone.]
  - [Content that changes without the user acting (streaming, loading, results): a polite live region (`role="status"`), or `role="alert"` for urgent errors only.]

## Examples

*At least one realistic example. Use neutral content.*

```tsx
// [What this example shows]
<ComponentName />
```

## Props

*Props are the settings a developer passes to the component, such as `variant="danger"` or `disabled`. This section lists them so developers and AI assistants don't have to read the code. Write it by hand while the component is alpha. The docs site builds the component's props table from it, so keep this shape:*

- *First table: the props of the main component (the root).*
- *Then, for each sub-component that has props of its own, a `###` heading with its name in backticks, and a table. Skip sub-components that have none. A sentence under the heading is shown as that sub-component's description.*
- *List only the props this component adds. Standard HTML attributes (`id`, `aria-*`, `onClick`…) are passed through, so don't list them.*
- *Types and defaults must match the code.*

| Prop | Type | Default | Description |
|---|---|---|---|
| `[prop]` | `[type]` | `[default, or —]` | [What it does, in one line.] |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

### `[SubComponentName]`

| Prop | Type | Default | Description |
|---|---|---|---|
| `[prop]` | `[type]` | `[default, or —]` | [What it does, in one line.] |

_Hand-written while this component is alpha. Moves to `lib/components-api.ts` when promoted to stable._


## Open questions

*Only what needs a decision from PRIZM's maintainers: new tokens, naming, overlap with an existing component, or a gap in an existing PRIZM guideline. Delete this section if there is nothing.*

- **[The question, as a question?]** [Elaboration: the context, what this proposal does for now, and what would change if the answer is yes.]
