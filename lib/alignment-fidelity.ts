/**
 * A3 — Fidelity. Best-effort drift detection for PRIZM components that a product
 * has COPIED into its own tree (copy-paste distribution).
 *
 * How it works: for each PRIZM component we extract a compact "style signature" —
 * the set of token / variant class strings it uses, plus whether it uses
 * forwardRef. A product's copy is compared against the baseline signature. This
 * deliberately ignores formatting, import paths, comments, and prop plumbing, so
 * only real contract drift (changed tokens, changed/removed variants, dropped
 * forwardRef) shows up — the things A3 actually cares about.
 *
 * The baseline signatures are generated at build time from PRIZM's own
 * components/ui/* by scripts/generate-alignment-groundtruth.ts, so the comparison
 * is always against the PRIZM version this checker was built from.
 */

import type { Finding } from "./alignment-checker";

export interface UiSignature {
  /** Sorted, de-duped token/variant class strings used in the component. */
  tokens: string[];
  /** Whether the component forwards a ref (a PRIZM convention). */
  forwardRef: boolean;
}

// A class-like token: contains a hyphen or colon (bg-surface, hover:bg-accent,
// rounded-md, px-4, data-[state=open]:…). Bare words (flex, grid, prose) are
// dropped — symmetrically on both sides, so they never cause false drift.
const CLASS_TOKEN = /^[a-z][\w:./%[\]&-]*$/;

/** Extract the style signature from a component's source. */
export function extractSignature(source: string): UiSignature {
  const body = source
    .split("\n")
    .filter((l) => !/^\s*import\b/.test(l))
    .join("\n");
  const tokens = new Set<string>();
  const literals = body.match(/"[^"]*"|'[^']*'|`[^`]*`/g) ?? [];
  for (const lit of literals) {
    for (const raw of lit.slice(1, -1).split(/\s+/)) {
      const t = raw.trim();
      if (t.length < 2 || t.length > 48) continue;
      if (!/[-:]/.test(t)) continue;
      if (!CLASS_TOKEN.test(t)) continue;
      tokens.add(t);
    }
  }
  return { tokens: [...tokens].sort(), forwardRef: /\bforwardRef\b/.test(source) };
}

export interface SignatureDiff {
  drift: boolean;
  added: string[];
  removed: string[];
  forwardRefDropped: boolean;
}

/** Compare a product copy's signature against the PRIZM baseline signature. */
export function diffSignature(product: UiSignature, base: UiSignature): SignatureDiff {
  const pb = new Set(product.tokens);
  const bb = new Set(base.tokens);
  const added = product.tokens.filter((t) => !bb.has(t));
  const removed = base.tokens.filter((t) => !pb.has(t));
  const forwardRefDropped = base.forwardRef && !product.forwardRef;
  return {
    drift: added.length > 0 || removed.length > 0 || forwardRefDropped,
    added,
    removed,
    forwardRefDropped,
  };
}

export interface ProductUiFile {
  path: string;
  slug: string;
  content: string;
}

export interface FidelitySeed {
  opps: number;
  violWeight: number;
  findings: Finding[];
  comparedCount: number;
}

const list = (xs: string[], max = 4) =>
  xs.length <= max ? xs.join(", ") : `${xs.slice(0, max).join(", ")} +${xs.length - max} more`;

/**
 * Score A3 for a repo: diff each copied PRIZM component against the baseline.
 * Returns axis tallies + findings to seed into the overall result.
 */
export function computeFidelity(
  productUi: ProductUiFile[],
  baseline: Record<string, UiSignature>,
  ref: string,
): FidelitySeed {
  let opps = 0;
  let violWeight = 0;
  let comparedCount = 0;
  const findings: Finding[] = [];

  for (const f of productUi) {
    const base = baseline[f.slug];
    if (!base) continue; // not a PRIZM component we have a baseline for
    opps += 1;
    comparedCount += 1;
    const diff = diffSignature(extractSignature(f.content), base);
    if (!diff.drift) continue;

    violWeight += 1.0; // contract drift is an error-weight fidelity hit
    const bits: string[] = [];
    if (diff.removed.length) bits.push(`dropped ${list(diff.removed)}`);
    if (diff.added.length) bits.push(`added ${list(diff.added)}`);
    if (diff.forwardRefDropped) bits.push("dropped forwardRef");

    findings.push({
      id: "PZ-D01",
      axis: "A3",
      severity: "error",
      deterministic: true,
      line: 1,
      file: f.path,
      snippet: `components/ui/${f.slug}`,
      message: `Copied ${f.slug} has drifted from PRIZM (${ref}): ${bits.join("; ")}.`,
      suggestion: `Re-sync from PRIZM's components/ui/${f.slug}.tsx, or record it as a sanctioned deviation. Baseline is the current PRIZM ${ref}, which may be newer than the version you adopted.`,
    });
  }

  return { opps, violWeight, findings, comparedCount };
}
