import { getDashboardData } from "@/app/dashboard/dashboard-actions";
import { Header } from "@/components/layout/header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

const EMPTY_KPIS = {
  totalMembers: 0, activeMembers: 0, proximoVencerMembers: 0,
  overdueMembers: 0, inactiveMembers: 0, monthlyRevenue: 0,
  projectedRevenue: 0, activePercentage: 0, overduePercentage: 0,
  muayThaiMonthlyRevenue: 0,
};

export default async function DashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch (err) {
    // Re-throw redirects (NEXT_REDIRECT) — Next.js must handle them
    const isRedirect = err instanceof Error && (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT");
    if (isRedirect) throw err;
    console.error("[dashboard] getDashboardData error:", err);
    data = { kpis: EMPTY_KPIS, alerts: [], recentPayments: [] };
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
