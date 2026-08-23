/**
 * PRIZM Alignment Checker — deterministic source scan.
 *
 * This is the browser-side, Tier-1 (source) core of the PRIZM Checker: it reads
 * PASTED SOURCE (TSX / JSX / HTML / CSS / JavaFX) and scores how aligned it is
 * to PRIZM, using the five-axis rubric.
 *
 * Why source, not rendered output: PRIZM's whole token thesis is that colours
 * must COME FROM tokens, not merely resolve to the right pixels. A hardcoded
 * `#00d3f2` and `var(--color-accent)` render identically but only one survives a
 * theme switch — and that difference is only visible in code. So the axes that
 * carry the most weight (A1 tokens, A2 adoption) are scanned here deterministically.
 *
 * Ground truth (legal tokens, radii, primitive scales, component + JavaFX
 * catalogues) is NOT hand-written here — it is generated from PRIZM's canonical
 * sources into lib/alignment-ground-truth.generated.ts by
 * scripts/generate-alignment-groundtruth.ts, and imported below. So when PRIZM's
 * components, tokens, or extension packs change, the checker stays in sync:
 *   pnpm generate:alignment   regenerates the ground truth
 *   pnpm check:alignment      fails (pre-commit + CI) if it is stale
 * This file holds only the rule SHAPES; the FACTS they read are generated.
 *
 * A3 (fidelity — copied-source diff vs a pinned PRIZM SHA) and A4 (composition —
 * holistic pattern judgement) can't be answered from a pasted snippet, so they
 * are reported n/a. Run the full PRIZM Checker skill against the repo for those.
 */

import {
  LEGAL_COLOR_TOKENS as GEN_LEGAL_COLOR_TOKENS,
  LEGAL_RADIUS_PX as GEN_LEGAL_RADIUS_PX,
  JAVAFX_CONTROL_MAP,
  PRIZM_PRIMITIVE_FAMILIES,
} from "./alignment-ground-truth.generated";

export type Severity = "error" | "warn" | "info";
export type AxisKey = "A1" | "A2" | "A3" | "A4" | "A5";
export type Language = "tsx" | "css" | "html" | "javafx" | "unknown" | "mixed";

export interface Finding {
  id: string;
  axis: AxisKey;
  severity: Severity;
  deterministic: boolean;
  line: number;
  snippet: string;
  message: string;
  suggestion: string;
  /** Repo-relative path, present when scanning a whole repository. */
  file?: string;
}

export interface AxisResult {
  key: AxisKey;
  name: string;
  weight: number;
  measured: boolean;
  score: number | null; // 0–100
  note: string;
  opportunities: number;
  violations: number;
}

export interface AlignmentResult {
  overall: number | null; // 0–100, or null if nothing measurable
  band: string;
  tier: string;
  tierNote: string;
  language: Language;
  linesScanned: number;
  axes: AxisResult[];
  findings: Finding[];
  errorCount: number;
  warnCount: number;
  /** Number of files scanned (whole-repo mode); undefined for a single snippet. */
  filesScanned?: number;
  /** Human-readable coverage note (whole-repo mode). */
  coverage?: string;
}

// ── Ground truth ──────────────────────────────────────────────────────────────
// The volatile PRIZM facts (legal tokens, radii, primitive scales, component and
// JavaFX catalogues) come from lib/alignment-ground-truth.generated.ts, which is
// generated from PRIZM's canonical sources by scripts/generate-alignment-groundtruth.ts.
// `pnpm generate:alignment` regenerates it; `pnpm check:alignment` fails if it is
// stale. The rule SHAPES below are curated; the FACTS they read are generated.

/** Legal semantic colour utility suffixes (from @theme --color-*). */
const LEGAL_COLOR_TOKENS = new Set(GEN_LEGAL_COLOR_TOKENS);

/** Legal radius values in px (from the --radius-* / --prizm-radius-* scale). */
const LEGAL_RADIUS_PX = GEN_LEGAL_RADIUS_PX;

