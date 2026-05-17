"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/gastos/constants";
import { fmtARS } from "@/lib/gastos/format";
import { Plus, Receipt, TrendingUp, LayoutDashboard, Package, ShoppingCart, Banknote } from "lucide-react";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-800/80 px-1 font-mono text-[10px] font-medium text-zinc-400 shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)]">
      {children}
    </kbd>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onNavigate: (tab: string) => void;
  onNewProduct: () => void;
  onNewExpense: () => void;
  onNewIncome: () => void;
  onSell: (product: Product) => void;
}

export function CommandPalette({
  open,
  onClose,
  products,
  onNavigate,
  onNewProduct,
  onNewExpense,
  onNewIncome,
  onSell,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-900/95 p-0 overflow-hidden max-w-lg shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="bg-transparent">
          <div className="border-b border-zinc-800/80">
            <CommandInput
              placeholder="Buscar producto, acción o página..."
              className="border-none bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:ring-0 h-12"
            />
          </div>
          <CommandList className="max-h-[60vh]">
            <CommandEmpty className="py-6 text-center text-sm text-zinc-500">
              Sin resultados.
            </CommandEmpty>

            <CommandGroup
              heading="Acciones rápidas"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
            >
              <CommandItem
                onSelect={() => { onNewProduct(); onClose(); }}
                className="data-[selected=true]:bg-zinc-800/80 rounded-lg mx-1 px-3 py-2 text-zinc-300 cursor-pointer"
              >
                <Plus className="mr-2.5 h-4 w-4 text-zinc-400" />
                Nuevo producto
                <CommandShortcut className="flex gap-0.5">
                  <Kbd>N</Kbd>
                  <Kbd>P</Kbd>
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => { onNewExpense(); onClose(); }}
                className="data-[selected=true]:bg-zinc-800/80 rounded-lg mx-1 px-3 py-2 text-zinc-300 cursor-pointer"
              >
                <Receipt className="mr-2.5 h-4 w-4 text-zinc-400" />
                Registrar gasto
                <CommandShortcut className="flex gap-0.5">
                  <Kbd>N</Kbd>
                  <Kbd>G</Kbd>
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => { onNewIncome(); onClose(); }}
                className="data-[selected=true]:bg-zinc-800/80 rounded-lg mx-1 px-3 py-2 text-zinc-300 cursor-pointer"
              >
                <TrendingUp className="mr-2.5 h-4 w-4 text-zinc-400" />
                Registrar ingreso
                <CommandShortcut className="flex gap-0.5">
                  <Kbd>N</Kbd>
                  <Kbd>I</Kbd>
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandGroup
              heading="Navegación"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
            >
              {[
                { tab: "resumen", label: "Ir a Resumen", icon: LayoutDashboard, shortcut: "GR" },
                { tab: "inventario", label: "Ir a Inventario", icon: Package, shortcut: "GI" },
                { tab: "ventas", label: "Ir a Ventas", icon: ShoppingCart, shortcut: "GV" },
                { tab: "gastos", label: "Ir a Gastos", icon: Banknote, shortcut: "GG" },
              ].map(({ tab, label, icon: Icon, shortcut }) => (
                <CommandItem
                  key={tab}
                  onSelect={() => { onNavigate(tab); onClose(); }}
                  className="data-[selected=true]:bg-zinc-800/80 rounded-lg mx-1 px-3 py-2 text-zinc-300 cursor-pointer"
                >
                  <Icon className="mr-2.5 h-4 w-4 text-zinc-400" />
                  {label}
                  <CommandShortcut className="flex gap-0.5">
                    <Kbd>{shortcut[0]}</Kbd>
                    <Kbd>{shortcut[1]}</Kbd>
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>

            {products.length > 0 && (
              <CommandGroup
                heading="Vender producto"
                className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              >
                {products.map((p) => {
                  const catConfig = PRODUCT_CATEGORIES[p.category];
                  return (
                    <CommandItem
                      key={p.id}
                      disabled={p.stock_quantity === 0}
                      onSelect={() => { onSell(p); onClose(); }}
                      className="data-[selected=true]:bg-zinc-800/80 rounded-lg mx-1 px-3 py-2 cursor-pointer data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none"
                    >
                      <span
                        className={`mr-3 grid h-7 w-7 shrink-0 place-items-center rounded-md ring-1 ring-inset ${catConfig?.bgClass ?? ""} ${catConfig?.ringClass ?? ""}`}
                      >
                        <ShoppingCart className={`h-3.5 w-3.5 ${catConfig?.textClass ?? "text-zinc-400"}`} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-zinc-200 truncate">{p.name}</span>
                        <span className="block text-[11px] text-zinc-500">
                          Stock: {p.stock_quantity} {p.unit} · {fmtARS(p.sale_price)}
                        </span>
                      </span>
                      {p.stock_quantity === 0 && (
                        <span className="text-[10px] uppercase text-red-400/80 shrink-0 ml-2">
                          Sin stock
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>

          <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/40 px-4 py-2.5">
            <div className="flex items-center gap-3 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd>
                ejecutar
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Esc</Kbd>
                cerrar
              </span>
            </div>
            <span className="text-[11px] text-zinc-600">MK Gym · Command Palette</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
