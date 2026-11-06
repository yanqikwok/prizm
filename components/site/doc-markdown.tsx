import { CodeBlock } from "@/components/site/code-block";
import type { ReactNode } from "react";

/**
 * Renders the small slice of Markdown used in llms/<slug>.md guideline sections: paragraphs,
 * "###" headings, bullet and numbered lists, tables, code fences, and `code`, **bold**, _italic_
 * and [links](url) inside text. Anything fancier would need a real Markdown renderer.
 */

type Block =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "code"; lang: string; code: string };

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

const isTableLine = (l: string) => l.trim().startsWith("|");
const isSeparator = (l: string) => /^\|?\s*:?-{3,}/.test(l.trim());
const isBullet = (l: string) => /^- /.test(l);
const isNumbered = (l: string) => /^\d+\. /.test(l);

function parse(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] as string;

    if (!line.trim()) {
      i++;
    } else if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "tsx";
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] as string).startsWith("```")) {
        code.push(lines[i] as string);
        i++;
      }
      i++;
      blocks.push({ type: "code", lang, code: code.join("\n") });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
    } else if (isTableLine(line) && isSeparator(lines[i + 1] ?? "")) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && isTableLine(lines[i] as string)) {
        rows.push(splitRow(lines[i] as string));
        i++;
      }
      blocks.push({ type: "table", head, rows });
    } else if (isBullet(line) || isNumbered(line)) {
      const ordered = isNumbered(line);
      const items: string[] = [];
      while (
        i < lines.length &&
        (ordered ? isNumbered(lines[i] as string) : isBullet(lines[i] as string))
      ) {
        let item = (lines[i] as string).replace(ordered ? /^\d+\. / : /^- /, "");
        i++;
        // Wrapped lines of the same item are indented.
        while (i < lines.length && /^ {2,}\S/.test(lines[i] as string)) {
          item += ` ${(lines[i] as string).trim()}`;
          i++;
        }
        items.push(item);
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
    } else {
      const text: string[] = [];
      while (
        i < lines.length &&
        (lines[i] as string).trim() &&
        !(lines[i] as string).startsWith("```") &&
        !(lines[i] as string).startsWith("### ") &&
        !isTableLine(lines[i] as string) &&
        !isBullet(lines[i] as string) &&
        !isNumbered(lines[i] as string)
      ) {
        text.push((lines[i] as string).trim());
        i++;
      }
      blocks.push({ type: "p", text: text.join(" ") });
    }
  }
  return blocks;
}

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|_[^_]+_)/g;

function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = text.split(INLINE).map((part, i) => {
    const key = `${i}-${part.slice(0, 12)}`;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={key} className="rounded bg-bg-muted px-1 py-0.5 font-mono text-[11px] text-fg">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={key} href={link[2]} className="text-accent underline underline-offset-2">
          {link[1]}
        </a>
      );
    }
    return part;
  });
  return <>{parts}</>;
}

export function DocMarkdown({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        switch (block.type) {
          case "h3":
            return (
              <h3 key={key} className="pt-2 text-sm font-semibold text-fg">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={key}>
                <Inline text={block.text} />
              </p>
            );
          case "ul":
          case "ol": {
            const List = block.type === "ul" ? "ul" : "ol";
            return (
              <List
                key={key}
                className={`space-y-1.5 pl-5 ${block.type === "ul" ? "list-disc" : "list-decimal"}`}
              >
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}-${item.slice(0, 12)}`}>
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "table":
            return (
              <div key={key} className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-bg-subtle text-[10px] uppercase tracking-wider text-fg-subtle">
                    <tr>
                      {block.head.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium">
                          <Inline text={h} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {block.rows.map((row, r) => (
                      <tr key={`${key}-r${r}-${row[0]?.slice(0, 12)}`} className="align-top">
                        {row.map((cell, c) => (
                          <td key={`${key}-r${r}-c${c}`} className="px-3 py-2">
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "code":
            return <CodeBlock key={key} code={block.code} language={block.lang} />;
        }
      })}
    </div>
  );
}
