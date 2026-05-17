"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";

interface ActivityToggleProps {
  defaultActivities?: string[];
}

const ACTIVITIES = [
  { key: "gimnasio", label: "Gimnasio", active: "border-blue-500 bg-blue-500/20 text-blue-300" },
  { key: "muay_thai", label: "Muay Thai", active: "border-red-500 bg-red-500/20 text-red-300" },
  { key: "zumba", label: "Zumba", active: "border-purple-500 bg-purple-500/20 text-purple-300" },
  { key: "funcional", label: "Funcional", active: "border-green-500 bg-green-500/20 text-green-300" },
];

export function ActivityToggle({ defaultActivities = ["gimnasio"] }: ActivityToggleProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultActivities));

  function toggle(activity: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(activity)) {
        if (next.size > 1) next.delete(activity);
      } else {
        next.add(activity);
      }
      return next;
    });
  }

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label className="text-zinc-300">Actividad *</Label>
      {Array.from(selected).map((act) => (
        <input key={act} type="hidden" name="activities" value={act} />
      ))}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {ACTIVITIES.map(({ key, label, active }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all border ${
              selected.has(key)
                ? active
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-600">Podés seleccionar una o más actividades.</p>
    </div>
  );
}
