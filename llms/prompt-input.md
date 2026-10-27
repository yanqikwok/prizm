---
component: prompt-input
slug: prompt-input
type: component
layer: ai-design-system
status: alpha
source: components/ui/prompt-input.tsx
built-on: Base UI Field
proposed-by: yanqikwok
source-screen: contributions/source-screens/prompt-input/screen.png
---

# Prompt Input

The composer a user types into to send a prompt to an AI assistant: an auto-growing text area, optional file attachments, and a send button that becomes Stop while a response is generating. A composite form control in PRIZM, and the entry point of every conversation in the AI design system. Built on Base UI `Field`, like PRIZM's `Field`: the composer is the field root (rendered as a `<form>`) and the text area is its control (`Field.Control` rendered as a `<textarea>`), so it shares the focused, filled and disabled behaviour of PRIZM's other text fields.

## UI visuals

- Preview: none yet. Alpha components have no docs-site page; a live preview will be added with the docs-site work.
- A rounded surface with the text area on top and a row of actions underneath: attach on the left, send on the right. Attachments, when present, sit as chips above the text area.

```tsx
<PromptInput onSubmit={send}>
  <PromptInputTextarea placeholder="Ask anything" aria-label="Prompt" />
  <PromptInputActions>
    <PromptInputAttachButton onFilesSelected={attach} />
    <PromptInputSubmit />
  </PromptInputActions>
</PromptInput>
```

## Sub-components

- `PromptInput` — root: a Base UI `Field.Root` rendered as a `<form>`; holds the value, submit gating, status and disabled state
- `PromptInputTextarea` — the field control: Base UI `Field.Control` rendered as an auto-growing `<textarea>` (Enter sends, Shift+Enter adds a line)
- `PromptInputAttachments` — row of attachment chips above the text area; hidden when empty
- `PromptInputAttachment` — one file chip: icon, name, meta line, reading state, remove button
- `PromptInputActions` — the row of buttons under the text area; plain layout, normal tab order
- `PromptInputAttachButton` — opens the file picker; multiple files by default
- `PromptInputCount` — character count, shown only as the value nears `maxLength`
- `PromptInputSubmit` — Send; becomes Stop while `status="generating"`

## When to use

- The input a user sends prompts from in an AI assistant, chat or copilot surface.
- Both on an empty / landing screen (`variant="hero"`) and pinned under a conversation (`variant="docked"`).

## When NOT to use

- A plain multi-line form field that is submitted with the rest of a form: use `Textarea` inside `Field`.
- A single-line search box: use `Input`.
- Picking from a list of commands or results as you type: use `Command` or `Combobox`.

## Variants

| variant | When to use |
|---------|-------------|
| `docked` | Default. Pinned to the bottom of a conversation. Max width 712px, matching a centred message column. |
| `hero` | Centred on an empty or landing screen under a heading, before the first message. Max width 800px, wider than `docked`. |

## States

