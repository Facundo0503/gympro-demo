"use client";

import { useState } from "react";
import type { Product, ProductCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ProductCard } from "./product-card";
import { fmtARS } from "@/lib/gastos/format";
import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/gastos/constants";

type StockFilter = "all" | "low" | "none";

interface Props {
  products: Product[];
  lowStock: Product[];
  totalInventoryValue: number;
  onNew: () => void;
  onEdit: (product: Product) => void;
  onSell: (product: Product) => void;
}

export function InventarioTab({
  products,
  lowStock,
  totalInventoryValue,
  onNew,
  onEdit,
  onSell,
}: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<ProductCategory | "all">("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (stockFilter === "low" && (p.stock_quantity === 0 || p.stock_quantity > 5)) return false;
    if (stockFilter === "none" && p.stock_quantity !== 0) return false;
    return true;
  });

  const lowStockCount = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
  ).length;
  const noStockCount = products.filter((p) => p.stock_quantity === 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 border-zinc-700 bg-zinc-800 text-zinc-100 text-sm"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as ProductCategory | "all")}
            className="h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
          >
            <option value="all">Todas las categorías</option>
            {PRODUCT_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="flex rounded-md border border-zinc-700 overflow-hidden">
            {(
              [
                { id: "all", label: "Todos" },
                { id: "low", label: `Stock bajo (${lowStockCount})` },
                { id: "none", label: `Sin stock (${noStockCount})` },
              ] as { id: StockFilter; label: string }[]
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setStockFilter(id)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  stockFilter === id
                    ? "bg-zinc-700 text-zinc-100"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-zinc-500">
            Inventario:{" "}
            <span className="font-mono text-zinc-300">
              {fmtARS(totalInventoryValue)}
            </span>
          </span>
          <Button
            size="sm"
            onClick={onNew}
            className="bg-yellow-500 text-black hover:bg-yellow-400 h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar producto
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-400 font-medium">
            {products.length === 0 ? "Sin productos todavía" : "Sin resultados"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {products.length === 0
              ? "Agregá tu primer producto para gestionar el inventario."
              : "Probá con otros filtros."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={() => onEdit(p)}
              onSell={() => onSell(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
