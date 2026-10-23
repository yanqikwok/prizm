---
component: <slug>
slug: <slug>
status: alpha
source: components/ui/<slug>.tsx
proposed-by: yanqikwok
source-screen: contributions/source-screens/<file>
---

<!--
  Copy this file to llms/<slug>.md and fill it in. Sections up to "Examples" mirror PRIZM's
  own component docs (see llms/button.md, llms/rc3/safety-actions.md) — keep their order and
  wording style. Sections under "Proposed additions" are new guidance this fork adds; delete
  any that don't apply. Delete these comments when done.
-->

# <Component name>

<One sentence: what the component does. Then one sentence on where it sits in PRIZM —
primitive, composite, or extension-pack organism.> Built on Base UI `<Primitive>`.

## When to use

- <The situation this component is for.>

## When NOT to use

- <Situation> — use `<ExistingPrizmComponent>` instead.

## Variants

| variant | When to use |
|---------|-------------|
| `<name>` | <When> |

## Sizes

| size | Use case |
|------|----------|
| `md` | Default |

## States

- **Default** — <description>
- **Hover / Focus** — <description>
- **Disabled** — <description>
- **<Other states seen in the source screen: loading, error, empty, selected…>**

## Visual treatment

<Which semantic tokens it uses (`bg-bg`, `text-fg`, `border-border`, `bg-accent`…) and any
zone differences between C3 and Enterprise. No raw colour values.>

## Accessibility

- <Role / Base UI primitive it wraps, keyboard behaviour, required `aria-*` labels.>

## Examples

```tsx
<ComponentName />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Hand-written while this component is alpha. Moves to `lib/components-api.ts` when promoted to stable._

---

# Proposed additions

## Reuse check

PRIZM components considered before building this one (per PRIZM.md, "Reuse before you build"):

| PRIZM component | Why it doesn't fit |
|---|---|
| `<Component>` | <Reason> |

## Anatomy

<Named parts of the component. Don't paste crops of the source screen — screens stay out of git.>

1. **<Part>** — <purpose>

## Content guidelines

- <Label length, capitalisation, tone, truncation rules.>

## Do / Don't

| Do | Don't |
|---|---|
| <Correct usage> | <Incorrect usage> |

## Source

- Screen: `<source-screen file>`, <where in the screen it appears>.
- Product / zone: <C3 or Enterprise, and extension pack if any>.

## Open questions

- <Anything that needs a decision from PRIZM's maintainers: new tokens, naming, overlap with an existing component.>
