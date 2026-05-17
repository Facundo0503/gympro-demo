"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyRevenue } from "@/app/dashboard/estadisticas/stats-actions";

interface RevenueChartProps {
  data: MonthlyRevenue[];
  title: string;
  color?: string;
}

export function RevenueChart({ data, title, color = "#eab308" }: RevenueChartProps) {
  const isEmpty = data.every((d) => d.amount === 0);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="mb-4 text-sm font-semibold text-zinc-400">{title}</p>
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-sm text-zinc-500">Sin datos de pagos aún</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
              }
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#f4f4f5",
              }}
              formatter={(value) => [
                `$${Number(value ?? 0).toLocaleString("es-AR")}`,
                "Ingresos",
              ]}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
