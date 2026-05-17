import type { PaymentHistoryEntry } from "@/lib/types";

interface PaymentHistoryProps {
  payments: PaymentHistoryEntry[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-4">Sin historial de pagos.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {payments.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-green-400">
              ${p.amount.toLocaleString("es-AR")}
            </span>
            {p.notes && (
              <span className="text-xs text-zinc-500">{p.notes}</span>
            )}
          </div>
          <span className="text-xs text-zinc-400">
            {new Date(p.paid_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}
