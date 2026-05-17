"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyGestionData } from "@/lib/types";
import { fmtARS } from "@/lib/gastos/format";

interface TooltipRenderProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipRenderProps) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div
      style={{
        backdropFilter: "blur(10px)",
        background: "rgba(10,10,10,0.78)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
      <p className={`text-sm font-mono font-medium ${value >= 0 ? "text-green-400" : "text-red-400"}`}>
        {value >= 0 ? "+" : ""}{fmtARS(value)}
      </p>
    </div>
  );
}

interface DotProps {
  cx?: number;
  cy?: number;
  value?: number;
  index?: number;
}

function renderDot(props: DotProps) {
  const { cx, cy, value } = props;
  if (cx === undefined || cy === undefined) return <g key="empty" />;
  const fill = (value ?? 0) >= 0 ? "#4ADE80" : "#F87171";
  return (
    <circle
      key={`dot-${cx}-${cy}`}
      cx={cx}
      cy={cy}
      r={2.5}
      fill={fill}
      stroke="#0a0a0a"
      strokeWidth={1.5}
    />
  );
}

function renderActiveDot(props: DotProps) {
  const { cx, cy, value } = props;
  if (cx === undefined || cy === undefined) return <g key="empty-active" />;
  const fill = (value ?? 0) >= 0 ? "#4ADE80" : "#F87171";
  return (
    <circle
      key={`adot-${cx}-${cy}`}
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="#0a0a0a"
      strokeWidth={1.5}
    />
  );
}

interface Props {
  monthlyData: MonthlyGestionData[];
  height?: number;
}

export function GananciaNeta({ monthlyData, height = 200 }: Props) {
  const isEmpty = monthlyData.every((d) => d.netProfit === 0);

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-zinc-500">Sin datos aún</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={monthlyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="profitStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.7} />
            <stop offset="50%" stopColor="#4ADE80" stopOpacity={1} />
            <stop offset="100%" stopColor="#86EFAC" stopOpacity={1} />
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
          cursor={{ stroke: "#3f3f46", strokeDasharray: "2 3" }}
        />
        <ReferenceLine y={0} stroke="#27272a" strokeWidth={1} />
        <Area
          type="monotone"
          dataKey="netProfit"
          fill="url(#profitArea)"
          stroke="url(#profitStroke)"
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="netProfit"
          stroke="transparent"
          dot={renderDot}
          activeDot={renderActiveDot}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
