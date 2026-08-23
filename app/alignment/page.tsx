import { AlignmentChecker } from "@/components/site/alignment-checker";
import { CopyBlock } from "@/components/site/copy-block";
import { withBasePath } from "@/lib/base-path";
import { Download, Repeat, ScanLine, Target } from "lucide-react";
import type { ReactNode } from "react";

export const metadata = {
  title: "Alignment",
  description:
    "Score how aligned a product is to PRIZM — token compliance, component adoption, fidelity, composition, and accessibility — with a diagnostic report.",
};

interface Axis {
  key: string;
  name: string;
  weight: string;
  question: string;
  example: string;
}

const AXES: Axis[] = [
  {
    key: "A1",
    name: "Tokens",
    weight: "30%",
    question: "Do colours, radii, shadows and type come from PRIZM tokens?",
    example: "bg-slate-800 instead of bg-surface; a hardcoded #00d3f2; rounded-[5px].",
  },
  {
    key: "A2",
    name: "Adoption",
    weight: "25%",
    question: "Is a PRIZM component used wherever one exists?",
    example: 'A hand-rolled <div role="button">; a bespoke modal when Dialog ships.',
  },
  {
    key: "A3",
    name: "Fidelity",
    weight: "20%",
    question: "Do copied components still match upstream PRIZM?",
    example: "A pasted Button whose cva variants have drifted from the pinned SHA.",
  },
  {
    key: "A4",
    name: "Composition",
    weight: "15%",
    question: "Are components composed the way PRIZM intends?",
    example: "Enterprise tokens inside a C3 surface; data-zone unset.",
  },
  {
    key: "A5",
    name: "Accessibility",
    weight: "10%",
    question: "Does it meet the accessibility floor (WCAG AA)?",
    example:
      "An <img> or JavaFX ImageView with no text alternative; an icon-only control with no label; blocked zoom; a colour pair below AA contrast.",
  },
];

interface Tier {
  id: string;
  name: string;
  input: string;
  covers: string;
  claim: string;
}

const TIERS: Tier[] = [
  {
    id: "T1",
    name: "Full",
    input: "Repo (optionally a running build)",
    covers: "A1–A5 (contrast needs a rendered pass)",
    claim: "Authoritative — the score can be tracked over time and pinned to a PRIZM SHA.",
  },
  {
    id: "T2",
    name: "Rendered",
    input: "Running app / deployed URL, no source",
    covers: "A1 (palette only), A2 (fuzzy), A4, A5",
    claim: "Surface audit — token provenance unverified; theme-switch risk not assessed.",
  },
  {
    id: "T3",
    name: "Visual",
    input: "Screenshots only (air-gapped C3)",
    covers: "A1 (palette), A4 (partial)",
    claim: "Indicative only — scored with a wide band, or not scored.",
  },
];

interface Band {
  range: string;
  name: string;
  tone: string;
}

const BANDS: Band[] = [
  { range: "≥ 90", name: "Aligned", tone: "text-success" },
  { range: "75–89", name: "Mostly aligned", tone: "text-success" },
  { range: "50–74", name: "Partial", tone: "text-warning" },
  { range: "< 50", name: "Off-system", tone: "text-danger" },
];

interface CodeRow {
  code: string;
  axis: string;
  flags: string;
}

