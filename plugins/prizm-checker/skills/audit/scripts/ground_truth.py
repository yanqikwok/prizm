#!/usr/bin/env python3
"""Ground-truth extractor.

Reads a pinned PRIZM checkout and emits ONE JSON manifest that every scanner
consumes. This is the keystone of the Checker: no scanner may contain a
hardcoded PRIZM fact. Add a component or a token upstream and it is known on
the next run of this script.

Usage:
  python3 ground_truth.py --prizm <path-to-prizm-checkout> --out ground-truth.json
"""
import argparse, os, re, subprocess, sys, json
from common import read, sha256, match_braces

# Tailwind's built-in colour families. Any `<prefix>-<family>-<step>` utility is a
# raw colour and therefore off-system, because it bypasses the token indirection.
TW_FAMILIES = ["slate","gray","zinc","neutral","stone","red","orange","amber","yellow",
               "lime","green","emerald","teal","cyan","sky","blue","indigo","violet",
               "purple","fuchsia","pink","rose"]
COLOR_PREFIXES = ["bg","text","border","ring","outline","fill","stroke","divide","from",
                  "to","via","placeholder","caret","accent","decoration","shadow"]


def git_sha(path):
    try:
        return subprocess.run(["git", "-C", path, "rev-parse", "HEAD"],
                              capture_output=True, text=True, timeout=10).stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def parse_token_files(prizm):
    """Collect every --prizm-* custom property defined anywhere in styles/tokens,
    plus which theme selectors exist. Values are kept so we can resolve the
    palette to hex and detect hardcoded equivalents."""
    tokens_dir = os.path.join(prizm, "styles", "tokens")
    defined, raw_values, selectors, files = set(), {}, set(), []
    if not os.path.isdir(tokens_dir):
        return defined, raw_values, sorted(selectors), files
    for fn in sorted(os.listdir(tokens_dir)):
        if not fn.endswith(".css"):
            continue
        files.append(f"styles/tokens/{fn}")
        css = read(os.path.join(tokens_dir, fn))
        for sel in re.findall(r"^\s*([^\s{][^{]*?)\s*\{", css, re.M):
            sel = sel.strip()
            if sel and not sel.startswith("/*"):
                selectors.add(sel)
        for name, val in re.findall(r"(--prizm-[a-z0-9-]+)\s*:\s*([^;]+);", css):
            defined.add(name)
            raw_values.setdefault(name, val.strip())
    return defined, raw_values, sorted(selectors), files


def parse_theme_block(prizm):
    """Read the Tailwind @theme block: it declares which semantic names exist as
    utilities (--color-x -> bg-x / text-x / border-x), plus radius and shadow steps."""
    css = read(os.path.join(prizm, "app", "globals.css"))
    idx = css.find("@theme")
    semantic, radius, shadow, fonts = [], [], [], []
    if idx == -1:
        return semantic, radius, shadow, fonts
    block = css[idx:match_braces(css, css.index("{", idx))]
    for name in re.findall(r"--color-([a-z0-9-]+)\s*:", block):
        semantic.append(name)
    for name in re.findall(r"--radius-([a-z0-9-]+)\s*:", block):
        radius.append(name)
    for name in re.findall(r"--shadow-([a-z0-9-]+)\s*:", block):
        shadow.append(name)
    for _, fam in re.findall(r"--font-(sans|mono)\s*:\s*([^;]+);", block):
        fonts += [f.strip().strip('"\'') for f in fam.split(",")]
    return semantic, radius, shadow, fonts


