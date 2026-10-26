---
pattern: [slug]
slug: [slug]
type: pattern
layer: ai-design-system
status: alpha
proposed-by: yanqikwok
source-screen: contributions/source-screens/[file]
components: [[slug], [slug]]
guidelines: [[slug]]
---

<!--
  Copy this file to llms/patterns/[slug].md and fill it in. Delete these comments and every
  italic instruction line when done.

  WHAT MAKES A PATTERN
  A pattern is a reusable solution to a recurring USER PROBLEM, expressed as an arrangement of
  several components plus the behaviour between them (sequence, hand-offs, timing, fallbacks).
  It answers "how does the user accomplish [task] with the AI?" rather than "what is this
  control?" or "what rule must this obey?".

  |                | Component             | Pattern                           | Guideline                  | Template (existing PRIZM)        |
  |----------------|-----------------------|-----------------------------------|----------------------------|----------------------------------|
  | Answers        | What is this control? | How does the user do this task?   | What rule must this obey?  | What does this screen look like? |
  | Made of        | Own code + props API  | Several components + behaviour    | Prose, tokens, principles  | Several components, laid out     |
  | Code artifact  | Yes, one file         | No new component code*            | None                       | Yes, a page scaffold             |
  | Scope          | One element           | One task or flow, on any screen   | Cross-cutting              | One full screen                  |
  | Lives in       | llms/[slug].md        | llms/patterns/[slug].md           | llms/guidelines/[slug].md  | app/[zone]/templates/            |

  * A pattern may ship an example composition for the docs site. If you need a new reusable code
    unit with its own props, that is a component: split it out.

  FOUR-QUESTION TEST: it is a pattern only if all are true.
    1. It solves a recurring user problem (not one screen, not one control).
    2. It uses two or more components in a defined arrangement.
    3. It specifies behaviour between those components (what happens, in what order, who acts).
    4. Removing any one component breaks the solution rather than just changing its look.
  Fails 2 → component or variant. Mostly rules, no flow → guideline. One whole screen → template.

  Components and guidelines are linked, never restated. Component specs live in the component's
  doc; rules live in the guideline.

  Links: while this is alpha, link to other docs by file path (/llms/[slug].md), because alpha
  components have no docs-site page. When the component is promoted to stable, change those links
  to docs-site routes (/components/[slug]), as PRIZM's own docs do.

  Placeholders use [square brackets] because <angle brackets> are hidden by Markdown previews.
-->

# [Pattern name]

*One sentence: "When [situation], [arrangement] so the user can [outcome]."*

[When …, … so the user can … .]

## Purpose

*What the user is trying to do and why this pattern exists.*

[The recurring problem, what goes wrong without the pattern, and what it gives the user.]

## When to use

*The situations and user goals this pattern is for.*

- [Situation or user goal.]

## When NOT to use

*Name the neighbouring pattern or component for each "not" case, as the component template does.*

- [Situation]: use [neighbouring pattern] instead.
- [Situation]: use [component] instead.

## Components used

*A table of component, its role in the flow, and a link to its doc. Don't restate their specs.*

| Component | Role in the flow | Doc |
|---|---|---|
| `[Component]` | [What it does, and at which step] | [[slug]](/llms/[slug].md) |

## The flow

*Numbered steps. For each step, say what the AI does and what the user does. This section is the core of a pattern.*

1. **[Step name]**
   - **AI:** [What the AI does or shows.]
   - **User:** [What the user does or decides.]
   - **UI:** [Which component carries this step.]
2. **[Step name]**
   - **AI:** […]
   - **User:** […]
   - **UI:** […]

## States across the flow

*Only states that span components, for example generating, paused and failed. Component-level states stay in the component's doc.*

| State | What the user sees | Components involved | What the user can do |
|---|---|---|---|
| [Generating] | [description] | [list] | [stop, edit, wait] |
| [Paused] | [description] | [list] | [resume, cancel] |
| [Failed] | [description] | [list] | [retry, recover] |

## Variations

*Variations change the arrangement or the flow, not just props. For example, content review vs agent action approval in Human-in-the-loop. Delete this section if there are none.*

| Variation | When to use | What changes in the flow |
|---|---|---|
| [name] | [When] | [Which steps or components differ] |

## Failure and edge cases

*AI-specific ones: model failure, empty or partial results, the user leaving mid-flow. For each, say what the user sees and what they can do next.*

| Case | What happens | What the user can do |
|---|---|---|
| Model failure or timeout | [description] | [retry, edit, abandon] |
| Empty result | [description] | […] |
| Partial result | [description] | […] |
| User leaves mid-flow | [is work kept, resumed or discarded?] | […] |
| [Other] | […] | […] |

## Accessibility

*Cross-component concerns: focus order, announcements as the flow changes, keyboard path through it.*

- **Focus order:** [Where focus starts, and where it moves after each step.]
- **Announcements:** [What is announced as the flow changes state, and how (live region politeness).]
- **Keyboard path:** [How to complete the whole flow without a pointer.]

## Examples

*At least one end-to-end example with neutral content (for example a generic document, a to-do list or a recipe). Don't use SharePoint or other product-specific content.*

### [Example name]

[One or two lines on the scenario.]

```tsx
[Composition showing the flow end to end]
```

## Related guidelines

*Link the guidelines that govern it.*

- [[Guideline name]](/llms/guidelines/[slug].md): [what it governs in this pattern]

---

# Proposed additions

## Reuse check

*Existing PRIZM patterns, templates or compositions considered (per PRIZM.md, "Reuse before you build"), and why each doesn't fit.*

| Existing | Why it doesn't fit |
|---|---|
| [template or composition] | [Reason] |

## Source screen

*Delete this section if the pattern isn't drawn from a screen.*

- Screen: `[source-screen file]`, [where the pattern appears]. Describe it in PRIZM terms; don't quote product content.
- Product / zone: [C3 or Enterprise, and extension pack if any].

## Open questions

*Components this pattern needs that don't exist yet, new tokens, overlap with an existing template.*

- [Question.]
