"use client";

import { useState, useTransition } from "react";
import { Activity, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePayment } from "@/app/dashboard/clientes/actions";
import type { RecentPayment } from "@/app/dashboard/dashboard-actions";

interface RecentActivityProps {
  recentPayments: RecentPayment[];
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function PaymentRow({ payment }: { payment: RecentPayment }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePayment(payment.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pago eliminado y monto descontado.");
      }
      setConfirming(false);
    });
  }

  return (
    <li className="flex items-center gap-3 px-5 py-3.5 group hover:bg-white/[0.02] transition-colors">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 ring-1 ring-white/5">
        {getInitials(payment.member_first_name, payment.member_last_name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-100">
          {payment.member_first_name} {payment.member_last_name}
        </p>
        <p className="text-xs text-zinc-500">
          {new Date(payment.paid_at).toLocaleString("es-AR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold text-emerald-400">
        +${payment.amount.toLocaleString("es-AR")}
      </span>
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirming ? (
          <>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {isPending ? "..." : "Confirmar"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded px-2 py-0.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              No
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Eliminar pago"
            className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

export function RecentActivity({ recentPayments }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10">
          <Activity className="h-3.5 w-3.5 text-yellow-500" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-100">Actividad reciente</h2>
        <span className="ml-auto text-xs text-zinc-600">Últimos 5 pagos</span>
      </div>

      {recentPayments.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-zinc-600">
          Sin pagos registrados aún.
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.03]">
          {recentPayments.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
