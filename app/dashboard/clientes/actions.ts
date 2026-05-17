"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActivityType, MemberStatus } from "@/lib/types";

function computeStatus(dueDateStr: string): MemberStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 5) return "al_dia";
  if (diffDays >= 0) return "proximo_vencer";
  if (diffDays >= -30) return "vencido";
  return "inactivo";
}


// Siempre avanza desde la fecha de vencimiento original (nunca desde hoy)
// para que los socios no ganen días gratis pagando tarde.
function nextDueDate(dueDateStr: string): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  let d = new Date(dueDateStr + "T12:00:00");
  do {
    const prevDay = d.getDate();
    d.setMonth(d.getMonth() + 1);
    if (d.getDate() !== prevDay) d.setDate(0);
  } while (d <= today);
  return d.toISOString().split("T")[0];
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export async function createMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const first_name = (formData.get("first_name") as string)?.trim();
  const last_name = (formData.get("last_name") as string)?.trim();
  const start_date = formData.get("start_date") as string;
  const monthly_fee_raw = formData.get("monthly_fee") as string;
  const due_date = formData.get("due_date") as string;

  if (!first_name || !last_name || !start_date || !monthly_fee_raw || !due_date) {
    return { error: "Nombre, apellido, fecha de inicio, cuota y vencimiento son requeridos." };
  }

  const monthly_fee = parseFloat(monthly_fee_raw);
  if (isNaN(monthly_fee) || monthly_fee <= 0) {
    return { error: "El valor de la cuota debe ser un número positivo." };
  }

  const age_raw = formData.get("age") as string;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const age = age_raw ? parseInt(age_raw, 10) : null;

  const status = computeStatus(due_date);
  const activitiesRaw = formData.getAll("activities") as ActivityType[];
  const activities: ActivityType[] = activitiesRaw.length > 0 ? activitiesRaw : ["gimnasio"];

  const { data: maxData } = await supabase
    .from("members")
    .select("member_number")
    .order("member_number", { ascending: false })
    .not("member_number", "is", null)
    .limit(1)
    .single();

  const member_number = maxData?.member_number ? maxData.member_number + 1 : 1;

  const { error } = await supabase.from("members").insert({
    first_name,
    last_name,
    age,
    whatsapp,
    start_date,
    monthly_fee,
    due_date,
    notes,
    status,
    activities,
    months_attended: 0,
    member_number,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const first_name = (formData.get("first_name") as string)?.trim();
  const last_name = (formData.get("last_name") as string)?.trim();
  const start_date = formData.get("start_date") as string;
  const monthly_fee_raw = formData.get("monthly_fee") as string;
  const due_date = formData.get("due_date") as string;

  if (!first_name || !last_name || !start_date || !monthly_fee_raw || !due_date) {
    return { error: "Nombre, apellido, fecha de inicio, cuota y vencimiento son requeridos." };
  }

  const monthly_fee = parseFloat(monthly_fee_raw);
  if (isNaN(monthly_fee) || monthly_fee <= 0) {
    return { error: "El valor de la cuota debe ser un número positivo." };
  }

  const age_raw = formData.get("age") as string;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const age = age_raw ? parseInt(age_raw, 10) : null;

  const status = computeStatus(due_date);
  const activitiesRaw = formData.getAll("activities") as ActivityType[];
  const activities: ActivityType[] = activitiesRaw.length > 0 ? activitiesRaw : ["gimnasio"];

  const { error } = await supabase
    .from("members")
    .update({ first_name, last_name, age, whatsapp, start_date, monthly_fee, due_date, notes, status, activities })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  redirect(`/dashboard/clientes/${id}`);
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function markAsPaid(id: string, amount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member, error: fetchError } = await supabase
    .from("members")
    .select("due_date, months_attended")
    .eq("id", id)
    .single();

  if (fetchError || !member) return { error: "No se encontró el miembro." };

  const newDueDate = nextDueDate(member.due_date);
  const newStatus = computeStatus(newDueDate);

  const { error: paymentError } = await supabase
    .from("payment_history")
    .insert({ member_id: id, amount });

  if (paymentError) return { error: paymentError.message };

  const { error: updateError } = await supabase
    .from("members")
    .update({
      due_date: newDueDate,
      status: newStatus,
      months_attended: member.months_attended + 1,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  revalidatePath("/dashboard/pipeline");
}

export async function deletePayment(paymentId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: payment, error: fetchError } = await supabase
    .from("payment_history")
    .select("member_id")
    .eq("id", paymentId)
    .single();

  if (fetchError || !payment) return { error: "Pago no encontrado." };

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("due_date, months_attended")
    .eq("id", payment.member_id)
    .single();

  if (memberError || !member) return { error: "Miembro no encontrado." };

  const { error: deleteError } = await supabase
    .from("payment_history")
    .delete()
    .eq("id", paymentId);

  if (deleteError) return { error: deleteError.message };

  const newDueDate = subtractDays(member.due_date, 30);
  const newStatus = computeStatus(newDueDate);

  await supabase
    .from("members")
    .update({
      due_date: newDueDate,
      months_attended: Math.max(0, member.months_attended - 1),
      status: newStatus,
    })
    .eq("id", payment.member_id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${payment.member_id}`);
  return {};
}

export async function refreshMemberStatuses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.rpc("refresh_member_statuses");
  revalidatePath("/dashboard/clientes");
  revalidatePath("/dashboard/pipeline");
}