const CODES: CodeRow[] = [
  {
    code: "PZ-T01",
    axis: "A1 · Tokens",
    flags: "Raw Tailwind colour class (e.g. bg-slate-800) instead of a token",
  },
  {
    code: "PZ-T02",
    axis: "A1 · Tokens",
    flags: "Hardcoded colour literal — #hex, rgb(), or oklch()",
  },
  { code: "PZ-T03", axis: "A1 · Tokens", flags: "Arbitrary colour value, e.g. bg-[#00d3f2]" },
  { code: "PZ-T04", axis: "A1 · Tokens", flags: "Invented token that isn't in PRIZM's vocabulary" },
  { code: "PZ-T05", axis: "A1 · Tokens", flags: "Off-token corner radius, e.g. rounded-[5px]" },
  { code: "PZ-C01", axis: "A2 · Adoption", flags: 'role="button" on a non-button — use Button' },
  {
    code: "PZ-C02–C10",
    axis: "A2 · Adoption",
    flags:
      "A hand-rolled element where a PRIZM component exists (table, select, dialog, checkbox, radio, slider, progress, accordion, button)",
  },
  {
    code: "PZ-C20",
    axis: "A2 · Adoption",
    flags: "A native JavaFX control with a Prizm* equivalent",
  },
  {
    code: "PZ-D01",
    axis: "A3 · Fidelity",
    flags: "A copied PRIZM component that has drifted from the current version",
  },
  {
    code: "PZ-P01",
    axis: "A4 · Composition",
    flags: "Liquid-glass (a C3-only treatment) used in product code",
  },
  {
    code: "PZ-P06",
    axis: "A4 · Composition",
    flags: "Conflicting product zones declared in one file",
  },
  {
    code: "PZ-P10",
    axis: "A4 · Composition",
    flags: "An extension pack used without its activation marker",
  },
  { code: "PZ-A01", axis: "A5 · Accessibility", flags: "Image with no alt text" },
  { code: "PZ-A02", axis: "A5 · Accessibility", flags: "Viewport blocks zoom" },
  {
    code: "PZ-A03",
    axis: "A5 · Accessibility",
    flags: "A colour pair below WCAG AA contrast (4.5:1), using PRIZM's own contrast policy",
  },
  { code: "PZ-A10", axis: "A5 · Accessibility", flags: "JavaFX ImageView with no accessible text" },
  {
    code: "PZ-A11",
    axis: "A5 · Accessibility",
    flags: "Icon-only control with no accessible name",
  },
];

function Feature({
  icon,
  title,
  children,
}: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-accent">{icon}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{children}</p>
    </div>
  );
}

