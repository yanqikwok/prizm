/**
 * Reads an alpha component's guideline doc (llms/<slug>.md) so its docs-site page can show the
 * same content, instead of a second copy that could drift.
 *
 * Alpha components are not in lib/components-api.ts (the component audit only allows stable ones),
 * so their props live in the doc's hand-written "Props" tables. getDocApi() turns those tables into
 * the same shape components-api.ts uses, so the page can render them like any other component's.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentApi, PropSpec, SubComponentSpec } from "@/lib/components-api";

export interface DocSection {
  /** The "## " heading text. */
  heading: string;
  /** Markdown under the heading, up to the next "## " heading. */
  body: string;
}

/** Split llms/<slug>.md into its "## " sections. Returns null if the doc does not exist. */
export function readDocSections(slug: string): DocSection[] | null {
  let text: string;
  try {
    text = readFileSync(join(process.cwd(), "llms", `${slug}.md`), "utf8");
  } catch {
    return null;
  }

  const lines = text.split("\n");
  let i = 0;
  if (lines[0] === "---") i = lines.indexOf("---", 1) + 1;

  const sections: DocSection[] = [];
  let current: { heading: string; lines: string[] } | null = null;
  let inFence = false;

  const close = () => {
    if (current) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });
  };

  for (; i < lines.length; i++) {
    const line = lines[i] as string;
    if (line.startsWith("```")) inFence = !inFence;
    if (!inFence && /^#{1,2} /.test(line)) {
      close();
      // "# Proposed additions" only divides the doc; its "## " children are the sections.
      current = line.startsWith("## ") ? { heading: line.slice(3).trim(), lines: [] } : null;
      continue;
    }
    if (!inFence && line.trim() === "---") continue;
    current?.lines.push(line);
  }
  close();
  return sections;
}

export function findSection(
  sections: DocSection[] | null,
  heading: string,
): DocSection | undefined {
  return sections?.find((s) => s.heading === heading);
}

// ---- Markdown tables ------------------------------------------------------------------------

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "\\" && trimmed[i + 1] === "|") {
      cell += "|";
      i++;
    } else if (ch === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cell.trim());
  return cells;
}

/** Body rows of the first table in `lines` (header and separator rows dropped). */
function firstTableRows(lines: string[]): string[][] {
  const start = lines.findIndex((l) => l.trim().startsWith("|"));
  if (start === -1) return [];
  const rows: string[][] = [];
  for (let i = start; i < lines.length && (lines[i] as string).trim().startsWith("|"); i++) {
    rows.push(splitRow(lines[i] as string));
  }
  return rows.slice(2);
}

const unwrapCode = (cell: string) => cell.replace(/^`([\s\S]*)`$/, "$1");

function toPropSpecs(rows: string[][]): PropSpec[] {
  return rows.map(([name = "", type = "", dflt = "", description = ""]) => {
    const def = unwrapCode(dflt);
    return {
      name: unwrapCode(name),
      type: unwrapCode(type),
      default: def === "—" || def === "" ? undefined : def,
      description,
    };
  });
}

// ---- Props and sub-components ---------------------------------------------------------------

/**
 * Build the page's props / sub-components data from the doc:
 *  - "## Props": the first table is the root's props; each "### `Name`" below it holds one
 *    sub-component's table (and optionally a sentence about it).
 *  - "## Sub-components": "- `Name` — description" bullets, in display order.
 *  - The italic line at the end of "## Props" becomes the notes under the table.
 */
export function getDocApi(sections: DocSection[] | null): ComponentApi | undefined {
  const propsSection = findSection(sections, "Props");
  if (!propsSection) return undefined;

  const [rootPart = "", ...subParts] = propsSection.body.split(/^### /m);
  const props = toPropSpecs(firstTableRows(rootPart.split("\n")));
  if (props.length === 0) return undefined;

  // The page shows notes and sub-component descriptions as plain text, so drop the backticks.
  const plain = (text: string) => text.replace(/`/g, "");
  const note = propsSection.body.match(/^_(.+)_$/m)?.[1];

  const subProps = new Map<string, { props: PropSpec[]; text: string }>();
  for (const part of subParts) {
    const [head = "", ...rest] = part.split("\n");
    const name = head.replace(/`/g, "").trim();
    const textLines = rest.filter(
      (l) => l.trim() && !l.trim().startsWith("|") && !/^_.*_$/.test(l.trim()),
    );
    subProps.set(name, {
      props: toPropSpecs(firstTableRows(rest)),
      text: textLines.join(" ").trim(),
    });
  }

  const subComponents: SubComponentSpec[] = [];
  for (const line of findSection(sections, "Sub-components")?.body.split("\n") ?? []) {
    const m = line.match(/^- `([^`]+)` — (.*)$/);
    if (!m) continue;
    const [, name = "", description = ""] = m;
    const extra = subProps.get(name);
    subComponents.push({
      name,
      description: plain(extra?.text ? `${description} ${extra.text}` : description),
      props: extra && extra.props.length > 0 ? extra.props : undefined,
    });
  }

  return {
    props,
    subComponents: subComponents.length > 0 ? subComponents : undefined,
    notes: note ? plain(note) : undefined,
  };
}
