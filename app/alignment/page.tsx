import { AlignmentChecker } from "@/components/site/alignment-checker";
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
    question: "Does it meet the accessibility floor?",
    example:
      "An <img> or JavaFX ImageView with no text alternative; an icon-only control with no label; blocked zoom.",
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
    covers: "A1–A5",
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
        Paste a component for a quick read, or point the checker at a GitHub repository to score the
        whole codebase. Either way it measures the two axes that source can prove, token use and
        component adoption, plus the accessibility signals it can see. Everything runs in your
        browser, and the same code always produces the same score.
      </p>
      <div className="mt-6">
        <AlignmentChecker />
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
        How much the checker can see depends on how much access you give it. It states which tier it
        ran in, and a Tier 2 result should not be read as if it were a Tier 1 one. Pasting a
        component or scanning a repo above are both Tier 1: the source is available, so token use
        and adoption can be checked directly.
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

      {/* Full audit */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight">
        Fidelity, composition, and the full audit
      </h2>
      <p className="mt-3 max-w-3xl text-fg-muted">
        A GitHub scan gives <strong>Fidelity (A3)</strong> a best-effort score: it compares the
        PRIZM components you copied into your repo against this site&rsquo;s own PRIZM build and
        flags the ones whose token or variant classes have drifted. It is not pinned to the exact
        PRIZM version you adopted, so treat it as a signal, not a verdict. A pasted snippet has no
        repo to compare, so there A3 stays{" "}
        <code className="rounded-sm bg-bg-muted px-1 py-0.5 text-sm">n/a</code>.{" "}
        <strong>Composition (A4)</strong> — whether components are put together the way PRIZM
        intends — is a judgement call and is always{" "}
        <code className="rounded-sm bg-bg-muted px-1 py-0.5 text-sm">n/a</code> here. For an A3
        pinned to your adopted commit and a real A4, run the PRIZM Checker skill against the
        repository.
      </p>

      {/* Get the skill */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h3 className="font-semibold">Get the PRIZM Checker skill</h3>
        <p className="mt-1 text-sm text-fg-muted">
          The full, AI-driven audit for Claude — all five axes, run against your whole repo.
        </p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Recommended — install as a plugin (stays up to date)
        </p>
        <p className="mt-1.5 text-sm text-fg-muted">
          Install once from the{" "}
          <code className="rounded-sm bg-bg-muted px-1 py-0.5">prizm-design/prizm</code>{" "}
          marketplace; later, updates arrive without re-downloading. Works in Claude Code — the
          desktop app, the terminal, or an IDE extension. (Not the general claude.ai chat app.)
        </p>

        <p className="mt-3 text-sm font-medium text-fg">Claude Code desktop app (no terminal)</p>
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
        </ol>

        <p className="mt-3 text-sm font-medium text-fg">Terminal or IDE</p>
        <pre className="mt-1.5 overflow-x-auto rounded-md border border-border bg-bg-muted p-3 font-mono text-sm text-fg">
          <code>{`# in Claude Code
/plugin marketplace add prizm-design/prizm
/plugin install prizm-checker@prizm

# later, to update to the newest version:
/plugin update prizm-checker@prizm`}</code>
        </pre>

        <p className="mt-3 text-sm font-medium text-fg">Roll it out to a team (auto-install)</p>
        <p className="mt-1.5 text-sm text-fg-muted">
          Commit this to a repo&rsquo;s{" "}
          <code className="rounded-sm bg-bg-muted px-1 py-0.5">.claude/settings.json</code> and the
          plugin installs itself when a teammate opens the repo in Claude Code (desktop, terminal,
          or web) and trusts the folder — no manual steps.
        </p>
        <pre className="mt-1.5 overflow-x-auto rounded-md border border-border bg-bg-muted p-3 font-mono text-sm text-fg">
          <code>{`{
  "extraKnownMarketplaces": {
    "prizm": { "source": { "source": "github", "repo": "prizm-design/prizm" } }
  },
  "enabledPlugins": { "prizm-checker@prizm": true }
}`}</code>
        </pre>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Offline / air-gapped — download the folder
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <a
            href={withBasePath("/prizm-checker.zip")}
            download
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-bg px-4 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
          >
            <Download className="h-4 w-4" />
            Download skill (v0.3.2)
          </a>
          <span className="text-sm text-fg-muted">
            Unzip into <code className="rounded-sm bg-bg-muted px-1 py-0.5">.claude/skills/</code>{" "}
            (or <code className="rounded-sm bg-bg-muted px-1 py-0.5">~/.claude/skills/</code>), so
            you have{" "}
            <code className="rounded-sm bg-bg-muted px-1 py-0.5">
              .claude/skills/prizm-checker/SKILL.md
            </code>
            . Re-download to update.
          </span>
        </div>

        <p className="mt-5 text-sm text-fg-muted">
          Then, in your product repo, ask Claude to run it:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-bg-muted p-3 font-mono text-sm text-fg">
          <code>{`claude "run the prizm-checker against this repo"

# Scores every file across all five axes, emits a Markdown + HTML
# report and a JSON sidecar so alignment can be tracked over time.`}</code>
        </pre>
      </div>
      <p className="mt-4 max-w-3xl text-sm text-fg-subtle">
        Agreed exceptions, such as vendored code, generated files, or modules still mid-migration,
        go in a <code className="rounded-sm bg-bg-muted px-1 py-0.5">prizm-checker.config</code> so
        they stay out of the headline score. Any exception left undocumented is reported as a
        finding of its own, so the number stays honest.
      </p>
    </article>
  );
}
