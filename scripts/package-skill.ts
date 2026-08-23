#!/usr/bin/env tsx
/**
 * Package the PRIZM Checker skill into a downloadable zip for the Alignment page's
 * offline / air-gapped fallback.
 *
 * Single source of truth: plugins/prizm-checker/skills/audit/ (the same skill
 * the plugin ships). This zips that folder so it extracts to `audit/`, ready to
 * drop into `.claude/skills/` (invoked as /audit when installed as a loose skill).
 *
 * Runs automatically before `build` (see the "prebuild" script), so the download
 * always matches the committed skill. The zip itself is git-ignored.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SKILL_PARENT = resolve(ROOT, "plugins/prizm-checker/skills");
const SKILL_NAME = "audit";
const SKILL_DIR = resolve(SKILL_PARENT, SKILL_NAME);
const OUT = resolve(ROOT, "public/prizm-checker.zip");

if (!existsSync(resolve(SKILL_DIR, "SKILL.md"))) {
  console.error(`✗ Skill source not found at ${SKILL_DIR}/SKILL.md`);
  process.exit(1);
}

mkdirSync(resolve(ROOT, "public"), { recursive: true });
rmSync(OUT, { force: true });

try {
  // -X strips extra file attributes for a cleaner, more stable archive.
  execSync(`zip -r -X -q "${OUT}" ${SKILL_NAME} -x '*.DS_Store'`, { cwd: SKILL_PARENT });
} catch (e) {
  console.error("✗ Failed to create the skill zip. Is the `zip` CLI available?");
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}

console.log(`✓ Wrote public/prizm-checker.zip from plugins/prizm-checker/skills/${SKILL_NAME}.`);
