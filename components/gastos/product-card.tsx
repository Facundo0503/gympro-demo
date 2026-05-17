"use client";

import { useTransition } from "react";
import type { Product } from "@/lib/types";
import { deleteProduct } from "@/app/dashboard/gastos/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ShoppingCart } from "lucide-react";
import { CategoryBadge } from "./category-badge";
import { fmtARS } from "@/lib/gastos/format";

interface Props {
  product: Product;
  onEdit: () => void;
  onSell: () => void;
}

export function ProductCard({ product, onEdit, onSell }: Props) {
  const [isDeleting, startDelete] = useTransition();
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const noStock = product.stock_quantity === 0;

  const margin =
    product.sale_price > 0
      ? Math.round(
          ((product.sale_price - product.purchase_price) / product.sale_price) * 100
        )
      : 0;

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) toast.error(result.error);
      else toast.success("Producto eliminado");
    });
  }

  return (
    <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={product.category} type="product" />
            {noStock && (
              <span className="rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-red-500/10 text-red-300 ring-red-500/30">
                Sin stock
              </span>
            )}
            {isLowStock && (
              <span className="rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-amber-500/10 text-amber-300 ring-amber-500/30">
                Stock bajo
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-100 leading-tight">
            {product.name}
          </p>
          {product.description && (
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
              {product.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-px rounded-lg border border-zinc-800/60 overflow-hidden text-center">
          <div className="bg-zinc-800/40 px-2 py-2">
            <p className="text-[10px] text-zinc-500 mb-0.5">Stock</p>
            <p
              className={`font-mono text-sm font-semibold tabular-nums ${
                noStock
                  ? "text-red-400"
                  : isLowStock
                  ? "text-amber-400"
                  : "text-zinc-100"
              }`}
            >
              {product.stock_quantity}
            </p>
            <p className="text-[10px] text-zinc-600">{product.unit}</p>
          </div>
          <div className="bg-zinc-800/40 px-2 py-2">
            <p className="text-[10px] text-zinc-500 mb-0.5">Costo</p>
            <p className="font-mono text-sm text-zinc-300 tabular-nums">
              {fmtARS(product.purchase_price, { compact: true })}
            </p>
          </div>
          <div className="bg-zinc-800/40 px-2 py-2">
            <p className="text-[10px] text-zinc-500 mb-0.5">Venta</p>
            <p className="font-mono text-sm text-yellow-400 tabular-nums">
              {fmtARS(product.sale_price, { compact: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/60 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Margen {margin}%</span>
        <Button
          size="sm"
          onClick={onSell}
          disabled={noStock}
          className="h-7 bg-yellow-500 text-black hover:bg-yellow-400 text-xs px-3 disabled:opacity-40"
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          Registrar venta
        </Button>
      </div>
    </div>
  );
}
