"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Toolbar as BaseToolbar } from "@base-ui-components/react/toolbar";
import { type VariantProps, cva } from "class-variance-authority";
import { FileText, Paperclip, Send, Square, X } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// The textarea grows with its content up to this height, then scrolls.
const MAX_TEXTAREA_HEIGHT = 200;
// The character count appears once the value reaches this share of maxLength.
const COUNT_THRESHOLD = 0.9;

export type PromptInputStatus = "idle" | "generating";

interface PromptInputContextValue {
  value: string;
  setValue: (value: string) => void;
  canSubmit: boolean;
  status: PromptInputStatus;
  onStop?: () => void;
  disabled: boolean;
  maxLength?: number;
  registerPending: () => () => void;
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

function usePromptInput(part: string) {
  const ctx = useContext(PromptInputContext);
  if (!ctx) throw new Error(`${part} must be used inside <PromptInput>.`);
  return ctx;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as { current: T }).current = node;
}

const promptInputVariants = cva(
  [
    "mx-auto w-full rounded-xl border border-border-strong bg-surface px-4 pt-3 pb-2 shadow-md",
    "transition-[border-color,box-shadow]",
    "focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        // Centred on an empty / landing screen, under a heading.
        hero: "max-w-200",
        // Pinned to the bottom of a conversation, aligned with the message column.
        docked: "max-w-178",
      },
    },
    defaultVariants: { variant: "docked" },
  },
);

export interface PromptInputProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "defaultValue">,
    VariantProps<typeof promptInputVariants> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  status?: PromptInputStatus;
  onStop?: () => void;
  disabled?: boolean;
  maxLength?: number;
}

export const PromptInput = forwardRef<HTMLFormElement, PromptInputProps>(
  (
    {
      className,
      variant,
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      status = "idle",
      onStop,
      disabled = false,
      maxLength,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolled;
    const setValue = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolled(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    // Attachments still being read register here; the prompt can't be sent until they finish.
    const [pendingCount, setPendingCount] = useState(0);
    const registerPending = useCallback(() => {
      setPendingCount((n) => n + 1);
      return () => setPendingCount((n) => n - 1);
    }, []);

    const overLimit = maxLength !== undefined && value.length > maxLength;
    const canSubmit =
      !disabled && status === "idle" && value.trim().length > 0 && pendingCount === 0 && !overLimit;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;
      onSubmit?.(value.trim());
      setValue("");
    };

    return (
      <PromptInputContext.Provider
        value={{ value, setValue, canSubmit, status, onStop, disabled, maxLength, registerPending }}
      >
        <form
          ref={ref}
          onSubmit={handleSubmit}
          aria-disabled={disabled || undefined}
          aria-busy={status === "generating" || undefined}
          data-disabled={disabled ? "" : undefined}
          data-status={status}
          className={cn(promptInputVariants({ variant }), className)}
          {...props}
        >
          {children}
        </form>
      </PromptInputContext.Provider>
    );
  },
);
PromptInput.displayName = "PromptInput";

export type PromptInputTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "maxLength"
>;

export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, onChange, onKeyDown, rows = 1, ...props }, ref) => {
    const { value, setValue, canSubmit, disabled } = usePromptInput("PromptInputTextarea");
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // Grow with the content up to MAX_TEXTAREA_HEIGHT; reset when the value is cleared.
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure whenever the value changes.
    useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }, [value]);

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // Enter sends, Shift+Enter adds a new line. Ignore Enter while an IME is composing.
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        if (canSubmit) event.currentTarget.form?.requestSubmit();
      }
    };

    return (
      <textarea
        ref={(node) => {
          innerRef.current = node;
          assignRef(ref, node);
        }}
        rows={rows}
        value={value}
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          onChange?.(event);
          setValue(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "block max-h-50 w-full resize-none overflow-y-auto bg-transparent px-0.5 py-1 text-base leading-normal text-fg outline-none",
          "placeholder:text-fg-subtle disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);
PromptInputTextarea.displayName = "PromptInputTextarea";

export const PromptInputAttachments = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label="Attachments"
      className={cn("mb-2 flex flex-wrap gap-2 empty:hidden", className)}
      {...props}
    />
  ),
);
PromptInputAttachments.displayName = "PromptInputAttachments";

export interface PromptInputAttachmentProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  meta?: ReactNode;
  icon?: ReactNode;
  status?: "reading" | "ready";
  readingLabel?: string;
  onRemove?: () => void;
  removeLabel?: string;
}

