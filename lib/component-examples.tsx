import { ComboboxDemo } from "@/components/site/combobox-demo";
import { CommandDemo } from "@/components/site/command-demo";
import { PaginationDemo } from "@/components/site/pagination-demo";
import { PromptInputDemo } from "@/components/site/prompt-input-demo";
import { ToastDemo } from "@/components/site/toast-demo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Code, CodeBlock } from "@/components/ui/code";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Frame } from "@/components/ui/frame";
import { Group } from "@/components/ui/group";
import { Heading } from "@/components/ui/heading";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Prose } from "@/components/ui/prose";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Stack } from "@/components/ui/stack";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InboxIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface ComponentExample {
  preview: ReactNode;
  code: string;
}

const buttonExample: ComponentExample = {
  preview: (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  code: `import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Button>Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}`,
};

const inputExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm space-y-3">
      <Input placeholder="Email address" type="email" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
  code: `import { Input } from "@/components/ui/input";

export function Example() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <Input placeholder="Email address" type="email" />
      <Input placeholder="Disabled" disabled />
    </div>
  );
}`,
};

const cardExample: ComponentExample = {
  preview: (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short description of what this card contains.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-fg-muted">
          The body of the card. Cards group related information into a single visual unit.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Confirm</Button>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  ),
  code: `import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";

export function Example() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short description of what this card contains.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-fg-muted">The body of the card.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Confirm</Button>
        <Button size="sm" variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  );
}`,
};

const badgeExample: ComponentExample = {
  preview: (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  code: `import { Badge } from "@/components/ui/badge";

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  );
}`,
};

const dialogExample: ComponentExample = {
  preview: (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm change</DialogTitle>
          <DialogDescription>
            This will update the configuration for all operators in this group.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  code: `import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm change</DialogTitle>
          <DialogDescription>
            This will update the configuration for all operators.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,
};

const labelExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm space-y-1.5">
      <Label htmlFor="ex-name">Display name</Label>
      <Input id="ex-name" placeholder="Jane Doe" />
    </div>
  ),
  code: `import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Example() {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="name">Display name</Label>
      <Input id="name" placeholder="Jane Doe" />
    </div>
  );
}`,
};

const fieldExample: ComponentExample = {
  preview: (
    <Field className="w-full max-w-sm">
      <FieldLabel>Project key</FieldLabel>
      <Input placeholder="PRIZM" />
      <FieldDescription>
        Used as the prefix for issue IDs. Cannot be changed later.
      </FieldDescription>
    </Field>
  ),
  code: `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function Example() {
  return (
    <Field>
      <FieldLabel>Project key</FieldLabel>
      <Input placeholder="PRIZM" />
      <FieldDescription>
        Used as the prefix for issue IDs. Cannot be changed later.
      </FieldDescription>
    </Field>
  );
}`,
};

const textareaExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Describe the incident..." rows={4} />
    </div>
  ),
  code: `import { Textarea } from "@/components/ui/textarea";

export function Example() {
  return <Textarea placeholder="Describe the incident..." rows={4} />;
}`,
};

const checkboxExample: ComponentExample = {
  preview: (
    <div className="flex items-center gap-3">
      <Checkbox id="ex-cb" defaultChecked />
      <Label htmlFor="ex-cb">Notify on critical alerts</Label>
    </div>
  ),
  code: `import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="notify" defaultChecked />
      <Label htmlFor="notify">Notify on critical alerts</Label>
    </div>
  );
}`,
};

const switchExample: ComponentExample = {
  preview: (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch id="ex-sw" defaultChecked />
        <Label htmlFor="ex-sw">Auto-refresh feeds</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="ex-sw-locked" defaultChecked disabled />
        <Label htmlFor="ex-sw-locked" className="text-fg-muted">
          Telemetry sync (locked)
        </Label>
      </div>
    </div>
  ),
  code: `import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Example() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch id="autorefresh" defaultChecked />
        <Label htmlFor="autorefresh">Auto-refresh feeds</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="locked" defaultChecked disabled />
        <Label htmlFor="locked" className="text-fg-muted">
          Telemetry sync (locked)
        </Label>
      </div>
    </div>
  );
}`,
};

const selectExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Critical">Critical</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  code: `import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function Example() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select severity" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Critical">Critical</SelectItem>
        <SelectItem value="High">High</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="Low">Low</SelectItem>
      </SelectContent>
    </Select>
  );
}`,
};

const separatorExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm">
      <div className="text-sm">
        <div className="font-medium">PRIZM 4.0</div>
        <div className="text-fg-muted">A DSTA design system.</div>
      </div>
      <Separator className="my-4" />
      <Group gap="4">
        <span className="text-sm text-fg-muted">Docs</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-fg-muted">Components</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-fg-muted">Source</span>
      </Group>
    </div>
  ),
  code: `import { Separator } from "@/components/ui/separator";

