---
component: prompt-input
slug: prompt-input
status: alpha
source: components/ui/prompt-input.tsx
built-on: PRIZM Field
---

# Prompt Input

The chatbox where a user types a prompt and sends it to an AI assistant. It grows as the user types, can hold file attachments, and its send button turns into a Stop button while a reply is being generated. Built from PRIZM's `Field` (the chatbox, with its focused, filled and disabled states), `FieldControl` (the text area, rendered as a `<textarea>`), `Button` (attach, send, stop, remove) and `Spinner` (the reading state). Base UI is used only through `Field`.

## Sub-components

- `PromptInput` — the chatbox itself. Holds the text, the status and the disabled state.
- `PromptInputTextarea` — the text area. It grows as the user types. Enter sends; Shift+Enter adds a new line.
- `PromptInputAttachments` — the row of attachment chips above the text area. Hidden when empty.
- `PromptInputAttachment` — one file chip: icon, name, a short info line, a "reading" state and a remove button.
- `PromptInputActions` — the row of buttons under the text area.
- `PromptInputAttachButton` — opens the file picker. The user can pick several files.
- `PromptInputCount` — the character count. Only shows when the text is close to `maxLength`.
- `PromptInputSubmit` — the Send button. Becomes Stop while `status="generating"`.

## When to use

- Anywhere a user sends prompts to an AI assistant, chat or copilot.
- On an empty or landing screen (`variant="hero"`) and at the bottom of a conversation (`variant="docked"`).

## When NOT to use

- A multi-line field that is sent together with the rest of a form: use `Textarea` inside `Field`. `Textarea` is a standalone field with its own border, radius, focus outline, 80px minimum height and resize handle. The chatbox needs a plain text area that grows as the user types, inside a box that owns the border and focus ring, and overriding `Textarea`'s styles is not allowed by PRIZM's reuse rule (see Open questions).
- A single-line search box: use `Input`.
- Choosing from a list of commands or results as the user types: use `Command` or `Combobox`.

## Variants

| variant | When to use |
|---------|-------------|
| `docked` | Default. At the bottom of a conversation. Max width 712px, so it lines up with the messages above it. |
| `hero` | Centred on an empty or landing screen, under a heading, before the first message. Max width 800px, wider than `docked`. |

## States

- **Default (empty)** — placeholder text in `text-fg-subtle`. Attach is on. Send is off, at 50% opacity.
- **Hover** — the attach, send, stop and remove buttons get the usual `Button` hover fill.
- **Focus** — while the text area has focus, the whole box gets `border-accent` and a 3px `ring-accent/20`. When focus moves to a button, that button shows its own focus outline instead.
- **Has text** — Send turns on, in `text-accent`. Enter sends; Shift+Enter adds a new line.
- **Growing** — the text area gets taller as the user types, up to 200px, then scrolls. After sending, it clears and goes back to one line.
- **Attachment reading** — a chip with a `Spinner` and "Reading file…". Send stays off until every file has been read, even if there is text.
- **Attachment ready** — the chip shows the file type and size (for example "PDF · 120 KB") and a remove button. Several chips wrap onto new lines.
- **Generating** — while a reply is coming in, Send becomes a Stop button (`Button variant="subtle"`). The text area stays on, so the user can write the next prompt. Enter does nothing until the reply ends or is stopped.
- **Near limit / over limit** — when `maxLength` is set, a count appears at 90% of the limit in `text-fg-subtle`. Over the limit it turns `text-danger` and Send is off. The user can still type or paste, so pasted text is never cut off.
- **Disabled** — the whole chatbox at 50% opacity with a not-allowed cursor. The text area and every button are off.

There is no attachment error state. The product's file picker must only allow the right file types (`accept`), so a wrong file never reaches the chatbox.

## Visual treatment

- Box: `bg-surface`, `border-border-strong`, `rounded-xl`, `shadow-md`. Padding is 16px at the sides, 12px at the top, 8px at the bottom.
- Focus: `border-accent` and `ring-3 ring-accent/20` while the text area has focus.
- Text: `text-base` (16px) in `text-fg`. Placeholder in `text-fg-subtle`.
- Attachment chip: `bg-bg-subtle`, `border-border`, `rounded-lg`. Name in `text-sm font-semibold text-fg`, info line in `text-xs text-fg-subtle`.
- Send: ghost icon `Button` in `text-accent`. Stop: subtle icon `Button`. Attach: ghost icon `Button` in `text-fg-muted`.
- Count: `text-xs text-fg-subtle`, and `text-danger` when over the limit.
- C3 and Enterprise look the same; the tokens handle the difference. It is not a glass surface: the chatbox is an input, so it stays solid in C3.

## Accessibility

- The chatbox is a form, and the text area is the field inside it. Give the text area a name with `aria-label`, or put PRIZM's `FieldLabel` inside the chatbox and it is linked automatically. A placeholder is not a label.
- Tab goes in the normal order: attachment remove buttons, then the text area, then Attach, then Send or Stop. Buttons that are off are skipped.
- Every icon button has an `aria-label`: "Attach files", "Send", "Stop generating", "Remove [file name]". You can change all of them for other languages.
- Enter sends and Shift+Enter adds a new line. Enter is ignored while the user is still composing text with an input method (IME), so Chinese, Japanese and Korean typing works.
- Attachments sit in a group (`role="group"`) labelled "Attachments". A chip that is still reading is marked `aria-busy`, and its `Spinner` is announced to screen readers.
- While a reply is generating, the form is marked `aria-busy`. The count is announced politely (`aria-live="polite"`), so screen reader users hear when they get close to the limit.
- Buttons that are off use the native `disabled` attribute, so they cannot be reached with Tab.