- **Default (empty)** — placeholder in `text-fg-subtle`; attach enabled; send disabled at 50% opacity.
- **Hover** — attach, send, stop and remove buttons take the ghost / subtle `Button` hover fill.
- **Focus** — while the text area has focus (Base UI Field's `data-focused`), the whole box shows `border-accent` plus a 3px `ring-accent/20`. Buttons in the row show their own `Button` focus outline instead.
- **Has text** — send enables in `text-accent`. Enter sends; Shift+Enter adds a new line.
- **Growing** — the text area grows with its content up to 200px, then scrolls. It clears and returns to one line after sending.
- **Attachment reading** — a chip with a `Spinner` and a "Reading file…" line. Send is blocked until every attachment finishes reading, even when there is text.
- **Attachment ready** — the chip's meta line shows type and size (for example "PDF · 120 KB"), with a remove button. Several chips wrap onto new lines.
- **Generating** — while a response streams, send becomes a Stop button (`Button variant="subtle"`). The text area stays enabled so the user can draft the next prompt, but Enter does not send until generation ends or is stopped.
- **Near limit / over limit** — with `maxLength` set, a count appears at 90% of the limit in `text-fg-subtle`; over the limit it turns `text-danger` and send is blocked. Typing is not cut off, so pasted text isn't silently truncated.
- **Disabled** — the whole composer at 50% opacity with a not-allowed cursor; the text area and every button are disabled.

There is no attachment error state: the product's file picker must restrict file types (`accept`) before upload, so wrong types never reach the composer.

## Visual treatment

- Surface: `bg-surface`, `border-border-strong`, `rounded-xl`, `shadow-md`, padding 16px sides, 12px top, 8px bottom.
- Focus: `border-accent` and `ring-3 ring-accent/20` on `data-focused` (set by Base UI Field while the text area has focus).
- Text: `text-base` (16px) `text-fg`; placeholder `text-fg-subtle`.
- Attachment chip: `bg-bg-subtle`, `border-border`, `rounded-lg`; name `text-sm font-semibold text-fg`, meta `text-xs text-fg-subtle`.
- Send: ghost icon `Button` in `text-accent`. Stop: subtle icon `Button`. Attach: ghost icon `Button` in `text-fg-muted`.
- Count: `text-xs text-fg-subtle`, `text-danger` when over the limit.
- Same treatment in C3 and Enterprise; the tokens carry the zone difference. Not a glass surface: the composer is an input and stays solid in C3.

## Accessibility

- Base UI `Field` wraps the composer: the root renders as a `<form>`, and the text area is the field's control. Give it an accessible name with `aria-label`, or put PRIZM's `FieldLabel` inside the composer and Base UI links it automatically. The placeholder is not a label.
- Normal tab order, as in any form: attachment remove buttons, then the text area, then attach, then Send / Stop. Disabled buttons are skipped.
- Every icon button has an `aria-label`: "Attach files", "Send", "Stop generating", "Remove [file name]". All are overridable for localisation.
- Enter sends, Shift+Enter inserts a new line; Enter is ignored while an IME is composing, so CJK input works.
- Attachments sit in a `role="group"` labelled "Attachments". A reading chip is `aria-busy` and its `Spinner` is a `role="status"` live region.
- While generating, the form is `aria-busy`. The count is `aria-live="polite"` so screen-reader users hear when they near the limit.
- Disabled buttons use the native `disabled` attribute, so they drop out of the tab order.

## Examples

```tsx
// Docked under a conversation, with attachments and Stop
const [value, setValue] = useState("");
const [files, setFiles] = useState<Attached[]>([]);

<PromptInput
  value={value}
  onValueChange={setValue}
  onSubmit={(text) => send(text, files)}
  status={isGenerating ? "generating" : "idle"}
  onStop={cancel}
  maxLength={4000}
>
  <PromptInputAttachments>
    {files.map((f) => (
      <PromptInputAttachment
        key={f.id}
        name={f.name}
        meta={`PDF · ${f.size}`}
        status={f.ready ? "ready" : "reading"}
        onRemove={() => remove(f.id)}
      />
    ))}
  </PromptInputAttachments>
  <PromptInputTextarea
    placeholder={files.length ? "Ask about these files" : "Ask anything"}
    aria-label="Prompt"
  />
  <PromptInputActions>
    <PromptInputAttachButton accept=".pdf,application/pdf" onFilesSelected={add} />
    <PromptInputCount />
    <PromptInputSubmit />
  </PromptInputActions>
</PromptInput>
```

```tsx
// Hero on an empty screen
<PromptInput variant="hero" onSubmit={start}>
  <PromptInputTextarea placeholder="Ask anything" aria-label="Prompt" autoFocus />
  <PromptInputActions>
    <PromptInputAttachButton onFilesSelected={add} />
    <PromptInputSubmit />
  </PromptInputActions>
</PromptInput>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"docked" \| "hero"` | `"docked"` | Placement. Sets the max width (712px / 800px). |
| `value` | `string` | — | Controlled value. |
| `defaultValue` | `string` | `""` | Uncontrolled starting value. |
| `onValueChange` | `(value: string) => void` | — | Called on every change, and with `""` after a send. |
| `onSubmit` | `(value: string) => void` | — | Called with the trimmed value when the user sends. Only fires when sending is allowed. |
| `status` | `"idle" \| "generating"` | `"idle"` | `"generating"` swaps Send for Stop and blocks sending. |
| `onStop` | `() => void` | — | Called when the user presses Stop. |
| `disabled` | `boolean` | `false` | Disables the whole composer. |
| `maxLength` | `number` | — | Soft character limit. Shows `PromptInputCount` near the limit and blocks sending over it. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

`PromptInputAttachment`

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | File name. Truncated with an ellipsis; full name in the tooltip. |
| `meta` | `ReactNode` | — | Second line when ready, e.g. "PDF · 120 KB". |
| `icon` | `ReactNode` | `FileText` | File-type icon. |
| `status` | `"reading" \| "ready"` | `"ready"` | `"reading"` shows the spinner and blocks sending. |
| `readingLabel` | `string` | `"Reading file…"` | Text shown while reading. |
| `onRemove` | `() => void` | — | Shows the remove button when set. |
| `removeLabel` | `string` | `"Remove [name]"` | Accessible name for the remove button. |

`PromptInputAttachButton`: `onFilesSelected(files: File[])`, `accept`, `multiple` (default `true`), `label` (default `"Attach files"`).
`PromptInputSubmit`: `sendLabel` (default `"Send"`), `stopLabel` (default `"Stop generating"`).
`PromptInputTextarea` spreads all `<textarea>` props except `value`, `defaultValue`, `maxLength` and `disabled`, which come from the root and the Field.

_Hand-written while this component is alpha. Moves to `lib/components-api.ts` when promoted to stable._

## Source

The canonical source lives at `components/ui/prompt-input.tsx`. Copy it into the consumer's project at the same relative path, together with `components/ui/button.tsx` and `components/ui/spinner.tsx`. Required peer dependencies: `@base-ui-components/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

---

# Proposed additions

## Reuse check

| PRIZM component | Why it doesn't fit |
|---|---|
| `Textarea` | Closest match, but it is a standalone bordered field (`min-h-[80px]`, own border, radius and focus outline, user-resizable). A composer needs a borderless, auto-growing text area inside a larger surface that owns the border and focus ring. Getting there means overriding `Textarea`'s internals, which PRIZM's reuse rule forbids. |
| `Field` | Closest in behaviour, and the composer is built on the same Base UI primitive. PRIZM's `Field` is a layout wrapper (label, hint, error stacked with a gap) around a separately styled control; the composer needs one surface that holds the attachments, text and actions together, plus submit behaviour (Enter, gating, Stop) that `Field` doesn't model. |
| `Input` | Single-line only; prompts are multi-line. |
| `Command` / `Combobox` | Pick from a filtered list; the composer submits free text. |
| `Group` | Layout only; used as the reference for the action row's layout. |

Reused inside the component: `Button` (attach, send, stop, remove), `Spinner` (reading state).

Base UI primitive used: `Field`. `Field.Root` renders as the `<form>` and `Field.Control` renders as the `<textarea>` through Base UI's `render` prop (Base UI has no dedicated textarea part). This gives the composer the same label linking, disabled propagation and `data-focused` / `data-filled` / `data-disabled` state as PRIZM's other text fields. `Toolbar` was considered for the action row and rejected: its single tab stop with arrow-key movement suits long toolbars, not two or three buttons, where users expect Tab to reach each one.

## Anatomy

1. **Container**: the surface; owns the border, radius, shadow and focus ring.
2. **Attachments row** (optional): file chips above the text area.
3. **Text area**: where the prompt is written; grows to 200px.
4. **Actions row**: attach on the left; count and send / stop on the right.

## Content guidelines

- Placeholder: a short invitation in sentence case, no full stop ("Ask anything"). Switch to a file-specific placeholder once a file is attached ("Ask about this file").
- Keep the placeholder under about 40 characters so it fits on one line at the docked width on small screens.
- Button labels are verbs: "Send", "Stop generating", "Attach files", "Remove [file name]".
- Put disclaimers (accuracy notices, classification markings) outside the composer, in a footnote under it, not in the placeholder.

## Do / Don't

| Do | Don't |
|---|---|
| Keep the text area enabled while generating so the user can draft the next prompt. | Disable the whole composer while a response is generating. |
| Restrict file types with `accept` on `PromptInputAttachButton`. | Accept any file and show an error after upload. |
| Use `variant="hero"` on the empty screen and `docked` once a conversation starts. | Use `hero` under a conversation; the wider box won't line up with the messages. |
| Give the text area an `aria-label`. | Rely on the placeholder as its only label. |

## Supplementary guidelines

### Generating and Stop

Pass `status="generating"` from the moment the prompt is sent until the response finishes or fails. Stop must always be available while generating; `onStop` should cancel the request and keep whatever was already streamed. When generation ends, set `status` back to `"idle"`; any text drafted meanwhile is kept and can be sent.

### Character limit

PRIZM doesn't fix a limit; it is product config, driven by the model's context and cost. If the product has one, pass it as `maxLength` and include `PromptInputCount`. The limit is soft: typing and pasting past it are allowed, the count turns `text-danger` and Send is blocked until the text is shortened.

### Attachments

The composer only displays attachments; reading, uploading and validating files are the product's job. Drag and drop is out of scope here and will be covered by a separate attachment-upload component.

## Related

- **Patterns that use this component:** none yet
- **Guidelines that apply:** none yet

## Source screen

- Screen: `contributions/source-screens/prompt-input/screen.png` (with `screen.html`), the composer in the main canvas of an AI assistant web app: centred under a heading on the empty screen, and pinned under the message thread once a conversation starts. The screenshot shows the focused, empty state; the other states come from the prototype's code in `screen.html`.
- Product / zone: Enterprise, dark mode. No extension pack.

## Open questions

- **Soft accent fill.** The source uses a translucent accent fill for the focus ring and button hovers. PRIZM has no `accent-subtle` token; this proposal uses `ring-accent/20` (an opacity modifier on `accent`, as `bg-fg/5` is used elsewhere). Should PRIZM add an `accent-subtle` token?
- **Bright accent text.** The source colours the enabled send icon with a lighter accent than `accent`. This proposal uses `text-accent`; check contrast on `bg-surface` in all four themes.
- **Radius.** The source uses a 16px radius; PRIZM's largest is `rounded-xl` (12px). Is 12px enough for this surface, or does PRIZM need a larger radius token?
- **Resting border.** The source tints the resting border towards the accent. This proposal uses `border-border-strong` to stay on semantic tokens.
- **Scope selector slot.** Another source composer shows a "search scope" chip row above the text area. Left out for now; it could become a `PromptInputHeader` slot later.
- **Attachment chip ownership.** `PromptInputAttachment` may move to the planned attachment-upload component once that exists.
