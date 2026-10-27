import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CodeBlock } from "@/components/site/code-block";
import { ComponentPreview } from "@/components/site/component-preview";
import { Badge } from "@/components/ui/badge";
import { EXAMPLES } from "@/lib/component-examples";
import { COMMON_PROPS_NOTE, type PropSpec, getComponentApi } from "@/lib/components-api";
import { COMPONENTS, getComponent } from "@/lib/components-registry";
import { JAVAFX_API } from "@/lib/javafx-api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

// The canonical source for each stable component lives at components/ui/<slug>.tsx.
// Read it at build time (static export) so the page can show the actual file to
// copy — not just a usage snippet. Returns null if there's no matching file.
function readComponentSource(slug: string): string | null {
  try {
    return readFileSync(join(process.cwd(), "components/ui", `${slug}.tsx`), "utf8").trimEnd();
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) return { title: "Not found" };
  return {
    title: component.name,
    description: component.description,
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) notFound();

  const example = EXAMPLES[slug];
  const api = getComponentApi(slug);
  const isStable = component.status === "stable";
  // Alpha components ship source and a preview too; only planned ones have neither.
  const isShipped = component.status !== "planned";
  const source = isShipped ? readComponentSource(slug) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/components"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All components
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{component.name}</h1>
          <p className="mt-2 max-w-2xl text-fg-muted">{component.description}</p>
        </div>
        <div className="flex gap-2">
          {component.status === "stable" && <Badge variant="success">stable</Badge>}
          {component.status === "alpha" && <Badge variant="warning">alpha</Badge>}
          {component.status === "planned" && <Badge variant="subtle">planned</Badge>}
          {component.builtOn && <Badge variant="outline">{component.builtOn}</Badge>}
        </div>
      </div>

      {isShipped && example ? (
        <div className="mt-8 space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-subtle">
              Preview
            </h2>
            <ComponentPreview>{example.preview}</ComponentPreview>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-subtle">
              Code
            </h2>
            <CodeBlock code={example.code} language="tsx" />
          </section>

          {!isStable && !api && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-subtle">
                Props
              </h2>
              <p className="text-sm text-fg-muted">
                Alpha components document their props by hand in{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-xs">
                  llms/{component.slug}.md
                </code>{" "}
                until they are promoted to stable.
              </p>
            </section>
          )}

          {api && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-subtle">
                Props
              </h2>
              {api.props.length > 0 ? (
                <PropTable props={api.props} />
              ) : (
                <p className="text-sm text-fg-muted">
                  No props on the root — see sub-components below.
                </p>
              )}
              {api.subComponents && api.subComponents.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-fg-subtle">
                    Sub-components
                  </h3>
                  {api.subComponents.map((sub) => (
                    <div key={sub.name} className="rounded-lg border border-border bg-surface p-4">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <code className="font-mono text-sm font-semibold text-fg">{sub.name}</code>
                        <span className="text-sm text-fg-muted">— {sub.description}</span>
                      </div>
                      {sub.props && sub.props.length > 0 && (
                        <div className="mt-3">
                          <PropTable props={sub.props} compact />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {api.notes && <p className="mt-4 text-sm text-fg-muted">{api.notes}</p>}
              <p className="mt-3 text-xs text-fg-subtle">{COMMON_PROPS_NOTE}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-subtle">
              Source
            </h2>
            <p className="mb-3 text-sm text-fg-muted">
              The full implementation of{" "}
              <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-xs">
                components/ui/{component.slug}.tsx
              </code>{" "}
              {source
                ? "is below — copy it into your project and own it."
                : "is in the repository — copy it into your project and own it."}{" "}
              Some components import the{" "}
              <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-xs">cn</code> helper
              from{" "}
              <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-xs">lib/utils</code>{" "}
              or other primitives; copy those too.
            </p>
            {source && <CodeBlock code={source} language="tsx" />}
          </section>

          {component.javafx && <JavaFxSection slug={component.slug} />}
        </div>
      ) : (
        <div className="mt-12 rounded-lg border border-dashed border-border bg-bg-subtle p-12 text-center">
          <h2 className="text-lg font-medium">On the roadmap</h2>
          <p className="mt-2 text-sm text-fg-muted">
            This component is planned but not yet shipped. The slug and category are reserved so
            templates and AI tooling can reference it ahead of time.
            {component.builtOn && (
              <>
                {" "}
                It will be built on <span className="font-medium text-fg">{component.builtOn}</span>
                .
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function JavaFxSection({ slug }: { slug: string }) {
  const api = JAVAFX_API[slug];
  if (!api) return null;
  const usage = `import ${api.package}.${api.className};\n\n${api.constructors.join("\n")}`;
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-fg-subtle">JavaFX</h2>
      <p className="text-sm text-fg-muted">
        Ships in the{" "}
        <Link href="/c3/javafx" className="text-accent hover:underline">
          PRIZM JavaFX library
        </Link>{" "}
        for thick-client C3 apps as{" "}
        <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-xs">{api.className}</code>{" "}
        (extends{" "}
        <code className="rounded bg-bg-muted px-1.5 py-0.5 font-mono text-xs">
          {api.base.split(".").pop()}
        </code>
        ). Run the gallery to see it natively.
      </p>
      <div className="mt-4">
        <CodeBlock code={usage} language="java" />
      </div>
      {api.members.length > 0 && (
        <div className="mt-4">
          <PropTable props={api.members} compact />
        </div>
      )}
      {api.notes && <p className="mt-4 text-sm text-fg-muted">{api.notes}</p>}
    </section>
  );
}

function PropTable({ props, compact = false }: { props: PropSpec[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={`w-full min-w-[640px] ${compact ? "text-xs" : "text-sm"}`}>
        <thead className="bg-bg-subtle text-[10px] uppercase tracking-wider text-fg-subtle">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Prop</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Default</th>
            <th className="px-3 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {props.map((p) => (
            <tr key={p.name} className="align-top">
              <td className="px-3 py-2 font-mono text-xs font-semibold text-fg">{p.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-fg-muted">
                <code className="break-words">{p.type}</code>
              </td>
              <td className="px-3 py-2 font-mono text-xs text-fg-muted">
                {p.default ?? <span className="text-fg-subtle">—</span>}
              </td>
              <td className="px-3 py-2 text-fg-muted">
                <PropDescription text={p.description} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Render a prop description with `inline-code` backticks formatted. */
function PropDescription({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let buffer = "";
  let inCode = false;
  let key = 0;
  for (const ch of text) {
    if (ch === "`") {
      if (inCode) {
        parts.push(
          <code key={key++} className="rounded bg-bg-muted px-1 py-0.5 font-mono text-[11px]">
            {buffer}
          </code>,
        );
      } else if (buffer) {
        parts.push(buffer);
      }
      buffer = "";
      inCode = !inCode;
    } else {
      buffer += ch;
    }
  }
  if (buffer) parts.push(buffer);
  return <>{parts}</>;
}