export function Example() {
  return (
    <>
      <div className="text-sm">
        <div className="font-medium">PRIZM 4.0</div>
        <div className="text-fg-muted">A DSTA design system.</div>
      </div>
      <Separator className="my-4" />
      <div className="flex items-center gap-4 text-sm text-fg-muted">
        <span>Docs</span>
        <Separator orientation="vertical" className="h-4" />
        <span>Components</span>
      </div>
    </>
  );
}`,
};

const stackExample: ComponentExample = {
  preview: (
    <Stack gap="3" className="w-full max-w-sm">
      <Input placeholder="First name" />
      <Input placeholder="Last name" />
      <Input placeholder="Email" type="email" />
      <Button>Continue</Button>
    </Stack>
  ),
  code: `import { Stack } from "@/components/ui/stack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <Stack gap="3">
      <Input placeholder="First name" />
      <Input placeholder="Last name" />
      <Input placeholder="Email" type="email" />
      <Button>Continue</Button>
    </Stack>
  );
}`,
};

const groupExample: ComponentExample = {
  preview: (
    <Group gap="2">
      <Button size="sm" variant="outline">
        Cancel
      </Button>
      <Button size="sm">Save changes</Button>
    </Group>
  ),
  code: `import { Group } from "@/components/ui/group";
import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <Group gap="2">
      <Button size="sm" variant="outline">Cancel</Button>
      <Button size="sm">Save changes</Button>
    </Group>
  );
}`,
};

const alertExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-md space-y-3">
      <Alert variant="info">
        <AlertTitle>Maintenance window</AlertTitle>
        <AlertDescription>The status feed will pause between 02:00 and 02:30 UTC.</AlertDescription>
      </Alert>
      <Alert variant="danger">
        <AlertTitle>Connection lost</AlertTitle>
        <AlertDescription>Retrying every 5 seconds.</AlertDescription>
      </Alert>
    </div>
  ),
  code: `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function Example() {
  return (
    <div className="space-y-3">
      <Alert variant="info">
        <AlertTitle>Maintenance window</AlertTitle>
        <AlertDescription>
          The status feed will pause between 02:00 and 02:30 UTC.
        </AlertDescription>
      </Alert>
      <Alert variant="danger">
        <AlertTitle>Connection lost</AlertTitle>
        <AlertDescription>Retrying every 5 seconds.</AlertDescription>
      </Alert>
    </div>
  );
}`,
};

const spinnerExample: ComponentExample = {
  preview: (
    <Group gap="4" align="center">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </Group>
  ),
  code: `import { Spinner } from "@/components/ui/spinner";

export function Example() {
  return (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  );
}`,
};

const skeletonExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  ),
  code: `import { Skeleton } from "@/components/ui/skeleton";

export function Example() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}`,
};

const avatarExample: ComponentExample = {
  preview: (
    <Group gap="3">
      <Avatar size="sm">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatar-placeholder.png" alt="" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>OP</AvatarFallback>
      </Avatar>
    </Group>
  ),
  code: `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm"><AvatarFallback>AL</AvatarFallback></Avatar>
      <Avatar>
        <AvatarImage src="/avatar.png" alt="" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg"><AvatarFallback>MK</AvatarFallback></Avatar>
    </div>
  );
}`,
};

const progressExample: ComponentExample = {
  preview: (
    <Stack gap="3" className="w-full max-w-sm">
      <Progress value={30} />
      <Progress value={65} />
      <Progress value={92} />
    </Stack>
  ),
  code: `import { Progress } from "@/components/ui/progress";

export function Example() {
  return (
    <div className="space-y-3">
      <Progress value={30} />
      <Progress value={65} />
      <Progress value={92} />
    </div>
  );
}`,
};

const toastExample: ComponentExample = {
  preview: <ToastDemo />,
  code: `import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.add({
            title: "Saved",
            description: "Your changes have been saved.",
            type: "success",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.add({
            title: "Couldn't save",
            description: "Network error. Try again.",
            type: "error",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.add({
            title: "Heads up",
            description: "A new version is available.",
            type: "info",
          })
        }
      >
        Info
      </Button>
    </div>
  );
}

// <ToastProvider> must wrap your app in app/layout.tsx.`,
};

