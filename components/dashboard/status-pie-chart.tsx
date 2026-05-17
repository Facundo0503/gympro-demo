"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardKPIs } from "@/app/dashboard/dashboard-actions";

interface StatusPieChartProps {
  kpis: DashboardKPIs;
}

export function StatusPieChart({ kpis }: StatusPieChartProps) {
  const data = [
    { name: "Activos", value: kpis.activeMembers, color: "#EAB308" },
    { name: "Vencidos", value: kpis.overdueMembers, color: "#EF4444" },
    { name: "Inactivos", value: kpis.inactiveMembers, color: "#52525b" },
  ].filter((d) => d.value > 0);

  const isEmpty = data.length === 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Estado de membresías
        </h2>
      </div>
      <div className="p-4">
        {isEmpty ? (
          <div className="flex h-52 items-center justify-center text-sm text-zinc-500">
            Sin datos aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  color: "#fff",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: "#a1a1aa", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
