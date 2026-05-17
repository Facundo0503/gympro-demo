"use client";

import { useTransition } from "react";
import { MessageCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logWhatsappMessage } from "@/app/dashboard/conversaciones/actions";

interface WhatsappButtonsProps {
  member: {
    id: string;
    first_name: string;
    last_name: string;
    whatsapp: string | null;
    due_date: string;
    status: string;
  };
  /** Mostrar ambos botones siempre (para sección conversaciones) */
  showBoth?: boolean;
}

export function WhatsappButtons({ member, showBoth = false }: WhatsappButtonsProps) {
  const [isPending, startTransition] = useTransition();

  if (!member.whatsapp) return null;
  if (!showBoth && member.status !== "proximo_vencer" && member.status !== "vencido") return null;

  const phone = member.whatsapp.replace(/\D/g, "");

  const reminderMessage =
    `Hola ${member.first_name}! Te recordamos que tu cuota de GymPro esta proxima a vencer. ` +
    `Renovala antes del vencimiento para seguir disfrutando del gimnasio sin interrupciones. ` +
    `Gracias por ser parte de GymPro!`;

  const overdueMessage =
    `Hola ${member.first_name}! Te informamos que tu cuota de GymPro se encuentra vencida. ` +
    `Para mantener el acceso activo al gimnasio, es necesario regularizar el pago a la brevedad. Gracias!`;

  function handleSend(type: "reminder" | "overdue", message: string) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    // Abrir sincrónicamente dentro del gesto del usuario — iOS Safari bloquea
    // window.open si se llama después de un await (fuera del gesture handler)
    window.open(url, "_blank", "noopener,noreferrer");
    // Registrar en segundo plano
    startTransition(async () => {
      const result = await logWhatsappMessage(member.id, type, message);
      if (result.error) {
        toast.error("No se pudo registrar el mensaje");
      }
    });
  }

  const showReminder = showBoth || member.status === "proximo_vencer";
  const showOverdue = showBoth || member.status === "vencido";

  return (
    <div className="flex gap-2 flex-wrap">
      {showReminder && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleSend("reminder", reminderMessage)}
          className="border-amber-500/30 text-amber-400 hover:border-amber-500/60 hover:text-amber-300 hover:bg-amber-500/5"
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "..." : "Recordatorio"}
        </Button>
      )}
      {showOverdue && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleSend("overdue", overdueMessage)}
          className="border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300 hover:bg-red-500/5"
        >
          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "..." : "Vencimiento"}
        </Button>
      )}
    </div>
  );
}
