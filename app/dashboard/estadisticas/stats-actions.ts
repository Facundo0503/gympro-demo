import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type MonthlyRevenue = {
  month: string;
  amount: number;
};

export type NewClientsPerMonth = {
  month: string;
  count: number;
};

export type StatsData = {
  monthlyRevenue: MonthlyRevenue[];
  gymRevenue: MonthlyRevenue[];
  muayThaiRevenue: MonthlyRevenue[];
  zumbaRevenue: MonthlyRevenue[];
  funcionalRevenue: MonthlyRevenue[];
  newClientsPerMonth: NewClientsPerMonth[];
  mrr: number;
  totalRevenue: number;
  overdueRate: number;
  retentionRate: number;
  totalMembers: number;
  activeMembers: number;
  overdueMembers: number;
  inactiveMembers: number;
};

function getStartOfMonth(year: number, month: number): string {
  return new Date(year, month, 1).toISOString();
}

function getEndOfMonth(year: number, month: number): string {
  return new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
}

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export async function getStatsData(): Promise<StatsData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startDate = new Date(currentYear, currentMonth - 11, 1);
  const startISO = getStartOfMonth(startDate.getFullYear(), startDate.getMonth());
  const endISO = getEndOfMonth(currentYear, currentMonth);

  const [membersResult, paymentsResult, totalRevenueResult, newMembersResult] = await Promise.all([
    supabase.from("members").select("status"),
    supabase
      .from("payment_history")
      .select("amount, paid_at, members(activities)")
      .gte("paid_at", startISO)
      .lte("paid_at", endISO),
    supabase.from("payment_history").select("amount"),
    supabase
      .from("members")
      .select("start_date")
      .gte("start_date", startDate.toISOString().split("T")[0])
      .lte("start_date", now.toISOString().split("T")[0]),
  ]);

  const members = membersResult.data ?? [];
  const totalMembers = members.length;
  const activeMembers = members.filter(
    (m) => m.status === "al_dia" || m.status === "proximo_vencer"
  ).length;
  const overdueMembers = members.filter((m) => m.status === "vencido").length;
  const inactiveMembers = members.filter((m) => m.status === "inactivo").length;

  const overdueRate = totalMembers > 0 ? (overdueMembers / totalMembers) * 100 : 0;
  const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

  const allPayments = totalRevenueResult.data ?? [];
  const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  type PaymentRow = { amount: number; paid_at: string; members: { activities: string[] } | null };
  const payments = (paymentsResult.data ?? []) as unknown as PaymentRow[];

  const paymentsByMonth: Record<string, number> = {};
  const gymByMonth: Record<string, number> = {};
  const muayThaiByMonth: Record<string, number> = {};
  const zumbaByMonth: Record<string, number> = {};
  const funcionalByMonth: Record<string, number> = {};

  for (const p of payments) {
    const d = new Date(p.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const activities = p.members?.activities ?? [];
    paymentsByMonth[key] = (paymentsByMonth[key] ?? 0) + Number(p.amount);
    if (activities.includes("gimnasio"))
      gymByMonth[key] = (gymByMonth[key] ?? 0) + Number(p.amount);
    if (activities.includes("muay_thai"))
      muayThaiByMonth[key] = (muayThaiByMonth[key] ?? 0) + Number(p.amount);
    if (activities.includes("zumba"))
      zumbaByMonth[key] = (zumbaByMonth[key] ?? 0) + Number(p.amount);
    if (activities.includes("funcional"))
      funcionalByMonth[key] = (funcionalByMonth[key] ?? 0) + Number(p.amount);
  }

  const newMembersByMonth: Record<string, number> = {};
  for (const m of newMembersResult.data ?? []) {
    const d = new Date(m.start_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    newMembersByMonth[key] = (newMembersByMonth[key] ?? 0) + 1;
  }

  const monthlyRevenue: MonthlyRevenue[] = [];
  const gymRevenue: MonthlyRevenue[] = [];
  const muayThaiRevenue: MonthlyRevenue[] = [];
  const zumbaRevenue: MonthlyRevenue[] = [];
  const funcionalRevenue: MonthlyRevenue[] = [];
  const newClientsPerMonth: NewClientsPerMonth[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    monthlyRevenue.push({ month: label, amount: paymentsByMonth[key] ?? 0 });
    gymRevenue.push({ month: label, amount: gymByMonth[key] ?? 0 });
    muayThaiRevenue.push({ month: label, amount: muayThaiByMonth[key] ?? 0 });
    zumbaRevenue.push({ month: label, amount: zumbaByMonth[key] ?? 0 });
    funcionalRevenue.push({ month: label, amount: funcionalByMonth[key] ?? 0 });
    newClientsPerMonth.push({ month: label, count: newMembersByMonth[key] ?? 0 });
  }

  const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const mrr = paymentsByMonth[currentKey] ?? 0;

  return {
    monthlyRevenue,
    gymRevenue,
    muayThaiRevenue,
    zumbaRevenue,
    funcionalRevenue,
    newClientsPerMonth,
    mrr,
    totalRevenue,
    overdueRate,
    retentionRate,
    totalMembers,
    activeMembers,
    overdueMembers,
    inactiveMembers,
  };
}
