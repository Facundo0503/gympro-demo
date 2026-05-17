import { MessageCircle, Send, Clock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { WhatsappButtons } from "@/components/conversaciones/whatsapp-buttons";
import { MessageHistoryList } from "@/components/conversaciones/message-history-list";
import { ActivityBadges } from "@/components/clientes/activity-badges";

type MessageWithMember = {
  id: string;
  message_type: string;
  message_body: string;
  sent_at: string;
  members: { first_name: string; last_name: string } | null;
};

type ContactMember = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  whatsapp: string | null;
  due_date: string;
  activities: string[];
};

export default async function ConversacionesPage() {
  const supabase = await createClient();

  const [membersResult, messagesResult] = await Promise.all([
    supabase
      .from("members")
      .select("id, first_name, last_name, status, whatsapp, due_date, activities")
      .in("status", ["proximo_vencer", "vencido"])
      .order("due_date", { ascending: true }),
    supabase
      .from("whatsapp_messages")
      .select("id, message_type, message_body, sent_at, members(first_name, last_name)")
      .order("sent_at", { ascending: false })
      .limit(10),
  ]);

  const contacts = (membersResult.data ?? []) as ContactMember[];
  const messages = (messagesResult.data ?? []) as unknown as MessageWithMember[];

  const overdueContacts = contacts.filter((m) => m.status === "vencido");
  const upcomingContacts = contacts.filter((m) => m.status === "proximo_vencer");

  return (
    <div className="flex flex-col md:h-full">
      <Header title="Conversaciones" />

      {/* Mobile: columnas apiladas, la página hace scroll libre via <main>
          Desktop: dos columnas fijas con overflow interno */}
      <div className="flex flex-col gap-3 p-3 md:flex-1 md:flex-row md:gap-4 md:overflow-hidden md:p-4">

        {/* LEFT — Contactar miembros */}
        <div className="flex shrink-0 flex-col rounded-xl border border-white/5 bg-zinc-900/60 md:h-auto md:w-[420px]">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-2.5 border-b border-white/5 bg-zinc-900 px-4 py-3 rounded-t-xl">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10">
              <Send className="h-3.5 w-3.5 text-yellow-500" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Contactar miembros</span>
            {contacts.length > 0 && (
              <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {contacts.length}
              </span>
            )}
          </div>

          {/* Contact list — fluye en mobile, scroll interno en desktop */}
          <div className="p-3 space-y-2 md:flex-1 md:overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <MessageCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">Todo al dia</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    No hay miembros que necesiten contacto
                  </p>
                </div>
              </div>
            ) : (
              <>
                {overdueContacts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-1 pt-1 pb-0.5">
                      <AlertCircle className="h-3 w-3 text-red-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400/70">
                        Cuota vencida ({overdueContacts.length})
                      </span>
                    </div>
                    {overdueContacts.map((member) => (
                      <ContactCard key={member.id} member={member} />
                    ))}
                  </>
                )}

                {upcomingContacts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-1 pt-3 pb-0.5">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/70">
                        Proximos a vencer ({upcomingContacts.length})
                      </span>
                    </div>
                    {upcomingContacts.map((member) => (
                      <ContactCard key={member.id} member={member} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Historial */}
        <div className="flex flex-col rounded-xl border border-white/5 bg-zinc-900/60 md:flex-1 md:min-h-0">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-2.5 border-b border-white/5 bg-zinc-900 px-4 py-3 rounded-t-xl">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-700/50">
              <MessageCircle className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Historial</span>
            {messages.length > 0 && (
              <span className="ml-auto text-xs text-zinc-600">
                {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Messages — fluyen en mobile, scroll interno en desktop */}
          <div className="p-3 md:flex-1 md:overflow-y-auto">
            <MessageHistoryList messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ member }: { member: ContactMember }) {
  const isOverdue = member.status === "vencido";
  const dueDate = new Date(member.due_date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        isOverdue
          ? "border-red-500/15 bg-red-500/5 hover:bg-red-500/8"
          : "border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/8"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isOverdue ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
          }`}
        >
          {`${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-zinc-100 truncate">
              {member.first_name} {member.last_name}
            </p>
            <ActivityBadges activities={member.activities ?? []} />
          </div>
          <p className={`text-xs truncate ${isOverdue ? "text-red-400/70" : "text-amber-400/70"}`}>
            {isOverdue ? `Vencio el ${dueDate}` : `Vence el ${dueDate}`}
            {member.whatsapp && ` · ${member.whatsapp}`}
          </p>
        </div>
      </div>

      {member.whatsapp ? (
        <WhatsappButtons
          member={{
            id: member.id,
            first_name: member.first_name,
            last_name: member.last_name,
            whatsapp: member.whatsapp,
            due_date: member.due_date,
            status: member.status,
          }}
          showBoth
        />
      ) : (
        <p className="text-xs text-zinc-600 italic">Sin numero de WhatsApp registrado</p>
      )}
    </div>
  );
}
