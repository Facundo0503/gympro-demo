import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MemberForm } from "@/components/clientes/member-form";
import type { Member } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const member = data as Member;

  return (
    <div className="flex flex-col">
      <Header title={`Editar — ${member.first_name} ${member.last_name}`} />
      <div className="p-6">
        <MemberForm member={member} />
      </div>
    </div>
  );
}
