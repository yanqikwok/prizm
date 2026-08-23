#!/usr/bin/env tsx
/**
 * Static internal-link checker.
 *
 * Scans every .tsx / .ts / .md / .mdx file in the repo for internal hrefs
 * (paths starting with `/`) and verifies each resolves to either:
 *
 *   1. A static asset in /public/ (e.g. /llms.txt, /favicon.svg, /noise.svg)
 *   2. A Next.js route under /app/ (page.tsx exists for the slug, including
 *      dynamic [slug] segments resolved via lib/components-registry.ts)
 *
 * Also enforces PRIZM's link convention:
 *   - <Link href="/..."> must point to a ROUTE, never a static file
 *   - <a href="/..."> for internal links should point to STATIC FILES,
 *     never a route (since Next Link handles trailingSlash + prefetch)
 *
 * Exits 1 on any violation, suitable for CI.
 *
 * Run with:  pnpm check:links
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { COMPONENTS } from "../lib/components-registry";

const ROOT = resolve(import.meta.dirname, "..");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "out",
  ".pnpm-store-offline",
  "scripts",
  "llms",
  // The bundled PRIZM Checker skill/plugin (incl. deliberately off-system
  // fixtures). It ships as a plugin, not as part of the docs site.
  "plugins",
]);

// Scan only source code. Markdown files contain example `<Link>` / `<a>` tags
// inside code fences that look like real links; verifying them produces false
// positives. Markdown link integrity (e.g. `[text](url)`) is a separate
// concern and out of scope for this checker.
const SCAN_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);

interface Violation {
  file: string;
  line: number;
  rule: string;
  detail: string;
}

const violations: Violation[] = [];

// ----- Build the set of valid routes from app/ -----

function discoverRoutes(): Set<string> {
  const routes = new Set<string>();
  const appDir = resolve(ROOT, "app");

  function walk(dir: string, urlPrefix: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (!stat.isDirectory()) continue;

      // route groups (parens) don't add to URL
      // dynamic segments like [slug] are resolved below from the registry
      const segment = entry;
      if (segment.startsWith("(") && segment.endsWith(")")) {
        walk(full, urlPrefix);
        continue;
      }
      if (segment.startsWith("[") && segment.endsWith("]")) {
        // Special-case the one dynamic segment we have: /components/[slug]
        const param = segment.slice(1, -1);
        if (param === "slug" && urlPrefix === "/components") {
          const hasPage =
            existsSync(join(full, "page.tsx")) ||
            existsSync(join(full, "page.mdx")) ||
            existsSync(join(full, "page.jsx")) ||
            existsSync(join(full, "page.ts")) ||
            existsSync(join(full, "page.js"));
          if (hasPage) {
            for (const c of COMPONENTS) {
              routes.add(`${urlPrefix}/${c.slug}`);
            }
          }
        }
        // Unknown dynamic segment — skip; the checker won't validate it.
        continue;
      }

      const childPrefix = urlPrefix === "" ? `/${segment}` : `${urlPrefix}/${segment}`;
      // Only treat as a route if there's a page.tsx (or page.mdx) inside
      const hasPage =
        existsSync(join(full, "page.tsx")) ||
        existsSync(join(full, "page.mdx")) ||
        existsSync(join(full, "page.jsx")) ||
        existsSync(join(full, "page.ts")) ||
        existsSync(join(full, "page.js"));
      if (hasPage) routes.add(childPrefix);
      walk(full, childPrefix);
    }
  }

  // Root page
  if (existsSync(join(appDir, "page.tsx"))) routes.add("/");
  walk(appDir, "");

  return routes;
}

// ----- Build the set of static files served from public/ -----

function discoverStaticFiles(): Set<string> {
  const files = new Set<string>();
  const publicDir = resolve(ROOT, "public");
  if (!existsSync(publicDir)) return files;

  function walk(dir: string, urlPrefix: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      const childUrl = urlPrefix === "" ? `/${entry}` : `${urlPrefix}/${entry}`;
      if (stat.isDirectory()) {
        walk(full, childUrl);
      } else {
        files.add(childUrl);
      }
    }
  }
  walk(publicDir, "");
  return files;
}

const ROUTES = discoverRoutes();
const STATIC_FILES = discoverStaticFiles();

// Normalize a URL to its canonical route form: strip trailing slash, drop
// hash, drop query string. Returns null if the URL is external or non-internal.
function normalize(url: string): { path: string; isStatic: boolean } | null {
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  // strip hash and query
  const noHash = url.split("#")[0];
  const noQuery = noHash.split("?")[0];
  // strip trailing slash (except root)
  const stripped = noQuery !== "/" && noQuery.endsWith("/") ? noQuery.slice(0, -1) : noQuery;
  // a static file ref usually has an extension; routes generally don't
  // (the only routes with dots are unlikely in PRIZM)
  const lastSegment = stripped.split("/").pop() ?? "";
  const isStatic = /\.[a-zA-Z0-9]+$/.test(lastSegment);
  return { path: stripped, isStatic };
}

function pathExists(path: string, isStatic: boolean): boolean {
  if (isStatic) return STATIC_FILES.has(path);
  return ROUTES.has(path);
}

// ----- File scanning -----

interface LinkRef {
  file: string;
  line: number;
  url: string;
  /** Whether the link was written as <Link href> (TRUE) or <a href> (FALSE) */
  usingNextLink: boolean;
  /** True when the href was `{expression}` (e.g. withBasePath("/x")) rather than a literal string. */
  hrefIsExpression: boolean;
}