def parse_registry(prizm):
    """Parse lib/components-registry.ts — the canonical component list. PRIZM's own
    `pnpm audit:components` guarantees this agrees with the API file and the source,
    which is exactly why it is safe to treat as ground truth."""
    src = read(os.path.join(prizm, "lib", "components-registry.ts"))
    comps = {}
    for m in re.finditer(r"\{\s*slug:\s*\"([a-z0-9-]+)\"(.*?)\}", src, re.S):
        slug, body = m.group(1), m.group(2)
        def field(k):
            fm = re.search(rf'{k}:\s*"([^"]*)"', body)
            return fm.group(1) if fm else None
        comps[slug] = {
            "slug": slug,
            "name": field("name") or slug,
            "category": field("category"),
            "status": field("status") or "stable",
            "builtOn": field("builtOn"),
            "javafx": field("javafx"),
        }
    return comps


def parse_cva_variants(source):
    """Extract the legal variant groups and their option names from a cva() call.
    This reads the implementation rather than the docs, so it cannot drift."""
    out = {}
    vi = source.find("variants:")
    if vi == -1:
        return out
    try:
        open_idx = source.index("{", vi)
    except ValueError:
        return out
    # Inner content only — otherwise the enclosing `variants: {` is itself
    # matched as a group and every option collapses into one bucket.
    block = source[open_idx + 1: match_braces(source, open_idx) - 1]
    # each top-level group: `name: { opt: "...", opt2: "..." }`
    pos = 0
    while True:
        gm = re.search(r"(\w+):\s*\{", block[pos:])
        if not gm:
            break
        gstart = pos + gm.end() - 1
        gend = match_braces(block, gstart)
        group_body = block[gstart:gend]
        opts = re.findall(r'(?:^|[{,]\s*)["\']?([A-Za-z0-9_]+)["\']?\s*:\s*["\`]', group_body)
        if opts:
            out[gm.group(1)] = sorted(set(opts))
        pos = gend
    return out


def parse_components(prizm, registry):
    comps = {}
    for slug, meta in registry.items():
        rel = f"components/ui/{slug}.tsx"
        ap = os.path.join(prizm, rel)
        entry = dict(meta)
        entry["source"] = rel
        if os.path.isfile(ap):
            src = read(ap)
            entry["sha256"] = sha256(src)
            entry["lines"] = src.count("\n") + 1
            entry["variants"] = parse_cva_variants(src)
            entry["exports"] = sorted(set(re.findall(r"export const (\w+)", src)))
            entry["present"] = True
        else:
            entry.update(sha256=None, variants={}, exports=[], present=False)
        comps[slug] = entry
    return comps


def parse_packs(prizm):
    """A pack is a repeatable shape, not a special case: token overlay files named
    <pack>-{light,dark}.css, a components/<pack>/ directory of organisms, and
    activation via data-pack="<pack>". Discovered generically so a future pack
    needs no Checker change."""
    packs = {}
    comp_root = os.path.join(prizm, "components")
    tokens_dir = os.path.join(prizm, "styles", "tokens")
    known_non_pack = {"ui", "site"}
    if os.path.isdir(comp_root):
        for d in sorted(os.listdir(comp_root)):
            if d in known_non_pack or not os.path.isdir(os.path.join(comp_root, d)):
                continue
            organisms = {}
            for fn in sorted(os.listdir(os.path.join(comp_root, d))):
                if fn.endswith(".tsx"):
                    s = read(os.path.join(comp_root, d, fn))
                    organisms[fn[:-4]] = {"source": f"components/{d}/{fn}", "sha256": sha256(s)}
            overlays = []
            if os.path.isdir(tokens_dir):
                overlays = [f"styles/tokens/{f}" for f in sorted(os.listdir(tokens_dir))
                            if f.startswith(d + "-")]
            packs[d] = {"slug": d, "organisms": organisms, "token_overlays": overlays,
                        "activation": f'data-pack="{d}"'}
    return packs


