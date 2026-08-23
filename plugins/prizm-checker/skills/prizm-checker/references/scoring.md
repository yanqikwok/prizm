# Scoring

## Per axis

```
axis_score = max(0, 1 - weighted_violations / opportunities) × 100
weighted_violations = Σ severity_weight(finding)     error 1.0 · warn 0.4 · info 0.1
```

Denominators are **opportunities**, never files or lines:

| Axis | Opportunity = |
|---|---|
| A1 | compliant token references + token violations |
| A2 | PRIZM component usages + hand-rolled candidates + parallel-library imports |
| A3 | vendored copies checked + variant-prop usages checked |

Violations per file is noisy; violations per line is gameable and makes a large product look
better than a small one purely by dilution.

## Overall

Weighted mean of the axes actually measured, renormalised over their weights.

| Axis | Weight | Rationale |
|---|---|---|
| A1 Token compliance | 30% | Highest leverage, most objective, predicts theme breakage |
| A2 Component adoption | 25% | The core "reuse before you build" mandate |
| A3 Component fidelity | 20% | Invisible-but-corrosive; nothing else can see it |
| A4 Composition | 15% | High value, lowest reproducibility — capped deliberately |
| A5 A11y / contrast | 10% | Partly covered by PRIZM's own CI; avoid double-counting |

In v0.1 only A1–A3 run, so the effective split is A1 40% / A2 33% / A3 27%. Unmeasured axes
are reported as `n/a` and named in "Not assessed" — **never** treated as 100%.

## Bands

| Band | Range |
|---|---|
| Aligned | ≥ 90 |
| Mostly aligned | 75–89 |
| Partial | 50–74 |
| Off-system | < 50 |

Lead with the band. It absorbs the few points of wobble that judgement findings introduce, and
it is what a non-engineer can actually act on.

## Guardrails

- Always show per-axis scores next to the headline. One number tells a team nothing about what to do.
- Always record access tier, PRIZM version + SHA, and Checker version. Two reports differing in
  any of the three are not comparable.
- Newly-shipped components need a grace period before `PZ-C01` escalates from `info` to `error`.
  Otherwise a PRIZM release makes every product's score drop with no change to the product.
- **Flag thin evidence.** An axis with fewer than 15 opportunities, or a report with fewer than 60
  in total, is marked Low confidence with the reason stated at the top. A score off a handful of
  sites moves several points on one finding; presenting that as a measurement is how the tool
  loses credibility on its first report.
- **Upstream findings never affect a score and never appear in the shared report.** Deviations
  inside verbatim PRIZM source go to an internal `upstream-notes.md`: the product team can neither
  fix them nor be fairly charged for them, and the design system's own gaps are not a product
  team's business.
- Exclusions belong in a reviewed per-product config, not in ad-hoc command-line flags that
  nobody can audit later.

## Calibration (v0.2.0, PRIZM 4.0.0-alpha.1 @ 40c727a8)

| Control | Expected | Actual |
|---|---|---|
| `fixtures/bad-product` — deliberately off-system | low | **32.1%** Off-system (A1 18.3 / A2 33.3 / A3 51.4) |
| `fixtures/good-product` — compliant consumer | high | **100.0%** Aligned, 0 findings |
| PRIZM repo, exemption on | near-silent | **97.1%**, 16 warns (all `PZ-D03`) |
| PRIZM repo, `--treat-as-consumer` | moderate, mostly true positives | **92.2%**, 356 findings |

Re-run all four after changing any rule. A rule that moves the good fixture off 100% or the bad
fixture above ~50% needs justifying before it ships.


## Large codebases

Two things break at scale, and only one of them is the scanner.

**Runtime does not break.** Measured: 401 files in 0.5 s, 7,049 files in 21.6 s, peak RSS 41 MB.
Linear in bytes scanned. A 50k-file monorepo is a coffee break, not an engineering problem.

**The report breaks completely.** The same 7,049-file run produced 20,577 findings — a 3 MB
Markdown file and an 11 MB JSON sidecar in the first implementation. Nobody opens that, and a
number attached to a list nobody reads changes no behaviour.

Three mechanisms address it:

1. **Per-module rollup** (`--group-depth`). The same maths applied per directory bucket, sorted
   worst-first. On the synthetic monorepo this immediately isolated the offending module at 50.9%
   against an 84.2% overall. "These three modules are off-system" is actionable; "you have 20,577
   findings" is not. Buckets below 20 opportunities are folded together — a score computed off
   three sites is noise.
2. **Grouped fix list.** Findings collapse by rule × message, ranked by severity × frequency. One
   rule hit 400 times is one fix, not 400 problems. This list is never truncated.
3. **Itemised cap** (`--max-findings`, default 300). Highest-severity first. Cut report.md from
   3 MB to 43 KB and report.json from 11 MB to 1 MB with no loss of actionable content.

**Do not ask the team to break up their codebase to suit the tool.** That is solving the wrong
problem — the module rollup already gives per-area scores without touching their repo structure,
and `--exclude` handles anything genuinely out of scope.

## Where this belongs in the cadence

| Cadence | Mode | Purpose | Expected score |
|---|---|---|---|
| Once, at adoption | baseline | Establish the debt number and the backlog | whatever it is |
| Every PR (or nightly) | `--since <base>` | Stop new drift at the door | ~100%, investigate any drop |
| End of sprint | `--since <last-sprint-tag>` | One short, actionable list while authors still remember the code | ~100% |
| Quarterly | baseline | Has the debt actually moved? | trending up |

The end-of-sprint incremental run is the highest-value cadence: measured at 0.48 s and 8 findings
on a 7,000-file repo, versus 21.6 s and 20,577 findings for the baseline. Same tool, same rules —
but one of those lists gets fixed.

Baseline-only auditing fails a specific way: the number is large, nobody feels ownership of debt
they inherited, and the audit becomes an annual ritual. Incremental auditing makes each team
responsible only for what they just wrote, which is the only scope anyone acts on.
