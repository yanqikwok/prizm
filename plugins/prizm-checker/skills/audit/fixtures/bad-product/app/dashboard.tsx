import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu } from "@headlessui/react";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="text-2xl font-bold text-slate-100">Operations</h1>

      {/* hand-rolled button */}
      <div role="button" onClick={() => save()} className="cursor-pointer rounded-[7px] bg-blue-600 px-4 py-2 text-white">
        Save changes
      </div>

      {/* raw form controls */}
      <label className="text-gray-400">Callsign</label>
      <input type="text" className="rounded border border-gray-600 bg-slate-800 px-3 py-2" />
      <input type="checkbox" className="accent-blue-500" />
      <select className="bg-slate-800 text-gray-200"><option>All</option></select>
      <textarea rows={3} className="bg-slate-800" />

      {/* illegal variant + overrides that fight the component */}
      <Button variant="hero" size="xl">Launch</Button>
      <Button variant="solid" className="bg-emerald-500 rounded-full h-14">Confirm</Button>
      <Button size="icon"><TrashIcon /></Button>

      <table className="w-full text-sm"><tbody><tr><td>PLT-01</td></tr></tbody></table>

      <Card style={{ backgroundColor: "#1e293b", boxShadow: "0 3px 9px rgba(0,0,0,0.4)" }}>
        <span style={{ color: "#38bdf8" }}>Telemetry</span>
      </Card>
    </div>
  );
}