def parse_javafx(prizm):
    """Second platform, not a bolt-on: discover Prizm* controls and the looked-up
    -color-* names the generated themes expose."""
    controls, looked_up = {}, set()
    base = os.path.join(prizm, "javafx", "src", "main", "java", "design", "prizm", "fx")
    for sub in ("controls", "templates", "rc3"):
        d = os.path.join(base, sub)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if fn.endswith(".java"):
                controls[fn[:-5]] = f"javafx/src/main/java/design/prizm/fx/{sub}/{fn}"
    themes = os.path.join(prizm, "javafx", "src", "main", "resources", "prizm", "themes")
    if os.path.isdir(themes):
        for fn in os.listdir(themes):
            for name in re.findall(r"(-color-[a-z0-9-]+)\s*:", read(os.path.join(themes, fn))):
                looked_up.add(name)
    return {"controls": controls, "looked_up_colors": sorted(looked_up)}


def index_owned(prizm):
    """Hash every file PRIZM itself ships. A consumer's verbatim copy of PRIZM
    source is not the consumer's work: it must be exempt from token and adoption
    checks and judged only by the drift axis. Without this the Checker blames
    product teams for the design system's own code."""
    from common import walk_code
    owned = {}
    for ap, rel in walk_code(prizm):
        owned[sha256(read(ap))] = rel.replace(os.sep, "/")
    return owned


def build(prizm):
    version = "unknown"
    pkg = os.path.join(prizm, "package.json")
    if os.path.isfile(pkg):
        version = json.loads(read(pkg)).get("version", "unknown")

    defined, raw_values, selectors, token_files = parse_token_files(prizm)
    semantic, radius, shadow, fonts = parse_theme_block(prizm)
    registry = parse_registry(prizm)
    components = parse_components(prizm, registry)

    allowed_utilities = sorted({f"{p}-{n}" for p in COLOR_PREFIXES for n in semantic})
    allowed_radius = sorted({f"rounded-{r}" for r in radius} | {"rounded", "rounded-none", "rounded-full"})
    allowed_shadow = sorted({f"shadow-{s}" for s in shadow} | {"shadow-none"})

    return {
        "prizm": {
            "version": version,
            "sha": git_sha(prizm),
            "path": os.path.abspath(prizm),
            "token_files": token_files,
        },
        "tokens": {
            "semantic_names": sorted(semantic),
            "defined_vars": sorted(defined),
            "radius_steps": sorted(radius),
            "shadow_steps": sorted(shadow),
            "font_families": fonts,
            "theme_selectors": selectors,
        },
        "allowed": {
            "color_utilities": allowed_utilities,
            "radius_utilities": allowed_radius,
            "shadow_utilities": allowed_shadow,
            "color_prefixes": COLOR_PREFIXES,
        },
        "banned": {"tailwind_families": TW_FAMILIES},
        "components": components,
        "packs": parse_packs(prizm),
        "javafx": parse_javafx(prizm),
        "owned_hashes": index_owned(prizm),
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--prizm", required=True)
    ap.add_argument("--out", default="ground-truth.json")
    a = ap.parse_args()
    if not os.path.isdir(a.prizm):
        sys.exit(f"not a directory: {a.prizm}")
    gt = build(a.prizm)
    with open(a.out, "w") as f:
        json.dump(gt, f, indent=2)
    t, c, p = gt["tokens"], gt["components"], gt["packs"]
    stable = [k for k, v in c.items() if v["status"] == "stable"]
    print(f"PRIZM {gt['prizm']['version']} @ {gt['prizm']['sha'][:8]}")
    print(f"  {len(t['semantic_names'])} semantic colour names, {len(t['defined_vars'])} vars, "
          f"{len(t['radius_steps'])} radii, {len(t['shadow_steps'])} shadows")
    print(f"  {len(c)} components ({len(stable)} stable), "
          f"{sum(1 for v in c.values() if v['variants'])} with variant contracts")
    print(f"  {len(p)} extension pack(s): {', '.join(p) or 'none'}")
    print(f"  {len(gt['javafx']['controls'])} JavaFX classes")
    print(f"  {len(gt['owned_hashes'])} PRIZM-owned source files indexed by hash")
    print(f"  -> {a.out}")