/** Utility prefixes that take a colour token (universal Tailwind, not a PRIZM fact). */
const COLOR_PREFIXES = [
  "bg",
  "text",
  "border",
  "ring",
  "fill",
  "stroke",
  "from",
  "to",
  "via",
  "divide",
  "outline",
  "caret",
  "accent",
  "decoration",
  "shadow",
  "placeholder",
];

/** Standard Tailwind palette families (universal), unioned with PRIZM's own
 *  baseline/extension primitive scales (generated, e.g. rc3) — all banned for
 *  direct use in product code; use a semantic token instead. */
const UNIVERSAL_TW_FAMILIES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];
const BANNED_TW_FAMILIES = [...new Set([...UNIVERSAL_TW_FAMILIES, ...PRIZM_PRIMITIVE_FAMILIES])];

/** Suggested PRIZM token for each banned family, by semantic role. */
const FAMILY_TO_TOKEN: Record<string, string> = {
  slate: "a neutral token — bg / surface / border / fg (by role)",
  gray: "a neutral token — bg / surface / border / fg (by role)",
  zinc: "a neutral token — bg / surface / border / fg (by role)",
  neutral: "a neutral token — bg / surface / border / fg (by role)",
  stone: "a neutral token — bg / surface / border / fg (by role)",
  red: "danger",
  rose: "danger",
  green: "success",
  emerald: "success",
  lime: "success",
  teal: "success",
  amber: "warning",
  yellow: "warning",
  orange: "warning",
  blue: "accent (Enterprise)",
  indigo: "accent",
  sky: "info",
  cyan: "accent (C3)",
  rc3: "accent (RC3 extension pack)",
  violet: "accent",
  purple: "accent",
  fuchsia: "accent",
  pink: "accent",
};

/**
 * Raw HTML/JSX elements (or bespoke component names) that PRIZM already ships a
 * component for. Each maps to its PRIZM replacement.
 */
