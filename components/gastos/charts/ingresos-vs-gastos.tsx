"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyGestionData } from "@/lib/types";
import { fmtARS } from "@/lib/gastos/format";

interface ChartData {
  month: string;
  income: number;
  expenses: number;
}

interface TooltipRenderProps {
  active?: boolean;
  payload?: Array<{ value?: number | string; dataKey?: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipRenderProps) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
  const expenses = payload.find((p) => p.dataKey === "expenses")?.value ?? 0;
  const net = Number(income) - Number(expenses);
  return (
    <div
      style={{
        backdropFilter: "blur(10px)",
        background: "rgba(10,10,10,0.78)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        minWidth: 160,
      }}
    >
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
          <span className="text-xs text-zinc-400 flex-1">Ingresos</span>
          <span className="text-xs font-mono text-zinc-100">{fmtARS(Number(income))}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
          <span className="text-xs text-zinc-400 flex-1">Gastos</span>
          <span className="text-xs font-mono text-zinc-100">{fmtARS(Number(expenses))}</span>
        </div>
        <div
          className="flex items-center gap-2 pt-1 mt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-xs text-zinc-400 flex-1">Neto</span>
          <span
            className={`text-xs font-mono font-medium ${
              net >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmtARS(net)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  monthlyData: MonthlyGestionData[];
}

export function IngresosVsGastos({ monthlyData }: Props) {
  const data: ChartData[] = monthlyData.map((d) => ({
    month: d.month,
    income: d.membershipRevenue + d.productRevenue,
    expenses: d.expenses,
  }));

  const isEmpty = data.every((d) => d.income === 0 && d.expenses === 0);

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-500">Sin datos aún</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        barSize={6}
        barGap={2}
        barCategoryGap="22%"
      >
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FACC15" stopOpacity={1} />
            <stop offset="100%" stopColor="#EAB308" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F87171" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 10 }}
        />
        <YAxis hide />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "transparent", stroke: "#3f3f46", strokeDasharray: "2 3" }}
        />
        <Bar dataKey="income" fill="url(#incomeGrad)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="expenses" fill="url(#expenseGrad)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
