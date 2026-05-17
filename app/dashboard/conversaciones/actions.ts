"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logWhatsappMessage(
  memberId: string,
  messageType: "reminder" | "overdue",
  messageBody: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("whatsapp_messages").insert({
    member_id: memberId,
    message_type: messageType,
    message_body: messageBody,
  });

  if (error) return { error: error.message };

  // FIFO: mantener máximo 10 mensajes — borrar el más antiguo si se supera el límite
  const { count } = await supabase
    .from("whatsapp_messages")
    .select("*", { count: "exact", head: true });

  if (count && count > 10) {
    const { data: oldest } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .order("sent_at", { ascending: true })
      .limit(count - 10);

    if (oldest && oldest.length > 0) {
      await supabase
        .from("whatsapp_messages")
        .delete()
        .in("id", oldest.map((m) => m.id));
    }
  }

  revalidatePath("/dashboard/conversaciones");
  revalidatePath(`/dashboard/clientes/${memberId}`);
  return {};
}

export async function deleteWhatsappMessage(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("whatsapp_messages")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/conversaciones");
  return {};
}
