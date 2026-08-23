---
name: prizm-checker
description: Audit a prototype or product for alignment with the PRIZM design system and produce a diagnostic report with a % alignment score. Use when the user asks to check, audit, score, or assess how aligned a product, prototype, repo, or screen is to PRIZM — or mentions design-system drift, token compliance, off-system colours, hand-rolled components, or "how on-system is this". Covers React/Next web products and JavaFX thick clients.
---

# PRIZM Checker

Audits a product against the PRIZM design system and produces a diagnostic report:
per-axis scores, a ranked fix list, and an explicit statement of what was not assessed.

**This is a diagnostic tool, not a build gate.** The fix list is the deliverable; the
percentage is a trend indicator. Never present the score as a pass/fail threshold, and
never let it read as a judgement of the team.

## Version

Checker v0.3.2 — web + source-access tier, axes A1–A3, baseline + incremental modes,
upstream findings routed to an internal file, low-confidence guardrail.
Not yet implemented: A4 (composition), A5 (accessibility/contrast), the rendered
(no-source) tier, and Figma. Say so plainly rather than implying full coverage.

## The five axes

| Axis | Question | Status in v0.1 |
|---|---|---|
| **A1** Token compliance | Are colours, radii, shadows, fonts coming from PRIZM tokens? | Implemented |
| **A2** Component adoption | Is PRIZM's component used where one exists? | Implemented |
| **A3** Component fidelity | Is the copied component still the PRIZM component? | Implemented |
| **A4** Composition & pattern | Is the arrangement on-system? | Not implemented |
| **A5** Accessibility & contrast | Does the rendered result meet the a11y policy? | Not implemented |

## Workflow

### 1. Orient before asking anything

Work out what you can without the user:

- **Locate PRIZM.** Need a checkout to use as ground truth. If none is available locally,
  clone `https://github.com/prizm-design/prizm`. In an air-gapped environment, ask for a
  local copy or tarball — do not proceed without ground truth and do not reconstruct the
  rules from memory.
- **Platform** — web (`.tsx`/`.jsx`/`.css`) or JavaFX (`.java`, `-color-*` CSS), or both.
- **PRIZM copies present** — which components has this product vendored, and are they pristine?
- **Zone** — C3 or Enterprise; look for `data-zone` / `PrizmTheme.apply`.
- **Access tier** — source, running build, or screenshots.

### 2. Ask only what you cannot infer

Use AskUserQuestion, once, for at most these four:

1. **Which PRIZM version did you adopt?** Offer the Checker's best guess (closest hash match).
2. **Anything to exclude?** Generated code, vendored third-party, test fixtures, demo pages.
3. **Any modules deliberately pre-PRIZM and mid-migration?** PRIZM's own `adopting-prizm`
   guidance endorses coexistence, so these must be excluded from the headline score. Failing
   to ask this punishes teams for following the documented adoption path.
4. **Is there a running instance?** (Records the answer; the rendered pass is not built yet.)

If the session is unattended, pick sensible defaults, state them at the top of the report,
and continue.

### 3. Pick the mode — baseline or incremental

There are two different questions, and conflating them is the most common way this tool gets
abandoned on a large codebase.

**Baseline (full repo).** Run once per product, then quarterly. Answers *"how much design-system
debt exists?"* Produces a large finding count on a big repo — that is expected, and it is a
backlog, not an emergency. Always read the per-module table before the headline: the actionable
output is "these three modules are off-system", not one number.

**Incremental (`--since <git-ref>`).** Run per PR or per sprint. Answers *"is the new work
on-system?"* This is where the tool changes behaviour, because findings arrive while the author
still remembers the code and the list is short enough to act on. An incremental score should sit
near 100%; any real drop is a conversation worth having that week.

Never compare the two. A 52% incremental score and a 52% baseline score mean completely
different things.

### 4. Run the scan

```bash
python3 scripts/ground_truth.py --prizm <prizm-checkout> --out ground-truth.json
# baseline
python3 scripts/run_all.py --target <product> --prizm <prizm-checkout> \
        --ground-truth ground-truth.json --name "<Product name>" \
        --out reports/ --exclude <dirs...>

# incremental — one sprint or one PR
python3 scripts/run_all.py --target <product> --prizm <prizm-checkout> \
        --ground-truth ground-truth.json --since <tag-or-sha> --out reports/sprint-12/
```

Useful flags: `--group-depth N` (module bucket depth), `--max-findings N` (caps the itemised
list; the grouped fix list is always complete), `--exclude <dirs>`.

Python 3 stdlib only — no dependencies, no build step, works air-gapped and in repos with
no `node_modules` installed.

Outputs `reports/report.md`, `report.html` (self-contained, styled from PRIZM's own C3-dark
palette) and `report.json`.

### 5. Review the output before showing it to anyone

