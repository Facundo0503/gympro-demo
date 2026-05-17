import { getDashboardData } from "@/app/dashboard/dashboard-actions";
import { Header } from "@/components/layout/header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch (err) {
    console.error("[dashboard] getDashboardData error:", err);
    throw err;
  }

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <KpiCards kpis={data.kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AlertsPanel alerts={data.alerts} />
          </div>
          <div>
            <StatusPieChart kpis={data.kpis} />
          </div>
        </div>

        <RecentActivity recentPayments={data.recentPayments} />
      </div>
    </div>
  );
}
