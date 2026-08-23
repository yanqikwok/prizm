"""A5 (accessibility) from a RENDERED pass — imports a standard axe-core JSON
report and folds it into the A5 axis.

This is the real WCAG check: axe runs on the actual rendered DOM (inherited
contrast, roles, focus, names — the things a source scan can't see) and tags each
result with its WCAG success criterion. The Checker just consumes axe's output, so
it stays dependency-free and air-gapped: produce the JSON with the offline axe
DevTools extension, @axe-core/cli, or a vendored-axe console snippet in the Chrome
that's already on the machine, then pass it with --rendered-a11y.

Accepts either a raw axe results object ({violations, passes, ...}) or an array of
them (axe-cli emits an array, one per URL).
"""
import json
import re

from common import Finding

_WCAG_TAG = re.compile(r"^wcag(\d)(\d)(\d+)$")


def _severity(impact):
    return "error" if impact in ("critical", "serious") else "warn"


def _wcag_scs(tags):
    scs = []
    for t in tags or []:
        m = _WCAG_TAG.match(t)
        if m:
            scs.append(f"{m.group(1)}.{m.group(2)}.{m.group(3)}")
    return scs


def _reports(data):
    """Normalise to a list of axe result objects."""
    if isinstance(data, list):
        # could be [results, ...] or the results themselves
        return [r for r in data if isinstance(r, dict) and ("violations" in r or "passes" in r)] or data
    if isinstance(data, dict):
        return [data]
    return []


def load(path):
    with open(path, encoding="utf-8") as f:
        return build(json.load(f))


def build(data):
    reports = _reports(data)
    findings = []
    opps = 0
    per_url = {}
    engine = ""
    urls = []

    for rep in reports:
        if not isinstance(rep, dict):
            continue
        engine = engine or (rep.get("testEngine", {}) or {}).get("name", "axe-core")
        url = rep.get("url") or "(rendered page)"
        urls.append(url)
        before = opps

        # Every node axe evaluated is an opportunity (passed or failed), so the
        # score reflects how much was checked, not just what failed.
        for v in rep.get("passes", []) or []:
            opps += len(v.get("nodes", []) or [1])

        for v in rep.get("violations", []) or []:
            sev = _severity(v.get("impact"))
            scs = _wcag_scs(v.get("tags"))
            sc = (" · WCAG " + ", ".join(scs)) if scs else ""
            nodes = v.get("nodes", []) or [{}]
            for n in nodes:
                opps += 1
                target = n.get("target") or []
                sel = target[0] if target else ""
                findings.append(
                    Finding(
                        f"AXE:{v.get('id', 'unknown')}",
                        "A5",
                        sev,
                        url,
                        0,
                        f"{v.get('help', v.get('id', 'accessibility issue'))}{sc}.",
                        (n.get("html") or sel or "")[:200],
                        (n.get("failureSummary") or v.get("helpUrl") or "").replace("\n", " ")[:300],
                        kind="rendered",
                    )
                )

        if opps - before:
            per_url[url] = opps - before

    return {
        "axis": "A5",
        "findings": findings,
        "opportunities": opps,
        "per_file": per_url,
        "files_scanned": len(reports),
        "rendered": True,
        "engine": engine or "axe-core",
        "urls": urls,
    }
