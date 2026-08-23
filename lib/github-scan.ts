/**
 * Fetch a GitHub repository's source files in the browser and score them with
 * the PRIZM Alignment Checker. Runs entirely client-side against GitHub's public
 * API — no server, no proxy.
 *
 * Public repos work with no token (GitHub allows 60 unauthenticated calls/hour;
 * file contents are read from raw.githubusercontent.com, which is unmetered).
 * For private repos or a higher rate limit, the user supplies a token that is
 * held only in the page and sent only to api.github.com.
 */

import { type AlignmentResult, runRepoScan } from "./alignment-checker";

/** Source file types the checker understands. */
const SOURCE_EXT = /\.(tsx|ts|jsx|js|mjs|cjs|css|scss|html|htm|vue|svelte|java|fxml)$/i;

/** Directories that hold vendored, generated, or build output — never product code. */
const EXCLUDE_DIR =
  /(^|\/)(node_modules|dist|build|out|\.next|\.git|vendor|coverage|__generated__|generated|\.turbo|storybook-static)\//i;

const MAX_FILES = 250; // keep scans fast and within rate limits
const MAX_FILE_BYTES = 200_000; // skip huge/minified files
const CONCURRENCY = 8;

export interface RepoRef {
  owner: string;
  repo: string;
  ref?: string;
}

export interface RepoScanProgress {
  phase: "resolving" | "listing" | "fetching" | "scoring";
  done: number;
  total: number;
}

/** Accept `owner/repo`, `owner/repo/tree/branch`, a github.com URL, or a
 *  GitHub Pages (`*.github.io`) URL, which is mapped back to its repo. */
