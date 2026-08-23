#!/usr/bin/env python3
"""PRIZM Checker orchestrator (v0.1 — web, source-access tier, axes A1-A3).

  python3 run_all.py --target <product-repo> --prizm <prizm-checkout> \
                     --name "Product name" --out reports/

Emits report.md, report.html and report.json. Exit code is always 0: this is a
diagnostic tool, not a build gate.
"""
import argparse, datetime, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ground_truth, scan_tokens, scan_components, scan_drift, scan_composition, scan_a11y, score, report
from common import dump, owned_files, changed_files

CHECKER_VERSION = "0.4.0"
MEASURED = ("A1", "A2", "A3", "A4", "A5")
NOT_ASSESSED_NOTE = (
    "A4 (composition) covers the source-detectable rules — liquid-glass/zone/extension-pack "
    "correctness; holistic composition still benefits from a reviewer. A5 (accessibility) covers "
    "source signals — image text alternatives, icon-only control names, and zoom; colour CONTRAST "
    "needs a rendered pass and is not measured here. Spacing and typography remain out of scope.")


def sev_order_key(sev):
    return {"error": 0, "warn": 1, "info": 2}.get(sev, 3)


def group_upstream(upstream):
    """Collapse upstream findings by rule + PRIZM file, so the section reads as a
    short list of things to raise, not a repeat of the product findings."""
    groups = {}
    for f in upstream:
        key = (f["rule"], f["file"])
        g = groups.setdefault(key, {"rule": f["rule"], "file": f["file"], "count": 0,
                                    "severity": f["severity"], "message": f["message"],
                                    "snippet": f["snippet"], "lines": []})
        g["count"] += 1
        if len(g["lines"]) < 8:
            g["lines"].append(f["line"])
    out = sorted(groups.values(), key=lambda g: (sev_order_key(g["severity"]), -g["count"]))
    return out


