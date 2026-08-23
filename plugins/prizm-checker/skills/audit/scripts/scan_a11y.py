#!/usr/bin/env python3
"""Axis A5 — accessibility (source pass).

Deterministic accessibility signals that are visible in source, across web and
JavaFX thick-client code:
  - images without a text alternative (web <img>, JavaFX ImageView / FXML)
  - icon-only controls with no accessible name (JavaFX)
  - viewports that block zoom (web)

Full colour-contrast is NOT assessed here: in source a colour is a token name,
not a resolved value, so contrast needs a rendered pass. That limit is reported,
never silently passed.
"""
import os
import re

import contrast
from common import Finding, line_of, read, strip_comments, walk_code

IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)
HAS_ALT = re.compile(r"\balt\s*=", re.I)
VIEWPORT_BLOCK = re.compile(r"user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?!\d)")
FXML_IMAGEVIEW = re.compile(r"<ImageView\b[^>]*>")
FXML_HAS_ACCTEXT = re.compile(r"accessibleText\s*=")
JAVA_NEW_IMAGEVIEW = re.compile(r"\bnew\s+ImageView\s*\(")
JAVA_ICON_ONLY = re.compile(r"\bnew\s+(?:Button|ToggleButton|Hyperlink|MenuButton)\s*\(\s*\"\"\s*,")
FILE_HAS_ACCTEXT = re.compile(r"setAccessibleText|accessibleText\s*[:=]")

WEB_EXT = {".tsx", ".ts", ".jsx", ".js", ".mjs", ".html", ".htm", ".vue", ".svelte"}
FX_EXT = {".java", ".fxml"}

# Contrast (PZ-A03): find a foreground + background colour set together, so the
# pair is locally knowable from source. Layout-inherited backgrounds are invisible
# here — that gap is why full contrast needs a rendered pass.
COLOR_LITERAL = re.compile(r"#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]*\)|oklch\([^)]*\)", re.I)
CSS_BLOCK = re.compile(r"\{([^{}]*)\}")
CSS_COLOR = re.compile(r"(?<![\w-])color\s*:\s*([^;}]+)", re.I)
CSS_BG = re.compile(r"(?<![\w-])background(?:-color)?\s*:\s*([^;}]+)", re.I)
STYLE_OBJ = re.compile(r"style\s*=\s*\{\{([^{}]*)\}\}")
JSX_COLOR = re.compile(r"""(?<![\w-])color\s*:\s*['"]([^'"]+)['"]""", re.I)
JSX_BG = re.compile(r"""(?<![\w-])background(?:Color)?\s*:\s*['"]([^'"]+)['"]""", re.I)
HTML_STYLE = re.compile(r'style\s*=\s*"([^"]*)"', re.I)
CLASS_ATTR = re.compile(r"""class(?:Name)?\s*=\s*["'`{]([^"'`}]+)""")
ARB_TEXT = re.compile(r"(?<![\w-])text-\[([^\]]+)\]")
ARB_BG = re.compile(r"(?<![\w-])bg-\[([^\]]+)\]")


def _snip(text, start, length=100):
    return text[start : start + length]


def _first_color(val):
    m = COLOR_LITERAL.search(val)
    return m.group(0) if m else val.strip()


def _dearb(v):
    return v.replace("_", " ")  # Tailwind arbitrary values use _ for spaces


def contrast_pairs(text, ext):
    """Yield (fg, bg, index) where a foreground and background colour are set in
    the same place: a CSS rule, an inline style, or one element's arbitrary
    Tailwind classes."""
    pairs = []
    if ext in (".css", ".scss"):
        for m in CSS_BLOCK.finditer(text):
            body = m.group(1)
            c, b = CSS_COLOR.search(body), CSS_BG.search(body)
            if c and b:
                pairs.append((_first_color(c.group(1)), _first_color(b.group(1)), m.start()))
        return pairs
    for m in STYLE_OBJ.finditer(text):
        c, b = JSX_COLOR.search(m.group(1)), JSX_BG.search(m.group(1))
        if c and b:
            pairs.append((c.group(1), _first_color(b.group(1)), m.start()))
    for m in HTML_STYLE.finditer(text):
        c, b = CSS_COLOR.search(m.group(1)), CSS_BG.search(m.group(1))
        if c and b:
            pairs.append((_first_color(c.group(1)), _first_color(b.group(1)), m.start()))
    for m in CLASS_ATTR.finditer(text):
        t, b = ARB_TEXT.search(m.group(1)), ARB_BG.search(m.group(1))
        if t and b:
            pairs.append((_dearb(t.group(1)), _dearb(b.group(1)), m.start()))
    return pairs


