"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type AlignmentResult,
  type AxisResult,
  BAND_HINT,
  EXAMPLE_OFF_SYSTEM,
  EXAMPLE_ON_SYSTEM,
  type Finding,
  runAlignmentScan,
} from "@/lib/alignment-checker";
import { type RepoScanProgress, scanGitHubRepo } from "@/lib/github-scan";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  Code2,
  Copy,
  Download,
  Github,
  KeyRound,
  Loader2,
  Play,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type Mode = "paste" | "repo";

function progressLabel(p: RepoScanProgress): string {
  switch (p.phase) {
    case "resolving":
      return "Resolving branch…";
    case "listing":
      return "Listing files…";
    case "fetching":
      return `Reading files ${p.done}/${p.total}…`;
    default:
      return "Scoring…";
  }
}

function scoreTone(score: number | null): "success" | "warning" | "danger" {
  if (score == null) return "warning";
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

const TONE_TEXT = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;
const TONE_BG = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" } as const;
const TONE_STROKE = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
} as const;

export function AlignmentChecker() {
  const [mode, setMode] = useState<Mode>("paste");
  const [source, setSource] = useState("");
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [result, setResult] = useState<AlignmentResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<RepoScanProgress | null>(null);

  function run() {
    setError(null);
    setResult(runAlignmentScan(source));
  }
  function loadExample(kind: "on" | "off") {
    const code = kind === "on" ? EXAMPLE_ON_SYSTEM : EXAMPLE_OFF_SYSTEM;
    setMode("paste");
    setSource(code);
    setError(null);
    setResult(runAlignmentScan(code));
  }
  function clearAll() {
    setSource("");
    setResult(null);
    setError(null);
    setProgress(null);
  }

  async function runRepo() {
    if (!repo.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(null);
    try {
      const r = await scanGitHubRepo(repo, {
        token: token.trim() || undefined,
        onProgress: setProgress,
      });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function copyJson() {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadReport() {
    if (!result) return;
    const blob = new Blob([buildReportHtml(result)], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prizm-alignment-report.html";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* Mode switch */}
      <div className="flex gap-1 border-b border-border p-2">
        <Button
          variant={mode === "paste" ? "subtle" : "ghost"}
          size="sm"
          onClick={() => setMode("paste")}
        >
          <Code2 className="h-4 w-4" />
          Paste source
        </Button>
        <Button
          variant={mode === "repo" ? "subtle" : "ghost"}
          size="sm"
          onClick={() => setMode("repo")}
        >
          <Github className="h-4 w-4" />
          Scan a GitHub repo
        </Button>
      </div>

      {mode === "paste" ? (
        <div className="border-b border-border p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
              Component source — TSX / JSX / HTML / CSS / JavaFX
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => loadExample("on")}>
                On-system example
              </Button>
              <Button variant="ghost" size="sm" onClick={() => loadExample("off")}>
                Off-system example
              </Button>
              {(source || result) && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            rows={10}
            placeholder={
              'Paste a component, then press Check alignment\n<div className="bg-slate-800 text-gray-400">…</div>'
            }
            className="font-mono text-xs leading-relaxed"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={run} disabled={!source.trim()}>
              <Play className="h-4 w-4" />
              Check alignment
            </Button>
            <span className="text-xs text-fg-subtle">
              Runs in your browser. Nothing is uploaded.
            </span>
          </div>
        </div>
      ) : (
        <div className="border-b border-border p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            GitHub repository
          </span>
          <div className="mt-2">
            <Input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              spellCheck={false}
              placeholder="owner/name  ·  or a github.com/owner/name URL"
              onKeyDown={(e) => {
                if (e.key === "Enter") runRepo();
              }}
            />
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-fg-subtle hover:text-fg-muted">
              Private repo, or hitting the rate limit? Add a token
            </summary>
            <div className="mt-2 flex items-center gap-2">
              <KeyRound className="h-4 w-4 shrink-0 text-fg-subtle" />
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="GitHub token (optional)"
              />
            </div>
            <p className="mt-1.5 text-xs text-fg-subtle">
              Create a read-only token at github.com/settings/tokens. It stays in this browser tab
              and is sent only to api.github.com.
            </p>
          </details>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={runRepo} disabled={!repo.trim() || busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
              {busy ? "Scanning…" : "Scan repo"}
            </Button>
            <span className="text-xs text-fg-subtle">
              {busy && progress
                ? progressLabel(progress)
                : "Reads public repos with no sign-in. Needs an internet connection."}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-b border-border px-5 py-4">
          <p className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {result &&
        (result.overall !== null ? (
          <Results
            result={result}
            onCopyJson={copyJson}
            copied={copied}
            onDownload={downloadReport}
          />
        ) : (
          <div className="p-6 text-sm text-fg-muted">
            Nothing measurable in that input — no colours, components, or images to score. Try a
            component with markup or styles.
          </div>
        ))}
    </div>
  );
}

function Results({
  result,
  onCopyJson,
  copied,
  onDownload,
}: {
  result: AlignmentResult;
  onCopyJson: () => void;
  copied: boolean;
  onDownload: () => void;
}) {
  const tone = scoreTone(result.overall);
  return (
    <>
      {/* Headline */}
      <div className="flex flex-wrap items-center gap-5 p-5">
        <ScoreRing score={result.overall} tone={tone} />
        <div className="min-w-[180px] flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              PRIZM Alignment · {result.band}
            </h3>
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">{BAND_HINT[result.band]}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {result.errorCount > 0 && (
              <Badge variant="danger">
                <XCircle className="mr-1 h-3 w-3" />
                {result.errorCount} error{result.errorCount === 1 ? "" : "s"}
              </Badge>
            )}
            {result.warnCount > 0 && (
              <Badge variant="warning">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {result.warnCount} warning{result.warnCount === 1 ? "" : "s"}
              </Badge>
            )}
            {result.errorCount === 0 && result.warnCount === 0 && (
              <Badge variant="success">
                <Check className="mr-1 h-3 w-3" />
                clean
              </Badge>
            )}
            <Badge variant="outline">{result.tier}</Badge>
            <Badge variant="subtle">
              {result.filesScanned != null ? `${result.filesScanned} files · ` : ""}
              {result.linesScanned.toLocaleString()} lines · {result.language}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tier caveat */}
      <div className="mx-5 mb-4 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-xs leading-relaxed text-fg-muted">
        <span className="font-semibold text-fg">{result.tier}.</span> {result.tierNote}
      </div>

      {/* Axes */}
      <div className="border-t border-border px-5 py-4">
        <div className="space-y-2.5">
          {result.axes.map((a) => (
            <AxisRow key={a.key} axis={a} />
          ))}
        </div>
      </div>

      {/* Findings */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Findings ({result.findings.length})
          </span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={onCopyJson}>
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-3.5 w-3.5" />
              Report
            </Button>
          </div>
        </div>
        {result.findings.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-success">
            ✓ No findings — this source is on-system.
          </p>
        ) : (
          (() => {
            const sorted = [...result.findings].sort(
              (a, b) => (a.severity === "error" ? -1 : 1) - (b.severity === "error" ? -1 : 1),
            );
            const CAP = 150;
            const shown = sorted.slice(0, CAP);
            return (
              <>
                <ul className="divide-y divide-border border-t border-border">
                  {shown.map((f, idx) => (
                    <FindingRow key={`${f.file ?? ""}-${f.id}-${f.line}-${idx}`} finding={f} />
                  ))}
                </ul>
                {sorted.length > CAP && (
                  <p className="px-5 py-3 text-xs text-fg-subtle">
                    Showing the first {CAP} of {sorted.length} findings. The full set is in the
                    report and JSON export.
                  </p>
                )}
              </>
            );
          })()
        )}
      </div>
    </>
  );
}

function ScoreRing({
  score,
  tone,
}: { score: number | null; tone: "success" | "warning" | "danger" }) {
  const pct = score ?? 0;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 flex-shrink-0">
      <svg
        viewBox="0 0 80 80"
        className="h-24 w-24 -rotate-90"
        role="img"
        aria-label={`Alignment score ${score ?? "not scored"}`}
      >
        <title>Alignment score</title>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-bg-muted)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={TONE_STROKE[tone]}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-2xl font-bold tabular-nums", TONE_TEXT[tone])}>
          {score ?? "—"}
        </span>
      </div>
    </div>
  );
}

function AxisRow({ axis }: { axis: AxisResult }) {
  const tone = scoreTone(axis.score);
  return (
    <div className="flex items-center gap-3 text-sm" title={axis.note}>
      <span className="w-7 shrink-0 font-mono text-xs font-semibold text-fg-subtle">
        {axis.key}
      </span>
      <span className="w-32 shrink-0 text-fg">
        {axis.name}
        <span className="ml-1 text-xs text-fg-subtle">{Math.round(axis.weight * 100)}%</span>
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
        {axis.measured && (
          <div
            className={cn("h-full rounded-full", TONE_BG[tone])}
            style={{ width: `${axis.score}%` }}
          />
        )}
      </div>
      <span
        className={cn(
          "w-10 shrink-0 text-right font-semibold tabular-nums",
          axis.measured ? TONE_TEXT[tone] : "text-fg-subtle",
        )}
      >
        {axis.measured ? axis.score : "n/a"}
      </span>
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const isError = finding.severity === "error";
  return (
    <li className="px-5 py-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            isError ? "bg-danger" : "bg-warning",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
            <span className="font-mono font-semibold text-fg-muted">{finding.id}</span>
            <span>·</span>
            <span>{finding.axis}</span>
            <span>·</span>
            <span className={isError ? "text-danger" : "text-warning"}>
              {finding.severity.toUpperCase()}
            </span>
            <span>·</span>
            <span className={finding.deterministic ? "text-fg-subtle" : "text-info"}>
              {finding.deterministic ? "deterministic" : "judgement"}
            </span>
            <span>·</span>
            <span className="font-mono">
              {finding.file ? `${finding.file}:${finding.line}` : `line ${finding.line}`}
            </span>
          </div>
          <p className="mt-1 text-sm text-fg">{finding.message}</p>
          <code className="mt-1 block overflow-x-auto rounded-sm border border-border bg-bg-muted px-2 py-1 font-mono text-xs text-fg-muted">
            {finding.snippet}
          </code>
          <p className="mt-1 text-xs text-fg-muted">
            <span className="font-medium text-fg">Fix:</span> {finding.suggestion}
          </p>
        </div>
      </div>
    </li>
  );
}

// ── Standalone HTML report ────────────────────────────────────────────────────
function esc(s: string) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function buildReportHtml(r: AlignmentResult): string {
  const accent =
    r.overall == null
      ? "#d97706"
      : r.overall >= 75
        ? "#16a34a"
        : r.overall >= 50
          ? "#d97706"
          : "#dc2626";
  const axisRows = r.axes
    .map((a) => {
      const val = a.measured && a.score != null ? String(a.score) : "n/a";
      const bar =
        a.score == null
          ? "#cbd5e1"
          : a.score >= 75
            ? "#16a34a"
            : a.score >= 50
              ? "#d97706"
              : "#dc2626";
      const w = a.score ?? 0;
      return `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px 12px;font-weight:700;color:#64748b">${a.key}</td>
        <td style="padding:8px 12px">${esc(a.name)} <span style="color:#94a3b8">(${Math.round(a.weight * 100)}%)</span></td>
        <td style="padding:8px 12px;width:180px"><div style="height:8px;background:#f1f5f9;border-radius:999px;overflow:hidden"><div style="height:100%;width:${w}%;background:${bar}"></div></div></td>
        <td style="padding:8px 12px;font-weight:600;text-align:right;color:${bar}">${val}</td>
        <td style="padding:8px 12px;font-size:12px;color:#64748b">${esc(a.note)}</td>
      </tr>`;
    })
    .join("");
  const findingRows = r.findings.length
    ? r.findings
        .map(
          (f) => `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px 12px;font-weight:600;color:#64748b">${f.id}</td>
        <td style="padding:8px 12px">${f.axis}</td>
        <td style="padding:8px 12px"><span style="padding:2px 7px;border-radius:999px;font-size:11px;font-weight:600;background:${f.severity === "error" ? "#fef2f2" : "#fffbeb"};color:${f.severity === "error" ? "#dc2626" : "#d97706"}">${f.severity.toUpperCase()}</span></td>
        <td style="padding:8px 12px">${f.deterministic ? "deterministic" : "judgement"}</td>
        <td style="padding:8px 12px;font-family:ui-monospace,monospace;font-size:11px">${f.file ? `${esc(f.file)}:${f.line}` : `line ${f.line}`}</td>
        <td style="padding:8px 12px;font-size:12px">${esc(f.message)}<div style="font-family:ui-monospace,monospace;font-size:11px;color:#94a3b8;margin-top:3px">${esc(f.snippet)}</div></td>
        <td style="padding:8px 12px;font-size:12px;color:#475569">${esc(f.suggestion)}</td>
      </tr>`,
        )
        .join("")
    : `<tr><td colspan="7" style="padding:20px;text-align:center;color:#16a34a">✓ No findings — on-system</td></tr>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PRIZM Alignment Report</title>
<style>body{font-family:'Inter',system-ui,sans-serif;max-width:1000px;margin:0 auto;padding:40px 24px;color:#0f172a}h1{font-size:24px;margin:0 0 4px}h2{font-size:15px;margin:28px 0 12px}table{width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}th{background:#f8fafc;padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0}.head{display:flex;align-items:center;gap:20px;padding:20px 24px;background:#f8fafc;border-radius:12px}.num{font-size:44px;font-weight:700;color:${accent}}.tier{font-size:12px;background:#fffbeb;border:1px solid #fde68a;color:#92610a;border-radius:8px;padding:12px 16px;margin:12px 0 4px;line-height:1.6}</style>
</head><body>
<h1>PRIZM Alignment Report</h1>
<div style="color:#475569;font-size:13px;margin-bottom:20px">${r.tier} · ${r.filesScanned != null ? `${r.filesScanned} files · ` : ""}${r.linesScanned.toLocaleString()} lines (${r.language}) · Generated ${esc(new Date().toLocaleString())}</div>
<div class="head"><div class="num">${r.overall == null ? "—" : `${r.overall}%`}</div><div><div style="font-size:18px;font-weight:600">${esc(r.band)}</div><div style="font-size:13px;color:#475569;margin-top:4px">${r.errorCount} error(s) · ${r.warnCount} warning(s)</div></div></div>
<div class="tier"><strong>${r.tier}.</strong> ${esc(r.tierNote)}</div>
<h2>Per-axis breakdown</h2>
<table><thead><tr><th>Axis</th><th>Name (weight)</th><th>Score</th><th style="text-align:right">%</th><th>How it was measured</th></tr></thead><tbody>${axisRows}</tbody></table>
<h2>Findings</h2>
<table><thead><tr><th>Rule</th><th>Axis</th><th>Severity</th><th>Type</th><th>Where</th><th>Finding</th><th>Suggested PRIZM fix</th></tr></thead><tbody>${findingRows}</tbody></table>
</body></html>`;
}
