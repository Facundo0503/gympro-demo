import { Suspense } from "react";
import { getGestionStats, getProducts, getProductSales, getExpenses, getIncomes } from "./actions";
import { GastosTabs } from "@/components/gastos/gastos-tabs";

export const metadata = { title: "Gestión de Gastos — GymPro Demo" };

export default async function GastosPage() {
  const [stats, products, sales, expenses, incomes] = await Promise.all([
    getGestionStats(),
    getProducts(),
    getProductSales(100),
    getExpenses(),
    getIncomes(),
  ]);

  return (
    <Suspense>
      <GastosTabs
        stats={stats}
        products={products}
        sales={sales}
        expenses={expenses}
        incomes={incomes}
      />
    </Suspense>
  );
}
