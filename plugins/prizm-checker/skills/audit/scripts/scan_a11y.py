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


def _snip(text, start, length=100):
    return text[start : start + length]


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

        if opps - before:
            per_file[norm] = opps - before

    return {
        "axis": "A5",
        "findings": findings,
        "opportunities": opps,
        "per_file": per_file,
        "files_scanned": files_scanned,
    }
