"""WCAG contrast, using the SAME maths PRIZM's own scripts/audit-contrast.ts uses
(Oklab → linear sRGB → relative luminance → WCAG ratio) and the SAME policy
(AA: 4.5:1 text, 3.0:1 non-text). Keeping the path identical means the Checker
holds product code to exactly the standard PRIZM holds itself to.

Only colours that resolve to a concrete sRGB value from source are scored — hex,
rgb()/rgba(), and oklch(). PRIZM token pairings (var(--color-*) / bg-*/text-*) are
not recomputed here: PRIZM's CI already guarantees those meet AA, and their
resolved value depends on the active theme, which source does not fix.
"""
import math
import re

AA_TEXT = 4.5
AA_NON_TEXT = 3.0

_HEX = re.compile(r"^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
_RGB = re.compile(r"rgba?\(\s*([^)]+)\)", re.I)
_OKLCH = re.compile(r"oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)", re.I)


def _hex_to_srgb(h):
    h = h.lstrip("#")
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h[:3])
    elif len(h) == 8:
        h = h[:6]
    if len(h) != 6:
        return None
    try:
        return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return None


def _rgb_to_srgb(value):
    m = _RGB.search(value)
    if not m:
        return None
    parts = [p for p in re.split(r"[,\s/]+", m.group(1).strip()) if p][:3]
    if len(parts) < 3:
        return None
    out = []
    for p in parts:
        try:
            out.append(float(p[:-1]) / 100 if p.endswith("%") else float(p) / 255)
        except ValueError:
            return None
    return tuple(out)


def _oklch_to_srgb(value):
    m = _OKLCH.search(value)
    if not m:
        return None
    L = float(m.group(1))
    if m.group(2) == "%" or L > 1:
        L /= 100
    c = float(m.group(3))
    h = float(m.group(4))
    hr = math.radians(h)
    a = c * math.cos(hr)
    b = c * math.sin(hr)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    lc, mc, sc = l_**3, m_**3, s_**3
    r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
    g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
    bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc

    def to_srgb(v):
        v = 12.92 * v if v <= 0.0031308 else 1.055 * (v ** (1 / 2.4)) - 0.055
        return max(0.0, min(1.0, v))

    return (to_srgb(r), to_srgb(g), to_srgb(bl))


def to_srgb(value):
    """Resolve a CSS colour literal to (r,g,b) in 0..1, or None if not a literal
    we can resolve (e.g. a var(), a named colour other than black/white, a token)."""
    if not value:
        return None
    v = value.strip().lower()
    if v in ("white", "#fff", "#ffffff"):
        return (1.0, 1.0, 1.0)
    if v in ("black", "#000", "#000000"):
        return (0.0, 0.0, 0.0)
    if _HEX.match(v):
        return _hex_to_srgb(v)
    if v.startswith("rgb"):
        return _rgb_to_srgb(v)
    if v.startswith("oklch"):
        return _oklch_to_srgb(v)
    return None


def _luminance(rgb):
    def lin(x):
        return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(fg_value, bg_value):
    """WCAG contrast ratio between two colour literals, or None if either is
    unresolvable from source."""
    fg = to_srgb(fg_value)
    bg = to_srgb(bg_value)
    if fg is None or bg is None:
        return None
    lf, lb = _luminance(fg), _luminance(bg)
    return (max(lf, lb) + 0.05) / (min(lf, lb) + 0.05)
