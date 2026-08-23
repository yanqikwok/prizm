"use client";

import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChevronDown, Github, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { CommandPalette, useCommandPaletteShortcut } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  {
    label: "Overview",
    href: "/docs/introduction",
    children: [
      { label: "Introduction", href: "/docs/introduction" },
      { label: "Getting started", href: "/docs/getting-started" },
      { label: "Using with AI", href: "/docs/using-with-ai" },
      { label: "Adopting PRIZM", href: "/docs/adopting-prizm" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Theming", href: "/docs/theming" },
      { label: "Air-gap setup", href: "/docs/air-gap" },
      { label: "Changelog", href: "/docs/changelog" },
    ],
  },
  {
    label: "Foundations",
    href: "/docs/foundations",
    children: [
      { label: "Overview", href: "/docs/foundations" },
      { label: "Design principles", href: "/docs/principles" },
      { label: "Colours", href: "/docs/colors" },
      { label: "Typography", href: "/docs/typography" },
      { label: "Surface & motion", href: "/docs/surface-and-motion" },
      { label: "Icons", href: "/docs/icons" },
      { label: "Liquid glass", href: "/docs/liquid-glass" },
    ],
  },
  { label: "Components", href: "/components" },
  {
    label: "C3",
    href: "/c3",
    children: [
      { label: "Overview", href: "/c3/overview" },
      { label: "Templates", href: "/c3/templates" },
      { label: "Robotics & Autonomy", href: "/c3/rc3" },
      { label: "JavaFX (thick-client)", href: "/c3/javafx" },
    ],
  },
  {
    label: "Enterprise",
    href: "/enterprise",
    children: [
      { label: "Overview", href: "/enterprise/overview" },
      { label: "Templates", href: "/enterprise/templates" },
    ],
  },
  { label: "Alignment", href: "/alignment" },
];

export function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useCommandPaletteShortcut(() => setPaletteOpen(true));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <PrizmMark />
          <span className="inline-flex items-baseline gap-1.5">
            PRIZM 4.0
            <span className="text-[10px] font-medium uppercase tracking-widest text-fg-subtle">
              DSTA
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
                >
                  {item.label}
                  <ChevronDown className="h-3 w-3" />
                </Link>
                {openMenu === item.label && (
                  <div className="absolute left-0 top-full pt-1">
                    <div className="min-w-[180px] rounded-md border border-border bg-surface-elevated p-1 shadow-md">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-sm px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "hidden h-9 items-center gap-2 rounded-md border border-border bg-bg-subtle px-3 text-sm text-fg-subtle md:inline-flex",
              "hover:bg-bg-muted hover:text-fg-muted",
            )}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="rounded border border-border bg-bg px-1.5 py-0.5 text-[10px] text-fg-subtle">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <a
            href="https://github.com/prizm-design/prizm"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}

function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const close = () => onOpenChange(false);
  const focusRef = useRef<HTMLElement>(null);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85%] max-w-sm" initialFocus={focusRef}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PrizmMark />
            <span className="inline-flex items-baseline gap-1.5">
              PRIZM 4.0
              <span className="text-[10px] font-medium uppercase tracking-widest text-fg-subtle">
                DSTA
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="px-0 py-2">
          <nav ref={focusRef} tabIndex={-1} className="flex flex-col outline-none">
            {NAV.map((item) => (
              <div key={item.label} className="flex flex-col">
                <Link
                  href={item.href}
                  onClick={close}
                  className="px-6 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-bg-muted"
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={close}
                    className="py-2 pl-10 pr-6 text-sm text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function PrizmMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-accent"
      aria-hidden="true"
    >
      <title>PRIZM</title>
      <path d="M12 2L22 20H2L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 2L12 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