const linkExample: ComponentExample = {
  preview: (
    <p className="max-w-sm text-sm text-fg-muted">
      Read the <Link href="/docs/getting-started">getting started guide</Link> or browse the{" "}
      <Link href="/components">component catalog</Link> to begin.
    </p>
  ),
  code: `import { Link } from "@/components/ui/link";

export function Example() {
  return (
    <p>
      Read the <Link href="/docs/getting-started">getting started guide</Link>{" "}
      or browse the <Link href="/components">component catalog</Link>.
    </p>
  );
}`,
};

const breadcrumbExample: ComponentExample = {
  preview: (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  code: `import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink href="/components">Components</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}`,
};

const tabsExample: ComponentExample = {
  preview: (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-fg-muted">Overview panel content.</p>
      </TabsContent>
      <TabsContent value="activity">
        <p className="text-sm text-fg-muted">Recent activity appears here.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-fg-muted">Configuration options.</p>
      </TabsContent>
    </Tabs>
  ),
  code: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content.</TabsContent>
      <TabsContent value="activity">Activity content.</TabsContent>
      <TabsContent value="settings">Settings content.</TabsContent>
    </Tabs>
  );
}`,
};

const tooltipExample: ComponentExample = {
  preview: (
    <TooltipProvider>
      <Group gap="4">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
          <TooltipContent>Helpful hint about this action</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost">Or me</Button>} />
          <TooltipContent>Another tooltip</TooltipContent>
        </Tooltip>
      </Group>
    </TooltipProvider>
  ),
  code: `import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
        <TooltipContent>Helpful hint about this action</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}`,
};

const radioGroupExample: ComponentExample = {
  preview: (
    <RadioGroup defaultValue="medium" className="w-full max-w-sm">
      <div className="flex items-center gap-3">
        <RadioGroupItem id="ex-r-c" value="critical" />
        <Label htmlFor="ex-r-c">Critical</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="ex-r-h" value="high" />
        <Label htmlFor="ex-r-h">High</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="ex-r-m" value="medium" />
        <Label htmlFor="ex-r-m">Medium</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="ex-r-l" value="low" />
        <Label htmlFor="ex-r-l">Low</Label>
      </div>
    </RadioGroup>
  ),
  code: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function Example() {
  return (
    <RadioGroup defaultValue="medium">
      <div className="flex items-center gap-3">
        <RadioGroupItem id="critical" value="critical" />
        <Label htmlFor="critical">Critical</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="high" value="high" />
        <Label htmlFor="high">High</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="medium" value="medium" />
        <Label htmlFor="medium">Medium</Label>
      </div>
    </RadioGroup>
  );
}`,
};

const sliderExample: ComponentExample = {
  preview: (
    <div className="w-full max-w-sm">
      <Slider defaultValue={40} min={0} max={100} step={1} />
    </div>
  ),
  code: `import { Slider } from "@/components/ui/slider";

export function Example() {
  return <Slider defaultValue={40} min={0} max={100} step={1} />;
}`,
};

const headingExample: ComponentExample = {
  preview: (
    <div className="space-y-2">
      <Heading size="4xl">Display heading</Heading>
      <Heading size="2xl">Section heading</Heading>
      <Heading size="lg" as="h3">
        Subsection
      </Heading>
    </div>
  ),
  code: `import { Heading } from "@/components/ui/heading";

export function Example() {
  return (
    <div className="space-y-2">
      <Heading size="4xl">Display heading</Heading>
      <Heading size="2xl">Section heading</Heading>
      <Heading size="lg" as="h3">Subsection</Heading>
    </div>
  );
}`,
};

const textExample: ComponentExample = {
  preview: (
    <div className="space-y-2">
      <Text>Default body text at base size.</Text>
      <Text variant="muted" size="sm">
        Muted small text for secondary info.
      </Text>
      <Text weight="semibold">Semibold emphasis.</Text>
    </div>
  ),
  code: `import { Text } from "@/components/ui/text";

export function Example() {
  return (
    <div className="space-y-2">
      <Text>Default body text at base size.</Text>
      <Text variant="muted" size="sm">Muted small text for secondary info.</Text>
      <Text weight="semibold">Semibold emphasis.</Text>
    </div>
  );
}`,
};

