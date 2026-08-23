#!/usr/bin/env python3
"""Axis A2 — component adoption.

Answers "did they use PRIZM's component, or build their own?" The catalogue is
read from the manifest, so a component shipped upstream tomorrow is checked
tomorrow with no change here.
"""
import os, re
from common import Finding, read, walk_code, strip_comments, line_of, sha256, tag_snippet

# Raw HTML elements PRIZM has a first-class component for. Keyed by the element,
# valued by the PRIZM slug we'd point the developer at.
RAW_ELEMENTS = {
    "button": "button", "textarea": "textarea", "select": "select",
    "table": "table", "dialog": "dialog", "progress": "progress",
}
EXTERNAL_UI = {
    "@radix-ui": "Radix", "@mui/": "MUI", "@headlessui": "Headless UI",
    "antd": "Ant Design", "@ant-design": "Ant Design", "@chakra-ui": "Chakra",
    "react-bootstrap": "React Bootstrap", "@mantine": "Mantine",
    "flowbite": "Flowbite", "@nextui-org": "NextUI", "primereact": "PrimeReact",
    "react-modal": "react-modal", "sweetalert": "SweetAlert",
}
IMPORT_RE = re.compile(r"""import\s+(?:(\{[^}]*\})|(\w+))?[^;'"]*from\s+['"]([^'"]+)['"]""")
JSX_OPEN = re.compile(r"<([A-Z][A-Za-z0-9_]*)\b")


def vendored_prizm_files(target, gt, exclude=(), only=None):
    """Identify the consumer's own copies of PRIZM components — by canonical path
    or by exact content hash. These are exempt from hand-rolled checks, because a
    PRIZM component legitimately renders a raw <button>."""
    by_hash = {v["sha256"]: k for k, v in gt["components"].items() if v.get("sha256")}
    found = {}
    for ap, rel in walk_code(target, exclude, only):
        if not rel.endswith((".tsx", ".jsx")):
            continue
        norm = rel.replace(os.sep, "/")
        text = read(ap)
        h = sha256(text)
        slug = None
        m = re.search(r"components/ui/([a-z0-9-]+)\.(?:tsx|jsx)$", norm)
        if m and m.group(1) in gt["components"]:
            slug = m.group(1)
        elif h in by_hash:
            slug = by_hash[h]
        if slug:
            found[norm] = {"slug": slug, "sha256": h, "pristine": h == gt["components"][slug].get("sha256")}
    return found


def scan(target, gt, exclude=(), owned=None, only=None):
    vendored = vendored_prizm_files(target, gt, exclude, only)
    owned = owned or {}
    stable = {k: v for k, v in gt["components"].items() if v["status"] == "stable"}
    name_to_slug = {v["name"]: k for k, v in stable.items()}
    findings, adopted, hand_rolled = [], 0, 0
    per_file = {}

    for ap, rel in walk_code(target, exclude, only):
        norm = rel.replace(os.sep, "/")
        if norm in vendored or norm in owned:
            continue  # PRIZM's own components legitimately render raw elements
        text = read(ap)
        if not text:
            continue
        code = strip_comments(text)
        before_a, before_h = adopted, hand_rolled

        prizm_imported = set()
        for m in IMPORT_RE.finditer(code):
            named, default, source = m.group(1), m.group(2), m.group(3)
            if re.search(r"components/ui/[a-z0-9-]+$", source):
                for n in re.findall(r"\w+", named or default or ""):
                    prizm_imported.add(n)
            for pkg, label in EXTERNAL_UI.items():
                if source.startswith(pkg) or source == pkg.rstrip("/"):
                    hand_rolled += 1
                    findings.append(Finding(
                        "PZ-C02", "A2", "error", rel, line_of(code, m.start()),
                        f"Imports UI components from {label} — PRIZM components are curated, not "
                        f"assembled from external libraries.",
                        m.group(0)[:120],
                        "Replace with the PRIZM equivalent. If nothing fits, say so explicitly "
                        "and raise it rather than importing a parallel component system."))

        for m in JSX_OPEN.finditer(code):
            if m.group(1) in prizm_imported:
                adopted += 1

        if rel.endswith((".tsx", ".jsx", ".html", ".vue", ".svelte")):
            for el, slug in RAW_ELEMENTS.items():
                if slug not in stable:
                    continue
                for m in re.finditer(rf"<{el}(?=[\s>/])", code):
                    hand_rolled += 1
                    findings.append(Finding(
                        "PZ-C01", "A2", "error", rel, line_of(code, m.start()),
                        f"Raw <{el}> element where PRIZM ships `{stable[slug]['name']}`.",
                        tag_snippet(code, m.start()),
                        f"Import {{ {stable[slug]['name']} }} from your PRIZM components/ui/{slug}."))

            for m in re.finditer(r'<input\b([^>]*)>', code):
                attrs = m.group(1)
                tm = re.search(r'type\s*=\s*["\'](\w+)["\']', attrs)
                t = tm.group(1) if tm else "text"
                if t == "hidden":
                    continue
                slug = {"checkbox": "checkbox", "radio": "radio-group"}.get(t, "input")
                if slug in stable:
                    hand_rolled += 1
                    findings.append(Finding(
                        "PZ-C01", "A2", "error", rel, line_of(code, m.start()),
                        f"Raw <input type=\"{t}\"> where PRIZM ships `{stable[slug]['name']}`.",
                        tag_snippet(code, m.start()),
                        f"Use PRIZM's {stable[slug]['name']} — it carries the token styling, "
                        f"focus ring and a11y wiring."))

            for m in re.finditer(r'<div\b[^>]*>', code):
                tag = m.group(0)
                clickable = "onClick" in tag or "onclick" in tag
                looks_button = 'role="button"' in tag or "cursor-pointer" in tag
                if clickable and looks_button:
                    hand_rolled += 1
                    findings.append(Finding(
                        "PZ-C01", "A2", "error", rel, line_of(code, m.start()),
                        "Clickable <div> standing in for a button.",
                        tag_snippet(code, m.start()),
                        "Use PRIZM's Button. A div is not focusable, not keyboard-operable, "
                        "and announces nothing to a screen reader."))

        # JavaFX: second platform, same rule engine.
        if rel.endswith(".java"):
            for m in re.finditer(r"javafx\.scene\.control\.(\w+)", code):
                if f"Prizm{m.group(1)}" in gt["javafx"]["controls"]:
                    hand_rolled += 1
                    findings.append(Finding(
                        "PZ-C05", "A2", "error", rel, line_of(code, m.start()),
                        f"Raw JavaFX {m.group(1)} where PRIZM ships Prizm{m.group(1)}.",
                        m.group(0), f"Use design.prizm.fx.controls.Prizm{m.group(1)}."))

        per_file[norm] = (adopted - before_a) + (hand_rolled - before_h)

    return {"axis": "A2", "findings": findings, "per_file": per_file,
            "opportunities": adopted + hand_rolled,
            "adopted": adopted, "vendored": vendored}