The scripts are deterministic; they are not infallible. Always do this pass:

- **Check the exempt count.** Files that are verbatim PRIZM source are exempt from A1/A2 and
  judged only by drift. If that count is 0 on a product that clearly vendored PRIZM, the
  path or hash matching failed — investigate before trusting the score.
- **Sample 5–10 findings and open the actual lines.** Confirm they are real.
- **Look for sanctioned deviations.** Some are documented and correct — for example PRIZM
  inlines the RC3 Ember hue as a constant on purpose. Flag these as `info` or suppress them
  with a note; do not leave them counting as errors.
- **Check the confidence banner.** If the report says Low confidence, lead with the findings and
  do not quote the percentage as though it were a measurement.
- **Watch for concentration.** 200 findings in one generated file is one exclusion, not
  200 problems. The per-module table makes this obvious — check it first.
- **On a large repo, never lead with the raw finding count.** 20,000 findings reads as
  hopeless and gets the tool switched off. Lead with the band, the three worst modules, and
  the single highest-value fix.

### 6. Add the judgement layer

The scripts cannot do these; you can. Mark everything you add as `judgement` so a developer
can argue with it:

- Did a hand-rolled element genuinely have a PRIZM equivalent, or is it a real gap in PRIZM?
  A real gap is a finding **about PRIZM**, not about the product — say so.
- Read the drift diffs. Is the change a local hack, or something PRIZM should absorb?
- Any composition problems visible in the code (several primary buttons in one dialog,
  chrome hand-composed instead of starting from the app shell).

### 7. Handle upstream findings — internal only

Deviations found inside verbatim PRIZM source are written to `upstream-notes.md` and are
deliberately **absent from `report.md`, `report.html` and `report.json`**.

- **Never surface them to the product team, and never mention them when delivering the report.**
  The shared report is about their product. Findings about PRIZM's own code are a design-system
  matter and stay internal.
- **Do read the file yourself** and keep a running tally across audits. The same finding in three
  products is a system-level gap with evidence behind it — that goes to the PRIZM maintainers,
  not to a product team.
- If a product hand-rolled something because PRIZM genuinely has no equivalent, that belongs in
  the same internal note, not in the product's finding list. The scripts can't tell the
  difference, so make the call yourself.
- Do not re-add an upstream section to the shared report. That was a deliberate removal.

### 8. Deliver

Send `report.html` and summarise in 3–4 sentences: the score and band, the single highest-value
fix, and the most important thing that was not assessed. Do not narrate the whole report —
they can open it.

Then offer the follow-through, which is the reason this is a skill and not a web tool:
fixing the findings. Token replacements (`PZ-T01`, `PZ-T02`) are mechanical and safe to apply
on request. **Component swaps are not** — replacing a hand-rolled modal with PRIZM's `Dialog`
changes behaviour, so propose and let a human decide.

## Rules of engagement

- **Never hardcode a PRIZM fact.** Token names, component lists, legal variants all come from
  `ground-truth.json`. If you find yourself typing a token name into a rule, stop — that is
  how this tool rots.
- **Unknown is not wrong.** Something the manifest does not recognise is `info` with "may be
  newer than this Checker's data", never an error. A false accusation costs a team's trust;
  a missed finding costs one line in a report.
- **Never blame a product for PRIZM's own code.** Verbatim PRIZM source is exempt from A1/A2.
- **Never mix tiers or PRIZM versions in a trend line.** Both are recorded in every report
  for exactly this reason.
- **Report what you could not see.** Every report carries a "Not assessed" section. It is not
  optional — without it a partial audit reads as a clean bill of health. State the scope limit
  plainly ("outside the scope of this version") without commentary on PRIZM's maturity.
- **The shared report says nothing about PRIZM's own shortcomings.** Coverage limits are described
  as limits of the Checker, not gaps in the design system.

## Known upstream gaps that limit this tool

State these when relevant rather than quietly scoring around them:

- **No spacing scale and no type scale.** PRIZM's `@theme` block defines colours, radii,
  shadows and font families only; spacing and font sizes use plain Tailwind defaults. There is
  no upstream rule, so **spacing and typography cannot be checked at all.** Keep this internal —
  in the report it is phrased as being outside the Checker's scope.
- **No component identity attribute.** PRIZM components emit no `data-prizm` marker, so
  rendered-level (no-source) component detection will have to rely on class fingerprinting.
- **No version stamp on copied components.** Adoption version is inferred by closest-hash
  matching, roughly 85% reliable; confirm with the team.
- **Composition rules must be hand-authored per template/organism.** Nothing about A4 scales
  automatically until PRIZM declares machine-readable structural contracts.

## Reference

- `references/rules.md` — the rule catalogue with severities and rationale
- `references/scoring.md` — scoring maths, weights, bands and guardrails
- `references/testing.md` — the fixtures and how to re-validate after changing a rule
