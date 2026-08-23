"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** A code block with a one-click Copy button. The whole block copies verbatim,
 *  so users never have to select or identify which lines to take. */
export function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore; users can still select.
    }
  }

  return (
    <div className="relative mt-1.5">
      <pre className="overflow-x-auto rounded-md border border-border bg-bg-muted p-3 pr-16 font-mono text-sm text-fg">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="absolute right-2 top-2 inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-xs font-medium text-fg-muted transition-colors hover:bg-bg hover:text-fg"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
