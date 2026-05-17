"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyGestionData } from "@/lib/types";

interface Props {
  monthlyData: MonthlyGestionData[];
  avgLabel: string;
}

export function MiniGananciaNeta({ monthlyData, avgLabel }: Props) {
  const lastVal = monthlyData[monthlyData.length - 1]?.netProfit ?? 0;
  const isPositive = lastVal >= 0;
  const strokeColor = isPositive ? "#EAB308" : "#F87171";
  const areaColor = isPositive ? "#EAB308" : "#F87171";

  const visibleData = monthlyData.map((d, i) => ({
    ...d,
    _i: i,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          Últimos 12 meses
        </p>
        <p className="text-[11px] text-zinc-500">
          prom · <span className="font-mono text-zinc-400">{avgLabel}</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart
          data={visibleData}
          margin={{ top: 8, right: 4, bottom: 18, left: 4 }}
        >
          <defs>
            <linearGradient id="miniProfitArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={(props) => {
              const { x, y, index, payload } = props as {
                x: number;
                y: number;
                index: number;
                payload: { value: string };
              };
              if (index !== 0 && index !== visibleData.length - 1) return <g key={`tick-${index}`} />;
              return (
                <text
                  key={`tick-${index}`}
                  x={x}
                  y={y + 12}
                  textAnchor="middle"
                  fill="#52525b"
                  fontSize={9}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="netProfit"
            fill="url(#miniProfitArea)"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