function scanFile(file: string): LinkRef[] {
  const ext = file.slice(file.lastIndexOf("."));
  if (!SCAN_EXTENSIONS.has(ext)) return [];

  let content = readFileSync(file, "utf8");
  // Strip JS block comments (e.g. JSDoc) while preserving line numbers, so
  // documentation examples that show <a href=...> markup don't get scanned
  // as real anchors. We replace each block comment with the same number of
  // newlines so error messages still point at the right line.
  content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const newlines = (match.match(/\n/g) || []).length;
    return "\n".repeat(newlines);
  });
  const lines = content.split("\n");
  const relPath = relative(ROOT, file);
  const refs: LinkRef[] = [];

  // Match <Link href="..."> and <a href="...">. Only first capture group is the URL.
  // For the `<a>` form we also detect static-string hrefs separately from
  // expression hrefs like `href={withBasePath("/x")}` so Rule 4 can verify
  // that raw `<a>` tags pointing at static files go through the helper.
  const linkRe = /<Link\b[^>]*href=["']([^"']+)["']/g;
  const aStringRe = /<a\b[^>]*href=["']([^"']+)["']/g;
  const aExprRe = /<a\b[^>]*href=\{([^}]+)\}/g;

  lines.forEach((line, idx) => {
    let m: RegExpExecArray | null = linkRe.exec(line);
    while (m !== null) {
      refs.push({
        file: relPath,
        line: idx + 1,
        url: m[1],
        usingNextLink: true,
        hrefIsExpression: false,
      });
      m = linkRe.exec(line);
    }
    linkRe.lastIndex = 0;

    m = aStringRe.exec(line);
    while (m !== null) {
      refs.push({
        file: relPath,
        line: idx + 1,
        url: m[1],
        usingNextLink: false,
        hrefIsExpression: false,
      });
      m = aStringRe.exec(line);
    }
    aStringRe.lastIndex = 0;

    // `<a href={expr}>` — we can't statically resolve `expr`, but we can
    // check whether it contains `withBasePath(...)` and if so capture the
    // path argument so we can still validate it as a static file.
    m = aExprRe.exec(line);
    while (m !== null) {
      const expr = m[1];
      const wrappedPath = expr.match(/withBasePath\(\s*["']([^"']+)["']\s*\)/);
      if (wrappedPath) {
        refs.push({
          file: relPath,
          line: idx + 1,
          url: wrappedPath[1],
          usingNextLink: false,
          hrefIsExpression: true,
        });
      }
      m = aExprRe.exec(line);
    }
    aExprRe.lastIndex = 0;
  });
  return refs;
}

function walkRepo(dir: string, fn: (file: string) => void) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    if (IGNORE_DIRS.has(entry) || IGNORE_DIRS.has(rel)) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) walkRepo(full, fn);
    else fn(full);
  }
}

