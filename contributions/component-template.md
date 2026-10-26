---
component: [slug]
slug: [slug]
type: component
layer: ai-design-system
status: alpha
source: components/ui/[slug].tsx
built-on: Base UI [Primitive]
proposed-by: yanqikwok
source-screen: contributions/source-screens/[file]
---

<!--
  Copy this file to llms/[slug].md and fill it in. Everything above "Proposed additions" mirrors
  PRIZM's own component docs (llms/dialog.md, llms/button.md, llms/rc3/safety-actions.md): keep
  that order and wording style. Everything under "Proposed additions" is new guidance this fork
  adds; delete any section that doesn't apply. Delete these comments and every italic instruction
  line when done.

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

*One sentence: what the component does. Then one sentence on where it sits in PRIZM (primitive, composite, or extension-pack organism) and its role in the AI design system. End with the Base UI primitive it is built on.*

[What the component does.] [Where it sits in PRIZM and its role in the AI design system.] Built on Base UI `[Primitive]`.

## UI visuals

*Show what it looks like using live PRIZM renders or a Figma link, not crops of the source screen (screens stay out of git). Describe the default composition in a line or two.*

- Preview: `[docs-site path or Figma link]`
- [One or two lines on the default composition.]

```tsx
<ComponentName />
```

## Sub-components

*List each part a consumer can import. Delete this section if the component is a single element.*

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

*The role or Base UI primitive it wraps, keyboard behaviour, and required `aria-*` labels, live-region behaviour and focus management.*

- [Role / Base UI primitive it wraps.]
- [Keyboard behaviour: keys and what they do.]
- [Required `aria-*` labels, live-region behaviour, focus management.]

## Examples

*At least one realistic example. Use neutral content.*

```tsx
// [What this example shows]
<ComponentName />
```

## Props

*Hand-write the table while the component is alpha.*

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Hand-written while this component is alpha. Moves to `lib/components-api.ts` when promoted to stable._

## Source

The canonical source lives at `components/ui/[slug].tsx`. Copy it into the consumer's project at the same relative path. Required peer dependencies: `class-variance-authority`, `clsx`, `tailwind-merge` [, plus any others this component needs].

---

# Proposed additions

## Reuse check

*PRIZM components considered before building this one (per PRIZM.md, "Reuse before you build"), and why each doesn't fit. Say which Base UI primitive is used, or why none fits.*

| PRIZM component | Why it doesn't fit |
|---|---|
| `[Component]` | [Reason] |

Base UI primitive used: `[Primitive]`, or [why none fits].

## Anatomy

*Name the parts of the component. Don't paste crops of the source screen.*

1. **[Part]**: [purpose]

## Content guidelines

*Label length, capitalisation, tone and truncation rules.*

- [Rule.]

## Do / Don't

*Pair a correct and an incorrect use. Use neutral content.*

| Do | Don't |
|---|---|
| [Correct usage] | [Incorrect usage] |

## Supplementary guidelines

*Only if this component needs more than the sections above, such as streaming behaviour, density, motion, responsive behaviour or localisation. One subheading per topic. If a topic applies to more than this component, write a guideline and link to it instead.*

### [Topic]

[Guidance.]

## Related

*Links only.*

- **Patterns that use this component:** [pattern slug, or none yet]
- **Guidelines that apply:** [guideline slug, or none yet]

## Source screen

*Delete this section if the component isn't drawn from a screen.*

- Screen: `[source-screen file]`, [where in the screen it appears]. Describe it in PRIZM terms; don't quote product content.
- Product / zone: [C3 or Enterprise, and extension pack if any].

## Open questions

*Anything that needs a decision from PRIZM's maintainers: new tokens, naming, overlap with an existing component.*

- [Question.]
