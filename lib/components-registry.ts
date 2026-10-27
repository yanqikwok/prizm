/**
 * The canonical registry of every PRIZM component.
 *
 * This file is read by:
 *  - the component browser page (/components)
 *  - the per-component pages (/components/[name])
 *  - the LLM layer (root llms.txt, per-component llms.txt files)
 *  - the air-gap audit (to enumerate the surface area)
 *
 * When a new component is added, register it here. Source files live in
 * /components/ui/<slug>.tsx. Slugs are kebab-case and stable — they are
 * also the URL segment and the filename.
 */

export type ComponentCategory =
  | "actions"
  | "forms"
  | "data"
  | "layout"
  | "feedback"
  | "navigation"
  | "overlay"
  | "typography";

export type ComponentStatus = "stable" | "alpha" | "planned";

export interface ComponentEntry {
  slug: string;
  name: string;
  category: ComponentCategory;
  description: string;
  status: ComponentStatus;
  builtOn?: string;
  /** JavaFX (thick-client) availability, if the control ships in the JavaFX library. C3 scope only. */
  javafx?: "stable" | "planned";
}

export const COMPONENTS: ComponentEntry[] = [
  // ----- Actions -----
  {
    slug: "button",
    name: "Button",
    category: "actions",
    description: "Trigger an action. Six visual variants and four sizes.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "toggle-group",
    name: "Toggle Group",
    category: "actions",
    description: "Group of toggle buttons for view switching or multi-select.",
    status: "planned",
    builtOn: "Base UI Toggle Group",
  },

  // ----- Forms -----
  {
    slug: "input",
    name: "Input",
    category: "forms",
    description: "A single-line text input.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "textarea",
    name: "Textarea",
    category: "forms",
    description: "Multi-line text input.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "prompt-input",
    name: "Prompt Input",
    category: "forms",
    description:
      "Composer for sending prompts to an AI assistant: auto-growing text, attachments, send and stop.",
    status: "alpha",
    builtOn: "Base UI Toolbar",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "forms",
    description: "Binary toggle.",
    status: "stable",
    builtOn: "Base UI Checkbox",
    javafx: "stable",
  },
  {
    slug: "radio-group",
    name: "Radio Group",
    category: "forms",
    description: "Pick one of several mutually exclusive options.",
    status: "stable",
    builtOn: "Base UI Radio",
    javafx: "stable",
  },
  {
    slug: "switch",
    name: "Switch",
    category: "forms",
    description: "Toggle a setting on or off.",
    status: "stable",
    builtOn: "Base UI Switch",
    javafx: "stable",
  },
  {
    slug: "select",
    name: "Select",
    category: "forms",
    description: "Choose one from a list of options.",
    status: "stable",
    builtOn: "Base UI Select",
    javafx: "stable",
  },
  {
    slug: "combobox",
    javafx: "stable",
    name: "Combobox",
    category: "forms",
    description: "Searchable select with typeahead.",
    status: "stable",
    builtOn: "Base UI Combobox",
  },
  {
    slug: "slider",
    name: "Slider",
    category: "forms",
    description: "Pick a numeric value within a range.",
    status: "stable",
    builtOn: "Base UI Slider",
    javafx: "stable",
  },
  {
    slug: "label",
    name: "Label",
    category: "forms",
    description: "Accessible label for form controls.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "field",
    name: "Field",
    category: "forms",
    description: "Form field wrapper with label, hint, and error.",
    status: "stable",
    builtOn: "Base UI Field",
    javafx: "stable",
  },
  {
    slug: "number-input",
    name: "Number Input",
    category: "forms",
    description: "Numeric input with increment / decrement controls.",
    status: "planned",
    builtOn: "Base UI Number Field",
  },
  {
    slug: "date-picker",
    name: "Date Picker",
    category: "forms",
    description: "Pick a date or date range. Composes Calendar with input + popover.",
    status: "planned",
  },

  // ----- Data display -----
  {
    slug: "card",
    name: "Card",
    category: "layout",
    description: "A container with surface, border, and structured slots.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "badge",
    name: "Badge",
    category: "data",
    description: "A small status indicator or label.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "data",
    description: "User or entity image with fallback.",
    status: "stable",
    builtOn: "Base UI Avatar",
    javafx: "stable",
  },
  {
    slug: "table",
    name: "Table",
    category: "data",
    description: "Structured tabular data.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "calendar",
    javafx: "stable",
    name: "Calendar",
    category: "data",
    description: "Date picker grid.",
    status: "stable",
  },
  {
    slug: "kbd",
    javafx: "stable",
    name: "Kbd",
    category: "typography",
    description: "Keyboard shortcut display.",
    status: "stable",
  },
  {
    slug: "code",
    javafx: "stable",
    name: "Code",
    category: "typography",
    description: "Inline and block code.",
    status: "stable",
  },
  {
    slug: "tree",
    name: "Tree",
    category: "data",
    description: "Hierarchical data view with expand / collapse.",
    status: "planned",
  },

  // ----- Layout -----
  {
    slug: "separator",
    name: "Separator",
    category: "layout",
    description: "Visual dividing line.",
    status: "stable",
    builtOn: "Base UI Separator",
    javafx: "stable",
  },
  {
    slug: "frame",
    javafx: "stable",
    name: "Frame",
    category: "layout",
    description: "Constrained content frame with consistent padding.",
    status: "stable",
  },
  {
    slug: "group",
    name: "Group",
    category: "layout",
    description: "Horizontal grouping of related controls.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "stack",
    name: "Stack",
    category: "layout",
    description: "Vertical spacing primitive.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "accordion",
    name: "Accordion",
    category: "layout",
    description: "Vertically stacked, collapsible content sections.",
    status: "planned",
    builtOn: "Base UI Accordion",
  },
  {
    slug: "scroll-area",
    name: "Scroll Area",
    category: "layout",
    description: "Custom-styled scrollable region.",
    status: "planned",
    builtOn: "Base UI Scroll Area",
  },

  // ----- Feedback -----
  {
    slug: "alert",
    name: "Alert",
    category: "feedback",
    description: "Inline message block.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "toast",
    name: "Toast",
    category: "feedback",
    description: "Transient notification.",
    status: "stable",
    builtOn: "Base UI Toast",
    javafx: "stable",
  },
  {
    slug: "progress",
    name: "Progress",
    category: "feedback",
    description: "Determinate progress indicator.",
    status: "stable",
    builtOn: "Base UI Progress",
    javafx: "stable",
  },
  {
    slug: "spinner",
    name: "Spinner",
    category: "feedback",
    description: "Indeterminate loading indicator.",
    status: "stable",
    javafx: "stable",
  },
  {
    slug: "skeleton",
    javafx: "stable",
    name: "Skeleton",
    category: "feedback",
    description: "Loading placeholder.",
    status: "stable",
  },
  {
    slug: "empty-state",
    name: "Empty State",
    category: "feedback",
    description: "Placeholder for empty content regions.",
    status: "stable",
    javafx: "stable",
  },

  // ----- Navigation -----
  {
    slug: "tabs",
    javafx: "stable",
    name: "Tabs",
    category: "navigation",
    description: "Switch between related views.",
    status: "stable",
    builtOn: "Base UI Tabs",
  },
  {
    slug: "breadcrumb",
    javafx: "stable",
    name: "Breadcrumb",
    category: "navigation",
    description: "Hierarchical navigation trail.",
    status: "stable",
  },
  {
    slug: "pagination",
    javafx: "stable",
    name: "Pagination",
    category: "navigation",
    description: "Page navigation for long lists.",
    status: "stable",
  },
  {
    slug: "navigation-menu",
    javafx: "stable",
    name: "Navigation Menu",
    category: "navigation",
    description: "Multi-level navigation bar.",
    status: "stable",
    builtOn: "Base UI Navigation Menu",
  },
  {
    slug: "command",
    javafx: "stable",
    name: "Command",
    category: "navigation",
    description: "Command palette / fuzzy launcher.",
    status: "stable",
  },
  {
    slug: "link",
    javafx: "stable",
    name: "Link",
    category: "navigation",
    description: "Inline hyperlink with PRIZM styling.",
    status: "stable",
  },

  // ----- Overlay -----
  {
    slug: "dialog",
    name: "Dialog",
    category: "overlay",
    description: "Modal dialog for focused tasks.",
    status: "stable",
    builtOn: "Base UI Dialog",
    javafx: "stable",
  },
  {
    slug: "sheet",
    name: "Sheet",
    category: "overlay",
    description: "Edge-anchored sliding panel. Opens from any side.",
    status: "stable",
    builtOn: "Base UI Dialog",
    javafx: "stable",
  },
  {
    slug: "popover",
    name: "Popover",
    category: "overlay",
    description: "Floating contextual panel.",
    status: "stable",
    builtOn: "Base UI Popover",
    javafx: "stable",
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    category: "overlay",
    description: "Hover label for compact UI elements.",
    status: "stable",
    builtOn: "Base UI Tooltip",
    javafx: "stable",
  },
  {
    slug: "menu",
    name: "Menu",
    category: "overlay",
    description: "Action menu with keyboard support.",
    status: "stable",
    builtOn: "Base UI Menu",
    javafx: "stable",
  },
  {
    slug: "context-menu",
    name: "Context Menu",
    category: "overlay",
    description: "Right-click action menu.",
    status: "stable",
    builtOn: "Base UI Context Menu",
    javafx: "stable",
  },
  {
    slug: "hover-card",
    javafx: "stable",
    name: "Hover Card",
    category: "overlay",
    description: "Rich preview on hover.",
    status: "stable",
    builtOn: "Base UI Preview Card",
  },

  // ----- Typography -----
  {
    slug: "heading",
    javafx: "stable",
    name: "Heading",
    category: "typography",
    description: "Display and section headings.",
    status: "stable",
  },
  {
    slug: "text",
    javafx: "stable",
    name: "Text",
    category: "typography",
    description: "Body text primitive.",
    status: "stable",
  },
  {
    slug: "prose",
    javafx: "stable",
    name: "Prose",
    category: "typography",
    description: "Long-form content block.",
    status: "stable",
  },
];

export const CATEGORIES: Record<ComponentCategory, { label: string; description: string }> = {
  actions: { label: "Actions", description: "Things users click to do something." },
  forms: { label: "Forms", description: "Inputs, fields, and form controls." },
  data: { label: "Data display", description: "Surface information visually." },
  layout: { label: "Layout", description: "Structure and spacing primitives." },
  feedback: { label: "Feedback", description: "Inform users of state changes." },
  navigation: { label: "Navigation", description: "Move between views and pages." },
  overlay: { label: "Overlay", description: "Floating UI layered above content." },
  typography: { label: "Typography", description: "Text-shaped content primitives." },
};

export function getComponent(slug: string): ComponentEntry | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export function getStableComponents(): ComponentEntry[] {
  return COMPONENTS.filter((c) => c.status === "stable");
}

export function getComponentsByCategory(): Record<ComponentCategory, ComponentEntry[]> {
  const grouped = {} as Record<ComponentCategory, ComponentEntry[]>;
  for (const category of Object.keys(CATEGORIES) as ComponentCategory[]) {
    grouped[category] = COMPONENTS.filter((c) => c.category === category);
  }
  return grouped;
}
