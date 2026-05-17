import { StatusBadge } from "@/components/clientes/status-badge";
import { ActivityBadges } from "@/components/clientes/activity-badges";
import type { Member, MemberStatus } from "@/lib/types";

interface MemberKanbanCardProps {
  member: Member;
  onClick: () => void;
}

function getDaysInfo(dueDateStr: string, status: MemberStatus): { label: string; className: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Parsear como fecha local para evitar desfase de timezone (YYYY-MM-DD es UTC midnight)
  const [y, mo, d] = dueDateStr.split("-").map(Number);
  const due = new Date(y, mo - 1, d);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (status === "inactivo") {
    // El trigger marca inactivo cuando due_date < hoy - 30 días
    // Días de inactividad = días desde que se cumplieron 30 días post-vencimiento
    const daysInactive = Math.max(0, Math.abs(diffDays) - 30);
    return {
      label: `Inactivo hace ${daysInactive} día${daysInactive !== 1 ? "s" : ""}`,
      className: "text-zinc-500",
    };
  }

  if (diffDays >= 0) {
    return {
      label: `Vence en ${diffDays} día${diffDays !== 1 ? "s" : ""}`,
      className: diffDays <= 5 ? "text-amber-400" : "text-zinc-400",
    };
  }

  const overdue = Math.abs(diffDays);
  return {
    label: `Vencido hace ${overdue} día${overdue !== 1 ? "s" : ""}`,
    className: "text-red-400",
  };
}

export function MemberKanbanCard({ member, onClick }: MemberKanbanCardProps) {
  const daysInfo = getDaysInfo(member.due_date, member.status);
  const initials = `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className="animate-in fade-in-0 slide-in-from-top-1 duration-200 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 p-3 transition-colors hover:border-zinc-500"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">
            {member.first_name} {member.last_name}
          </p>
          {member.member_number != null && (
            <p className="text-[10px] text-zinc-500">#{member.member_number}</p>
          )}
          <ActivityBadges activities={member.activities ?? []} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={member.status} inactiveSince={member.inactive_since} />
      </div>
      <div className="mt-2 space-y-0.5">
        <p className={`text-xs ${daysInfo.className}`}>{daysInfo.label}</p>
        <p className="text-xs text-zinc-500">
          ${member.monthly_fee.toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
}
