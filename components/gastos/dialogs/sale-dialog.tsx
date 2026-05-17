"use client";

import { useState, useTransition, useEffect } from "react";
import type { Product } from "@/lib/types";
import { recordSale } from "@/app/dashboard/gastos/actions";
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
import { fmtARS } from "@/lib/gastos/format";

interface Props {
  open: boolean;
  product: Product;
  onClose: () => void;
}

export function SaleDialog({ open, product, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState(String(product.sale_price));
  const [method, setMethod] = useState<"efectivo" | "transferencia">("efectivo");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setQty("1");
      setPrice(String(product.sale_price));
      setNotes("");
      setMethod("efectivo");
    }
  }, [open, product.id, product.sale_price]);

  const qtyNum = parseInt(qty, 10) || 0;
  const priceNum = parseFloat(price) || 0;
  const total = qtyNum * priceNum;

  function handleConfirm() {
    if (qtyNum <= 0) { toast.error("Cantidad inválida"); return; }
    if (qtyNum > product.stock_quantity) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock_quantity}`);
      return;
    }
    if (priceNum < 0) { toast.error("Precio inválido"); return; }

    startTransition(async () => {
      const result = await recordSale(
        product.id,
        qtyNum,
        priceNum,
        method,
        notes.trim() || undefined
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Venta registrada — ${fmtARS(total)}`);
        onClose();
      }
    });
  }

  const inputCls = "border-zinc-700 bg-zinc-800 text-zinc-100 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500/50";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Registrar venta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-md border border-zinc-800 bg-zinc-800/50 px-3 py-2">
            <p className="text-sm font-medium text-zinc-100">{product.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Stock: <span className="font-mono">{product.stock_quantity}</span>{" "}
              {product.unit}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Cantidad</Label>
              <Input
                type="number"
                min="1"
                max={product.stock_quantity}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Precio unit. ($)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${inputCls} pl-7 font-mono tabular-nums`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Método de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["efectivo", "transferencia"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                    method === m
                      ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {m === "efectivo" ? "Efectivo" : "Transferencia"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Nota (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Cliente habitual"
              className={`${inputCls} resize-none`}
              rows={2}
            />
          </div>

          {total > 0 && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/[0.06] px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="font-mono text-base font-medium text-yellow-300">
                {fmtARS(total)}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending || product.stock_quantity === 0}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {isPending ? "Registrando..." : "Confirmar venta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
