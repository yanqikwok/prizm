import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export function FleetPage() {
  return (
    <div className="bg-bg text-fg min-h-screen p-6">
      <Card className="p-4">
        <h2 className="text-fg text-lg font-medium">Fleet status</h2>
        <p className="text-fg-muted text-sm">Nine platforms reporting.</p>
        <Badge variant="success">Nominal</Badge>
        <Badge variant="warning">Degraded</Badge>
        <div className="border-border mt-4 border-t pt-4">
          <Label htmlFor="callsign">Callsign</Label>
          <Input id="callsign" placeholder="Search platforms" />
        </div>
        <div className="mt-4 flex gap-2">
          <Button>Acknowledge</Button>
          <Button variant="outline">Dismiss</Button>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      <div className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <span className="text-fg-subtle">Last sync 12:04</span>
      </div>
    </div>
  );
}