const allRefs: LinkRef[] = [];
walkRepo(ROOT, (f) => allRefs.push(...scanFile(f)));

// ----- Verify each ref -----

for (const ref of allRefs) {
  const n = normalize(ref.url);
  if (!n) continue; // external URL — out of scope for this checker

  const exists = pathExists(n.path, n.isStatic);

  // Rule 1: every internal link must resolve to something
  if (!exists) {
    // Try alternative: maybe it's a static file but we missed the extension heuristic,
    // OR it's a route written with trailing slash that we already stripped.
    const altIsStatic = !n.isStatic;
    if (pathExists(n.path, altIsStatic)) {
      // Found it, but classification was different — likely fine, move on without rule mismatch
    } else {
      violations.push({
        file: ref.file,
        line: ref.line,
        rule: "broken-link",
        detail: `${ref.usingNextLink ? "<Link>" : "<a>"} href="${ref.url}" — no matching route or static file`,
      });
      continue;
    }
  }

  // Rule 2: <Link> must NOT point at a static file
  if (ref.usingNextLink && n.isStatic && STATIC_FILES.has(n.path)) {
    violations.push({
      file: ref.file,
      line: ref.line,
      rule: "link-to-static-file",
      detail: `<Link href="${ref.url}"> points at a static file — use <a href="${ref.url}"> instead`,
    });
  }

  // Rule 3: <a> must NOT point at a route (use <Link> for proper client navigation)
  // Skip when the link explicitly targets _blank — that's a deliberate full-page load.
  if (!ref.usingNextLink && !n.isStatic && ROUTES.has(n.path)) {
    // Re-read the line to check for target="_blank"
    const lineContent =
      readFileSync(resolve(ROOT, ref.file), "utf8").split("\n")[ref.line - 1] ?? "";
    if (!/target=["']_blank["']/.test(lineContent)) {
      violations.push({
        file: ref.file,
        line: ref.line,
        rule: "anchor-to-route",
        detail: `<a href="${ref.url}"> points at a route — use <Link href="${ref.url}"> for client-side navigation`,
      });
    }
  }

  // Rule 4: raw <a href="/file.ext"> for a static file must go through
  // withBasePath(), or it will 404 on deployments served under a basePath
  // (e.g. GitHub Pages at /prizm/). Next.js's <Link> auto-prepends basePath;
  // raw anchors don't. The helper bridges the gap.
  if (!ref.usingNextLink && n.isStatic && STATIC_FILES.has(n.path) && !ref.hrefIsExpression) {
    violations.push({
      file: ref.file,
      line: ref.line,
      rule: "anchor-missing-basepath",
      detail: `<a href="${ref.url}"> won't include basePath in production — wrap with withBasePath(): <a href={withBasePath("${ref.url}")}>`,
    });
  }
}

// ----- Report -----

console.log("PRIZM link check — scanning...\n");
console.log(`  Routes discovered: ${ROUTES.size}`);
console.log(`  Static files discovered: ${STATIC_FILES.size}`);
console.log(`  Internal links found: ${allRefs.length}`);
console.log();

if (violations.length === 0) {
  console.log("✓ All internal links valid and follow the <Link>/<a> convention.");
  process.exit(0);
}

console.log(`✗ Found ${violations.length} violation(s):\n`);
const byFile = new Map<string, Violation[]>();
for (const v of violations) {
  const arr = byFile.get(v.file) ?? [];
  arr.push(v);
  byFile.set(v.file, arr);
}
for (const [file, vs] of byFile) {
  console.log(`  ${file}`);
  for (const v of vs) {
    console.log(`    ${v.line}  [${v.rule}]  ${v.detail}`);
  }
  console.log();
}
console.log("Convention reminder:");
console.log(
  "  • <Link href=...> for ROUTES (client-side navigation, trailing-slash + basePath handled)",
);
console.log(
  "  • <a href={withBasePath(...)}> for STATIC FILES (raw fetch — llms.txt, PRIZM.md, etc.)",
);
console.log("    Static-file anchors must use withBasePath() — see lib/base-path.ts");
process.exit(1);