def coverage_line(gt):
    c = gt["components"]
    stable = [k for k, v in c.items() if v["status"] == "stable"]
    with_variants = [k for k, v in c.items() if v.get("variants")]
    return (f'PRIZM {gt["prizm"]["version"]} · {len(stable)} stable components, contract data for '
            f'{len(stable)} · variant contracts for {len(with_variants)} · '
            f'{len(gt["packs"])} extension pack(s), generic handler covers all · '
            f'{len(gt["javafx"]["controls"])} JavaFX classes known · '
            f'spacing: not checked · typography: not checked · contrast: needs rendered pass · '
            f'composition rules: 3 authored (A4 source pass) · accessibility: source pass (A5)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", required=True, help="product repo to audit")
    ap.add_argument("--prizm", required=True, help="PRIZM checkout (ground truth)")
    ap.add_argument("--name", default=None)
    ap.add_argument("--out", default="reports")
    ap.add_argument("--exclude", nargs="*", default=[],
                    help="extra directory names to skip (generated code, vendored libs, fixtures)")
    ap.add_argument("--tier", default="T1 — full (source access)")
    ap.add_argument("--ground-truth", default=None, help="reuse an existing manifest")
    ap.add_argument("--since", default=None, metavar="GITREF",
                    help="incremental mode: scan only files changed since this git ref. "
                         "This is how the Checker fits a sprint or PR workflow.")
    ap.add_argument("--group-depth", type=int, default=2,
                    help="path depth for the per-module breakdown (default 2)")
    ap.add_argument("--max-findings", type=int, default=300,
                    help="cap the itemised findings list. Grouped fix list is always complete.")
    ap.add_argument("--no-upstream-file", action="store_true",
                    help="skip writing upstream-notes.md as well. The upstream section never "
                         "appears in the shared report either way.")
    ap.add_argument("--treat-as-consumer", action="store_true",
                    help="do NOT exempt verbatim PRIZM source. Only for stress-testing the "
                         "Checker's false-positive rate against known-good code.")
    a = ap.parse_args()

    product = a.name or os.path.basename(os.path.abspath(a.target))
    gt = json.load(open(a.ground_truth)) if a.ground_truth else ground_truth.build(a.prizm)

    only, mode = None, "full repo"
    if a.since:
        only = changed_files(a.target, a.since)
        if only is None:
            print(f"! could not resolve git ref {a.since!r} in {a.target} — falling back to a "
                  f"full scan. An incremental score is not comparable to a full one.")
        elif not only:
            print(f"No scannable files changed since {a.since}. Nothing to audit.")
            return
        else:
            mode = f"changed files since {a.since} ({len(only)} file(s))"

    if a.treat_as_consumer:
        mode += " — INTERNAL STRESS TEST (PRIZM-owned exemption disabled; not a product report)"
    owned = {} if a.treat_as_consumer else owned_files(a.target, gt, a.exclude, only)
    r1 = scan_tokens.scan(a.target, gt, a.exclude, owned, only)
    r2 = scan_components.scan(a.target, gt, a.exclude, owned, only)
    r3 = scan_drift.scan(a.target, gt, r2["vendored"], a.exclude, only)
    r4 = scan_composition.scan(a.target, gt, a.exclude, owned, only)
    r5 = scan_a11y.scan(a.target, gt, a.exclude, owned, only)

    # Scan the PRIZM-owned copies too, but file the results separately. These are
    # deviations in the design system's own code: the product team cannot fix them
    # and must not be scored on them, but they are the most valuable output of an
    # audit for whoever maintains PRIZM. Previously they were silently discarded.
    upstream = []
    pristine_owned = {k for k, v in r2["vendored"].items() if v.get("pristine")}
    pristine_owned |= {k for k, v in owned.items() if v.startswith("verbatim")}
    if pristine_owned:
        u = scan_tokens.scan(a.target, gt, a.exclude, owned={}, only=pristine_owned)
        for f in u["findings"]:
            if f["file"].startswith("("):
                continue
            f["kind"] = "upstream"
            f["upstream_source"] = owned.get(f["file"], r2["vendored"].get(f["file"], {}).get("slug", ""))
            upstream.append(f)
        upstream.sort(key=lambda f: (sev_order_key(f["severity"]), f["rule"], f["file"], f["line"]))

    results = {"A1": r1, "A2": r2, "A3": r3, "A4": r4, "A5": r5}
    findings = r1["findings"] + r2["findings"] + r3["findings"] + r4["findings"] + r5["findings"]
    findings.sort(key=lambda f: (sev_order_key(f["severity"]), f["rule"], f["file"], f["line"]))

    s = score.combine(results, MEASURED)
    top, grouped = score.rank_fixes(findings)
    modules, modules_truncated = score.module_rollup(results, MEASURED, a.group_depth)

    ctx = {
        "product": product, "date": datetime.date.today().isoformat(),
        "checker_version": CHECKER_VERSION, "tier": a.tier,
        "ground_truth": gt, "score": s, "findings": findings, "top_fixes": top,
        "coverage": {"files_scanned": r1["files_scanned"], "prizm_owned_exempt": len(owned),
                     "prizm_copies": r3["copies_checked"], "drifted": r3["copies_drifted"],
                     "components_adopted": r2["adopted"]},
        "not_assessed_note": NOT_ASSESSED_NOTE, "coverage_line": coverage_line(gt),
        "mode": mode, "modules": modules, "modules_truncated": modules_truncated,
        "grouped_fixes": [{k: v for k, v in g.items() if k != "example"} |
                          {"example_file": g["example"]["file"],
                           "example_message": g["example"]["message"]} for g in grouped],
        "max_findings": a.max_findings,
    }

    os.makedirs(a.out, exist_ok=True)

    # Findings inside verbatim PRIZM source go to a SEPARATE file, never into
    # report.md / report.html / report.json. Those three are what the product team
    # reads; this one is for whoever maintains PRIZM. Suppressing the check entirely
    # would throw away the only cheap signal about gaps in the system itself.
    up_groups = group_upstream(upstream)
    if up_groups and not a.no_upstream_file:
        lines = [f"# Upstream notes — {product}", "",
                 "**Internal. Not part of the alignment report and not for the product team.**", "",
                 f"These {len(upstream)} finding(s) sit inside this product's verbatim copies of "
                 f"PRIZM {gt['prizm']['version']} ({gt['prizm']['sha'][:8]}). The product team did "
                 f"not write this code, is not scored on it, and does not see this file.", "",
                 "They are recorded because a product audit is incidentally an audit of the design "
                 "system. A finding that recurs across several product audits is a system-level gap "
                 "with evidence behind it.", "",
                 "| Rule | Sev | PRIZM file | Count | Finding |", "|---|---|---|---|---|"]
        for g in up_groups:
            lines.append(f'| `{g["rule"]}` | {g["severity"]} | `{g["file"]}` | {g["count"]}× | '
                         f'{g["message"]} |')
        with open(os.path.join(a.out, "upstream-notes.md"), "w") as f:
            f.write("\n".join(lines) + "\n")
    with open(os.path.join(a.out, "report.md"), "w") as f:
        f.write(report.render_markdown(ctx))
    with open(os.path.join(a.out, "report.html"), "w") as f:
        f.write(report.render_html(ctx))
    # The JSON sidecar carries the complete grouped fix list plus a capped
    # itemised list. Emitting 20k raw findings produces an 11MB file nobody opens.
    dump({k: v for k, v in ctx.items() if k not in ("ground_truth", "findings")} |
         {"prizm": gt["prizm"], "findings": findings[:a.max_findings],
          "findings_total": len(findings),
          "findings_truncated": max(0, len(findings) - a.max_findings)},
         os.path.join(a.out, "report.json"))

    print(f'{product}: {s["overall"]}% ({s["band"]})  [{mode}]')
    for k, ax in s["axes"].items():
        print(f'  {k} {ax["name"]:<26} '
              f'{(str(ax["score"]) + "%") if ax["score"] is not None else "n/a":>7}'
              f'  {ax.get("findings", 0)} findings / {ax.get("opportunities", 0)} sites')
    counts = {}
    for f in findings:
        counts[f["severity"]] = counts.get(f["severity"], 0) + 1
    print(f'  {len(findings)} findings total: ' +
          ", ".join(f"{v} {k}" for k, v in sorted(counts.items())) or "  clean")
    print(f'  {len(owned)} file(s) exempt as PRIZM-owned (drift-checked only)')
    if up_groups and not a.no_upstream_file:
        print(f'  {len(upstream)} finding(s) in PRIZM\'s own code -> {a.out}/upstream-notes.md '
              f'(internal; not in the shared report)')
    real = [m for m in modules if not m["module"].startswith("(")]
    worst = [m for m in real if m["score"] is not None][:3]
    if len(real) >= 3 and worst:
        print('  worst modules: ' + ', '.join(f'{m["module"]} {m["score"]}%' for m in worst))
    print(f'  -> {a.out}/report.{{md,html,json}}')


if __name__ == "__main__":
    main()
