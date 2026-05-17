"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";
import type { NewClientsPerMonth } from "@/app/dashboard/estadisticas/stats-actions";

interface NewClientsChartProps {
  data: NewClientsPerMonth[];
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-sm font-bold text-emerald-400">
        {payload[0].value} cliente{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function NewClientsChart({ data }: NewClientsChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const currentMonthCount = data[data.length - 1]?.count ?? 0;
  const isEmpty = total === 0;

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Clientes nuevos
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{currentMonthCount}</p>
          <p className="text-xs text-zinc-600">este mes · {total} en 12 meses</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
          <Users className="h-4 w-4 text-emerald-400" />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-zinc-600">Sin datos de nuevos clientes aún</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar
              dataKey="count"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              fillOpacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
