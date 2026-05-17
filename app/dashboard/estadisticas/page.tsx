import { Header } from "@/components/layout/header";
import { StatsGrid } from "@/components/estadisticas/stats-grid";
import { RevenueChart } from "@/components/estadisticas/revenue-chart";
import { NewClientsChart } from "@/components/estadisticas/new-clients-chart";
import { getStatsData } from "./stats-actions";

export default async function EstadisticasPage() {
  const stats = await getStatsData();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Estadísticas" />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 md:p-4">
        <StatsGrid stats={stats} />

        {/* Gráfico total */}
        <RevenueChart
          data={stats.monthlyRevenue}
          title="Ganancias totales — últimos 12 meses"
          color="#eab308"
        />

        {/* Gráficos por actividad — grilla 2x2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueChart
            data={stats.gymRevenue}
            title="Ganancias Gimnasio — últimos 12 meses"
            color="#3b82f6"
          />
          <RevenueChart
            data={stats.muayThaiRevenue}
            title="Ganancias Muay Thai — últimos 12 meses"
            color="#ef4444"
          />
          <RevenueChart
            data={stats.zumbaRevenue}
            title="Ganancias Zumba — últimos 12 meses"
            color="#a855f7"
          />
          <RevenueChart
            data={stats.funcionalRevenue}
            title="Ganancias Funcional — últimos 12 meses"
            color="#22c55e"
          />
        </div>

        {/* Nuevos clientes */}
        <NewClientsChart data={stats.newClientsPerMonth} />
      </div>
    </div>
  );
}