const proseExample: ComponentExample = {
  preview: (
    <Prose className="max-w-prose">
      <h2>Getting started</h2>
      <p>
        PRIZM provides a set of accessible, themeable components for building C3 and enterprise
        interfaces.
      </p>
      <ul>
        <li>Copy components into your project</li>
        <li>
          Apply design tokens via <code>data-zone</code> and <code>data-mode</code>
        </li>
        <li>Customise as needed</li>
      </ul>
    </Prose>
  ),
  code: `import { Prose } from "@/components/ui/prose";

export function Example() {
  return (
    <Prose>
      <h2>Getting started</h2>
      <p>PRIZM provides a set of accessible, themeable components.</p>
      <ul>
        <li>Copy components into your project</li>
        <li>Apply design tokens via data-zone and data-mode</li>
      </ul>
    </Prose>
  );
}`,
};

const kbdExample: ComponentExample = {
  preview: (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <span>Save</span>
      <Kbd>⌘</Kbd>
      <Kbd>S</Kbd>
    </div>
  ),
  code: `import { Kbd } from "@/components/ui/kbd";

export function Example() {
  return (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <span>Save</span>
      <Kbd>⌘</Kbd>
      <Kbd>S</Kbd>
    </div>
  );
}`,
};

const frameExample: ComponentExample = {
  preview: (
    <Frame maxWidth="sm" padding="md" className="bg-bg-muted rounded-md">
      <p className="text-sm text-fg-muted text-center">
        Constrained frame with max-width and padding
      </p>
    </Frame>
  ),
  code: `import { Frame } from "@/components/ui/frame";

export function Example() {
  return (
    <Frame maxWidth="sm" padding="md">
      <p>Content constrained to sm max-width with md padding.</p>
    </Frame>
  );
}`,
};

const emptyStateExample: ComponentExample = {
  preview: (
    <EmptyState
      icon={<InboxIcon className="h-6 w-6" />}
      title="No messages"
      description="When you receive messages they will appear here."
      action={<Button size="sm">Compose</Button>}
    />
  ),
  code: `import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function Example() {
  return (
    <EmptyState
      icon={<Inbox className="h-6 w-6" />}
      title="No messages"
      description="When you receive messages they will appear here."
      action={<Button size="sm">Compose</Button>}
    />
  );
}`,
};

const popoverExample: ComponentExample = {
  preview: (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Settings</PopoverTitle>
          <PopoverDescription>Manage your notification preferences.</PopoverDescription>
        </PopoverHeader>
        <p className="text-sm text-fg-muted">Popover body content goes here.</p>
      </PopoverContent>
    </Popover>
  ),
  code: `import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverDescription,
  PopoverHeader, PopoverTitle, PopoverTrigger,
} from "@/components/ui/popover";

export function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Settings</PopoverTitle>
          <PopoverDescription>Manage your notification preferences.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}`,
};

const menuExample: ComponentExample = {
  preview: (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Open menu</Button>} />
      <MenuContent>
        <MenuLabel>Actions</MenuLabel>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
  code: `import { Button } from "@/components/ui/button";
import {
  Menu, MenuContent, MenuItem, MenuLabel,
  MenuSeparator, MenuTrigger,
} from "@/components/ui/menu";

export function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Open menu</Button>} />
      <MenuContent>
        <MenuLabel>Actions</MenuLabel>
        <MenuItem onClick={() => console.log("edit")}>Edit</MenuItem>
        <MenuItem onClick={() => console.log("dup")}>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={() => console.log("delete")}>Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}`,
};

