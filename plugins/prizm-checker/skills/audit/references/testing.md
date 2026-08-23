# Testing the Checker

Two fixtures plus two runs against PRIZM itself. Together they answer the two questions that
matter: does it discriminate, and does it cry wolf?

## Fixtures

**`fixtures/good-product`** — a compliant consumer. Six PRIZM components copied verbatim, the
token CSS, and one page that uses semantic utilities, legal variants, and an `aria-label` on the
icon-only button. Expected: **100%, zero findings.** Any finding here is a false positive.

**`fixtures/bad-product`** — deliberately off-system, with one instance of each failure class:

| Planted defect | Should trigger |
|---|---|
| `bg-slate-900`, `text-gray-400`, `bg-blue-600` | `PZ-T01` |
| `#1e293b`, `rgba(0,0,0,0.4)`, `#38bdf8` inline styles | `PZ-T02` |
| `rounded-[7px]`, `border-radius: 7px`, `box-shadow: 0 2px 8px …` | `PZ-T03` |
| `--prizm-color-brand`, `--prizm-color-panel-tint` invented; `--prizm-color-text-primary` used but undefined | `PZ-T04` |
| `font-family: Roboto` | `PZ-T05` |
| `@import url("https://fonts.googleapis.com/…")` | `PZ-T07` |
| Clickable `<div role="button">`, raw `<input>`/`<select>`/`<textarea>`/`<table>` | `PZ-C01` |
| `@radix-ui/react-dialog`, `@headlessui/react` imports | `PZ-C02` |
| `button.tsx` with a `hero` variant added and `forwardRef` removed | `PZ-D01` (error — touches variant map + ref forwarding) |
| `variant="hero"`, `size="xl"` | `PZ-D02` |
| `<Button className="bg-emerald-500 rounded-full h-14">` | `PZ-D03` |

## Running

```bash
python3 scripts/ground_truth.py --prizm /path/to/prizm --out ground-truth.json
for t in good bad; do
  python3 scripts/run_all.py --target fixtures/$t-product --prizm /path/to/prizm \
    --ground-truth ground-truth.json --name "$t fixture" --out out/$t
done
# false-positive stress test against known-good real code
python3 scripts/run_all.py --target /path/to/prizm --prizm /path/to/prizm \
  --ground-truth ground-truth.json --out out/stress --treat-as-consumer
```

## What the stress test taught us

The first run flagged 426 findings against PRIZM's own repo. Diagnosis of every cluster:

| Cluster | Verdict | Action taken |
|---|---|---|
| 60 literals in generated JavaFX theme CSS | False positive — those files *are* the tokens | Token-file detection extended to `-color-*:` definitions and `themes/` paths |
| 44 `javafx.scene.control.*` in the PRIZM JavaFX library | False positive — the library legitimately extends JavaFX controls | Verbatim-PRIZM-source exemption |
| 56 raw `<table>`/`<input>` in docs pages and RC3 organisms | False positive *for a consumer* | Same exemption |
| 4 `--prizm-color-`, `--prizm-radius-` "invented tokens" | False positive — template-literal prefixes | Bare prefixes filtered |
| `rounded-[1px]`, `bg-[oklch(…)]` in PRIZM's own components | True, but PRIZM's deviation, not the consumer's | Same exemption |

**Two genuine findings about PRIZM itself came out of this**, which is a useful sign the rules
have teeth:

1. `badge.tsx` uses `bg-[oklch(…)]` arbitrary values for its status tints, because the web token
   set has no `success-subtle` / `warning-subtle` / `danger-subtle` step — though the JavaFX
   generator derives exactly those. Worth closing the gap upstream.
2. `--prizm-color-border-soft` is referenced in `app/c3/rc3/components/video-tile/page.tsx` but
   defined nowhere. It has a literal fallback so it renders, which means it silently never themes.

After the fixes, the false-positive rate in normal (exemption-on) mode is effectively zero, and
the remaining stress-test findings are true positives or documented sanctioned deviations.
