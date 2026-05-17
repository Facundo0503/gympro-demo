import { TrendingUp, TrendingDown } from "lucide-react";
import type { GestionStats } from "@/lib/types";
import { fmtARS } from "@/lib/gastos/format";
import { MiniGananciaNeta } from "./charts/mini-ganancia-neta";

interface Props {
  stats: GestionStats;
}

export function HeroKpi({ stats }: Props) {
  const {
    thisMonthNetProfit,
    thisMonthMembershipRevenue,
    thisMonthProductRevenue,
    thisMonthOtherIncome,
    thisMonthExpenses,
    monthlyData,
  } = stats;

  const isPositive = thisMonthNetProfit >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-yellow-400" : "text-red-400";
  const glowColor = isPositive
    ? "rgba(234,179,8,0.10)"
    : "rgba(248,113,113,0.10)";

  const totalRevenue =
    thisMonthMembershipRevenue + thisMonthProductRevenue + thisMonthOtherIncome;
  const margin =
    totalRevenue > 0
      ? ((thisMonthNetProfit / totalRevenue) * 100).toFixed(1)
      : "0.0";
  const expensesRatio =
    totalRevenue > 0
      ? Math.round((thisMonthExpenses / totalRevenue) * 100)
      : 0;

  const prev = monthlyData[monthlyData.length - 2]?.netProfit ?? 0;
  const curr = monthlyData[monthlyData.length - 1]?.netProfit ?? 0;
  const delta =
    prev !== 0 ? (((curr - prev) / Math.abs(prev)) * 100).toFixed(1) : null;
  const deltaPositive = parseFloat(delta ?? "0") >= 0;

  const prevMonthLabel =
    monthlyData[monthlyData.length - 2]?.month ?? "mes ant.";

  const avg =
    monthlyData.length > 0
      ? monthlyData.reduce((s, d) => s + d.netProfit, 0) / monthlyData.length
      : 0;

  const now = new Date();
  const monthYear = now
    .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(60% 100% at 100% 0%, ${glowColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr,360px] lg:gap-8">
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
              <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Ganancia neta · {monthYear}
              </span>
            </div>
            {delta !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  deltaPositive
                    ? "bg-green-500/10 text-green-300 ring-green-500/30"
                    : "bg-red-500/10 text-red-300 ring-red-500/30"
                }`}
              >
                {deltaPositive ? "+" : ""}
                {delta}% vs {prevMonthLabel}
              </span>
            )}
          </div>

          <p
            className={`mt-3 font-mono font-medium tabular-nums leading-none tracking-[-0.04em] text-[44px] sm:text-[56px] lg:text-[64px] ${trendColor}`}
          >
            {fmtARS(thisMonthNetProfit)}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-px rounded-lg border border-zinc-800/80 overflow-hidden">
            {[
              {
                label: `vs ${prevMonthLabel}`,
                value: fmtARS(curr - prev, { compact: true }),
                positive: curr - prev >= 0,
              },
              {
                label: "Margen",
                value: `${margin}%`,
                positive: parseFloat(margin) >= 0,
              },
              {
                label: "Gastos / Ing.",
                value: `${expensesRatio}%`,
                positive: expensesRatio < 80,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-zinc-900/60 px-3 py-2.5 text-center"
              >
                <p className="text-[10px] text-zinc-500 mb-0.5">{item.label}</p>
                <p
                  className={`font-mono text-sm font-medium tabular-nums ${
                    item.positive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <MiniGananciaNeta
            monthlyData={monthlyData}
            avgLabel={fmtARS(avg, { compact: true })}
          />
        </div>
      </div>
    </div>
  );
}
