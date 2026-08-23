# Rule catalogue

Every rule reads its legal values from `ground-truth.json`. Nothing here hardcodes a
PRIZM fact, so a token or component added upstream is covered on the next run.

Severity weights in scoring: `error` = 1.0, `warn` = 0.4, `info` = 0.1.

## A1 — Token compliance

| Rule | Severity | What it catches | Why it matters |
|---|---|---|---|
| `PZ-T01` | error | Raw Tailwind palette utility (`bg-slate-800`, `text-blue-600`). `-white`/`-black` downgraded to warn | PRIZM.md: "Never use raw Tailwind colour utilities — they break theme switching" |
| `PZ-T02` | error | Hardcoded colour literal (`#hex`, `rgb()`, `oklch()`) outside a token file | A value that happens to match today will not follow a theme change. This is the violation a rendered/UI audit physically cannot see |
| `PZ-T03` | warn | Arbitrary radius or shadow (`rounded-[7px]`, `shadow-[...]`, literal `border-radius`) | PRIZM defines a finite set of steps |
| `PZ-T04` | error | A `--prizm-*` token defined locally but not upstream, or used but defined nowhere | "Don't invent new tokens. If a semantic token is missing, raise it as a system-level decision" |
| `PZ-T05` | warn | `font-family` outside the PRIZM stack | |
| `PZ-T07` | error | External asset reference (`url(https://…)`, remote `src`/`href`) | Air-gap discipline, enforced in PRIZM's own CI |

**Token-file exemption.** A file that *defines* tokens is where literals belong. Detected by
the presence of `--prizm-*:` (web) or `-color-*:` (JavaFX looked-up colours), or a path under
`tokens/` or `themes/`. Without this, every generated JavaFX theme reads as 30 violations.

**Opportunity denominator.** Compliant token references (semantic utilities, `var(--prizm-*)`,
`-color-*`) plus violations. So the score answers "what share of styling decisions went
through the system", which is the actual question.

## A2 — Component adoption

| Rule | Severity | What it catches |
|---|---|---|
| `PZ-C01` | error | Raw `<button>`, `<input>`, `<textarea>`, `<select>`, `<table>`, `<dialog>`, `<progress>`, or a clickable `<div>`, where PRIZM ships a component |
| `PZ-C02` | error | Imports from a parallel component library (Radix, MUI, Headless UI, Ant, Chakra, Mantine, …). `@base-ui-components` is allowed — PRIZM is built on it |
| `PZ-C05` | error | JavaFX: `javafx.scene.control.X` where `PrizmX` exists |

Element→component mapping is filtered against the registry, so a rule only fires if PRIZM
actually ships that component as `stable`.

`PZ-C03` (chrome hand-composed instead of the app shell) and `PZ-C04` (RC3 organism
hand-built) are specified but not implemented in v0.1 — they need structural fingerprinting.

## A3 — Component fidelity (drift)

| Rule | Severity | What it catches |
|---|---|---|
| `PZ-D01` | error / warn | A vendored PRIZM component differs from upstream. Escalates to `error` when the diff touches `cva`, the variant map, `defaultVariants`, `forwardRef`, `cn()`, or token classes; stays `warn` when cosmetic |
| `PZ-D02` | error | A variant or size value that is not in the component's legal set, read from its `cva` block |
| `PZ-D03` | warn | `className` passed to a PRIZM component containing colour / radius / height / border utilities that override its variant |

`PZ-D04`–`PZ-D06` are specified in the plan, not implemented in v0.1.

**Why this axis exists.** PRIZM ships by copy-paste, so there is no dependency to inspect and
every consumer owns a mutable copy. A team that added a seventh button variant looks aligned
and isn't. No rendered or visual audit can see this.

## The exemption that matters most

**Verbatim PRIZM source is exempt from A1 and A2, and judged only by A3.**

Detected two ways: exact content-hash match against any file PRIZM ships (227 files indexed at
4.0.0-alpha.1), or a canonical path (`components/ui/<slug>.tsx`, `components/<pack>/`,
`components/site/`, `styles/tokens/`, the JavaFX library tree — pack paths derived from the
manifest, so a future pack needs no code change).

Without this the Checker charges product teams for the design system's own deviations. PRIZM's
own RC3 organisms use `rounded-[1px]` and `badge.tsx` uses `bg-[oklch(...)]`; a consumer who
copied those files faithfully did nothing wrong.

Exempt files are still scanned, but their findings go to **`upstream-notes.md`** — an internal
file, excluded from every score and from all three shared report formats. Product teams never see
it. Discarding the check entirely, as v0.1 did, threw away the most durable output of an audit:
evidence about the design system itself.

`--treat-as-consumer` disables the exemption. Only for stress-testing the Checker's
false-positive rate against known-good code — never for scoring a real product.

## Sanctioned deviations

Some deviations are documented and correct. PRIZM inlines the RC3 Ember hue as a constant on
purpose, so `const RC3 = "oklch(71% 0.195 32)"` is intended, not a violation. These belong in a
per-product config with a reason recorded. An undocumented suppression should itself surface as
an `info` finding — otherwise the score becomes fiction.
