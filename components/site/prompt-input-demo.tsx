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
import { type ComponentProps, useEffect, useRef, useState } from "react";

type DemoFile = { id: string; name: string; size: string; status: "reading" | "ready" };

const READ_DELAY = 1200;
const GENERATE_DELAY = 4000;

function formatSize(bytes: number) {
  return bytes < 1048576
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`;
}

// A working composer: attach files (simulated reading), send, then a simulated
// response you can stop. Nothing leaves the page.
function Playground() {
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
    <div className="space-y-2">
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
      <p className="mx-auto max-w-178 text-xs text-fg-subtle" aria-live="polite">
        {generating
          ? "Generating a response… press Stop, or keep typing your next prompt."
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

// A fixed state: the value is editable but sending does nothing.
function State({ text = "", files = [], ...props }: StateProps) {
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

const STATES: { label: string; note: string; props: StateProps }[] = [
  {
    label: "Hero",
    note: 'variant="hero" — centred on an empty screen; 800px max width.',
    props: { variant: "hero" },
  },
  {
    label: "Docked · empty",
    note: "Default variant; 712px max width. Send is disabled until there is text.",
    props: {},
  },
  {
    label: "Has text",
    note: "Send enables in the accent colour.",
    props: { text: "Summarise the meeting notes in five bullet points" },
  },
  {
    label: "Growing",
    note: "Grows with its content up to 200px, then scrolls.",
    props: {
      text: "First, list the decisions.\nThen the open risks.\nThen the action items, with owners.\nThen the dates.\nKeep each line short.\nUse plain English.\nNo headings.\nEnd with next steps.",
    },
  },
  {
    label: "Attachments · reading and ready",
    note: "Send is blocked until every file has been read.",
    props: {
      text: "What are the action items?",
      files: [
        { name: "meeting-notes.pdf", size: "120 KB", status: "ready" },
        { name: "quarterly-plan-final-revised-version.pdf", size: "2.4 MB", status: "reading" },
      ],
    },
  },
  {
    label: "Generating",
    note: "Send becomes Stop. The text area stays enabled for the next prompt.",
    props: { status: "generating", text: "And who owns each one?" },
  },
  {
    label: "Near the limit",
    note: "maxLength={60}: the count appears at 90% of the limit.",
    props: { maxLength: 60, text: "Draft a short reply that thanks the team for the update" },
  },
  {
    label: "Over the limit",
    note: "The count turns danger and Send is blocked; typing is not cut off.",
    props: {
      maxLength: 40,
      text: "Draft a short reply that thanks the team for the update and asks for dates",
    },
  },
  {
    label: "Disabled",
    note: "The whole composer is disabled.",
    props: { disabled: true },
  },
];

export function PromptInputDemo() {
  return (
    // Fixed width so hero (800px) and docked (712px) keep their real sizes inside the preview frame,
    // which sizes demos to their content and scrolls sideways when they are wider.
    <div className="w-200 space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Playground</p>
        <Playground />
      </section>
      {STATES.map((state) => (
        <section key={state.label} className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">
              {state.label}
            </p>
            <p className="mt-0.5 text-xs text-fg-muted">{state.note}</p>
          </div>
          <State {...state.props} />
        </section>
      ))}
    </div>
  );
}