export default function AlignmentPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Alignment</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Alignment</h1>
      <p className="mt-4 max-w-3xl text-lg text-fg-muted">
        The PRIZM Checker measures how closely a product follows PRIZM and gives it one alignment
        score. The score is made of five axes, each measured on its own, so a result also tells you
        what to fix.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Feature icon={<ScanLine className="h-5 w-5" />} title="It reads the code">
          Colours have to come from tokens, not just happen to match. That only shows in source, so
          the checker reads code rather than screenshots.
        </Feature>
        <Feature icon={<Target className="h-5 w-5" />} title="Five weighted axes">
          Tokens, adoption, fidelity, composition, and accessibility. Each axis is scored against
          the number of chances the code had to get it wrong.
        </Feature>
        <Feature icon={<Repeat className="h-5 w-5" />} title="Same input, same score">
          The scan is a fixed set of rules with fixed weights. Run it twice on the same code and you
          get the same number and the same findings.
        </Feature>
      </div>

      {/* Interactive checker */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Check your code</h2>
      <p className="mt-3 max-w-3xl text-fg-muted">
        Paste a component or scan a GitHub repo for an instant read, right in your browser.
      </p>
      <div className="mt-4 max-w-3xl rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-fg-muted">
        <span className="font-semibold text-fg">This is a quick, partial check.</span> In the
        browser it scores A1 tokens, A2 adoption, source-only A5 accessibility, and a best-effort A3
        fidelity when you scan a repo — but not A4 composition. For the authoritative, whole-repo
        audit of all five axes (A1–A5), deterministic and pinned to a PRIZM version,{" "}
        <a href="#get-the-skill" className="font-medium text-accent hover:underline">
          install the PRIZM Checker skill
        </a>{" "}
        below. (Contrast is checked on colour pairs visible in source, held to PRIZM&rsquo;s AA
        policy; contrast on layout-inherited backgrounds still needs a rendered pass.)
      </div>
      <div className="mt-6">
        <AlignmentChecker />
      </div>

      {/* Get the skill (the full audit) */}
      <div
        id="get-the-skill"
        className="mt-6 scroll-mt-20 rounded-lg border border-accent/40 bg-accent/5 p-5"
      >
        <h3 className="font-semibold">The full five-axis audit — the PRIZM Checker skill</h3>
        <p className="mt-1 text-sm text-fg-muted">
          The authoritative, whole-repo audit, run by Claude: tokens, adoption, fidelity,
          composition, and accessibility (A1–A5) scored deterministically and pinned to a PRIZM
          version, with per-file findings and a ranked fix list. Contrast is held to PRIZM&rsquo;s
          own AA policy on any colour pair resolvable from source. (Contrast on layout-inherited
          backgrounds still needs a rendered pass; deeper composition still benefits from a
          reviewer.) Install once; it stays up to date.
        </p>

        <p className="mt-4 text-sm font-medium text-fg">Claude Code desktop app (no terminal)</p>
        <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm text-fg-muted">
          <li>Open the Code tab and open a project folder.</li>
          <li>
            Click <span className="font-medium text-fg">+</span> next to the prompt →{" "}
            <span className="font-medium text-fg">Plugins</span>.
          </li>
          <li>
            Add marketplace{" "}
            <code className="rounded-sm bg-bg-muted px-1 py-0.5">prizm-design/prizm</code>, then in{" "}
            <span className="font-medium text-fg">Discover</span> find{" "}
            <span className="font-medium text-fg">prizm-checker</span> and click{" "}
            <span className="font-medium text-fg">Install</span>.
          </li>
          <li>
            Keep it up to date automatically — add this to the repo&rsquo;s{" "}
            <code className="rounded-sm bg-bg-muted px-1 py-0.5">.claude/settings.json</code> so it
            installs and updates on open, with no plugin commands (works in cloud sessions too):
            <CopyBlock
              code={`{
  "extraKnownMarketplaces": {
    "prizm": { "source": { "source": "github", "repo": "prizm-design/prizm" } }
  },
  "enabledPlugins": { "prizm-checker@prizm": true }
}`}
            />
          </li>
        </ol>

        <p className="mt-4 text-sm font-medium text-fg">Terminal or IDE</p>
        <p className="mt-1.5 text-sm text-fg-muted">
          First time — add the marketplace, then install <strong>prizm-checker</strong> from the
          plugin manager it opens:
        </p>
        <CopyBlock code={"/plugin marketplace add prizm-design/prizm"} />
        <p className="mt-3 text-sm text-fg-muted">To update later — paste this:</p>
        <CopyBlock code={"/plugin update prizm-checker@prizm"} />

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Offline / air-gapped — download the folder
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <a
            href={withBasePath("/prizm-checker.zip")}
            download
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-bg px-4 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
          >
            <Download className="h-4 w-4" />
            Download skill (v0.5.0)
          </a>
          <span className="text-sm text-fg-muted">
            Unzip into <code className="rounded-sm bg-bg-muted px-1 py-0.5">.claude/skills/</code>{" "}
            (or <code className="rounded-sm bg-bg-muted px-1 py-0.5">~/.claude/skills/</code>), so
            you have{" "}
            <code className="rounded-sm bg-bg-muted px-1 py-0.5">
              .claude/skills/audit/SKILL.md
            </code>
            . Re-download to update.
          </span>
        </div>

        <p className="mt-6 text-sm text-fg-muted">
          However you installed it, run it by asking Claude in your product repo (it also triggers
          automatically when you ask to check alignment):
        </p>
        <CopyBlock code={'claude "run the prizm-checker against this repo"'} />
      </div>

      {/* Axes */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight">What the score is built from</h2>
      <p className="mt-3 max-w-3xl text-fg-muted">
        A single percentage is only worth showing if it is built from parts you can measure and fix
        on their own. The overall score is the weighted mean of the axes that could be measured,
        renormalised. Axes that could not be measured are marked{" "}
        <code className="rounded-sm bg-bg-muted px-1 py-0.5 text-sm">n/a</code> rather than counted
        as perfect.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wider text-fg-subtle">
              <th className="px-4 py-2.5 font-semibold">Axis</th>
              <th className="px-4 py-2.5 font-semibold">Weight</th>
              <th className="px-4 py-2.5 font-semibold">Question it answers</th>
              <th className="px-4 py-2.5 font-semibold">Example violation</th>
            </tr>
          </thead>
          <tbody>
            {AXES.map((a) => (
              <tr key={a.key} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-fg-subtle">{a.key}</span>{" "}
                  <span className="font-medium text-fg">{a.name}</span>
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums text-accent">{a.weight}</td>
                <td className="px-4 py-3 text-fg-muted">{a.question}</td>
                <td className="px-4 py-3 text-fg-subtle">{a.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tiers */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Access tiers</h2>
      <p className="mt-3 max-w-3xl text-fg-muted">
        How much can be assessed depends on how much access the checker has. The browser tool above
        has your source but is a quick, partial read. The authoritative Tier 1 audit comes from
        running the skill against the repo — deterministic and pinned to a PRIZM version. It covers
        all five axes (A1–A5) from source — contrast included, held to PRIZM&rsquo;s AA policy on
        resolvable colour pairs; only layout-inherited contrast still needs a rendered pass, and
        holistic composition still benefits from a reviewer. A rendered-only (Tier 2) or
        screenshot-only (Tier 3) audit sees even less, and should never be read as a Tier 1 one.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wider text-fg-subtle">
              <th className="px-4 py-2.5 font-semibold">Tier</th>
              <th className="px-4 py-2.5 font-semibold">Input</th>
              <th className="px-4 py-2.5 font-semibold">Axes</th>
              <th className="px-4 py-2.5 font-semibold">Claimed confidence</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-fg-subtle">{t.id}</span>{" "}
                  <span className="font-medium text-fg">{t.name}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{t.input}</td>
                <td className="px-4 py-3 text-fg-subtle">{t.covers}</td>
                <td className="px-4 py-3 text-fg-muted">{t.claim}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bands */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Grade bands</h2>
      <p className="mt-3 max-w-3xl text-fg-muted">
        The score also maps to a band, so a result reads as a plain verdict instead of a number
        people over-read by a point or two.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {BANDS.map((b) => (
          <div key={b.name} className="rounded-lg border border-border bg-surface p-4">
            <div className={`text-2xl font-bold tabular-nums ${b.tone}`}>{b.range}</div>
            <div className="mt-1 text-sm font-medium text-fg">{b.name}</div>
          </div>
        ))}
      </div>

      {/* Finding codes */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Finding codes</h2>
      <p className="mt-3 max-w-3xl text-fg-muted">
        Every finding carries a rule ID like{" "}
        <code className="rounded-sm bg-bg-muted px-1 py-0.5 text-sm">PZ-T01</code>, shaped{" "}
        <code className="rounded-sm bg-bg-muted px-1 py-0.5 text-sm">
          PZ-&lt;axis&gt;&lt;number&gt;
        </code>
        . The letter marks the axis — <strong>T</strong> tokens (A1), <strong>C</strong> components
        / adoption (A2), <strong>D</strong> drift / fidelity (A3), <strong>P</strong> composition
        (A4), <strong>A</strong> accessibility (A5) — and the number is the specific rule. The skill
        uses the same IDs, so a code means the same thing everywhere.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wider text-fg-subtle">
              <th className="px-4 py-2.5 font-semibold">Code</th>
              <th className="px-4 py-2.5 font-semibold">Axis</th>
              <th className="px-4 py-2.5 font-semibold">What it flags</th>
            </tr>
          </thead>
          <tbody>
            {CODES.map((c) => (
              <tr key={c.code} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-fg">
                  {c.code}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-fg-muted">{c.axis}</td>
                <td className="px-4 py-3 text-fg-muted">{c.flags}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-3xl text-sm text-fg-subtle">
        The A4 (<code className="rounded-sm bg-bg-muted px-1 py-0.5">PZ-P*</code>) codes are scored
        by the skill; the browser tool doesn&rsquo;t check A4. An axis shown as{" "}
        <code className="rounded-sm bg-bg-muted px-1 py-0.5">n/a</code> means the input had nothing
        to measure for it; it never counts for or against the score.
      </p>
      <p className="mt-3 max-w-3xl text-sm text-fg-subtle">
        <strong className="text-fg">Accessibility &amp; WCAG.</strong> A5 checks the source-visible
        parts of the <strong>WCAG&nbsp;2.1 AA</strong> floor. Contrast (
        <code className="rounded-sm bg-bg-muted px-1 py-0.5">PZ-A03</code>) uses PRIZM&rsquo;s own
        policy — the one its tokens are CI-verified against:{" "}
        <strong>4.5:1 for text, 3:1 for non-text</strong>. A clean A5 result is not a full AA pass,
        though: contrast on layout-inherited backgrounds needs a rendered pass, and A5 doesn&rsquo;t
        cover keyboard, focus order, ARIA, or heading structure.
      </p>
    </article>
  );
}
