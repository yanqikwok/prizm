"use client";

import {
  PromptInput,
  PromptInputActions,
  PromptInputAttachButton,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputCount,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from "react";

type DemoFile = { id: string; name: string; size: string; status: "reading" | "ready" };

const READ_DELAY = 1200;
const GENERATE_DELAY = 4000;

function formatSize(bytes: number) {
  return bytes < 1048576
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`;
}

// The default chatbox, fully working: attach files (simulated reading), send, then a simulated
// reply you can stop. Nothing leaves the page.
export function PromptInputPlayground() {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<DemoFile[]>([]);
  const [generating, setGenerating] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const addFiles = (picked: File[]) => {
    const added = picked.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: formatSize(f.size),
      status: "reading" as const,
    }));
    setFiles((current) => [...current, ...added]);
    for (const f of added) {
      later(
        () =>
          setFiles((current) =>
            current.map((c) => (c.id === f.id ? { ...c, status: "ready" } : c)),
          ),
        READ_DELAY,
      );
    }
  };

  const send = (text: string) => {
    setLast(
      files.length ? `${text} (with ${files.length} file${files.length > 1 ? "s" : ""})` : text,
    );
    setFiles([]);
    setGenerating(true);
    later(() => setGenerating(false), GENERATE_DELAY);
  };

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGenerating(false);
  };

  return (
    // Fixed width: the preview frame sizes its content to fit, so the chatbox needs a width of its own.
    <div className="w-178 space-y-2">
      <PromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={send}
        status={generating ? "generating" : "idle"}
        onStop={stop}
        maxLength={500}
      >
        <PromptInputAttachments>
          {files.map((f) => (
            <PromptInputAttachment
              key={f.id}
              name={f.name}
              meta={f.size}
              status={f.status}
              onRemove={() => setFiles((current) => current.filter((c) => c.id !== f.id))}
            />
          ))}
        </PromptInputAttachments>
        <PromptInputTextarea
          aria-label="Prompt"
          placeholder={files.length ? "Ask about these files" : "Ask anything"}
        />
        <PromptInputActions>
          <PromptInputAttachButton onFilesSelected={addFiles} />
          <PromptInputCount />
          <PromptInputSubmit />
        </PromptInputActions>
      </PromptInput>
      <p className="text-xs text-fg-subtle" aria-live="polite">
        {generating
          ? "Generating a reply… press Stop, or keep typing your next prompt."
          : last
            ? `Sent: “${last}”`
            : "Try it: type, attach files, press Enter to send, Shift+Enter for a new line."}
      </p>
    </div>
  );
}

type StateProps = Omit<ComponentProps<typeof PromptInput>, "children"> & {
  text?: string;
  files?: Omit<DemoFile, "id">[];
};

// A fixed state: the text can be edited, but sending does nothing.
function Fixed({ text = "", files = [], ...props }: StateProps) {
  const [value, setValue] = useState(text);
  return (
    <PromptInput value={value} onValueChange={setValue} onStop={() => {}} {...props}>
      {files.length > 0 && (
        <PromptInputAttachments>
          {files.map((f) => (
            <PromptInputAttachment
              key={f.name}
              name={f.name}
              meta={f.size}
              status={f.status}
              onRemove={() => {}}
            />
          ))}
        </PromptInputAttachments>
      )}
      <PromptInputTextarea
        aria-label="Prompt"
        placeholder={files.length ? "Ask about these files" : "Ask anything"}
      />
      <PromptInputActions>
        <PromptInputAttachButton onFilesSelected={() => {}} />
        <PromptInputCount />
        <PromptInputSubmit />
      </PromptInputActions>
    </PromptInput>
  );
}

function VisualCard({
  label,
  note,
  children,
}: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg-subtle p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">{label}</p>
      {note && <p className="mt-0.5 text-xs text-fg-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

const VARIANTS: { label: string; props: StateProps }[] = [
  { label: "Docked (default)", props: {} },
  { label: "Hero", props: { variant: "hero" } },
];

const STATES: { label: string; note?: string; props: StateProps }[] = [
  { label: "Default (empty)", props: {} },
  {
    label: "Focus",
    note: "The text area has focus. Shown here with the focus styles switched on.",
    props: { className: "border-accent ring-3 ring-accent/20" },
  },
  { label: "Has text", props: { text: "Summarise the meeting notes in five bullet points" } },
  {
    label: "Growing",
    props: {
      text: "First, list the decisions.\nThen the open risks.\nThen the action items, with owners.\nThen the dates.\nKeep each line short.\nUse plain English.\nNo headings.\nEnd with next steps.",
    },
  },
  {
    label: "Attachments: reading and ready",
    props: {
      text: "What are the action items?",
      files: [
        { name: "meeting-notes.pdf", size: "120 KB", status: "ready" },
        { name: "quarterly-plan-final-revised-version.pdf", size: "2.4 MB", status: "reading" },
      ],
    },
  },
  { label: "Generating", props: { status: "generating", text: "And who owns each one?" } },
  {
    label: "Near the limit",
    note: "Shown with a limit of 60 characters.",
    props: { maxLength: 60, text: "Draft a short reply that thanks the team for the update" },
  },
  {
    label: "Over the limit",
    note: "Shown with a limit of 40 characters.",
    props: {
      maxLength: 40,
      text: "Draft a short reply that thanks the team for the update and asks for dates",
    },
  },
  { label: "Disabled", props: { disabled: true } },
];

export function PromptInputVariants() {
  return (
    <div className="space-y-4">
      {VARIANTS.map((v) => (
        <VisualCard key={v.label} label={v.label}>
          <Fixed {...v.props} />
        </VisualCard>
      ))}
    </div>
  );
}

export function PromptInputStates() {
  return (
    <div className="space-y-4">
      {STATES.map((s) => (
        <VisualCard key={s.label} label={s.label} note={s.note}>
          <Fixed {...s.props} />
        </VisualCard>
      ))}
    </div>
  );
}
