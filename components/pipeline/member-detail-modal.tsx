"use client";

import Link from "next/link";
import { ExternalLink, Phone, Calendar, DollarSign, Clock, User, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/clientes/status-badge";
import { MarkPaidButton } from "@/components/clientes/mark-paid-button";
import type { Member } from "@/lib/types";

interface MemberDetailModalProps {
  member: Member | null;
  open: boolean;
  onClose: () => void;
}

export function MemberDetailModal({
  member,
  open,
  onClose,
}: MemberDetailModalProps) {
  if (!member) return null;

  const details: { icon: React.ReactNode; label: string; value: string }[] = [
    ...(member.member_number != null
      ? [{ icon: <Hash className="h-3.5 w-3.5" />, label: "Nº Socio", value: String(member.member_number) }]
      : []),
    ...(member.age
      ? [{ icon: <User className="h-3.5 w-3.5" />, label: "Edad", value: `${member.age} años` }]
      : []),
    ...(member.whatsapp
      ? [{ icon: <Phone className="h-3.5 w-3.5" />, label: "WhatsApp", value: member.whatsapp }]
      : []),
    {
      icon: <DollarSign className="h-3.5 w-3.5" />,
      label: "Cuota",
      value: `$${member.monthly_fee.toLocaleString("es-AR")}`,
    },
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: "Inicio",
      value: new Date(member.start_date).toLocaleDateString("es-AR"),
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Meses asistidos",
      value: `${member.months_attended}`,
    },
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: "Vencimiento",
      value: new Date(member.due_date).toLocaleDateString("es-AR"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-zinc-800 bg-zinc-900 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300">
              {member.first_name[0]}
              {member.last_name[0]}
            </div>
            <div>
              <DialogTitle className="text-base text-white">
                {member.first_name} {member.last_name}
              </DialogTitle>
              <StatusBadge status={member.status} inactiveSince={member.inactive_since} />
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {details.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-2.5"
            >
              <span className="mt-0.5 text-yellow-500">{icon}</span>
              <div>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-xs font-medium text-zinc-200">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {member.notes && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5">
            <p className="mb-1 text-xs text-zinc-500">Observaciones</p>
            <p className="text-xs text-zinc-300">{member.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          {member.status !== "al_dia" && (
            <MarkPaidButton
              memberId={member.id}
              monthlyFee={member.monthly_fee}
            />
          )}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="ml-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Link href={`/dashboard/clientes/${member.id}`}>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Ver ficha completa
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
