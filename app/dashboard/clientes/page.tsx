import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MembersTable } from "@/components/clientes/members-table";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/types";

export default async function ClientesPage() {
  const supabase = await createClient();

  // Actualizar estados (inactivos se conservan permanentemente en el historial)
  await supabase.rpc("refresh_member_statuses");
  const { data } = await supabase
    .from("members")
    .select("*")
    .order("first_name", { ascending: true });

  const members = (data ?? []) as Member[];

  return (
    <div className="flex flex-col">
      <Header title="Clientes" />
      <div className="p-4 space-y-4 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {members.length} cliente{members.length !== 1 ? "s" : ""}{" "}
            registrado{members.length !== 1 ? "s" : ""}
          </p>
          <Button
            asChild
            className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
          >
            <Link href="/dashboard/clientes/nuevo">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo cliente
            </Link>
          </Button>
        </div>
        <MembersTable members={members} />
      </div>
    </div>
  );
}
