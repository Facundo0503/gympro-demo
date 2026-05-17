import { DollarSign, Users, AlertTriangle, UserX } from "lucide-react";
import type { StatsData } from "@/app/dashboard/estadisticas/stats-actions";

interface StatsGridProps {
  stats: StatsData;
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  subtext: string;
}

function StatCard({ icon, iconBg, value, label, subtext }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{subtext}</p>
      </div>
    </div>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const {
    mrr,
    totalRevenue,
    activeMembers,
    totalMembers,
    retentionRate,
    overdueRate,
    overdueMembers,
    inactiveMembers,
  } = stats;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<DollarSign className="h-5 w-5 text-yellow-500" />}
        iconBg="bg-yellow-500/10"
        value={`$${mrr.toLocaleString("es-AR")}`}
        label="Ingresos del mes"
        subtext={`Total histórico: $${totalRevenue.toLocaleString("es-AR")}`}
      />
      <StatCard
        icon={<Users className="h-5 w-5 text-green-400" />}
        iconBg="bg-green-500/10"
        value={`${activeMembers} de ${totalMembers}`}
        label="Miembros activos"
        subtext={`${retentionRate.toFixed(1)}% retención`}
      />
      <StatCard
        icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
        iconBg="bg-red-500/10"
        value={`${overdueRate.toFixed(1)}%`}
        label="Tasa de morosidad"
        subtext={`${overdueMembers} miembros vencidos`}
      />
      <StatCard
        icon={<UserX className="h-5 w-5 text-zinc-400" />}
        iconBg="bg-zinc-700/50"
        value={`${inactiveMembers}`}
        label="Inactivos"
        subtext="Sin actividad +30 días"
      />
    </div>
  );
}