const contextMenuExample: ComponentExample = {
  preview: (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-20 w-full max-w-xs items-center justify-center rounded-md border border-dashed border-border text-sm text-fg-muted">
          Right-click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  code: `import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-20 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-fg-muted">
          Right-click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}`,
};

const hoverCardExample: ComponentExample = {
  preview: (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link">@alvin</Button>} />
      <HoverCardContent>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-fg">Alvin Loh</p>
          <p className="text-xs text-fg-muted">Product designer at DSTA. Building PRIZM 4.0.</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  code: `import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link">@alvin</Button>} />
      <HoverCardContent>
        <p className="text-sm font-semibold text-fg">Alvin Loh</p>
        <p className="text-xs text-fg-muted">Product designer at DSTA.</p>
      </HoverCardContent>
    </HoverCard>
  );
}`,
};

const sheetExample: ComponentExample = {
  preview: (
    <div className="flex flex-wrap items-center gap-3">
      <Sheet>
        <SheetTrigger render={<Button variant="outline">Open from left</Button>} />
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Often used as a mobile nav drawer.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <nav className="flex flex-col gap-1 text-sm">
              <a href="#" className="rounded px-2 py-1.5 text-fg hover:bg-bg-muted">
                Dashboard
              </a>
              <a href="#" className="rounded px-2 py-1.5 text-fg hover:bg-bg-muted">
                Reports
              </a>
              <a href="#" className="rounded px-2 py-1.5 text-fg hover:bg-bg-muted">
                Settings
              </a>
            </nav>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={<Button variant="outline">Open from right</Button>} />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Update your details and save.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="text-sm text-fg-muted">Form fields would live here.</p>
          </SheetBody>
          <SheetFooter>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={<Button variant="outline">Open from bottom</Button>} />
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Share post</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className="text-sm text-fg-muted">Mobile action-sheet pattern.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  ),
  code: `import { Button } from "@/components/ui/button";
import {
  Sheet, SheetBody, SheetContent, SheetDescription,
  SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

export function Example() {
  return (
    <div className="flex gap-3">
      {/* Left — navigation drawer */}
      <Sheet>
        <SheetTrigger render={<Button variant="outline">Open from left</Button>} />
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <nav>{/* links */}</nav>
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Right — form / settings panel */}
      <Sheet>
        <SheetTrigger render={<Button variant="outline">Open from right</Button>} />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Update your details and save.</SheetDescription>
          </SheetHeader>
          <SheetBody>{/* form fields */}</SheetBody>
          <SheetFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}`,
};

const comboboxExample: ComponentExample = {
  preview: <ComboboxDemo />,
  code: `import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput,
  ComboboxItem, ComboboxList,
} from "@/components/ui/combobox";

const items = [
  "C3 product",
  "Enterprise product",
  "Mobile app",
  "Internal tool",
  "Marketing site",
];

export function Example() {
  return (
    <Combobox items={items}>
      <ComboboxInput placeholder="Search products…" className="w-56" />
      <ComboboxContent>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No results.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}`,
};

const paginationExample: ComponentExample = {
  preview: <PaginationDemo />,
  code: `import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";

export function Example() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
        <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationNext href="#" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}`,
};

const tableExample: ComponentExample = {
  preview: (
    <Table>
      <TableCaption>System components</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Component</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Button</TableCell>
          <TableCell>Actions</TableCell>
          <TableCell>Stable</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Dialog</TableCell>
          <TableCell>Overlay</TableCell>
          <TableCell>Stable</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  code: `import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export function Example() {
  return (
    <Table>
      <TableCaption>System components</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Component</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Button</TableCell>
          <TableCell>Actions</TableCell>
          <TableCell>Stable</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}`,
};

const calendarExample: ComponentExample = {
  preview: <Calendar />,
  code: `import { Calendar } from "@/components/ui/calendar";

export function Example() {
  return <Calendar />;
}`,
};

const codeExample: ComponentExample = {
  preview: (
    <div className="space-y-4">
      <p className="text-sm text-fg">
        Use the <Code>cn()</Code> utility to merge class names.
      </p>
      <CodeBlock>{`import { cn } from "@/lib/utils";

const classes = cn("base-class", condition && "conditional-class");`}</CodeBlock>
    </div>
  ),
  code: `import { Code, CodeBlock } from "@/components/ui/code";

export function Example() {
  return (
    <>
      <p>Use the <Code>cn()</Code> utility to merge class names.</p>
      <CodeBlock>{\`import { cn } from "@/lib/utils";\`}</CodeBlock>
    </>
  );
}`,
};

const navigationMenuExample: ComponentExample = {
  preview: (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent className="p-3 w-48">
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="block rounded px-2 py-1 text-fg hover:bg-bg-muted">
                  C3 Suite
                </a>
              </li>
              <li>
                <a href="#" className="block rounded px-2 py-1 text-fg hover:bg-bg-muted">
                  Enterprise Portal
                </a>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent className="p-3 w-48">
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="block rounded px-2 py-1 text-fg hover:bg-bg-muted">
                  Getting started
                </a>
              </li>
              <li>
                <a href="#" className="block rounded px-2 py-1 text-fg hover:bg-bg-muted">
                  Components
                </a>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  code: `import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent className="p-3 w-48">
            <ul className="space-y-1 text-sm">
              <li><Link href="/c3" className="block rounded px-2 py-1 hover:bg-bg-muted">C3 Suite</Link></li>
              <li><Link href="/enterprise" className="block rounded px-2 py-1 hover:bg-bg-muted">Enterprise Portal</Link></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}`,
};

const commandExample: ComponentExample = {
  preview: <CommandDemo />,
  code: `import { BookOpen, Calendar, Check, FileText, LayoutDashboard, Settings } from "lucide-react";
import { useState } from "react";
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";

export function Example() {
  // Items are selectable: picking one marks it until another is chosen.
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Command className="rounded-lg border border-border shadow-md">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList className="p-1">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            keywords={["home", "overview"]}
            onSelect={() => setSelected("dashboard")}
            className="gap-3 py-2"
          >
            <LayoutDashboard className="h-4 w-4 text-fg-subtle" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Dashboard</span>
              <span className="text-xs text-fg-muted">View today's activity</span>
            </div>
            {selected === "dashboard" && <Check className="ml-auto h-4 w-4 text-accent" />}
          </CommandItem>
          {/* …more items… */}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Documentation">
          <CommandItem
            keywords={["docs", "install"]}
            onSelect={() => setSelected("getting-started")}
            className="gap-3 py-2"
          >
            <BookOpen className="h-4 w-4 text-fg-subtle" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Getting started</span>
              <span className="text-xs text-fg-muted">Install PRIZM and ship your first component</span>
            </div>
            {selected === "getting-started" && <Check className="ml-auto h-4 w-4 text-accent" />}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}`,
};

const promptInputExample: ComponentExample = {
  preview: <PromptInputDemo />,
  code: `import {
  PromptInput, PromptInputActions, PromptInputAttachButton,
  PromptInputAttachment, PromptInputAttachments, PromptInputCount,
  PromptInputSubmit, PromptInputTextarea,
} from "@/components/ui/prompt-input";

export function Composer({ files, onAttach, onRemove, onSend, generating, onStop }) {
  return (
    <PromptInput
      onSubmit={onSend}
      status={generating ? "generating" : "idle"}
      onStop={onStop}
      maxLength={4000}
    >
      <PromptInputAttachments>
        {files.map((f) => (
          <PromptInputAttachment
            key={f.id}
            name={f.name}
            meta={f.size}
            status={f.ready ? "ready" : "reading"}
            onRemove={() => onRemove(f.id)}
          />
        ))}
      </PromptInputAttachments>
      <PromptInputTextarea
        aria-label="Prompt"
        placeholder={files.length ? "Ask about these files" : "Ask anything"}
      />
      <PromptInputActions>
        <PromptInputAttachButton accept=".pdf,application/pdf" onFilesSelected={onAttach} />
        <PromptInputCount />
        <PromptInputSubmit />
      </PromptInputActions>
    </PromptInput>
  );
}`,
};

export const EXAMPLES: Record<string, ComponentExample> = {
  button: buttonExample,
  input: inputExample,
  card: cardExample,
  badge: badgeExample,
  dialog: dialogExample,
  label: labelExample,
  field: fieldExample,
  textarea: textareaExample,
  "prompt-input": promptInputExample,
  checkbox: checkboxExample,
  switch: switchExample,
  select: selectExample,
  separator: separatorExample,
  stack: stackExample,
  group: groupExample,
  alert: alertExample,
  spinner: spinnerExample,
  skeleton: skeletonExample,
  avatar: avatarExample,
  progress: progressExample,
  link: linkExample,
  breadcrumb: breadcrumbExample,
  tabs: tabsExample,
  tooltip: tooltipExample,
  "radio-group": radioGroupExample,
  slider: sliderExample,
  heading: headingExample,
  text: textExample,
  prose: proseExample,
  kbd: kbdExample,
  frame: frameExample,
  "empty-state": emptyStateExample,
  popover: popoverExample,
  menu: menuExample,
  "context-menu": contextMenuExample,
  "hover-card": hoverCardExample,
  sheet: sheetExample,
  combobox: comboboxExample,
  pagination: paginationExample,
  table: tableExample,
  calendar: calendarExample,
  code: codeExample,
  "navigation-menu": navigationMenuExample,
  command: commandExample,
  toast: toastExample,
};
