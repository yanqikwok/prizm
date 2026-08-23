# PRIZM Checker v0.3.2

Audits a product against the PRIZM design system and produces a diagnostic report with a
% alignment score, a ranked fix list, and an explicit statement of what was not assessed.

Python 3 stdlib only. No dependencies, no build step, works air-gapped.

## Quick start

```bash
git clone https://github.com/prizm-design/prizm /tmp/prizm     # ground truth

python3 scripts/ground_truth.py --prizm /tmp/prizm --out ground-truth.json

python3 scripts/run_all.py \
  --target /path/to/product \
  --prizm /tmp/prizm \
  --ground-truth ground-truth.json \
  --name "My product" \
  --out reports/
```

Produces `reports/report.md`, `reports/report.html` and `reports/report.json`.

## Two modes

```bash
# Baseline — whole repo. Run once per product, then quarterly. "How much debt is there?"
python3 scripts/run_all.py --target /path/to/product --prizm /tmp/prizm \
  --ground-truth ground-truth.json --out reports/baseline/

# Incremental — changed files only. Run per sprint or per PR. "Is the new work on-system?"
python3 scripts/run_all.py --target /path/to/product --prizm /tmp/prizm \
  --ground-truth ground-truth.json --since sprint-11 --out reports/sprint-12/
```

Never compare an incremental score to a baseline score — they answer different questions.

## Measured performance

| Target | Files | Wall time | Peak RSS | Findings | report.md |
|---|---|---|---|---|---|
| PRIZM repo | 401 | 0.5 s | 19 MB | 356 | 41 KB |
| Synthetic monorepo | 7,049 | 21.6 s | 41 MB | 20,577 | 43 KB |
| Same monorepo, `--since` one sprint | 2 | 0.48 s | 19 MB | 8 | 3.6 KB |

Runtime is linear in bytes scanned and never the constraint — a 50k-file repo lands around
2–3 minutes. The constraint is human attention, which is what the per-module rollup, the
grouped fix list and `--max-findings` exist to manage.

## Upstream notes — internal only

A consumer's verbatim copies of PRIZM components are exempt from the token and adoption axes:
the product team didn't write that code and isn't scored on it. Those files are still scanned,
but anything found in them goes to **`upstream-notes.md`**, written alongside the report and
**never included in `report.md`, `report.html` or `report.json`**. The shared report contains
nothing about PRIZM's own code.

Keep it that way. The three report files are what a product team reads; `upstream-notes.md` is
for whoever maintains PRIZM. Discarding the check entirely would be worse than routing it —
a product audit is incidentally the cheapest audit of the design system you will ever get, and a
finding that recurs across several products is a system-level gap with evidence behind it.

Suppress the file too with `--no-upstream-file`.

## Low-confidence scores

An axis scored off fewer than 15 sites, or a report with fewer than 60 sites in total, is marked
**Low confidence** at the top with an explanation. A score built on a handful of sites swings
several points on one finding, and presenting it as a measurement is how a tool loses credibility.

## Other flags

| Flag | Purpose |
|---|---|
| `--since GITREF` | Incremental: only files changed since that ref |
| `--group-depth N` | Path depth for the per-module breakdown (default 2) |
| `--max-findings N` | Cap the itemised list (default 300). Grouped fix list stays complete |
| `--exclude DIR...` | Skip generated code, vendored libraries, demo pages |
| `--treat-as-consumer` | Disable the PRIZM-owned exemption. Stress-testing only |

## Check it works before trusting it

```bash
python3 scripts/run_all.py --target fixtures/good-product --prizm /tmp/prizm \
  --ground-truth ground-truth.json --out out/good   # expect 100%, 0 findings

python3 scripts/run_all.py --target fixtures/bad-product --prizm /tmp/prizm \
  --ground-truth ground-truth.json --out out/bad    # expect ~32%, ~34 findings
```

## What it covers

| Axis | v0.1 |
|---|---|
| A1 Token compliance — colours, radii, shadows, fonts, invented tokens, air-gap | ✅ |
| A2 Component adoption — hand-rolled elements, parallel component libraries, JavaFX controls | ✅ |
| A3 Component fidelity — drift vs upstream, illegal variants, overrides that fight the component | ✅ |
| A4 Composition & pattern | ❌ needs a rendered pass |
| A5 Accessibility & contrast | ❌ needs a rendered pass |

Not covered at all: **spacing and typography** — PRIZM does not define a spacing scale or a
type scale, so there is no upstream rule to check against.

## Design rules for anyone extending this

1. **Derive, never duplicate.** No PRIZM fact belongs in a scanner. Token names, component
   lists and legal variants all come from `ground-truth.json`, regenerated per PRIZM release.
2. **Packs and platforms are shapes, not special cases.** RC3 is discovered generically from
   its token overlay + organisms directory + `data-pack` attribute. Never write an
   RC3-specific branch — the next pack must cost nothing.
3. **Unknown is not wrong.** Anything the manifest doesn't recognise degrades to `info`.
4. **Never blame a product for PRIZM's own code.** Verbatim PRIZM source is exempt from
   A1/A2 and judged only by drift.
5. **Re-run all four calibration controls after any rule change** (see `references/testing.md`).

## Files

```
SKILL.md                  agent-facing workflow
README.md                 this file
references/rules.md       rule catalogue with severities and rationale
references/scoring.md     scoring maths, weights, bands, calibration results
references/testing.md     fixtures and the false-positive stress test
scripts/common.py         shared helpers, owned-file classifier
scripts/ground_truth.py   PRIZM -> JSON manifest (the keystone)
scripts/scan_tokens.py    A1
scripts/scan_components.py A2
scripts/scan_drift.py     A3
scripts/score.py          weighted per-axis scoring, fix ranking
scripts/report.py         Markdown + self-contained HTML rendering
scripts/run_all.py        orchestrator
fixtures/                 positive and negative test products
```
