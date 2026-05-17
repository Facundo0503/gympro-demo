import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "./charts/sparkline";

interface Props {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  sparkData: number[];
  sparkColor: string;
}

export function MiniKpiCard({
  label,
  value,
  delta,
  icon: Icon,
  sparkData,
  sparkColor,
}: Props) {
  const deltaPositive = (delta ?? 0) >= 0;
  const DeltaIcon = deltaPositive ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              {label}
            </span>
          </div>
          {delta !== undefined && (
            <div
              className={`flex items-center gap-0.5 text-[11px] font-medium ${
                deltaPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              <DeltaIcon className="h-3 w-3" />
              {deltaPositive ? "+" : ""}
              {delta.toFixed(1)}%
            </div>
          )}
        </div>
        <p className="mt-2 font-mono text-[20px] font-medium tracking-[-0.02em] text-zinc-100">
          {value}
        </p>
      </div>
      <div className="px-2 pb-2 h-10">
        <Sparkline data={sparkData} color={sparkColor} height={34} />
      </div>
    </div>
  );
}