export const PromptInputAttachment = forwardRef<HTMLDivElement, PromptInputAttachmentProps>(
  (
    {
      className,
      name,
      meta,
      icon,
      status = "ready",
      readingLabel = "Reading file…",
      onRemove,
      removeLabel,
      ...props
    },
    ref,
  ) => {
    const { disabled, registerPending } = usePromptInput("PromptInputAttachment");
    const reading = status === "reading";

    useEffect(() => {
      if (reading) return registerPending();
    }, [reading, registerPending]);

    return (
      <div
        ref={ref}
        data-status={status}
        aria-busy={reading || undefined}
        className={cn(
          "flex min-w-0 max-w-full items-center gap-3 rounded-lg border border-border bg-bg-subtle py-2 pr-2 pl-3",
          className,
        )}
        {...props}
      >
        <span className="shrink-0 text-fg-muted" aria-hidden="true">
          {icon ?? <FileText className="h-6 w-6" />}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-fg" title={name}>
            {name}
          </span>
          <span className="flex items-center gap-2 text-xs text-fg-subtle">
            {reading ? (
              <>
                <Spinner size="sm" label={readingLabel} />
                {readingLabel}
              </>
            ) : (
              meta
            )}
          </span>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-6 w-6 shrink-0 text-fg-muted"
            onClick={onRemove}
            disabled={disabled}
            aria-label={removeLabel ?? `Remove ${name}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  },
);
PromptInputAttachment.displayName = "PromptInputAttachment";

export const PromptInputToolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { disabled } = usePromptInput("PromptInputToolbar");
    return (
      <BaseToolbar.Root
        ref={ref}
        disabled={disabled}
        aria-label="Prompt actions"
        className={cn("mt-1 flex items-center gap-1", className)}
        {...props}
      />
    );
  },
);
PromptInputToolbar.displayName = "PromptInputToolbar";

export interface PromptInputAttachButtonProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  className?: string;
}

export const PromptInputAttachButton = forwardRef<HTMLButtonElement, PromptInputAttachButtonProps>(
  ({ onFilesSelected, accept, multiple = true, label = "Attach files", className }, ref) => {
    const { disabled } = usePromptInput("PromptInputAttachButton");
    const fileRef = useRef<HTMLInputElement>(null);
    return (
      <>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          tabIndex={-1}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length) onFilesSelected(files);
          }}
        />
        <BaseToolbar.Button
          ref={ref}
          disabled={disabled}
          focusableWhenDisabled={false}
          aria-label={label}
          title={label}
          onClick={() => fileRef.current?.click()}
          render={<Button variant="ghost" size="icon" className={cn("text-fg-muted", className)} />}
        >
          <Paperclip className="h-4.5 w-4.5" />
        </BaseToolbar.Button>
      </>
    );
  },
);
PromptInputAttachButton.displayName = "PromptInputAttachButton";

export const PromptInputCount = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { value, maxLength } = usePromptInput("PromptInputCount");
    if (maxLength === undefined || value.length < maxLength * COUNT_THRESHOLD) return null;
    const over = value.length > maxLength;
    return (
      <span
        ref={ref}
        aria-live="polite"
        data-slot="prompt-input-count"
        data-over={over ? "" : undefined}
        className={cn(
          "ml-auto px-1 text-xs tabular-nums text-fg-subtle",
          over && "font-medium text-danger",
          className,
        )}
        {...props}
      >
        {value.length.toLocaleString()} / {maxLength.toLocaleString()}
      </span>
    );
  },
);
PromptInputCount.displayName = "PromptInputCount";

// Send / Stop sit at the right end; when the count is shown it takes the auto margin instead.
const SUBMIT_POSITION = "ml-auto [[data-slot=prompt-input-count]+&]:ml-0";

export interface PromptInputSubmitProps {
  sendLabel?: string;
  stopLabel?: string;
  className?: string;
}

export const PromptInputSubmit = forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ sendLabel = "Send", stopLabel = "Stop generating", className }, ref) => {
    const { canSubmit, status, onStop, disabled } = usePromptInput("PromptInputSubmit");

    // While a response is generating, the send button becomes Stop.
    if (status === "generating") {
      return (
        <BaseToolbar.Button
          ref={ref}
          disabled={disabled}
          focusableWhenDisabled={false}
          aria-label={stopLabel}
          title={stopLabel}
          onClick={onStop}
          render={
            <Button variant="subtle" size="icon" className={cn(SUBMIT_POSITION, className)} />
          }
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </BaseToolbar.Button>
      );
    }

    return (
      <BaseToolbar.Button
        ref={ref}
        disabled={!canSubmit}
        focusableWhenDisabled={false}
        aria-label={sendLabel}
        title={sendLabel}
        // Submit through the form so onSubmit runs the same path as Enter.
        onClick={(event) => event.currentTarget.form?.requestSubmit()}
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(SUBMIT_POSITION, "text-accent", className)}
          />
        }
      >
        <Send className="h-4.5 w-4.5" />
      </BaseToolbar.Button>
    );
  },
);
PromptInputSubmit.displayName = "PromptInputSubmit";
