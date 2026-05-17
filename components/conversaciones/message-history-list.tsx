"use client";

import { useState, useTransition } from "react";
import { Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { deleteWhatsappMessage } from "@/app/dashboard/conversaciones/actions";

type MessageItem = {
  id: string;
  message_type: string;
  message_body: string;
  sent_at: string;
  members: { first_name: string; last_name: string } | null;
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function MessageRow({ msg }: { msg: MessageItem }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isReminder = msg.message_type === "reminder";
  const memberName = msg.members
    ? `${msg.members.first_name} ${msg.members.last_name}`
    : "Miembro eliminado";

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteWhatsappMessage(msg.id);
      if (result?.error) {
        toast.error("No se pudo eliminar el mensaje");
      } else {
        toast.success("Mensaje eliminado del historial");
      }
      setConfirming(false);
    });
  }

  return (
    <div className="group rounded-xl border border-white/5 bg-zinc-900/60 p-3 hover:bg-zinc-900 transition-colors md:p-4">
      {/* Header row */}
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
          {getInitials(
            msg.members?.first_name ?? "?",
            msg.members?.last_name ?? "?"
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-zinc-100 truncate">{memberName}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                isReminder
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {isReminder ? "Recordatorio" : "Aviso"}
            </span>
          </div>
          <span className="text-xs text-zinc-600">
            {new Date(msg.sent_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Delete button — siempre visible en mobile, hover en desktop */}
        <div className="flex shrink-0 items-center gap-1 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity">
          {confirming ? (
            <>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {isPending ? "..." : "Eliminar"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded px-2 py-0.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              aria-label="Eliminar mensaje"
              className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Cuerpo del mensaje — sin indentación en mobile */}
      <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:pl-9">
        {msg.message_body}
      </p>
    </div>
  );
}

interface MessageHistoryListProps {
  messages: MessageItem[];
}

export function MessageHistoryList({ messages }: MessageHistoryListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-zinc-900/40 py-10 text-center">
        <MessageCircle className="h-8 w-8 text-zinc-700" />
        <p className="text-sm text-zinc-600">Sin mensajes enviados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} />
      ))}
    </div>
  );
}
