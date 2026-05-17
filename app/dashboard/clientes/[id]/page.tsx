import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Phone, Calendar, DollarSign, Clock, User, Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/clientes/status-badge";
import { ActivityBadges } from "@/components/clientes/activity-badges";
import { PaymentHistory } from "@/components/clientes/payment-history";
import { MarkPaidButton } from "@/components/clientes/mark-paid-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WhatsappButtons } from "@/components/conversaciones/whatsapp-buttons";
import type { Member, PaymentHistoryEntry } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (!memberData) notFound();
  const member = memberData as Member;

  const { data: paymentsData } = await supabase
    .from("payment_history")
    .select("*")
    .eq("member_id", id)
    .order("paid_at", { ascending: false });

  const payments = (paymentsData ?? []) as PaymentHistoryEntry[];

  const fullName = `${member.first_name} ${member.last_name}`;

  return (
    <div className="flex flex-col">
      <Header title={fullName} />
      <div className="p-4 space-y-4 max-w-4xl md:p-6 md:space-y-6">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-zinc-300">
              {member.first_name[0]}{member.last_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <StatusBadge status={member.status} inactiveSince={member.inactive_since} />
                <ActivityBadges activities={member.activities ?? []} size="sm" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <WhatsappButtons
              member={{
                id: member.id,
                first_name: member.first_name,
                last_name: member.last_name,
                whatsapp: member.whatsapp ?? null,
                due_date: member.due_date,
                status: member.status,
              }}
            />
            {member.status !== "al_dia" && (
              <MarkPaidButton
                memberId={member.id}
                monthlyFee={member.monthly_fee}
              />
            )}
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Link href={`/dashboard/clientes/${member.id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Datos del miembro */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {member.member_number != null && (
            <InfoCard
              icon={<Hash className="h-4 w-4" />}
              label="Nº Socio"
              value={String(member.member_number)}
            />
          )}
          {member.age && (
            <InfoCard
              icon={<User className="h-4 w-4" />}
              label="Edad"
              value={`${member.age} años`}
            />
          )}
          {member.whatsapp && (
            <InfoCard
              icon={<Phone className="h-4 w-4" />}
              label="WhatsApp"
              value={member.whatsapp}
            />
          )}
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Inicio"
            value={new Date(member.start_date).toLocaleDateString("es-AR")}
          />
          <InfoCard
            icon={<Clock className="h-4 w-4" />}
            label="Meses asistidos"
            value={`${member.months_attended} mes${member.months_attended !== 1 ? "es" : ""}`}
          />
          <InfoCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Cuota"
            value={`$${member.monthly_fee.toLocaleString("es-AR")}`}
          />
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Vencimiento"
            value={new Date(member.due_date).toLocaleDateString("es-AR")}
          />
        </div>

        {/* Observaciones */}
        {member.notes && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Observaciones
            </p>
            <p className="text-sm text-zinc-300">{member.notes}</p>
          </div>
        )}

        <Separator className="bg-zinc-800" />

        {/* Historial de pagos */}
        <div className="space-y-3">
          <h3 className="font-semibold text-zinc-100">Historial de pagos</h3>
          <PaymentHistory payments={payments} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <span className="mt-0.5 text-yellow-500">{icon}</span>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-200">{value}</p>
      </div>
    </div>
  );
}
