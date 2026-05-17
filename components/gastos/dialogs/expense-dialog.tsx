"use client";

import { useState, useTransition, useEffect } from "react";
import type { ExpenseCategory } from "@/lib/types";
import { createExpense } from "@/app/dashboard/gastos/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/gastos/constants";

interface FormState {
  category: ExpenseCategory;
  description: string;
  amount: string;
  date: string;
  notes: string;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function defaultState(): FormState {
  return {
    category: "otro",
    description: "",
    amount: "",
    date: todayISO(),
    notes: "",
  };
}

function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(defaultState);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.description.trim()) { toast.error("La descripción es requerida"); return; }
    if (!form.amount) { toast.error("El monto es requerido"); return; }

    const fd = new FormData();
    fd.set("category", form.category);
    fd.set("description", form.description.trim());
    fd.set("amount", form.amount);
    fd.set("expense_date", form.date);
    fd.set("notes", form.notes.trim());

    startTransition(async () => {
      const result = await createExpense(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Gasto registrado");
        onClose();
      }
    });
  }

  const inputCls = "border-zinc-700 bg-zinc-800 text-zinc-100 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Categoría *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => set("category", v)}
          >
            <SelectTrigger className={inputCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
              {EXPENSE_CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-700">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Fecha *</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
            className={`${inputCls} [color-scheme:dark]`}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-300">Descripción *</Label>
        <Input
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Ej: Alquiler mes de mayo"
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-300">Monto ($) *</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            $
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            required
            className={`${inputCls} pl-7 font-mono tabular-nums`}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-300">Notas (opcional)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Detalles adicionales"
          className={`${inputCls} resize-none`}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-yellow-500 text-black hover:bg-yellow-400"
        >
          {isPending ? "Guardando..." : "Registrar gasto"}
        </Button>
      </div>
    </form>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExpenseDialog({ open, onClose }: Props) {
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (open) setFormKey((k) => k + 1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Registrar gasto</DialogTitle>
        </DialogHeader>
        <ExpenseForm key={formKey} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
