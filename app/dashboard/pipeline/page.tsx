import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import type { Member } from "@/lib/types";

export default async function PipelinePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("members")
    .select("*")
    .order("first_name", { ascending: true });

  const members = (data ?? []) as Member[];

  return (
    <div className="flex flex-col h-full">
      <Header title="Pipeline" />
      <div className="flex-1 p-3 overflow-hidden md:p-4">
        <KanbanBoard members={members} />
      </div>
    </div>
  );
}
