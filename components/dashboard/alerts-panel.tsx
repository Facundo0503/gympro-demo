import Link from "next/link";
import { Bell } from "lucide-react";
import { StatusBadge } from "@/components/clientes/status-badge";
import { ActivityBadges } from "@/components/clientes/activity-badges";
import { Separator } from "@/components/ui/separator";
import type { AlertMember } from "@/app/dashboard/dashboard-actions";

interface AlertsPanelProps {
  alerts: AlertMember[];
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  // Vencidos primero, luego próximos a vencer
  const sorted = [...alerts].sort((a, b) => {
    if (a.status === "vencido" && b.status !== "vencido") return -1;
    if (a.status !== "vencido" && b.status === "vencido") return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <Bell className="h-4 w-4 text-yellow-500" />
        <h2 className="text-sm font-semibold text-zinc-100">Alertas</h2>
        {sorted.length > 0 && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs font-semibold text-red-400">
            {sorted.length}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-zinc-500">
          Sin alertas pendientes. ¡Todo al día! 🎉
        </div>
      ) : (
        <ul>
          {sorted.map((member, idx) => (
            <li key={member.id}>
              <Link
                href={`/dashboard/clientes/${member.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-800/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                  {getInitials(member.first_name, member.last_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {member.first_name} {member.last_name}
                    </p>
                    <ActivityBadges activities={member.activities ?? []} />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Vence:{" "}
                    {new Date(member.due_date).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <StatusBadge status={member.status} />
              </Link>
              {idx < sorted.length - 1 && (
                <Separator className="bg-zinc-800/60" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