export function parseRepoInput(input: string): RepoRef | null {
  let s = (input || "").trim();

  // GitHub Pages: https://<owner>.github.io/<repo>/…  → <owner>/<repo>
  //               https://<owner>.github.io/          → <owner>/<owner>.github.io
  const pages = s.match(/^(?:https?:\/\/)?([^./]+)\.github\.io\/?([^/?#]*)/i);
  if (pages) {
    const owner = pages[1];
    const repo = pages[2] || `${owner}.github.io`;
    return { owner, repo };
  }

  s = s
    .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  const tree = s.match(/^([^/]+)\/([^/]+)\/tree\/([^/]+)/);
  if (tree) return { owner: tree[1], repo: tree[2], ref: tree[3] };
  const m = s.match(/^([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

function ghHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function ghError(res: Response): Promise<Error> {
  if (res.status === 404)
    return new Error("Repository not found. Check the name, or add a token if it's private.");
  if (res.status === 401) return new Error("Token rejected by GitHub (401). Check the token.");
  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0")
      return new Error("GitHub rate limit reached. Add a token, or wait and retry.");
    return new Error("GitHub denied the request (403). A token may be required.");
  }
  return new Error(`GitHub request failed (${res.status}).`);
}

async function pool<T>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

async function fetchFileContent(
  ref: RepoRef,
  branch: string,
  path: string,
  token: string | undefined,
): Promise<string | null> {
  try {
    if (token) {
      // Contents API works for private repos and carries the token.
      const res = await fetch(
        `https://api.github.com/repos/${ref.owner}/${ref.repo}/contents/${path
          .split("/")
          .map(encodeURIComponent)
          .join("/")}?ref=${encodeURIComponent(branch)}`,
        { headers: ghHeaders(token) },
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (typeof data.content !== "string") return null;
      return decodeBase64(data.content);
    }
    // Public repos: raw host is unmetered and CORS-enabled.
    const res = await fetch(
      `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${branch}/${path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`,
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function decodeBase64(b64: string): string {
  const clean = b64.replace(/\n/g, "");
  const bin = atob(clean);
  try {
    // Handle UTF-8 correctly.
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return bin;
  }
}

export async function scanGitHubRepo(
  input: string,
  opts: { token?: string; onProgress?: (p: RepoScanProgress) => void } = {},
): Promise<AlignmentResult> {
  const ref = parseRepoInput(input);
  if (!ref) throw new Error("Enter a repository as owner/name, or paste its github.com URL.");
  const { token, onProgress } = opts;
  const headers = ghHeaders(token);

  onProgress?.({ phase: "resolving", done: 0, total: 0 });

  // Resolve the branch if one wasn't given.
  let branch = ref.ref;
  if (!branch) {
    const repoRes = await fetch(`https://api.github.com/repos/${ref.owner}/${ref.repo}`, {
      headers,
    });
    if (!repoRes.ok) throw await ghError(repoRes);
    branch = (await repoRes.json()).default_branch as string;
  }

  // List the tree.
  onProgress?.({ phase: "listing", done: 0, total: 0 });
  const treeRes = await fetch(
    `https://api.github.com/repos/${ref.owner}/${ref.repo}/git/trees/${encodeURIComponent(
      branch,
    )}?recursive=1`,
    { headers },
  );
  if (!treeRes.ok) throw await ghError(treeRes);
  const tree = await treeRes.json();
  if (tree.truncated) {
    // Very large repo — we still scan what we got, and say so via coverage.
  }

  const blobs: Array<{ path: string; size: number }> = (tree.tree || []).filter(
    (n: { type: string; path: string; size?: number }) =>
      n.type === "blob" &&
      SOURCE_EXT.test(n.path) &&
      !EXCLUDE_DIR.test(`/${n.path}`) &&
      (n.size ?? 0) <= MAX_FILE_BYTES,
  );

  if (blobs.length === 0)
    throw new Error(
      "No scannable source files found (looked for .tsx/.ts/.jsx/.js/.css/.html/.java).",
    );

  const totalMatched = blobs.length;
  const picked = blobs.slice(0, MAX_FILES);

  // Fetch file contents.
  const files: Array<{ path: string; content: string }> = [];
  let done = 0;
  await pool(picked, CONCURRENCY, async (node) => {
    const content = await fetchFileContent(ref, branch as string, node.path, token);
    if (content != null) files.push({ path: node.path, content });
    done += 1;
    onProgress?.({ phase: "fetching", done, total: picked.length });
  });

  if (files.length === 0)
    throw new Error(
      "Could not read any file contents (rate limit, or a private repo without a token).",
    );

  onProgress?.({ phase: "scoring", done: files.length, total: files.length });

  // A3 — Fidelity: diff any copied PRIZM components against the built-in baseline.
  const fidelity = await computeRepoFidelity(files);

  return runRepoScan(
    files,
    { repo: `${ref.owner}/${ref.repo}`, ref: branch, totalMatched },
    fidelity ? { fidelity: fidelity.seed, fidelityRef: fidelity.ref } : undefined,
  );
}

/** Match a copied PRIZM component file: …/components/ui/<slug>.(tsx|jsx|ts|js). */
const UI_FILE = /(?:^|\/)components\/ui\/([a-z0-9-]+)\.[tj]sx?$/;

async function computeRepoFidelity(files: Array<{ path: string; content: string }>) {
  const productUi = files
    .map((f) => {
      const m = f.path.match(UI_FILE);
      return m ? { path: f.path, slug: m[1], content: f.content } : null;
    })
    .filter((x): x is { path: string; slug: string; content: string } => x !== null);

  if (productUi.length === 0) return null;

  // Lazy-load the (build-time) baseline so it stays out of the page's initial bundle.
  const [{ PRIZM_UI_SIGNATURES, PRIZM_BASELINE_REF }, { computeFidelity }] = await Promise.all([
    import("./prizm-baseline.generated"),
    import("./alignment-fidelity"),
  ]);

  const seed = computeFidelity(productUi, PRIZM_UI_SIGNATURES, PRIZM_BASELINE_REF);
  if (seed.comparedCount === 0) return null;
  return { seed, ref: PRIZM_BASELINE_REF };
}