const HANDROLLED_HTML: Array<{
  id: string;
  test: RegExp;
  replacement: string;
  severity: Severity;
  deterministic: boolean;
  label: string;
}> = [
  {
    id: "PZ-C01",
    test: /role\s*=\s*["']button["']/,
    replacement: "Button",
    severity: "error",
    deterministic: true,
    label: 'role="button" on a non-button element',
  },
  {
    id: "PZ-C02",
    test: /<table[\s>]/,
    replacement: "Table",
    severity: "warn",
    deterministic: true,
    label: "raw <table>",
  },
  {
    id: "PZ-C03",
    test: /<select[\s>]/,
    replacement: "Select",
    severity: "warn",
    deterministic: true,
    label: "raw <select>",
  },
  {
    id: "PZ-C04",
    test: /<dialog[\s>]|role\s*=\s*["']dialog["']|<Modal[\s>/]/,
    replacement: "Dialog",
    severity: "error",
    deterministic: true,
    label: "bespoke modal / dialog",
  },
  {
    id: "PZ-C05",
    test: /<input\s[^>]*type\s*=\s*["']checkbox["']/,
    replacement: "Checkbox",
    severity: "warn",
    deterministic: true,
    label: "raw checkbox input",
  },
  {
    id: "PZ-C06",
    test: /<input\s[^>]*type\s*=\s*["']radio["']/,
    replacement: "Radio Group",
    severity: "warn",
    deterministic: true,
    label: "raw radio input",
  },
  {
    id: "PZ-C07",
    test: /<input\s[^>]*type\s*=\s*["']range["']/,
    replacement: "Slider",
    severity: "warn",
    deterministic: true,
    label: "raw range input",
  },
  {
    id: "PZ-C08",
    test: /<progress[\s>]/,
    replacement: "Progress",
    severity: "warn",
    deterministic: true,
    label: "raw <progress>",
  },
  {
    id: "PZ-C09",
    test: /<details[\s>]/,
    replacement: "Accordion",
    severity: "warn",
    deterministic: true,
    label: "raw <details>",
  },
  {
    id: "PZ-C10",
    // Lowercase-only: <button> is a raw HTML tag; <Button> is the PRIZM component.
    test: /<button[\s>]/,
    replacement: "Button",
    severity: "warn",
    deterministic: false,
    label: "raw <button>",
  },
];

/** JavaFX native controls that have a Prizm* equivalent (from the generated map). */
const JAVAFX_CONTROLS = Object.keys(JAVAFX_CONTROL_MAP);

const SEVERITY_WEIGHT: Record<Severity, number> = { error: 1.0, warn: 0.4, info: 0.1 };

const AXIS_META: Record<AxisKey, { name: string; weight: number }> = {
  A1: { name: "Tokens", weight: 0.3 },
  A2: { name: "Adoption", weight: 0.25 },
  A3: { name: "Fidelity", weight: 0.2 },
  A4: { name: "Composition", weight: 0.15 },
  A5: { name: "Accessibility", weight: 0.1 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function detectLanguage(src: string): Language {
  if (/\bjavafx\b|import\s+javafx|extends\s+Application|\.fxml/.test(src)) return "javafx";
  if (/className=|=>|import\s+.*from\s+["']react|useState|<[A-Z]\w+/.test(src)) return "tsx";
  if (/^\s*[.#:@a-z][^{}\n]*\{[^}]*\}/m.test(src) && !/</.test(src.slice(0, 200))) return "css";
  if (/<\w+[\s>]/.test(src)) return "html";
  return "unknown";
}

function trimSnippet(line: string, max = 90): string {
  const t = line.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

// ── The scan ──────────────────────────────────────────────────────────────────

interface RawScan {
  findings: Finding[];
  axisOpps: Record<AxisKey, number>;
  axisViolWeight: Record<AxisKey, number>;
  language: Language;
  lines: number;
}

/** Scan one source string. Optionally tag every finding with a file path. */
function scanRaw(source: string, file?: string): RawScan {
  const src = source ?? "";
  const lines = src.split("\n");
  const language = detectLanguage(src);
  const findings: Finding[] = [];

  // Opportunity + violation tallies per axis.
  let a1Opps = 0;
  let a2Opps = 0;
  let a5Opps = 0;
  const axisViolWeight: Record<AxisKey, number> = { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 };

  // File-level: does this file give any control/image an accessible text alternative?
  // (Java `setAccessibleText(...)` or FXML `accessibleText="…"`.) Used by the
  // JavaFX/thick-client A5 rules so a file that labels its controls isn't flagged.
  const fileHasA11yText = /setAccessibleText|accessibleText\s*[=:]/.test(src);

  const push = (f: Finding) => {
    findings.push(file ? { ...f, file } : f);
    axisViolWeight[f.axis] += SEVERITY_WEIGHT[f.severity];
  };

  // Precompiled regexes
  const bannedColorRe = new RegExp(
    `\\b(?:${COLOR_PREFIXES.join("|")})-(${BANNED_TW_FAMILIES.join("|")})-(\\d{2,3})\\b`,
    "g",
  );
  const legalColorRe = new RegExp(
    `\\b(?:${COLOR_PREFIXES.join("|")})-([a-z]+(?:-[a-z]+)?)\\b`,
    "g",
  );
  const hexRe = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
  const funcColorRe = /\b(rgba?|hsla?|oklch|oklab|color-mix)\s*\(/g;
  const arbColorRe = /-\[(?:#|rgb|hsl|oklch|oklab)[^\]]*\]/g;
  const inventedTokenRe = /--(?:prizm-)?color-([a-z][a-z-]*)/g;
  const arbRadiusRe = /rounded-\[[^\]]+\]/g;
  const inlineRadiusRe = /border-?[rR]adius['"]?\s*[:=]\s*['"]?(\d+)px/g;
  const prizmImportRe = /from\s+["']@\/components\/ui\/([a-z-]+)["']/g;

  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    const line = rawLine;
    const snippet = trimSnippet(line);
    if (!line.trim()) return;

    // ── A1: banned Tailwind colour utilities ──
    for (const m of line.matchAll(bannedColorRe)) {
      a1Opps++;
      const family = m[1];
      push({
        id: "PZ-T01",
        axis: "A1",
        severity: "error",
        deterministic: true,
        line: lineNo,
        snippet,
        message: `Raw Tailwind colour utility "${m[0]}" — not a PRIZM token.`,
        suggestion: `Use ${FAMILY_TO_TOKEN[family] ?? "a PRIZM semantic token"} (e.g. bg-surface, text-fg, bg-accent).`,
      });
    }

    // ── A1: legal token usages (count as met opportunities) ──
    for (const m of line.matchAll(legalColorRe)) {
      if (LEGAL_COLOR_TOKENS.has(m[1])) a1Opps++;
    }

    // ── A1: raw colour literals ──
    for (const m of line.matchAll(hexRe)) {
      a1Opps++;
      push({
        id: "PZ-T02",
        axis: "A1",
        severity: "error",
        deterministic: true,
        line: lineNo,
        snippet,
        message: `Raw colour literal "${m[0]}".`,
        suggestion:
          "Reference a PRIZM token instead of a hardcoded colour — it won't survive a theme switch.",
      });
    }
    for (const m of line.matchAll(funcColorRe)) {
      a1Opps++;
      push({
        id: "PZ-T02",
        axis: "A1",
        severity: "error",
        deterministic: true,
        line: lineNo,
        snippet,
        message: `Raw colour function "${m[1]}(…)".`,
        suggestion:
          "Use a PRIZM token (var(--color-*) or a bg-*/text-* utility) rather than a literal colour.",
      });
    }
    for (const m of line.matchAll(arbColorRe)) {
      a1Opps++;
      push({
        id: "PZ-T03",
        axis: "A1",
        severity: "error",
        deterministic: true,
        line: lineNo,
        snippet,
        message: `Arbitrary colour value "${m[0]}".`,
        suggestion:
          "Replace the arbitrary value with a PRIZM token utility (bg-accent, text-danger, …).",
      });
    }

    // ── A1: invented tokens ──
    for (const m of line.matchAll(inventedTokenRe)) {
      const name = m[1];
      if (!LEGAL_COLOR_TOKENS.has(name)) {
        a1Opps++;
        push({
          id: "PZ-T04",
          axis: "A1",
          severity: "error",
          deterministic: true,
          line: lineNo,
          snippet,
          message: `Invented token "--color-${name}" is not in PRIZM's vocabulary.`,
          suggestion:
            "Don't invent tokens. Use an existing PRIZM semantic token, or propose it upstream.",
        });
      }
    }

    // ── A1: arbitrary radii ──
    for (const m of line.matchAll(arbRadiusRe)) {
      a1Opps++;
      push({
        id: "PZ-T05",
        axis: "A1",
        severity: "warn",
        deterministic: true,
        line: lineNo,
        snippet,
        message: `Arbitrary radius "${m[0]}".`,
        suggestion: "Use a PRIZM radius token: rounded-xs / sm / md / lg / xl.",
      });
    }
    for (const m of line.matchAll(inlineRadiusRe)) {
      const px = Number(m[1]);
      a1Opps++;
      if (!LEGAL_RADIUS_PX.includes(px)) {
        push({
          id: "PZ-T05",
          axis: "A1",
          severity: "warn",
          deterministic: true,
          line: lineNo,
          snippet,
          message: `Off-token border-radius "${px}px".`,
          suggestion: "Use a PRIZM radius token (2 / 4 / 6 / 8 / 12px → xs / sm / md / lg / xl).",
        });
      }
    }

    // ── A2: PRIZM component imports (adoption met) ──
    for (const _ of line.matchAll(prizmImportRe)) a2Opps++;

    // ── A2: hand-rolled HTML where a PRIZM component exists ──
    for (const rule of HANDROLLED_HTML) {
      if (rule.test.test(line)) {
        a2Opps++;
        push({
          id: rule.id,
          axis: "A2",
          severity: rule.severity,
          deterministic: rule.deterministic,
          line: lineNo,
          snippet,
          message: `Hand-rolled ${rule.label} where PRIZM ships a component.`,
          suggestion: `Reuse the PRIZM ${rule.replacement} — "reuse before you build".`,
        });
      }
    }

    // ── A2: JavaFX native controls with a Prizm* equivalent ──
    if (language === "javafx") {
      const fx = new RegExp(`\\b(?:new\\s+)?(${JAVAFX_CONTROLS.join("|")})\\s*\\(`);
      const fxImport = new RegExp(`javafx\\.scene\\.control\\.(${JAVAFX_CONTROLS.join("|")})`);
      const m = line.match(fx) || line.match(fxImport);
      if (m) {
        a2Opps++;
        const prizmClass = JAVAFX_CONTROL_MAP[m[1]] ?? `Prizm${m[1]}`;
        push({
          id: "PZ-C20",
          axis: "A2",
          severity: "error",
          deterministic: true,
          line: lineNo,
          snippet,
          message: `Native JavaFX ${m[1]} where a Prizm control exists.`,
          suggestion: `Use ${prizmClass} from the PRIZM JavaFX library instead of javafx.scene.control.${m[1]}.`,
        });
      }
    }

    // ── A5: images without alt ──
    for (const m of line.matchAll(/<img\b[^>]*>/gi)) {
      a5Opps++;
      if (!/\balt\s*=/.test(m[0])) {
        push({
          id: "PZ-A01",
          axis: "A5",
          severity: "error",
          deterministic: true,
          line: lineNo,
          snippet,
          message: "Image without an alt attribute.",
          suggestion: 'Add descriptive alt text, or alt="" for decorative images.',
        });
      }
    }

    // ── A5: viewport blocks zoom (web/mobile) ──
    if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?!\d)/.test(line)) {
      a5Opps++;
      push({
        id: "PZ-A02",
        axis: "A5",
        severity: "error",
        deterministic: true,
        line: lineNo,
        snippet,
        message: "Viewport prevents user zoom.",
        suggestion:
          "Remove user-scalable=no / maximum-scale=1 — users must be able to zoom to 200% (WCAG 1.4.4).",
      });
    }

    // ── A5: JavaFX / thick-client (desktop) accessibility ──
    if (language === "javafx") {
      // Images need a text alternative: FXML <ImageView …> attribute, or a
      // Java `new ImageView(…)` in a file that never sets accessible text.
      for (const m of line.matchAll(/<ImageView\b[^>]*>/g)) {
        a5Opps++;
        if (!/accessibleText\s*=/.test(m[0])) {
          push({
            id: "PZ-A10",
            axis: "A5",
            severity: "error",
            deterministic: true,
            line: lineNo,
            snippet,
            message: "JavaFX ImageView without accessibleText.",
            suggestion:
              'Set accessibleText on the ImageView so screen readers can describe it (accessibleText="…").',
          });
        }
      }
      if (/\bnew\s+ImageView\s*\(/.test(line)) {
        a5Opps++;
        if (!fileHasA11yText) {
          push({
            id: "PZ-A10",
            axis: "A5",
            severity: "error",
            deterministic: true,
            line: lineNo,
            snippet,
            message: "JavaFX ImageView without a text alternative.",
            suggestion:
              "Call setAccessibleText(...) on the image so assistive tech can describe it.",
          });
        }
      }
      // Icon-only controls (empty text label) need an accessible name.
      if (
        /\bnew\s+(Button|ToggleButton|Hyperlink|MenuButton|ToggleGroup)\s*\(\s*""\s*,/.test(line)
      ) {
        a5Opps++;
        if (!fileHasA11yText) {
          push({
            id: "PZ-A11",
            axis: "A5",
            severity: "error",
            deterministic: true,
            line: lineNo,
            snippet,
            message: "Icon-only JavaFX control with no accessible name.",
            suggestion:
              "An icon-only control needs setAccessibleText(...) so its purpose is announced.",
          });
        }
      }
    }
  });

  return {
    findings,
    axisOpps: { A1: a1Opps, A2: a2Opps, A3: 0, A4: 0, A5: a5Opps },
    axisViolWeight,
    language,
    lines: lines.filter((l) => l.trim()).length,
  };
}

const AXIS_NOTES: Record<AxisKey, string> = {
  A1: "Token use, read straight from the source — the one place provenance shows.",
  A2: "PRIZM components used, versus elements hand-rolled where a component already exists.",
  A3: "Drift between copied components and upstream PRIZM at a pinned commit. Needs the whole repo; run the skill.",
  A4: "Whether components are composed the way PRIZM intends. A judgement call handled by a reviewer or the AI skill.",
  A5: "Accessibility signals in source, web and JavaFX: image text alternatives (alt / accessibleText), icon-only controls named, zoom not blocked. Contrast needs the rendered app.",
};

function bandFor(overall: number | null): string {
  if (overall == null) return "Not scored";
  if (overall >= 90) return "Aligned";
  if (overall >= 75) return "Mostly aligned";
  if (overall >= 50) return "Partial";
  return "Off-system";
}

/** Combine one or more raw scans into a single scored result. */
/** Extra axis tallies that don't come from per-line scanning (e.g. A3 fidelity). */
export interface AxisSeed {
  opps: number;
  violWeight: number;
  findings: Finding[];
}

function finalize(
  scans: RawScan[],
  meta: {
    tier: string;
    tierNote: string;
    filesScanned?: number;
    coverage?: string;
    seed?: Partial<Record<AxisKey, AxisSeed>>;
    notes?: Partial<Record<AxisKey, string>>;
  },
): AlignmentResult {
  const findings = scans.flatMap((s) => s.findings);
  const opps: Record<AxisKey, number> = { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 };
  const viol: Record<AxisKey, number> = { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 };
  for (const s of scans) {
    for (const k of Object.keys(opps) as AxisKey[]) {
      opps[k] += s.axisOpps[k];
      viol[k] += s.axisViolWeight[k];
    }
  }
  // Merge seeded axes (fidelity, etc.).
  if (meta.seed) {
    for (const k of Object.keys(meta.seed) as AxisKey[]) {
      const s = meta.seed[k];
      if (!s) continue;
      opps[k] += s.opps;
      viol[k] += s.violWeight;
      findings.push(...s.findings);
    }
  }

  const raw = (k: AxisKey): number | null => (opps[k] > 0 ? clamp01(1 - viol[k] / opps[k]) : null);
  const axisRaw: Record<AxisKey, number | null> = {
    A1: raw("A1"),
    A2: raw("A2"),
    A3: raw("A3"),
    A4: raw("A4"),
    A5: raw("A5"),
  };

  const axes: AxisResult[] = (Object.keys(AXIS_META) as AxisKey[]).map((key) => ({
    key,
    name: AXIS_META[key].name,
    weight: AXIS_META[key].weight,
    measured: axisRaw[key] !== null,
    score: axisRaw[key] === null ? null : Math.round((axisRaw[key] as number) * 100),
    note: meta.notes?.[key] ?? AXIS_NOTES[key],
    opportunities: opps[key],
    violations: findings.filter((f) => f.axis === key).length,
  }));

  const measured = axes.filter((a) => a.measured);
  const wsum = measured.reduce((s, a) => s + a.weight, 0);
  const overall =
    wsum > 0
      ? Math.round(measured.reduce((s, a) => s + (a.score as number) * a.weight, 0) / wsum)
      : null;

  const langs = new Set(scans.map((s) => s.language).filter((l) => l !== "unknown"));
  const language: Language =
    langs.size === 1 ? [...langs][0] : langs.size === 0 ? "unknown" : "mixed";

  return {
    overall,
    band: bandFor(overall),
    tier: meta.tier,
    tierNote: meta.tierNote,
    language,
    linesScanned: scans.reduce((n, s) => n + s.lines, 0),
    axes,
    findings,
    errorCount: findings.filter((f) => f.severity === "error").length,
    warnCount: findings.filter((f) => f.severity === "warn").length,
    filesScanned: meta.filesScanned,
    coverage: meta.coverage,
  };
}

const SNIPPET_TIER_NOTE =
  "Scored from the source you pasted, so token use and component adoption are provable. Fidelity (A3) and composition (A4) need the whole repo at a pinned PRIZM commit — use the GitHub scan below, or run the PRIZM Checker skill.";

/** Score a single pasted source string. */
export function runAlignmentScan(source: string): AlignmentResult {
  return finalize([scanRaw(source)], { tier: "Tier 1 — Source", tierNote: SNIPPET_TIER_NOTE });
}

/** Score a set of repository files as one aggregate result. */
export function runRepoScan(
  files: Array<{ path: string; content: string }>,
  meta: { repo: string; ref?: string; totalMatched: number },
  opts?: { fidelity?: AxisSeed & { comparedCount: number }; fidelityRef?: string },
): AlignmentResult {
  const scans = files.map((f) => scanRaw(f.content, f.path));
  const coverage =
    meta.totalMatched > files.length
      ? `${files.length} of ${meta.totalMatched} source files (capped)`
      : `${files.length} source file${files.length === 1 ? "" : "s"}`;

  const fid = opts?.fidelity;
  const measuredFidelity = fid && fid.comparedCount > 0;
  const a3Line = measuredFidelity
    ? `Fidelity (A3) compares your ${fid.comparedCount} copied PRIZM component(s) against ${opts?.fidelityRef ?? "the current PRIZM baseline"}; run the skill to pin an exact adopted version. Composition (A4) still needs a reviewer or the AI skill.`
    : "Fidelity (A3) and composition (A4) still need a reviewer or the AI skill.";

  return finalize(scans, {
    tier: "Tier 1 — Repository",
    tierNote: `Scanned ${coverage} from ${meta.repo}${meta.ref ? ` @ ${meta.ref}` : ""}. Token use and component adoption are measured across the whole codebase. ${a3Line}`,
    filesScanned: files.length,
    coverage,
    seed: measuredFidelity
      ? { A3: { opps: fid.opps, violWeight: fid.violWeight, findings: fid.findings } }
      : undefined,
    notes: measuredFidelity
      ? {
          A3: `Copied PRIZM components compared against ${opts?.fidelityRef ?? "the current PRIZM baseline"} (best-effort; not pinned to your adopted version).`,
        }
      : undefined,
  });
}

export const BAND_HINT: Record<string, string> = {
  Aligned: "On-system — small or no fixes",
  "Mostly aligned": "Minor drift",
  Partial: "Notable drift — needs work",
  "Off-system": "Largely off-system",
  "Not scored": "No measurable signals in this input",
};

/** Two starter fixtures for the try-it panel. */
export const EXAMPLE_OFF_SYSTEM = `export function StatusCard({ label, value }) {
  return (
    <div className="rounded-[5px] bg-slate-800 p-4 shadow" style={{ borderRadius: 5 }}>
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="text-2xl" style={{ color: "#00d3f2" }}>{value}</div>
      <button className="mt-3 bg-blue-600 text-white rounded px-3 py-1.5">
        Refresh
      </button>
      <span role="button" className="ml-2 text-red-500">Dismiss</span>
      <img src="/spark.png" />
    </div>
  );
}`;

export const EXAMPLE_ON_SYSTEM = `import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-surface border-border rounded-lg">
      <CardHeader>
        <CardTitle className="text-fg">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-accent">{value}</div>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="solid" size="sm">Refresh</Button>
          <Badge variant="danger">Dismiss</Badge>
        </div>
      </CardContent>
    </Card>
  );
}`;
