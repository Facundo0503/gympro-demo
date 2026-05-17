"use client";

import { useState, useTransition } from "react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { deleteExpense } from "@/app/dashboard/gastos/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { CategoryBadge } from "./category-badge";
import { DeleteConfirm } from "./dialogs/delete-confirm";
import { fmtARS, fmtDate, fmtRelative } from "@/lib/gastos/format";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_OPTIONS, INCOME_CATEGORY_OPTIONS } from "@/lib/gastos/constants";

const DOT_COLORS: Record<ExpenseCategory, string> = {
  alquiler: "bg-blue-400",
  servicios: "bg-purple-400",
  equipamiento: "bg-orange-400",
  sueldos: "bg-yellow-400",
  marketing: "bg-green-400",
  otro: "bg-zinc-400",
  clases: "bg-teal-400",
  ingresos_varios: "bg-emerald-400",
};

function ExpenseRow({ expense }: { expense: Expense }) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteExpense(expense.id);
      if (result.error) toast.error(result.error);
      else toast.success("Gasto eliminado");
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <tr className="hover:bg-zinc-800/40 transition-colors">
        <td className="px-4 py-3">
          <CategoryBadge category={expense.category} type="expense" />
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-zinc-200">{expense.description}</p>
          {expense.notes && (
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[220px]">
              {expense.notes}
            </p>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-mono text-sm font-medium tabular-nums text-red-400">
            -{fmtARS(expense.amount)}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs text-zinc-400 tabular-nums">
            {fmtDate(expense.expense_date)}
          </p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            {fmtRelative(expense.expense_date)}
          </p>
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
        title="Eliminar gasto"
        description={`¿Confirmar eliminación de "${expense.description}" por ${fmtARS(expense.amount)}?`}
        onConfirm={handleDelete}
      />
    </>
  );
}

function IncomeRow({ income }: { income: Expense }) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteExpense(income.id);
      if (result.error) toast.error(result.error);
      else toast.success("Ingreso eliminado");
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <tr className="hover:bg-zinc-800/40 transition-colors">
        <td className="px-4 py-3">
          <CategoryBadge category={income.category} type="expense" />
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-zinc-200">{income.description}</p>
          {income.notes && (
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[220px]">
              {income.notes}
            </p>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-mono text-sm font-medium tabular-nums text-green-400">
            +{fmtARS(income.amount)}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs text-zinc-400 tabular-nums">
            {fmtDate(income.expense_date)}
          </p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            {fmtRelative(income.expense_date)}
          </p>
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
        title="Eliminar ingreso"
        description={`¿Confirmar eliminación de "${income.description}" por ${fmtARS(income.amount)}?`}
        onConfirm={handleDelete}
      />
    </>
  );
}

interface Props {
  expenses: Expense[];
  incomes: Expense[];
  onNew: () => void;
  onNewIncome: () => void;
}

export function GastosTab({ expenses, incomes, onNew, onNewIncome }: Props) {
  const [catFilter, setCatFilter] = useState<ExpenseCategory | "all">("all");

  const now = new Date();
  const monthLabel = now.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const filtered =
    catFilter === "all" ? expenses : expenses.filter((e) => e.category === catFilter);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const incomeTotal = incomes.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Partial<Record<ExpenseCategory, number>> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              Gastos · {monthLabel}
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-red-400">
              {fmtARS(total)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {expenses.length} registro{expenses.length !== 1 ? "s" : ""} este mes
            </p>
          </div>
          <Button
            size="sm"
            onClick={onNew}
            className="bg-yellow-500 text-black hover:bg-yellow-400 h-8 shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Registrar gasto
          </Button>
        </div>

        {total > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
              {(Object.entries(byCategory) as [ExpenseCategory, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => (
                  <div
                    key={cat}
                    title={`${EXPENSE_CATEGORIES[cat]?.label}: ${fmtARS(amount)}`}
                    className={`${DOT_COLORS[cat]} opacity-80`}
                    style={{ flex: amount }}
                  />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {(Object.entries(byCategory) as [ExpenseCategory, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${DOT_COLORS[cat]}`} />
                    <span className="text-[11px] text-zinc-500">
                      {EXPENSE_CATEGORIES[cat]?.label}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {Math.round((amount / total) * 100)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter("all")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
            catFilter === "all"
              ? "bg-zinc-700 text-zinc-100"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Todas
        </button>
        {EXPENSE_CATEGORY_OPTIONS.map((opt) => {
          const active = catFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setCatFilter(opt.value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                active
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[opt.value]}`} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-400 font-medium">
            {expenses.length === 0 ? "Sin gastos registrados" : "Sin resultados"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {expenses.length === 0
              ? "Registrá alquiler, servicios y otros gastos del gimnasio."
              : "Probá con otro filtro."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-zinc-900/80 border-b border-zinc-800">
                <tr>
                  {["Cat.", "Descripción", "Monto", "Fecha", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium text-zinc-500 last:text-right"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-zinc-950 divide-y divide-zinc-800/60">
                {filtered.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección Otros ingresos */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              Otros ingresos · {monthLabel}
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-green-400">
              {fmtARS(incomeTotal)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {incomes.length} registro{incomes.length !== 1 ? "s" : ""} este mes
            </p>
          </div>
          <Button
            size="sm"
            onClick={onNewIncome}
            className="bg-yellow-500 text-black hover:bg-yellow-400 h-8 shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Registrar ingreso
          </Button>
        </div>

        {incomes.length > 0 && (
          <div className="mt-4 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-zinc-900/80 border-b border-zinc-800">
                  <tr>
                    {["Cat.", "Descripción", "Monto", "Fecha", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium text-zinc-500 last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-zinc-950 divide-y divide-zinc-800/60">
                  {incomes.map((income) => (
                    <IncomeRow key={income.id} income={income} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {incomes.length === 0 && (
          <p className="mt-4 text-center text-sm text-zinc-600 py-6">
            Sin ingresos adicionales este mes. Registrá clases de Zumba, alquiler de espacio, etc.
          </p>
        )}
      </div>
    </div>
  );
}
