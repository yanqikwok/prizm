"""Shared helpers for the PRIZM Checker. Python 3 stdlib only — no deps,
so it runs in air-gapped environments and in repos with no node_modules."""
import json, os, re, hashlib

CODE_EXT = {".tsx", ".ts", ".jsx", ".js", ".mjs", ".css", ".scss", ".html", ".vue",
            ".svelte", ".java", ".fxml"}
SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "build", "out", "coverage",
             ".turbo", ".cache", "vendor", "__pycache__", ".venv", "target",
             "generated", "__generated__", ".gradle", "storybook-static"}

def sha256(text):
    return hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()

def read(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            return f.read()
    except (OSError, IsADirectoryError):
        return ""

def walk_code(root, extra_skip=(), only=None):
    """Yield (abs_path, rel_path) for every scannable source file.
    `only` restricts the walk to a set of posix relpaths — the mechanism behind
    incremental (changed-files-only) runs."""
    skip = SKIP_DIRS | set(extra_skip)
    only = None if only is None else {o.replace(os.sep, "/") for o in only}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip and not d.startswith(".")]
        for fn in filenames:
            if os.path.splitext(fn)[1] in CODE_EXT:
                ap = os.path.join(dirpath, fn)
                rel = os.path.relpath(ap, root)
                if only is not None and rel.replace(os.sep, "/") not in only:
                    continue
                yield ap, rel

def tag_snippet(text, start, limit=180):
    """Capture a whole opening tag rather than a fixed number of characters, so a
    snippet never stops mid-attribute."""
    depth, end = 0, None
    for i in range(start, min(len(text), start + limit)):
        c = text[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth = max(0, depth - 1)
        elif c == ">" and depth == 0 and text[i - 1] not in "=-":
            end = i + 1  # a real tag close, not the > of an arrow function
            break
    return text[start:end if end else start + limit]


def match_braces(text, open_idx):
    """Given index of an opening brace, return index just past its match."""
    depth = 0
    for i in range(open_idx, len(text)):
        c = text[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
    return len(text)

def line_of(text, idx):
    return text.count("\n", 0, idx) + 1

def strip_comments(text):
    """Remove /* */ and // comments so they don't produce findings.
    Conservative: leaves strings alone by not attempting string parsing,
    which is acceptable because we only use this for literal detection."""
    text = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)
    text = re.sub(r"(?<!:)//[^\n]*", "", text)
    return text

class Finding(dict):
    def __init__(self, rule, axis, severity, file, line, message, snippet="",
                 suggestion="", kind="deterministic"):
        # Collapse runs of whitespace so a multi-line JSX tag renders as one
        # readable line rather than a block that has to be clipped.
        flat = " ".join(snippet.split())[:200]
        super().__init__(rule=rule, axis=axis, severity=severity, file=file, line=line,
                         message=message, snippet=flat,
                         suggestion=suggestion, kind=kind)

def load(path):
    with open(path) as f:
        return json.load(f)

def dump(obj, path):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=2)


# Canonical locations of PRIZM source inside a consumer repo. A file here is
# PRIZM's work even when it has drifted, so it is exempt from A1/A2 and judged
# only by A3. Derived from the manifest, not hardcoded per pack.
def owned_path_patterns(gt):
    pats = [re.compile(r"components/ui/[a-z0-9-]+\.(?:tsx|jsx)$"),
            re.compile(r"components/site/"),
            re.compile(r"javafx/src/main/(?:java/design/prizm/fx/|resources/prizm/)"),
            re.compile(r"styles/tokens/[a-z0-9-]+\.css$")]
    for pack in gt.get("packs", {}):
        pats.append(re.compile(rf"components/{re.escape(pack)}/"))
    return pats


def owned_files(target, gt, exclude=(), only=None):
    """Return {relpath(posix): reason} for files PRIZM owns, not the consumer."""
    by_hash = gt.get("owned_hashes", {})
    pats = owned_path_patterns(gt)
    out = {}
    for ap, rel in walk_code(target, exclude, only):
        norm = rel.replace(os.sep, "/")
        h = sha256(read(ap))
        if h in by_hash:
            out[norm] = f"verbatim copy of {by_hash[h]}"
        elif any(p.search(norm) for p in pats):
            out[norm] = "canonical PRIZM source location"
    return out


def changed_files(target, ref):
    """Files touched since a git ref. This is how the Checker belongs in a sprint
    workflow: audit what changed, not the whole history. Returns None if the
    target is not a git repo or the ref is unknown, so the caller falls back to
    a full scan rather than silently scanning nothing."""
    import subprocess
    for args in ([f"{ref}...HEAD"], [ref]):
        try:
            r = subprocess.run(["git", "-C", target, "diff", "--name-only", "--diff-filter=d"] + args,
                               capture_output=True, text=True, timeout=60)
        except Exception:
            return None
        if r.returncode == 0:
            files = {ln.strip() for ln in r.stdout.splitlines() if ln.strip()}
            return {f for f in files if os.path.splitext(f)[1] in CODE_EXT}
    return None


def module_of(rel, depth=2):
    """Group a path into a module bucket so a large-repo report stays navigable."""
    parts = rel.replace(os.sep, "/").split("/")
    if len(parts) <= 1:
        return "(root)"
    return "/".join(parts[:depth])
