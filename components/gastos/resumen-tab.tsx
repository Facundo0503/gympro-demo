import { Wallet, ShoppingCart, Receipt } from "lucide-react";
import type { GestionStats } from "@/lib/types";
import { fmtARS } from "@/lib/gastos/format";
import { HeroKpi } from "./hero-kpi";
import { MiniKpiCard } from "./mini-kpi-card";
import { IngresosVsGastos } from "./charts/ingresos-vs-gastos";
import { GananciaNeta } from "./charts/ganancia-neta";
import { CategoryBadge } from "./category-badge";

interface Props {
  stats: GestionStats;
  onNavigate: (tab: string) => void;
}

export function ResumenTab({ stats, onNavigate }: Props) {
  const {
    thisMonthMembershipRevenue,
    thisMonthProductRevenue,
    thisMonthExpenses,
    monthlyData,
    topProducts,
    lowStockProducts,
    totalInventoryValue,
  } = stats;

  const cuotasData = monthlyData.map((d) => d.membershipRevenue);
  const productData = monthlyData.map((d) => d.productRevenue);
  const expenseData = monthlyData.map((d) => d.expenses);

  const prevCuotas = monthlyData[monthlyData.length - 2]?.membershipRevenue ?? 0;
  const currCuotas = thisMonthMembershipRevenue;
  const deltaCuotas =
    prevCuotas !== 0 ? ((currCuotas - prevCuotas) / Math.abs(prevCuotas)) * 100 : 0;

  const prevProduct = monthlyData[monthlyData.length - 2]?.productRevenue ?? 0;
  const currProduct = thisMonthProductRevenue;
  const deltaProduct =
    prevProduct !== 0 ? ((currProduct - prevProduct) / Math.abs(prevProduct)) * 100 : 0;

  const prevExpenses = monthlyData[monthlyData.length - 2]?.expenses ?? 0;
  const currExpenses = thisMonthExpenses;
  const deltaExpenses =
    prevExpenses !== 0
      ? ((currExpenses - prevExpenses) / Math.abs(prevExpenses)) * 100
      : 0;

  const topRevenue = topProducts[0]?.total_revenue ?? 1;

  return (
    <div className="space-y-5">
      <HeroKpi stats={stats} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <MiniKpiCard
          label="Cuotas del mes"
          value={fmtARS(thisMonthMembershipRevenue, { compact: true })}
          delta={deltaCuotas}
          icon={Wallet}
          sparkData={cuotasData}
          sparkColor="#4ADE80"
        />
        <MiniKpiCard
          label="Ventas productos"
          value={fmtARS(thisMonthProductRevenue, { compact: true })}
          delta={deltaProduct}
          icon={ShoppingCart}
          sparkData={productData}
          sparkColor="#60A5FA"
        />
        <MiniKpiCard
          label="Gastos"
          value={fmtARS(thisMonthExpenses, { compact: true })}
          delta={-deltaExpenses}
          icon={Receipt}
          sparkData={expenseData}
          sparkColor="#F87171"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-200">Ingresos vs. Gastos</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-zinc-500">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-xs text-zinc-500">Gastos</span>
              </div>
            </div>
          </div>
          <IngresosVsGastos monthlyData={monthlyData} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Ganancia neta</p>
          <GananciaNeta monthlyData={monthlyData} height={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-200">Top 5 productos</p>
            <button
              onClick={() => onNavigate("inventario")}
              className="text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
            >
              Ver inventario →
            </button>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Sin ventas registradas</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.product_id}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-zinc-500 w-5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-zinc-200 flex-1 truncate">
                      {p.name}
                    </span>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {p.total_units_sold} uds.
                    </span>
                    <span className="font-mono text-sm font-medium text-yellow-400 shrink-0">
                      {fmtARS(p.total_revenue, { compact: true })}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-500/80"
                      style={{
                        width: `${Math.round((p.total_revenue / topRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Stock bajo</p>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">
              Todos los productos con stock suficiente
            </p>
          ) : (
            <div className="flex-1 space-y-2">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryBadge category={p.category} type="product" />
                    <span className="text-sm text-zinc-200 truncate">{p.name}</span>
                  </div>
                  <span
                    className={`font-mono text-sm font-medium shrink-0 ml-2 ${
                      p.stock_quantity === 0 ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    {p.stock_quantity} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Valor de inventario</span>
            <span className="font-mono text-sm font-medium text-zinc-200">
              {fmtARS(totalInventoryValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
