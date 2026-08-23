#!/usr/bin/env python3
"""Axis A1 — token compliance.

The strongest axis: PRIZM's legal colour / radius / shadow vocabulary is finite
and known exactly, so violations here are facts, not opinions. Every legal value
is read from the ground-truth manifest, never hardcoded.
"""
import os, re
from common import Finding, read, walk_code, strip_comments, line_of

HEX = re.compile(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])")
FUNC_COLOR = re.compile(r"\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\s*\([^)]{0,80}\)")
ARB_RADIUS = re.compile(r"(?<![\w-])rounded(?:-[a-z]+)?-\[[^\]]+\]")
ARB_SHADOW = re.compile(r"(?<![\w-])shadow-\[[^\]]+\]")
CSS_RADIUS = re.compile(r"border-radius\s*:\s*(?!var\()[^;]+;")
CSS_SHADOW = re.compile(r"box-shadow\s*:\s*(?!var\(|none|inset\s+0\s+0)[^;]+;")
EXT_ASSET = re.compile(r"""url\(\s*['"]?https?://|<(?:link|script|img|source)\b[^>]*?(?:src|href)\s*=\s*['"]https?://""", re.I)
FONT_FAMILY = re.compile(r"font-family\s*:\s*([^;]+);")
PRIZM_VAR_USE = re.compile(r"--prizm-[a-z0-9-]+")
PRIZM_VAR_DEF = re.compile(r"(--prizm-[a-z0-9-]+)\s*:")


def build_patterns(gt):
    fams = "|".join(gt["banned"]["tailwind_families"])
    prefixes = "|".join(gt["allowed"]["color_prefixes"])
    banned = re.compile(
        rf"(?<![\w-])(?:{prefixes})-(?:(?:{fams})-(?:50|100|200|300|400|500|600|700|800|900|950)|white|black)(?![\w-])")
    names = sorted(gt["tokens"]["semantic_names"], key=len, reverse=True)
    compliant_color = re.compile(rf"(?<![\w-])(?:{prefixes})-(?:{'|'.join(names)})(?![\w-])")
    radii = "|".join(sorted(gt["tokens"]["radius_steps"], key=len, reverse=True) or ["md"])
    shadows = "|".join(sorted(gt["tokens"]["shadow_steps"], key=len, reverse=True) or ["md"])
    compliant_shape = re.compile(rf"(?<![\w-])(?:rounded-(?:{radii})|shadow-(?:{shadows}))(?![\w-])")
    return banned, compliant_color, compliant_shape


LOOKED_UP_DEF = re.compile(r"(-color-[a-z0-9-]+)\s*:")


def is_token_file(rel, text):
    """A file that DEFINES design tokens is where raw colour literals belong.
    Covers both web custom properties (--prizm-*) and JavaFX looked-up colours
    (-color-*), so generated JavaFX themes are not flagged as violations."""
    norm = rel.replace(os.sep, "/")
    return (bool(PRIZM_VAR_DEF.search(text)) or bool(LOOKED_UP_DEF.search(text))
            or "/tokens/" in norm or "/themes/" in norm)


