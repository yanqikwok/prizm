#!/usr/bin/env python3
"""Axis A4 — composition & pattern (source pass).

Composition is largely a judgement axis, but a few misuses ARE deterministic in
source and worth catching automatically:
  - liquid-glass (a C3-only surface treatment) used in product code
  - conflicting product zones declared in one file
  - an extension pack used without its activation marker

These are the source-detectable slice. Holistic composition (does a screen follow
PRIZM's layout/hierarchy patterns?) still needs a reviewer — findings here are
tagged `judgement` so a team can push back. Pack facts come from the ground-truth
manifest, never hardcoded.
"""
import os
import re

from common import Finding, line_of, read, strip_comments, walk_code

# Liquid glass is C3-only (see PRIZM foundations). Catch both the CSS custom
# properties and the utility/class forms.
GLASS = re.compile(r"--prizm-glass-[a-z0-9-]+|(?<![\w-])glass-(?:chrome|panel)(?![\w-])|\bdata-glass\b")
ZONE = re.compile(r"""data-zone\s*=\s*["']([a-z0-9-]+)["']""")
KNOWN_ZONES = {"c3", "enterprise"}


def scan(target, gt, exclude=(), owned=None, only=None):
    owned = owned or {}
    packs = gt.get("packs", {})
    pack_import = {s: re.compile(rf"""from\s+["'][^"']*/{re.escape(s)}/""") for s in packs}
    pack_activation = {
        s: re.compile(rf"""data-pack\s*=\s*["']{re.escape(s)}["']""") for s in packs
    }

    findings = []
    opps = 0
    per_file = {}
    files_scanned = 0

    for ap, rel in walk_code(target, exclude, only):
        norm = rel.replace(os.sep, "/")
        if norm in owned:
            continue
        raw = read(ap)
        if not raw:
            continue
        text = strip_comments(raw)
        files_scanned += 1
        before = opps

        # PZ-P01 — liquid glass (C3-only treatment)
        for m in GLASS.finditer(text):
            opps += 1
            findings.append(
                Finding(
                    "PZ-P01", "A4", "warn", norm, line_of(text, m.start()),
                    "Liquid-glass treatment used — it is a C3-only surface treatment.",
                    m.group(0),
                    "Use liquid glass only on C3 surfaces; on Enterprise use a solid surface token.",
                    kind="judgement",
                )
            )

        # PZ-P06 — conflicting product zones in one file
        zones = set(ZONE.findall(text))
        if zones:
            opps += 1
            if len(zones & KNOWN_ZONES) > 1:
                m = ZONE.search(text)
                findings.append(
                    Finding(
                        "PZ-P06", "A4", "warn", norm, line_of(text, m.start()),
                        f"Conflicting product zones declared in one file: {', '.join(sorted(zones))}.",
                        "",
                        "A screen belongs to one zone — set data-zone once at the shell, and split C3 and Enterprise surfaces.",
                        kind="judgement",
                    )
                )

        # PZ-P10 — extension pack used without its activation marker
        for s in packs:
            m = pack_import[s].search(text)
            if m:
                opps += 1
                if not pack_activation[s].search(text):
                    findings.append(
                        Finding(
                            "PZ-P10", "A4", "warn", norm, line_of(text, m.start()),
                            f"Uses the {s} extension pack without its activation marker.",
                            m.group(0),
                            f"Set {packs[s].get('activation', 'the pack activation marker')} on the surface so the pack's tokens apply.",
                            kind="judgement",
                        )
                    )

        if opps - before:
            per_file[norm] = opps - before

    return {
        "axis": "A4",
        "findings": findings,
        "opportunities": opps,
        "per_file": per_file,
        "files_scanned": files_scanned,
    }
