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

The chatbox where a user types a prompt and sends it to an AI assistant. It grows as the user types, can hold file attachments, and its send button turns into a Stop button while a reply is being generated. It is the starting point of every conversation in the AI design system. Built on Base UI `Field`.

## UI visuals

- Preview: `/components/prompt-input` on the docs site (run `pnpm dev`): a working playground plus every state, in all four themes via "Compare all variants".
- A rounded box with the text area on top and a row of buttons underneath: attach on the left, send on the right. Attachments, when there are any, sit above the text area as small chips.

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

- A multi-line field that is sent together with the rest of a form: use `Textarea` inside `Field`.
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

`PromptInputAttachment`

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | The file name. Shortened with an ellipsis if it is long; the full name shows in the tooltip. |
| `meta` | `ReactNode` | — | The second line once the file is ready, for example "PDF · 120 KB". |
| `icon` | `ReactNode` | `FileText` | The file-type icon. |
| `status` | `"reading" \| "ready"` | `"ready"` | `"reading"` shows the spinner and stops the user from sending. |
| `readingLabel` | `string` | `"Reading file…"` | The text shown while reading. |
| `onRemove` | `() => void` | — | Shows the remove button when set. |
| `removeLabel` | `string` | `"Remove [name]"` | The accessible name of the remove button. |

`PromptInputAttachButton`: `onFilesSelected(files: File[])`, `accept`, `multiple` (default `true`), `label` (default `"Attach files"`).
`PromptInputSubmit`: `sendLabel` (default `"Send"`), `stopLabel` (default `"Stop generating"`).
`PromptInputTextarea` accepts all `<textarea>` props except `value`, `defaultValue`, `maxLength` and `disabled`. Those are set by `PromptInput`.

_Hand-written while this component is alpha. Moves to `lib/components-api.ts` when promoted to stable._

## Source

The source is at `components/ui/prompt-input.tsx`. Copy it into your project at the same path, together with `components/ui/button.tsx` and `components/ui/spinner.tsx`. Required packages: `@base-ui-components/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

---

# Proposed additions

## Reuse check

| PRIZM component | Why it doesn't fit |
|---|---|
| `Textarea` | The closest match, but it is a standalone field with its own border, radius and focus outline, a minimum height of 80px, and a resize handle. The chatbox needs a plain text area that grows as the user types, inside a larger box that owns the border and the focus ring. Getting there would mean overriding `Textarea`'s own styles, which PRIZM's reuse rule does not allow. |
| `Field` | The closest in behaviour, and the chatbox uses the same Base UI part. PRIZM's `Field` only lays out a label, hint and error around a separate control. The chatbox needs one box that holds the attachments, the text and the buttons together, and it needs sending rules (Enter, blocking, Stop) that `Field` doesn't have. |
| `Input` | One line only. Prompts are often longer. |
| `Command` / `Combobox` | These let the user pick from a list. The chatbox sends free text. |
| `Group` | Layout only. Used as the guide for the row of buttons. |

Used inside the component: `Button` (attach, send, stop, remove) and `Spinner` (reading state).

Base UI part used: `Field`. `Field.Root` is shown as the `<form>` and `Field.Control` is shown as the `<textarea>`, using Base UI's `render` prop (Base UI has no separate textarea part). This gives the chatbox the same label linking and the same focused, filled and disabled states as PRIZM's other text fields. `Toolbar` was considered for the row of buttons and rejected: it gives the row a single Tab stop and moves between buttons with the arrow keys. That suits a long toolbar, but with two or three buttons users expect Tab to reach each one.

## Anatomy

1. **Box**: the surface. Owns the border, radius, shadow and focus ring.
2. **Attachments row** (optional): file chips above the text area.
3. **Text area**: where the prompt is written. Grows up to 200px.
4. **Buttons row**: attach on the left; count and send or stop on the right.

## Content guidelines

- Placeholder: a short invitation in sentence case, with no full stop ("Ask anything"). Once a file is attached, change it to match ("Ask about this file").
- Keep the placeholder under about 40 characters, so it fits on one line at the docked width on small screens.
- Button labels are verbs: "Send", "Stop generating", "Attach files", "Remove [file name]".
- Put notices (such as "AI may make mistakes" or a classification marking) outside the chatbox, in a footnote under it. Don't put them in the placeholder.

## Do / Don't

| Do | Don't |
|---|---|
| Keep the text area on while a reply is generating, so the user can write the next prompt. | Turn off the whole chatbox while a reply is generating. |
| Limit the file types with `accept` on `PromptInputAttachButton`. | Accept any file and show an error after upload. |
| Use `variant="hero"` on the empty screen and `docked` once the conversation starts. | Use `hero` under a conversation. The wider box won't line up with the messages. |
| Give the text area an `aria-label`. | Use the placeholder as the only label. |

## Supplementary guidelines

### Generating and Stop

Set `status="generating"` from the moment the prompt is sent until the reply finishes or fails. Stop must always be available while generating. `onStop` should cancel the request and keep whatever has already arrived. When generating ends, set `status` back to `"idle"`. Any text the user wrote in the meantime is kept and can be sent.

### Character limit

PRIZM does not set a limit. It depends on the product, and on the model's size and cost. If the product has a limit, pass it as `maxLength` and add `PromptInputCount`. The limit is soft: the user can still type and paste past it. The count turns `text-danger` and Send stays off until the text is shorter.

### Attachments

The chatbox only shows attachments. Reading, uploading and checking files is the product's job. Drag and drop is not part of this component. A separate attachment-upload component will cover it.

## Related

- **Patterns that use this component:** none yet
- **Guidelines that apply:** none yet

## Source screen

- Screen: `contributions/source-screens/prompt-input/screen.png` (with `screen.html`). It shows the chatbox in the main area of an AI assistant web app: centred under a heading on the empty screen, and at the bottom of the message thread once a conversation starts. The screenshot shows only the focused, empty state; the other states come from the prototype's code in `screen.html`.
- Product / zone: Enterprise, dark mode. No extension pack.

## Open questions

- **Soft accent fill.** The source uses a see-through accent fill for the focus ring and button hovers. PRIZM has no `accent-subtle` token, so this proposal uses `ring-accent/20` (an opacity setting on `accent`, the way `bg-fg/5` is used elsewhere). Should PRIZM add an `accent-subtle` token?
- **Brighter accent text.** The source colours the Send icon with a lighter accent than `accent`. This proposal uses `text-accent`. Contrast on `bg-surface` still needs to be checked in all four themes.
- **Corner radius.** The source uses a 16px radius, but PRIZM's largest is `rounded-xl` (12px). Is 12px enough, or does PRIZM need a larger radius token?
- **Resting border.** The source tints the border towards the accent colour. This proposal uses `border-border-strong`, to stay with the existing tokens.
- **Scope selector.** Another chatbox in the source has a "search scope" row above the text area. It is left out for now. It could become a `PromptInputHeader` part later.
- **Attachment chip.** `PromptInputAttachment` may move to the planned attachment-upload component once that exists.