def scan(target, gt, exclude=(), owned=None, only=None):
    banned, compliant_color, compliant_shape = build_patterns(gt)
    prizm_vars = set(gt["tokens"]["defined_vars"])
    allowed_fonts = {f.lower() for f in gt["tokens"]["font_families"]} | {
        "ui-sans-serif", "system-ui", "sans-serif", "ui-monospace", "monospace",
        "inherit", "initial", "unset", "-apple-system", "blinkmacsystemfont"}

    findings, compliant, violating = [], 0, 0
    per_file = {}
    target_defined, used_vars = set(), set()
    files_scanned = 0

    owned = owned or {}
    for ap, rel in walk_code(target, exclude, only):
        if rel.replace(os.sep, "/") in owned:
            continue  # PRIZM's own code — judged by the drift axis, not this one
        text = read(ap)
        if not text:
            continue
        files_scanned += 1
        code = strip_comments(text)
        tokenfile = is_token_file(rel, code)

        before = violating
        ok = (len(compliant_color.findall(code)) + len(compliant_shape.findall(code))
              + len(re.findall(r"var\(\s*--prizm-", code))
              + len(re.findall(r"(?<![\w-])-color-[a-z-]+", code)))
        compliant += ok

        for m in banned.finditer(code):
            violating += 1
            # white/black are theme-neutral enough to be a warning rather than an
            # error; a palette step like bg-slate-800 is a hard break.
            sev = "warn" if m.group(0).endswith(("-white", "-black")) else "error"
            findings.append(Finding(
                "PZ-T01", "A1", sev, rel, line_of(code, m.start()),
                f"Raw Tailwind colour utility `{m.group(0)}` bypasses the token layer.",
                m.group(0),
                "Use the semantic equivalent (bg-surface / text-fg / border-border / bg-accent). "
                "Raw palette utilities do not change when the theme switches."))

        if not tokenfile:
            for pat in (HEX, FUNC_COLOR):
                for m in pat.finditer(code):
                    violating += 1
                    findings.append(Finding(
                        "PZ-T02", "A1", "error", rel, line_of(code, m.start()),
                        f"Hardcoded colour value `{m.group(0)}` outside a token file.",
                        code[max(0, m.start() - 40):m.end() + 20],
                        "Reference a PRIZM semantic token instead. A hardcoded value that happens "
                        "to match today will not follow a theme change."))

        for pat, rule in ((ARB_RADIUS, "radius"), (ARB_SHADOW, "shadow"),
                          (CSS_RADIUS, "radius"), (CSS_SHADOW, "shadow")):
            if tokenfile and pat in (CSS_RADIUS, CSS_SHADOW):
                continue
            for m in pat.finditer(code):
                violating += 1
                steps = gt["tokens"]["radius_steps"] if rule == "radius" else gt["tokens"]["shadow_steps"]
                findings.append(Finding(
                    "PZ-T03", "A1", "warn", rel, line_of(code, m.start()),
                    f"Arbitrary {rule} value — PRIZM defines {len(steps)} {rule} steps.",
                    m.group(0), f"Use one of: {', '.join(steps)}."))

        for m in EXT_ASSET.finditer(code):
            violating += 1
            findings.append(Finding(
                "PZ-T07", "A1", "error", rel, line_of(code, m.start()),
                "External asset reference — breaks air-gap discipline.",
                m.group(0), "Self-host the asset. PRIZM enforces this in CI for a reason."))

        if rel.endswith((".css", ".scss")):
            for m in FONT_FAMILY.finditer(code):
                first = m.group(1).split(",")[0].strip().strip('"\'').lower()
                if first and first not in allowed_fonts:
                    violating += 1
                    findings.append(Finding(
                        "PZ-T05", "A1", "warn", rel, line_of(code, m.start()),
                        f"Font family `{first}` is not part of the PRIZM stack.",
                        m.group(0).strip(),
                        f"PRIZM ships {', '.join(gt['tokens']['font_families'][:2]) or 'Inter'}."))

        target_defined |= set(PRIZM_VAR_DEF.findall(code))
        used_vars |= set(PRIZM_VAR_USE.findall(code))
        per_file[rel.replace(os.sep, "/")] = ok + (violating - before)

    # Template-literal construction (`--prizm-color-${name}`) leaves a bare
    # prefix behind; those are not invented tokens.
    target_defined = {n for n in target_defined if not n.endswith("-")}
    used_vars = {n for n in used_vars if not n.endswith("-")}
    for name in sorted(target_defined - prizm_vars):
        findings.append(Finding(
            "PZ-T04", "A1", "error", "(project-wide)", 0,
            f"Invented token `{name}` is not defined by PRIZM.", name,
            "Don't invent tokens. If a semantic token is missing, raise it as a "
            "system-level decision so every product gets it."))
        violating += 1
    for name in sorted(used_vars - prizm_vars - target_defined):
        findings.append(Finding(
            "PZ-T04", "A1", "error", "(project-wide)", 0,
            f"Token `{name}` is used but defined nowhere — neither in PRIZM nor locally.", name,
            "This resolves to nothing at runtime. Check for a typo or a stale token name."))
        violating += 1

    return {"axis": "A1", "findings": findings,
            "opportunities": compliant + violating, "per_file": per_file,
            "compliant": compliant, "files_scanned": files_scanned}
