import { HeroBg } from "@/components/site/hero-bg";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ArrowRight, Droplet, Info, Layers, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <HeroBg />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs font-medium text-fg-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />A DSTA design
                system
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                Preview
              </span>
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              A design system for <span className="text-accent">command and control</span> and{" "}
              <span className="text-accent">enterprise</span>.
            </h1>
            <p className="mt-6 text-balance text-lg text-fg-muted md:text-xl">
              Shared component primitives, two design languages, four theme variants. Built on Base
              UI and Tailwind. Engineered for developers and AI.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs/getting-started"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/components"
                className="inline-flex h-11 items-center rounded-md border border-border bg-bg px-5 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
              >
                Browse components
              </Link>
            </div>
            <Alert variant="info" className="mx-auto mt-12 max-w-2xl text-left">
              <Info />
              <AlertDescription>
                PRIZM 4.0 is in active preview. We're building the system in the open — iterating on
                components, templates, and design language as feedback comes in from early teams.
                Base UI, the accessibility primitives PRIZM is built on, is itself approaching its
                first stable release. Expect breaking changes as both projects mature. Adopt PRIZM
                4.0 for projects where you're comfortable updating alongside the system.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Split product showcase */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <ProductColumn
            zone="c3"
            title="C3"
            tagline="Command & Control"
            description="Dense data display. Tactical interfaces. High contrast for operator stations and low-light environments."
            href="/c3"
            accent="oklch(52.0% 0.105 223.13)"
            surface="oklch(98.4% 0.019 200.87)"
            surfaceDark="oklch(15% 0.030 230)"
          />
          <ProductColumn
            zone="enterprise"
            title="Enterprise"
            tagline="Websites & Applications"
            description="Calm, spacious, professional. Standard SaaS patterns — dashboards, forms, marketing pages, data tables."
            href="/enterprise"
            accent="oklch(54.6% 0.245 262.88)"
            surface="oklch(99% 0.002 248)"
            surfaceDark="oklch(20% 0.042 266)"
            borderLeft
          />
        </div>
      </section>

      {/* Liquid glass showcase — new in 4.0, C3-only */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs font-medium text-fg-muted">
              <Droplet className="h-3 w-3" />
              New in 4.0 · C3-only
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Liquid glass for command and control
            </h2>
            <p className="mt-4 max-w-md text-fg-muted">
              A translucent surface treatment for floating panels in C3 products. Operators stay
              oriented to the map, feed, or canvas behind a panel rather than having it occluded.
              Two tiers, both light and dark, all baked into the system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs/liquid-glass"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Explore liquid glass
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/c3/templates/app-shell/preview"
                className="inline-flex h-10 items-center rounded-md border border-border bg-bg px-4 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
              >
                See it in the App Shell
              </Link>
            </div>
          </div>
          <GlassShowcase />
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight">Built differently</h2>
          <p className="mt-3 max-w-2xl text-fg-muted">
            PRIZM 4.0 is structured around three principles that make it work for both human and AI
            consumers.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Principle
              icon={<Sparkles className="h-5 w-5" />}
              title="AI-bootstrappable"
              body="A root PRIZM.md, top-level llms.txt, and per-component context files let an LLM understand and use the system end-to-end."
            />
            <Principle
              icon={<Layers className="h-5 w-5" />}
              title="Two products, one foundation"
              body="C3 and Enterprise share component primitives but maintain distinct design languages — light and dark each, all baked into the docs."
            />
            <Principle
              icon={<Zap className="h-5 w-5" />}
              title="Air-gap ready"
              body="Self-hosted fonts, no CDN dependencies, offline release tarballs. Works the same on the public internet and inside a secured environment."
            />
          </div>
        </div>
      </section>

      {/* Alignment checker */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Alignment</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Check how on-system you are
          </h2>
          <p className="mt-3 max-w-2xl text-fg-muted">
            The PRIZM Checker scores a product against PRIZM across five axes — tokens, adoption,
            fidelity, composition, and accessibility — and hands back a ranked fix list, not just a
            grade. Paste a component for an instant read, scan a GitHub repo, or install the skill
            for the full audit inside Claude.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Tokens", "Adoption", "Fidelity", "Composition", "Accessibility"].map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-fg-muted"
              >
                {a}
              </span>
            ))}
          </div>
          <Link
            href="/alignment"
            className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Open the checker
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ProductColumn({
  zone,
  title,
  tagline,
  description,
  href,
  accent,
  surface,
  surfaceDark,
  borderLeft = false,
}: {
  zone: "c3" | "enterprise";
  title: string;
  tagline: string;
  description: string;
  href: string;
  accent: string;
  surface: string;
  surfaceDark: string;
  borderLeft?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden p-10 transition-colors md:p-16 ${
        borderLeft ? "lg:border-l lg:border-border" : ""
      }`}
      style={
        {
          // Use the product's own surface to give a hint of its aesthetic
          backgroundColor: `light-dark(${surface}, ${surfaceDark})`,
        } as React.CSSProperties
      }
    >
      <div
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: accent }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        {tagline}
      </div>
      <h3 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h3>
      <p className="mt-4 max-w-md text-fg-muted">{description}</p>
      <div
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium transition-transform group-hover:translate-x-1"
        style={{ color: accent }}
      >
        Build for {title}
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

/**
 * A static visual showcase of the C3 dark glass treatment over a stylized
 * canvas. Mirrors the App Shell preview but is non-interactive — purpose is
 * to telegraph the aesthetic on the landing page, not to demo functionality.
 * The full interactive demo lives at /docs/liquid-glass.
 */
function GlassShowcase() {
  return (
    <div
      className={cn(
        "swatch-c3-dark relative h-[360px] overflow-hidden rounded-xl border border-border bg-bg shadow-xl",
      )}
    >
      {/* Radial accent glow — gives the glass something visibly colored to
          refract against. Without rich backdrop content, glass surfaces read
          as nearly invisible on a uniformly dark canvas. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 60%, oklch(78.9% 0.154 211.53 / 0.25), transparent 70%), radial-gradient(ellipse 40% 40% at 75% 30%, oklch(63.7% 0.237 25.33 / 0.20), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Minor + major grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 0.5px, transparent 0.5px), linear-gradient(to bottom, var(--color-border) 0.5px, transparent 0.5px)",
          backgroundSize: "12px 12px",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
        aria-hidden
      />

      {/* Terrain curve — passes UNDER both glass surfaces so you can see
          where it's blurred vs sharp. */}
      <svg
        className="absolute inset-0 h-full w-full text-fg-subtle opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <title>Canvas terrain</title>
        <path
          d="M0,30 C20,28 35,42 50,38 C65,34 78,46 100,40 L100,100 L0,100 Z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>

      {/* Route line — passes through both glass surfaces */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-accent"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <title>Route</title>
        <path
          d="M 8 18 Q 30 22, 50 50 T 92 78"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 1.2"
          opacity="0.9"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Markers — positioned to sit UNDER the glass surfaces so the user can
          see the canvas content through the translucent panels. */}
      {[
        // Under the chrome strip (top band, y=4-14%)
        { left: "30%", top: "10%", tone: "accent" as const, size: "md" as const },
        { left: "60%", top: "8%", tone: "danger" as const, size: "md" as const, pulse: true },
        { left: "85%", top: "11%", tone: "accent" as const, size: "sm" as const },
        // Under the floating panel (bottom-left area)
        { left: "12%", top: "72%", tone: "accent" as const, size: "md" as const },
        { left: "22%", top: "86%", tone: "danger" as const, size: "sm" as const },
        // Free-canvas markers (visible outside glass for contrast)
        { left: "55%", top: "55%", tone: "accent" as const, size: "lg" as const, pulse: true },
        { left: "78%", top: "40%", tone: "accent" as const, size: "md" as const },
      ].map((m, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: m.left, top: m.top }}
        >
          <span className="relative block">
            {m.pulse && (
              <span
                className={cn(
                  "absolute inset-0 -m-1 animate-ping rounded-full",
                  m.tone === "danger" ? "bg-danger/40" : "bg-accent/40",
                )}
              />
            )}
            <span
              className={cn(
                "relative block rounded-full ring-2",
                m.size === "sm" && "h-2 w-2",
                m.size === "md" && "h-2.5 w-2.5",
                m.size === "lg" && "h-3 w-3",
                m.tone === "danger" ? "bg-danger ring-danger/30" : "bg-accent ring-accent/30",
              )}
            />
          </span>
        </div>
      ))}

      {/* Chrome strip — top, glass over the row of markers + route start */}
      <div className="surface-glass-chrome absolute inset-x-4 top-4 flex h-10 items-center justify-between rounded-md border border-border px-3">
        <span className="text-xs font-semibold tracking-wide text-fg">
          C3
          <span className="ml-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-fg-subtle">
            DSTA
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-success">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
          ONLINE
        </span>
      </div>

      {/* Floating panel — bottom-left, glass over markers + terrain curve */}
      <div className="surface-glass-panel absolute bottom-4 left-4 w-60 rounded-md border border-border p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-fg">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Sector 7-G
        </div>
        <p className="mt-2 text-[11px] text-fg-muted">
          3 units on station · 2 inbound. Glass keeps the map visible while you review.
        </p>
      </div>
    </div>
  );
}

function Principle({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-bg-muted text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-fg-muted">{body}</p>
    </div>
  );
}