## Examples

```tsx
// At the bottom of a conversation, with attachments and Stop
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
| `variant` | `"docked" \| "hero"` | `"docked"` | Where the chatbox sits. Sets the max width (712px / 800px). |
| `value` | `string` | — | The text, when you control it yourself. |
| `defaultValue` | `string` | `""` | The starting text, when you don't. |
| `onValueChange` | `(value: string) => void` | — | Called on every change, and with `""` after a send. |
| `onSubmit` | `(value: string) => void` | — | Called with the trimmed text when the user sends. Only called when sending is allowed. |
| `status` | `"idle" \| "generating"` | `"idle"` | `"generating"` swaps Send for Stop and stops the user from sending. |
| `onStop` | `() => void` | — | Called when the user presses Stop. |
| `disabled` | `boolean` | `false` | Turns off the whole chatbox. |
| `maxLength` | `number` | — | A soft character limit. Shows `PromptInputCount` near the limit and stops sending when over it. |
| `className` | `string` | — | Extra Tailwind classes, merged with the defaults using `cn()`. |

### `PromptInputAttachment`

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | The file name. Shortened with an ellipsis if it is long; the full name shows in the tooltip. |
| `meta` | `ReactNode` | — | The second line once the file is ready, for example "PDF · 120 KB". |
| `icon` | `ReactNode` | `FileText` | The file-type icon. |
| `status` | `"reading" \| "ready"` | `"ready"` | `"reading"` shows the spinner and stops the user from sending. |
| `readingLabel` | `string` | `"Reading file…"` | The text shown while reading. |
| `onRemove` | `() => void` | — | Shows the remove button when set. |
| `removeLabel` | `string` | `"Remove [name]"` | The accessible name of the remove button. |

### `PromptInputAttachButton`

| Prop | Type | Default | Description |
|---|---|---|---|
| `onFilesSelected` | `(files: File[]) => void` | — | Called with the files the user picked. |
| `accept` | `string` | — | Limits the file types in the picker, for example `.pdf,application/pdf`. |
| `multiple` | `boolean` | `true` | Whether the user can pick more than one file. |
| `label` | `string` | `"Attach files"` | The accessible name and tooltip of the button. |

### `PromptInputSubmit`

| Prop | Type | Default | Description |
|---|---|---|---|
| `sendLabel` | `string` | `"Send"` | The accessible name and tooltip of the Send button. |
| `stopLabel` | `string` | `"Stop generating"` | The accessible name and tooltip of the Stop button. |

### `PromptInputTextarea`

Accepts all `<textarea>` props except `value`, `defaultValue`, `maxLength` and `disabled`. Those are set by `PromptInput`.

_Hand-written while this component is alpha. Moves to `lib/components-api.ts` when promoted to stable._

## Source

The source is at `components/ui/prompt-input.tsx`. Copy it into your project at the same path, together with `components/ui/button.tsx` and `components/ui/spinner.tsx`. Required packages: `@base-ui-components/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

## Supplementary guidelines

### Generating and Stop

Set `status="generating"` from the moment the prompt is sent until the reply finishes or fails. Stop must always be available while generating. `onStop` should cancel the request and keep whatever has already arrived. When generating ends, set `status` back to `"idle"`. Any text the user wrote in the meantime is kept and can be sent.

### Character limit

PRIZM does not set a limit. It depends on the product, and on the model's size and cost. If the product has a limit, pass it as `maxLength` and add `PromptInputCount`. The limit is soft: the user can still type and paste past it. The count turns `text-danger` and Send stays off until the text is shorter.

### Attachments

The chatbox only shows attachments. Reading, uploading and checking files is the product's job. Drag and drop is not part of this component. A separate attachment-upload component will cover it.

### Wording

- Placeholder: a short invitation in sentence case, with no full stop ("Ask anything"). Once a file is attached, change it to match ("Ask about this file").
- Keep the placeholder under about 40 characters, so it fits on one line at the docked width on small screens.
- Button labels are verbs: "Send", "Stop generating", "Attach files", "Remove [file name]".
- Put notices (such as "AI may make mistakes" or a classification marking) outside the chatbox, in a footnote under it. Don't put them in the placeholder.

## Open questions

- **Soft accent fill.** The source uses a see-through accent fill for the focus ring and button hovers. PRIZM has no `accent-subtle` token, so this proposal uses `ring-accent/20` (an opacity setting on `accent`, the way `bg-fg/5` is used elsewhere). Should PRIZM add an `accent-subtle` token?
- **Brighter accent text.** The source colours the Send icon with a lighter accent than `accent`. This proposal uses `text-accent`. Contrast on `bg-surface` still needs to be checked in all four themes.
- **Corner radius.** The source uses a 16px radius, but PRIZM's largest is `rounded-xl` (12px). Is 12px enough, or does PRIZM need a larger radius token?
- **Resting border.** The source tints the border towards the accent colour. This proposal uses `border-border-strong`, to stay with the existing tokens.
- **Bare `Textarea` variant.** The chatbox writes its own text area styles because PRIZM's `Textarea` has a border, background, shadow and minimum height that would all need overriding. Should `Textarea` get a bare variant (no border, background, shadow or minimum height, with optional auto-grow)? If so, the chatbox would use it.
- **Scope selector.** Another chatbox in the source has a "search scope" row above the text area. It is left out for now. It could become a `PromptInputHeader` part later.
- **Attachment chip.** `PromptInputAttachment` may move to the planned attachment-upload component once that exists.
