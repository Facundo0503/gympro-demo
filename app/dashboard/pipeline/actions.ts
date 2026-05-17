"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MemberStatus } from "@/lib/types";

export async function updateMemberStatus(id: string, status: MemberStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("members")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/clientes");
}
