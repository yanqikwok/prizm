#!/usr/bin/env python3
"""Scoring. Deliberately conservative: scores are per-axis against an opportunity
denominator, never violations-per-file (noisy) or violations-per-line (gameable).
Axes that this tier cannot measure are reported as n/a and dropped from the
weighted mean — never silently assumed clean."""

SEVERITY_WEIGHT = {"error": 1.0, "warn": 0.4, "info": 0.1}
AXIS_WEIGHT = {"A1": 0.30, "A2": 0.25, "A3": 0.20, "A4": 0.15, "A5": 0.10}
AXIS_NAME = {
    "A1": "Token compliance", "A2": "Component adoption", "A3": "Component fidelity",
    "A4": "Composition & pattern", "A5": "Accessibility & contrast",
}
BANDS = [(90, "Aligned"), (75, "Mostly aligned"), (50, "Partial"), (0, "Off-system")]

# Below this many opportunities an axis score swings wildly on a single finding, so
# it is reported but marked low-confidence rather than presented as a measurement.
MIN_CONFIDENT_OPPORTUNITIES = 15
MIN_CONFIDENT_TOTAL = 60


def band(pct):
    for floor, label in BANDS:
        if pct >= floor:
            return label
    return "Off-system"


def score_axis(result):
    opps = result.get("opportunities", 0)
    weighted = sum(SEVERITY_WEIGHT.get(f["severity"], 0.4) for f in result["findings"])
    if opps == 0:
        return None, weighted, 0
    pct = max(0.0, 1.0 - weighted / opps) * 100
    return round(pct, 1), weighted, opps


def combine(results, measured_axes):
    axes, total_w, acc = {}, 0.0, 0.0
    for axis in ("A1", "A2", "A3", "A4", "A5"):
        r = results.get(axis)
        if axis not in measured_axes or r is None:
            axes[axis] = {"name": AXIS_NAME[axis], "score": None, "status": "not assessed",
                          "weight": AXIS_WEIGHT[axis]}
            continue
        pct, weighted, opps = score_axis(r)
        if pct is None:
            axes[axis] = {"name": AXIS_NAME[axis], "score": None, "status": "no opportunities found",
                          "weight": AXIS_WEIGHT[axis], "findings": len(r["findings"])}
            continue
        axes[axis] = {"name": AXIS_NAME[axis], "score": pct,
                      "status": "measured" if opps >= MIN_CONFIDENT_OPPORTUNITIES
                                else f"measured, but only {opps} site(s) — low confidence",
                      "low_confidence": opps < MIN_CONFIDENT_OPPORTUNITIES,
                      "weight": AXIS_WEIGHT[axis], "opportunities": opps,
                      "weighted_violations": round(weighted, 1),
                      "findings": len(r["findings"])}
        acc += pct * AXIS_WEIGHT[axis]
        total_w += AXIS_WEIGHT[axis]
    overall = round(acc / total_w, 1) if total_w else None
    total_opps = sum(a.get("opportunities", 0) for a in axes.values())
    weak = [k for k, a in axes.items() if a.get("low_confidence")]
    low = total_opps < MIN_CONFIDENT_TOTAL or bool(weak)
    caution = None
    if low:
        bits = []
        if total_opps < MIN_CONFIDENT_TOTAL:
            bits.append(f"only {total_opps} styling/component sites were found in scope")
        if weak:
            bits.append("thin evidence on " + ", ".join(weak))
        caution = ("Indicative only — " + "; ".join(bits) +
                   ". A score off a handful of sites moves several points on one finding. "
                   "Read the findings, not the number.")
    return {"overall": overall, "band": band(overall) if overall is not None else "n/a",
            "axes": axes, "coverage_weight": round(total_w, 2),
            "low_confidence": low, "caution": caution, "total_opportunities": total_opps}


def rank_fixes(findings, limit=5):
    """Rank by severity x frequency: the same rule hit 40 times is one fix worth
    doing, not 40 separate problems."""
    groups = {}
    for f in findings:
        g = groups.setdefault((f["rule"], f["message"].split("`")[0][:60]), {
            "rule": f["rule"], "axis": f["axis"], "severity": f["severity"],
            "count": 0, "files": set(), "example": f, "suggestion": f["suggestion"]})
        g["count"] += 1
        g["files"].add(f["file"])
    out = []
    for g in groups.values():
        g["files"] = sorted(g["files"])
        g["impact"] = SEVERITY_WEIGHT.get(g["severity"], 0.4) * g["count"]
        out.append(g)
    out.sort(key=lambda g: -g["impact"])
    return out[:limit], out


def module_rollup(results, measured_axes, depth=2, min_opportunities=20, limit=25):
    """Per-module scores. On a large codebase a single number is useless — the
    actionable question is which modules are off-system, so the same maths is
    applied per directory bucket. Modules below min_opportunities are folded into
    "(small modules)" rather than shown with a wildly unstable score."""
    from common import module_of
    buckets = {}
    for axis in measured_axes:
        r = results.get(axis)
        if not r:
            continue
        for rel, opps in r.get("per_file", {}).items():
            b = buckets.setdefault(module_of(rel, depth), {})
            b.setdefault(axis, {"opps": 0.0, "weighted": 0.0, "findings": 0})
            b[axis]["opps"] += opps
        for f in r["findings"]:
            if not f["file"] or f["file"].startswith("("):
                continue
            b = buckets.setdefault(module_of(f["file"], depth), {})
            b.setdefault(axis, {"opps": 0.0, "weighted": 0.0, "findings": 0})
            if f["axis"] == axis:
                b[axis]["weighted"] += SEVERITY_WEIGHT.get(f["severity"], 0.4)
                b[axis]["findings"] += 1

    rows, small = [], {"opps": 0.0, "weighted": 0.0, "findings": 0, "modules": 0}
    for name, axes in buckets.items():
        opps = sum(a["opps"] for a in axes.values())
        weighted = sum(a["weighted"] for a in axes.values())
        findings = sum(a["findings"] for a in axes.values())
        if opps < min_opportunities:
            small["opps"] += opps; small["weighted"] += weighted
            small["findings"] += findings; small["modules"] += 1
            continue
        acc = tw = 0.0
        per_axis = {}
        for axis, a in axes.items():
            if a["opps"] <= 0:
                continue
            pct = max(0.0, 1 - a["weighted"] / a["opps"]) * 100
            per_axis[axis] = round(pct, 1)
            acc += pct * AXIS_WEIGHT[axis]; tw += AXIS_WEIGHT[axis]
        score = round(acc / tw, 1) if tw else None
        rows.append({"module": name, "score": score, "band": band(score) if score is not None else "n/a",
                     "findings": findings, "opportunities": int(opps), "axes": per_axis})
    rows.sort(key=lambda r: (r["score"] if r["score"] is not None else 999))
    truncated = max(0, len(rows) - limit)
    out = rows[:limit]
    if small["modules"]:
        sc = round(max(0.0, 1 - small["weighted"] / small["opps"]) * 100, 1) if small["opps"] else None
        out.append({"module": f'(small modules \u00d7{small["modules"]})', "score": sc,
                    "band": band(sc) if sc is not None else "n/a",
                    "findings": small["findings"], "opportunities": int(small["opps"]), "axes": {}})
    return out, truncated
