import type { MemberStatus } from "@/lib/types";

const config: Record<MemberStatus, { className: string; label: string }> = {
  al_dia: {
    className: "bg-green-500/20 text-green-400 border border-green-500/30",
    label: "Al día",
  },
  proximo_vencer: {
    className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    label: "Próximo a vencer",
  },
  vencido: {
    className: "bg-red-500/20 text-red-400 border border-red-500/30",
    label: "Vencido",
  },
  inactivo: {
    className: "bg-zinc-700/50 text-zinc-400 border border-zinc-600",
    label: "Inactivo",
  },
};

function inactiveLabel(since: string): string {
  const days = Math.floor(
    (Date.now() - new Date(since).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days < 30) return `Inactivo hace ${days} día${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Inactivo hace ${months} mes${months !== 1 ? "es" : ""}`;
}

interface StatusBadgeProps {
  status: MemberStatus;
  inactiveSince?: string | null;
}

export function StatusBadge({ status, inactiveSince }: StatusBadgeProps) {
  const { className } = config[status];
  const label =
    status === "inactivo" && inactiveSince
      ? inactiveLabel(inactiveSince)
      : config[status].label;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