def scan(target, gt, exclude=(), owned=None, only=None):
    owned = owned or {}
    findings = []
    opps = 0
    per_file = {}
    files_scanned = 0

    for ap, rel in walk_code(target, exclude, only):
        norm = rel.replace(os.sep, "/")
        if norm in owned:
            continue  # PRIZM's own code — judged by A3, not the product's a11y
        ext = os.path.splitext(ap)[1].lower()
        raw = read(ap)
        if not raw:
            continue
        text = strip_comments(raw)
        files_scanned += 1
        before = opps

        if ext in WEB_EXT:
            for m in IMG_TAG.finditer(text):
                opps += 1
                if not HAS_ALT.search(m.group(0)):
                    findings.append(
                        Finding(
                            "PZ-A01", "A5", "error", norm, line_of(text, m.start()),
                            "Image without an alt attribute.", m.group(0),
                            'Add descriptive alt text, or alt="" for a decorative image.',
                        )
                    )
            for m in VIEWPORT_BLOCK.finditer(text):
                opps += 1
                findings.append(
                    Finding(
                        "PZ-A02", "A5", "error", norm, line_of(text, m.start()),
                        "Viewport prevents user zoom.", _snip(text, max(0, m.start() - 30), 80),
                        "Allow zoom to 200% — drop user-scalable=no / maximum-scale=1 (WCAG 1.4.4).",
                    )
                )

        if ext in FX_EXT:
            file_has_acc = bool(FILE_HAS_ACCTEXT.search(text))
            for m in FXML_IMAGEVIEW.finditer(text):
                opps += 1
                if not FXML_HAS_ACCTEXT.search(m.group(0)):
                    findings.append(
                        Finding(
                            "PZ-A10", "A5", "error", norm, line_of(text, m.start()),
                            "JavaFX ImageView without accessibleText.", m.group(0),
                            "Set accessibleText so screen readers can describe the image.",
                        )
                    )
            for m in JAVA_NEW_IMAGEVIEW.finditer(text):
                opps += 1
                if not file_has_acc:
                    findings.append(
                        Finding(
                            "PZ-A10", "A5", "error", norm, line_of(text, m.start()),
                            "JavaFX ImageView without a text alternative.", _snip(text, m.start()),
                            "Call setAccessibleText(...) on the image.",
                        )
                    )
            for m in JAVA_ICON_ONLY.finditer(text):
                opps += 1
                if not file_has_acc:
                    findings.append(
                        Finding(
                            "PZ-A11", "A5", "error", norm, line_of(text, m.start()),
                            "Icon-only control with no accessible name.", _snip(text, m.start()),
                            "Give icon-only controls setAccessibleText(...) so their purpose is announced.",
                        )
                    )

        # PZ-A03 — contrast on colour pairs we can resolve from source, held to
        # PRIZM's own AA policy (4.5:1 text) via the shared contrast module.
        for fg, bg, pos in contrast_pairs(text, ext):
            r = contrast.ratio(fg, bg)
            if r is None:
                continue  # a token/var/named colour we can't resolve without rendering
            opps += 1
            if r < contrast.AA_TEXT:
                findings.append(
                    Finding(
                        "PZ-A03", "A5", "error", norm, line_of(text, pos),
                        f"Text contrast {r:.2f}:1 is below WCAG AA (4.5:1).",
                        f"{fg} on {bg}",
                        "Meet PRIZM's contrast policy (WCAG AA, 4.5:1 for text). Prefer PRIZM fg/bg "
                        "token pairings — they are AA by design.",
                    )
                )

        if opps - before:
            per_file[norm] = opps - before

    return {
        "axis": "A5",
        "findings": findings,
        "opportunities": opps,
        "per_file": per_file,
        "files_scanned": files_scanned,
    }
