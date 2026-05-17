"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Trash2, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/clientes/status-badge";
import { ActivityBadges } from "@/components/clientes/activity-badges";
import { deleteMember } from "@/app/dashboard/clientes/actions";
import type { Member, MemberStatus } from "@/lib/types";

interface MembersTableProps {
  members: Member[];
}

const statusFilters: { label: string; value: MemberStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Al día", value: "al_dia" },
  { label: "Próximo a vencer", value: "proximo_vencer" },
  { label: "Vencido", value: "vencido" },
  { label: "Inactivo", value: "inactivo" },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function MembersTable({ members }: MembersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "gimnasio" | "muay_thai" | "zumba" | "funcional">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(q) || (m.whatsapp ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesActivity =
      activityFilter === "all" || (m.activities ?? []).includes(activityFilter);
    return matchesSearch && matchesStatus && matchesActivity;
  });

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteMember(deleteId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cliente eliminado.");
      }
      setDeleteId(null);
    });
  }

  const memberToDelete = members.find((m) => m.id === deleteId);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Buscar por nombre o WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-zinc-700 bg-zinc-800 pl-9 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === value
                ? "bg-yellow-500 text-black"
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtros de actividad */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {([
          { val: "all", label: "Todas", activeClass: "bg-zinc-600 text-white border border-zinc-500" },
          { val: "gimnasio", label: "Gimnasio", activeClass: "bg-blue-500/30 text-blue-300 border border-blue-500" },
          { val: "muay_thai", label: "Muay Thai", activeClass: "bg-red-500/30 text-red-300 border border-red-500" },
          { val: "zumba", label: "Zumba", activeClass: "bg-purple-500/30 text-purple-300 border border-purple-500" },
          { val: "funcional", label: "Funcional", activeClass: "bg-green-500/30 text-green-300 border border-green-500" },
        ] as const).map(({ val, label, activeClass }) => (
          <button
            key={val}
            onClick={() => setActivityFilter(val)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              activityFilter === val
                ? activeClass
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center text-zinc-500">
          {members.length === 0
            ? "No hay clientes registrados. Agregá el primero."
            : "No hay resultados para esta búsqueda."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-2 py-3 text-left font-medium text-zinc-400 md:px-4">
                  Nombre
                </th>
                <th className="px-2 py-3 text-center font-medium text-zinc-400 md:px-4 md:text-left">
                  Estado
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-zinc-400 md:table-cell">
                  Vencimiento
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-zinc-400 lg:table-cell">
                  Cuota
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-zinc-400 lg:table-cell">
                  WhatsApp
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="transition-colors hover:bg-zinc-800/50"
                >
                  <td className="px-2 py-3 align-middle md:px-4">
                    <Link
                      href={`/dashboard/clientes/${m.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                        {getInitials(m.first_name, m.last_name)}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-zinc-100">
                          {m.first_name} {m.last_name}
                          {m.member_number != null && (
                            <span className="ml-1.5 text-xs font-normal text-zinc-500">
                              - {m.member_number}
                            </span>
                          )}
                        </span>
                        <ActivityBadges activities={m.activities ?? []} />
                      </div>
                    </Link>
                  </td>
                  <td className="px-2 py-3 align-middle md:px-4">
                    <div className="flex justify-center md:justify-start">
                      <StatusBadge status={m.status} inactiveSince={m.inactive_since} />
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-300 md:table-cell">
                    {new Date(m.due_date).toLocaleDateString("es-AR")}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-300 lg:table-cell">
                    ${m.monthly_fee.toLocaleString("es-AR")}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-300 lg:table-cell">
                    {m.whatsapp ?? "—"}
                  </td>
                  <td className="px-2 py-3 align-middle md:px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/clientes/${m.id}`}
                        aria-label="Ver cliente"
                        className="hidden md:inline-flex"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          asChild
                        >
                          <span>
                            <Eye className="h-4 w-4" />
                          </span>
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/clientes/${m.id}/editar`}
                        aria-label="Editar cliente"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-yellow-400"
                          asChild
                        >
                          <span>
                            <Pencil className="h-4 w-4" />
                          </span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar cliente"
                        onClick={() => setDeleteId(m.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
            <DialogDescription className="text-zinc-400">
              ¿Confirmás que querés eliminar a{" "}
              <span className="font-semibold text-white">
                {memberToDelete?.first_name} {memberToDelete?.last_name}
              </span>
              ? Esta acción no se puede deshacer y eliminará todo su historial
              de pagos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              disabled={isPending}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
