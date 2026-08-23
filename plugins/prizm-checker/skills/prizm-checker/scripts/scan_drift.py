#!/usr/bin/env python3
"""Axis A3 — component fidelity (drift).

The axis no other assessment layer can see. Because PRIZM ships by copy-paste,
every consumer owns a mutable copy of each component; a team that has quietly
added a seventh button variant looks aligned and isn't. This compares their copy
against upstream and classifies what changed.
"""
import difflib, os, re
from common import Finding, read, walk_code, strip_comments, line_of, tag_snippet

STRUCTURAL = {
    "cva(": "variant definition",
    "forwardRef": "ref forwarding",
    "cn(": "class merging",
    "variants:": "variant map",
    "defaultVariants": "default variants",
}


def classify(diff_lines):
    """Escalate a diff from cosmetic to structural if it touches the parts of a
    component that define its contract."""
    touched = set()
    for line in diff_lines:
        if not line.startswith(("+", "-")) or line.startswith(("+++", "---")):
            continue
        for needle, label in STRUCTURAL.items():
            if needle in line:
                touched.add(label)
        if re.search(r"(?<![\w-])(?:bg|text|border|ring|outline)-[a-z-]+", line):
            touched.add("token classes")
    return sorted(touched)


def scan(target, gt, vendored, exclude=(), only=None):
    prizm_root = gt["prizm"]["path"]
    findings = []
    checked, drifted = 0, 0
    per_file = {}

    # --- Copies of PRIZM components, compared against upstream -----------------
    for norm, info in sorted(vendored.items()):
        slug = info["slug"]
        meta = gt["components"][slug]
        upstream_path = os.path.join(prizm_root, meta["source"])
        if not os.path.isfile(upstream_path):
            continue
        checked += 1
        per_file[norm] = per_file.get(norm, 0) + 1
        if info["pristine"]:
            continue
        drifted += 1
        local = read(os.path.join(target, norm.replace("/", os.sep)))
        upstream = read(upstream_path)
        diff = list(difflib.unified_diff(upstream.splitlines(), local.splitlines(),
                                         "upstream", "local", lineterm="", n=0))
        touched = classify(diff)
        added = sum(1 for d in diff if d.startswith("+") and not d.startswith("+++"))
        removed = sum(1 for d in diff if d.startswith("-") and not d.startswith("---"))
        severity = "error" if touched else "warn"
        findings.append(Finding(
            "PZ-D01", "A3", severity, norm, 1,
            f"`{meta['name']}` has been modified from PRIZM {gt['prizm']['version']} "
            f"(+{added}/-{removed} lines"
            + (f"; touches {', '.join(touched)}" if touched else "; cosmetic only") + ").",
            "\n".join(d for d in diff[:6]),
            "Reconcile with upstream, or if the change is genuinely needed, raise it so "
            "PRIZM absorbs it and every product benefits."
            if touched else "Likely a formatting difference — re-copy from upstream to stay in sync."))

    # --- Illegal variant values and overrides that fight the component ---------
    name_to_slug = {v["name"]: k for k, v in gt["components"].items() if v.get("variants")}
    if name_to_slug:
        names = "|".join(sorted(name_to_slug, key=len, reverse=True))
        tag_re = re.compile(rf"<({names})\b([^>]*)>", re.S)
        for ap, rel in walk_code(target, exclude, only):
            if not rel.endswith((".tsx", ".jsx")):
                continue
            norm = rel.replace(os.sep, "/")
            if norm in vendored:
                continue
            code = strip_comments(read(ap))
            for m in tag_re.finditer(code):
                comp, attrs = m.group(1), m.group(2)
                slug = name_to_slug[comp]
                legal = gt["components"][slug]["variants"]
                for group, options in legal.items():
                    am = re.search(rf'{group}\s*=\s*["\']([\w-]+)["\']', attrs)
                    if not am:
                        continue
                    checked += 1
                    per_file[norm] = per_file.get(norm, 0) + 1
                    if am.group(1) not in options:
                        drifted += 1
                        findings.append(Finding(
                            "PZ-D02", "A3", "error", rel, line_of(code, m.start()),
                            f"`{comp} {group}=\"{am.group(1)}\"` is not a legal value.",
                            tag_snippet(code, m.start()),
                            f"Legal {group} values are: {', '.join(options)}."))
                cm = re.search(r'className\s*=\s*["\']([^"\']*)["\']', attrs)
                if cm:
                    fighting = re.findall(
                        r"(?<![\w-])(?:bg-\S+|text-(?!left|right|center|justify)\S+|rounded\S*|h-\d+|w-\d+|border-\S+)",
                        cm.group(1))
                    if fighting:
                        checked += 1
                        per_file[norm] = per_file.get(norm, 0) + 1
                        drifted += 1
                        findings.append(Finding(
                            "PZ-D03", "A3", "warn", rel, line_of(code, m.start()),
                            f"`{comp}` is passed className utilities that override its variant "
                            f"styling ({', '.join(fighting[:4])}).",
                            tag_snippet(code, m.start()),
                            "Pick the variant that already looks like this, or raise a new variant "
                            "upstream. Local overrides are how a component silently forks."))

    return {"axis": "A3", "findings": findings, "opportunities": checked, "per_file": per_file,
            "copies_checked": len(vendored), "copies_drifted": drifted}
