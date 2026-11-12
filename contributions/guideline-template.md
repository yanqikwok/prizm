---
guideline: [slug]
slug: [slug]
status: alpha
applies-to: [[component-or-pattern-slug]]
---

<!--
  Copy this file to llms/guidelines/[slug].md and fill it in. Delete these comments and every
  italic instruction line (the ones starting "*Explain…" / "*List…" etc.) when done.

  WHAT MAKES A GUIDELINE
  A guideline is a rule set that applies ACROSS components and patterns. It has no UI of its own.
  If you can point to one thing on screen, it's a component. If it describes a task flow built
  from several components, it's a pattern. If it says "everything of this kind must behave, look
  or read this way", it's a guideline. See contributions/pattern-template.md for the full
  comparison table.

  Write rules so they can be checked. "Must show the source" can be verified; "should feel
  trustworthy" cannot.

  Reuse check (do it before writing, nothing to write up): read the foundation pages
  (/docs/principles, /docs/colors, /docs/typography, /docs/surface-and-motion, /docs/icons,
  /docs/liquid-glass) and any component doc that already states this rule. If a neighbour covers
  part of it, point to it at the end of "Purpose and scope".

  Don't edit PRIZM's existing foundation pages. If one is wrong or incomplete for AI, note it in
  "Open questions" at the bottom.

  Links: while this is alpha, link to other docs by file path (/llms/[slug].md), because alpha
  components have no docs-site page. When the component is promoted to stable, change those links
  to docs-site routes (/components/[slug]), as PRIZM's own docs do.

  Placeholders use [square brackets] because <angle brackets> are hidden by Markdown previews.
-->

# [Guideline name]

*One sentence: what this guideline governs and who it is for.*

[This guideline governs … for … .]

## Purpose and scope

*Why this guideline exists: the problem it prevents or the outcome it protects. What it covers, in plain terms. If a neighbouring guideline covers something people might confuse with this one, end with one line pointing to it. Leave that line out if there is no neighbour.*

- **Why it exists:** [The problem it prevents or the outcome it protects.]
- **What it covers:** [In plain terms.]

For [what the neighbouring guideline covers], see [Neighbour guideline name](/llms/guidelines/[slug].md).
*(Example: "For how an answer was produced, see Explainability." Delete this line if there is no neighbour.)*

## Applies to

*List each component or pattern this guideline governs, and what it requires of it.*

- [[Component or pattern name]](/llms/[slug].md): [one line on what this guideline requires.]

## Rules

*Numbered, short, imperative. Each rule has: must or should, the rule, and a one-line reason. If there are more than about eight, group them under subheadings.*

1. **Must** [rule]. *Why:* [reason.]
2. **Should** [rule]. *Why:* [reason.]

## Do and Don't

*Pair a good and a bad example for the rules people break most often. Name the rule each example illustrates. Use neutral content.*

- **Do:** [example] *(Rule 1)*
- **Don't:** [example] *(Rule 1)*

## Exceptions

*When a rule may be broken, under what conditions, and who decides. If there are none, write "None."*

None.

## Review checklist

*Optional. A short list of yes/no questions a designer can run before shipping. Skip this section if it would only repeat the rules.*

- [ ] [Question that should be answered yes.]

## Related

*Links only.*

- **Guidelines:**
- **Patterns:**
- **Components:**
- **External references:**

## Open questions

*Only what needs a decision from PRIZM's maintainers: a gap or error in an existing PRIZM guideline, or a token that doesn't exist. Delete this section if there is nothing.*

- **[The question, as a question?]** [Elaboration: the context, what this proposal does for now, and what would change if the answer is yes.]
