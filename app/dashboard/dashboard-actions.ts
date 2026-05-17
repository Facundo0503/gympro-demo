import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type DashboardKPIs = {
  totalMembers: number;
  activeMembers: number;
  proximoVencerMembers: number;
  overdueMembers: number;
  inactiveMembers: number;
  monthlyRevenue: number;
  projectedRevenue: number;
  activePercentage: number;
  overduePercentage: number;
  muayThaiMonthlyRevenue: number;
};

export type AlertMember = {
  id: string;
  first_name: string;
  last_name: string;
  due_date: string;
  status: "proximo_vencer" | "vencido";
  monthly_fee: number;
  activities: string[];
};

export type RecentPayment = {
  id: string;
  member_id: string;
  amount: number;
  paid_at: string;
  member_first_name: string;
  member_last_name: string;
};

export type DashboardData = {
  kpis: DashboardKPIs;
  alerts: AlertMember[];
  recentPayments: RecentPayment[];
};

function getMonthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function getMonthEnd(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

type MemberRow = { status: string; monthly_fee: number };

// Supabase retorna FK many-to-one como objeto, no array
type PaymentWithMember = {
  id: string;
  member_id: string;
  amount: number;
  paid_at: string;
  members: { first_name: string; last_name: string } | null;
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membersResult, revenueResult, alertsResult, paymentsResult] =
    await Promise.all([
      supabase.from("members").select("status, monthly_fee"),
      supabase
        .from("payment_history")
        .select("amount, members(activities)")
        .gte("paid_at", getMonthStart())
        .lte("paid_at", getMonthEnd()),
      supabase
        .from("members")
        .select("id, first_name, last_name, due_date, status, monthly_fee, activities")
        .in("status", ["proximo_vencer", "vencido"])
        .order("due_date", { ascending: true })
        .limit(10),
      supabase
        .from("payment_history")
        .select("id, member_id, amount, paid_at, members(first_name, last_name)")
        .order("paid_at", { ascending: false })
        .limit(5),
    ]);

  const allMembers = (membersResult.data ?? []) as MemberRow[];
  const totalMembers = allMembers.length;
  const activeMembers = allMembers.filter(
    (s) => s.status === "al_dia" || s.status === "proximo_vencer"
  ).length;
  const proximoVencerMembers = allMembers.filter(
    (s) => s.status === "proximo_vencer"
  ).length;
  const overdueMembers = allMembers.filter((s) => s.status === "vencido").length;
  const inactiveMembers = allMembers.filter((s) => s.status === "inactivo").length;

  type RevenueRow = { amount: number; members: { activities: string[] } | null };
  const revenueRows = (revenueResult.data ?? []) as unknown as RevenueRow[];
  const monthlyRevenue = revenueRows.reduce((sum, r) => sum + Number(r.amount), 0);
  const muayThaiMonthlyRevenue = revenueRows
    .filter((r) => (r.members?.activities ?? []).includes("muay_thai"))
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const projectedRevenue = allMembers
    .filter((m) => m.status !== "inactivo")
    .reduce((sum, m) => sum + Number(m.monthly_fee), 0);

  const kpis: DashboardKPIs = {
    totalMembers,
    activeMembers,
    proximoVencerMembers,
    overdueMembers,
    inactiveMembers,
    monthlyRevenue,
    projectedRevenue,
    activePercentage:
      totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0,
    overduePercentage:
      totalMembers > 0 ? Math.round((overdueMembers / totalMembers) * 100) : 0,
    muayThaiMonthlyRevenue,
  };

  const alerts = (alertsResult.data ?? []) as AlertMember[];

  const rawPayments = (paymentsResult.data ?? []) as unknown as PaymentWithMember[];
  const recentPayments: RecentPayment[] = rawPayments.map((p) => ({
    id: p.id,
    member_id: p.member_id,
    amount: p.amount,
    paid_at: p.paid_at,
    member_first_name: p.members?.first_name ?? "—",
    member_last_name: p.members?.last_name ?? "",
  }));

  return { kpis, alerts, recentPayments };
}
