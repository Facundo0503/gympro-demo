"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { GestionStats, Product, ProductSale, Expense } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumenTab } from "./resumen-tab";
import { InventarioTab } from "./inventario-tab";
import { VentasTab } from "./ventas-tab";
import { GastosTab } from "./gastos-tab";
import { ProductDialog } from "./dialogs/product-dialog";
import { SaleDialog } from "./dialogs/sale-dialog";
import { ExpenseDialog } from "./dialogs/expense-dialog";
import { IncomeDialog } from "./dialogs/income-dialog";
import { CommandPalette } from "./command-palette";
import { CommandTrigger } from "./command-trigger";

type TabValue = "resumen" | "inventario" | "ventas" | "gastos";

const VALID_TABS: TabValue[] = ["resumen", "inventario", "ventas", "gastos"];

interface ProductDialogState {
  open: boolean;
  mode: "create" | "edit";
  product?: Product;
}

interface SaleDialogState {
  open: boolean;
  product: Product | null;
}

interface GastosTabsProps {
  stats: GestionStats;
  products: Product[];
  sales: ProductSale[];
  expenses: Expense[];
  incomes: Expense[];
}

export function GastosTabs({ stats, products, sales, expenses, incomes }: GastosTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get("tab") as TabValue | null;
  const activeTab: TabValue =
    rawTab && VALID_TABS.includes(rawTab) ? rawTab : "resumen";

  const [productDialog, setProductDialog] = useState<ProductDialogState>({
    open: false,
    mode: "create",
  });
  const [saleDialog, setSaleDialog] = useState<SaleDialogState>({
    open: false,
    product: null,
  });
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  function navigate(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  }

  function openNewProduct() {
    setProductDialog({ open: true, mode: "create" });
  }

  function openEditProduct(product: Product) {
    setProductDialog({ open: true, mode: "edit", product });
  }

  function openSell(product: Product) {
    setSaleDialog({ open: true, product });
  }

  function openNewExpense() {
    setExpenseOpen(true);
  }

  function openNewIncome() {
    setIncomeOpen(true);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">
            Gestión de Gastos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <CommandTrigger onOpen={() => setCmdOpen(true)} />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(v)}
        className="mt-4"
      >
        <div className="px-4 sm:px-6">
          <TabsList className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 p-1 gap-0.5">
            <TabsTrigger
              value="resumen"
              className="rounded-md text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none text-xs"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="inventario"
              className="rounded-md text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none text-xs"
            >
              Inventario
              {products.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-700 px-1 text-[10px] font-medium text-zinc-300">
                  {products.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="ventas"
              className="rounded-md text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none text-xs"
            >
              Ventas
              {sales.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-700 px-1 text-[10px] font-medium text-zinc-300">
                  {sales.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="gastos"
              className="rounded-md text-zinc-500 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none text-xs"
            >
              Gastos
              {expenses.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-700 px-1 text-[10px] font-medium text-zinc-300">
                  {expenses.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <TabsContent value="resumen" className="mt-0">
            <ResumenTab stats={stats} onNavigate={navigate} />
          </TabsContent>
          <TabsContent value="inventario" className="mt-0">
            <InventarioTab
              products={products}
              lowStock={stats.lowStockProducts}
              totalInventoryValue={stats.totalInventoryValue}
              onNew={openNewProduct}
              onEdit={openEditProduct}
              onSell={openSell}
            />
          </TabsContent>
          <TabsContent value="ventas" className="mt-0">
            <VentasTab sales={sales} />
          </TabsContent>
          <TabsContent value="gastos" className="mt-0">
            <GastosTab expenses={expenses} incomes={incomes} onNew={openNewExpense} onNewIncome={openNewIncome} />
          </TabsContent>
        </div>
      </Tabs>

      <ProductDialog
        open={productDialog.open}
        mode={productDialog.mode}
        product={productDialog.product}
        onClose={() => setProductDialog((s) => ({ ...s, open: false }))}
      />

      {saleDialog.product && (
        <SaleDialog
          open={saleDialog.open}
          product={saleDialog.product}
          onClose={() => setSaleDialog({ open: false, product: null })}
        />
      )}

      <ExpenseDialog open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <IncomeDialog open={incomeOpen} onClose={() => setIncomeOpen(false)} />

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        products={products}
        onNavigate={(tab) => { navigate(tab); }}
        onNewProduct={openNewProduct}
        onNewExpense={openNewExpense}
        onNewIncome={openNewIncome}
        onSell={openSell}
      />
    </div>
  );
}
