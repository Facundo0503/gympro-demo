"use client";

import { useState, useTransition } from "react";
import type { ProductSale } from "@/lib/types";
import { deleteSale } from "@/app/dashboard/gastos/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Box, Trash2, Banknote, ArrowLeftRight } from "lucide-react";
import { CategoryBadge } from "./category-badge";
import { DeleteConfirm } from "./dialogs/delete-confirm";
import { fmtARS, fmtDate, fmtRelative } from "@/lib/gastos/format";

type MethodFilter = "all" | "efectivo" | "transferencia";

function SaleRow({ sale }: { sale: ProductSale }) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSale(sale.id);
      if (result.error) toast.error(result.error);
      else toast.success("Venta eliminada");
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <tr className="hover:bg-zinc-800/40 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 shrink-0">
              <Box className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-200 truncate">
                {sale.product?.name ?? "—"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {sale.product?.category && (
                  <CategoryBadge category={sale.product.category} type="product" />
                )}
                {sale.notes && (
                  <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">
                    {sale.notes}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-mono text-sm tabular-nums text-zinc-300">
            {sale.quantity}
          </span>
          <span className="text-xs text-zinc-500 ml-1">
            {sale.product?.unit ?? ""}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-mono text-sm tabular-nums text-zinc-400">
            {fmtARS(sale.unit_price)}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-mono text-sm font-semibold tabular-nums text-yellow-400">
            {fmtARS(sale.total_amount)}
          </span>
        </td>
        <td className="px-4 py-3">
          {sale.payment_method === "efectivo" ? (
            <div className="flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-zinc-400">Efectivo</span>
            </div>
          ) : sale.payment_method === "transferencia" ? (
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-zinc-400">Transfer.</span>
            </div>
          ) : (
            <span className="text-xs text-zinc-600">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <p className="text-xs text-zinc-400 tabular-nums">{fmtDate(sale.sold_at)}</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">{fmtRelative(sale.sold_at)}</p>
        </td>
        <td className="px-4 py-3 text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-zinc-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </td>
      </tr>
      <DeleteConfirm
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar venta"
        description={`Se va a eliminar esta venta y revertir el stock (+${sale.quantity} ${sale.product?.unit ?? "uds."}).`}
        onConfirm={handleDelete}
      />
    </>
  );
}

interface Props {
  sales: ProductSale[];
}

export function VentasTab({ sales }: Props) {
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");

  const today = new Date().toDateString();
  const salesToday = sales.filter(
    (s) => new Date(s.sold_at).toDateString() === today
  );

  const filtered =
    methodFilter === "all"
      ? sales
      : sales.filter((s) => s.payment_method === methodFilter);

  const totalFiltered = filtered.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              Ventas hoy
            </p>
            <p className="font-mono text-lg font-semibold text-yellow-400 tabular-nums">
              {fmtARS(salesToday.reduce((s, v) => s + v.total_amount, 0), { compact: true })}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              Mostrando
            </p>
            <p className="font-mono text-lg font-semibold text-zinc-300 tabular-nums">
              {filtered.length}{" "}
              <span className="text-sm text-zinc-500">
                · {fmtARS(totalFiltered, { compact: true })}
              </span>
            </p>
          </div>
        </div>

        <div className="flex rounded-md border border-zinc-700 overflow-hidden ml-auto">
          {(
            [
              { id: "all", label: "Todos" },
              {
                id: "efectivo",
                label: "Efectivo",
                icon: <Banknote className="h-3 w-3 text-green-400" />,
              },
              {
                id: "transferencia",
                label: "Transfer.",
                icon: <ArrowLeftRight className="h-3 w-3 text-blue-400" />,
              },
            ] as { id: MethodFilter; label: string; icon?: React.ReactNode }[]
          ).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setMethodFilter(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                methodFilter === id
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-400 font-medium">Sin ventas</p>
          <p className="text-sm text-zinc-500 mt-1">
            {sales.length === 0
              ? "Las ventas aparecen aquí al registrarlas desde Inventario."
              : "No hay ventas con ese filtro."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-zinc-900/80 border-b border-zinc-800">
                <tr>
                  {["Producto", "Cant.", "P. Unit.", "Total", "Método", "Fecha", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium text-zinc-500 last:text-right"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-zinc-950 divide-y divide-zinc-800/60">
                {filtered.map((sale) => (
                  <SaleRow key={sale.id} sale={sale} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
