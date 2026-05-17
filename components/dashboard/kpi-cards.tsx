import { DollarSign, Users, AlertTriangle, UserCheck, TrendingUp, Flame } from "lucide-react";
import type { DashboardKPIs } from "@/app/dashboard/dashboard-actions";

interface KpiCardsProps {
  kpis: DashboardKPIs;
}

interface CardConfig {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent: string;
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards: CardConfig[] = [
    {
      label: "Ingresos del mes",
      value: `$${kpis.monthlyRevenue.toLocaleString("es-AR")}`,
      icon: DollarSign,
      iconBg: "bg-yellow-500/15",
      iconColor: "text-yellow-500",
      accent: "from-yellow-500/20 to-transparent",
    },
    {
      label: "Proyectado (100%)",
      value: `$${kpis.projectedRevenue.toLocaleString("es-AR")}`,
      sub: "Si todos los activos pagan",
      icon: TrendingUp,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      accent: "from-emerald-500/15 to-transparent",
    },
    {
      label: "Miembros activos",
      value: String(kpis.activeMembers),
      sub: `${kpis.activePercentage}% del total`,
      icon: Users,
      iconBg: "bg-green-500/15",
      iconColor: "text-green-400",
      accent: "from-green-500/15 to-transparent",
    },
    {
      label: "Total Muay Thai",
      value: `$${kpis.muayThaiMonthlyRevenue.toLocaleString("es-AR")}`,
      sub: "Ingresos del mes · Muay Thai",
      icon: Flame,
      iconBg: "bg-red-500/15",
      iconColor: "text-red-400",
      accent: "from-red-500/15 to-transparent",
    },
    {
      label: "Con deuda",
      value: String(kpis.overdueMembers),
      sub: `${kpis.overduePercentage}% del total`,
      icon: AlertTriangle,
      iconBg: "bg-red-500/15",
      iconColor: "text-red-400",
      accent: "from-red-500/15 to-transparent",
    },
    {
      label: "Total miembros",
      value: String(kpis.totalMembers),
      icon: UserCheck,
      iconBg: "bg-zinc-700/50",
      iconColor: "text-zinc-400",
      accent: "from-zinc-700/30 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900 p-4 shadow-md shadow-black/20"
        >
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${card.accent}`} />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 leading-tight">
                {card.label}
              </p>
              <p className="mt-2 text-xl font-bold tracking-tight text-white break-all">
                {card.value}
              </p>
              {card.sub && (
                <p className="mt-0.5 text-[11px] text-zinc-600 leading-tight">{card.sub}</p>
              )}
            </div>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
            >
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
