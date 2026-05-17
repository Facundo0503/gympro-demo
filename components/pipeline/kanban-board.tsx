"use client";

import { useState, useTransition, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { MemberKanbanCard } from "@/components/pipeline/member-kanban-card";
import { MemberDetailModal } from "@/components/pipeline/member-detail-modal";
import { updateMemberStatus } from "@/app/dashboard/pipeline/actions";
import type { Member, MemberStatus } from "@/lib/types";

interface KanbanBoardProps {
  members: Member[];
}

const COLUMNS: {
  id: MemberStatus;
  label: string;
  colorClass: string;
  countBg: string;
  dropBg: string;
  borderColor: string;
}[] = [
  {
    id: "al_dia",
    label: "Al día",
    colorClass: "text-emerald-400",
    countBg: "bg-emerald-500/15 text-emerald-400",
    dropBg: "bg-emerald-500/5",
    borderColor: "border-emerald-500/20",
  },
  {
    id: "proximo_vencer",
    label: "Próx. a vencer",
    colorClass: "text-amber-400",
    countBg: "bg-amber-500/15 text-amber-400",
    dropBg: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
  },
  {
    id: "vencido",
    label: "Vencidos",
    colorClass: "text-red-400",
    countBg: "bg-red-500/15 text-red-400",
    dropBg: "bg-red-500/5",
    borderColor: "border-red-500/20",
  },
  {
    id: "inactivo",
    label: "Inactivos",
    colorClass: "text-zinc-400",
    countBg: "bg-zinc-700/40 text-zinc-400",
    dropBg: "bg-zinc-800/30",
    borderColor: "border-zinc-700/40",
  },
];

function groupByStatus(members: Member[]): Record<MemberStatus, Member[]> {
  const groups: Record<MemberStatus, Member[]> = {
    al_dia: [],
    proximo_vencer: [],
    vencido: [],
    inactivo: [],
  };
  for (const m of members) {
    groups[m.status].push(m);
  }
  return groups;
}

export function KanbanBoard({ members }: KanbanBoardProps) {
  const [localMembers, setLocalMembers] = useState<Member[]>(members);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Sincronizar estado local cuando el servidor envía datos actualizados
  // (por ej. después de "Marcar como pagado" u otras mutaciones externas)
  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  const grouped = groupByStatus(localMembers);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as MemberStatus;
    const member = localMembers.find((m) => m.id === draggableId);
    if (!member || member.status === newStatus) return;

    // Optimistic update
    setLocalMembers((prev) =>
      prev.map((m) => (m.id === draggableId ? { ...m, status: newStatus } : m))
    );

    // Persist in DB
    startTransition(async () => {
      const res = await updateMemberStatus(draggableId, newStatus);
      if (res?.error) {
        // Revert on error
        setLocalMembers((prev) =>
          prev.map((m) => (m.id === draggableId ? { ...m, status: member.status } : m))
        );
        console.error("[pipeline] updateMemberStatus error:", res.error);
      }
    });
  }

  function openModal(member: Member) {
    setSelectedMember(member);
    setModalOpen(true);
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* overflow-x-auto para scroll horizontal en mobile */}
        <div className="overflow-x-auto pb-1" style={{ height: "calc(100vh - 160px)" }}>
          <div className="flex gap-3 h-full" style={{ minWidth: "min(900px, 220vw)" }}>
          {COLUMNS.map((col) => {
            const colMembers = grouped[col.id];
            return (
              <div
                key={col.id}
                className={`flex min-w-[76vw] md:min-w-0 md:flex-1 flex-col rounded-xl border ${col.borderColor} bg-zinc-900/60`}
              >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3 bg-zinc-900 rounded-t-xl">
                  <span className={`text-sm font-semibold ${col.colorClass}`}>
                    {col.label}
                  </span>
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${col.countBg}`}>
                    {colMembers.length}
                  </span>
                </div>

                {/* Droppable — overflow-y-auto here, NOT on parent column */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto space-y-2 p-2 transition-colors ${
                        snapshot.isDraggingOver ? col.dropBg : ""
                      }`}
                    >
                      {colMembers.map((member, idx) => (
                        <Draggable
                          key={member.id}
                          draggableId={member.id}
                          index={idx}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={{
                                ...dragProvided.draggableProps.style,
                                opacity: dragSnapshot.isDragging ? 0.9 : 1,
                              }}
                            >
                              <MemberKanbanCard
                                member={member}
                                onClick={() => openModal(member)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {colMembers.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-xs text-zinc-700">Sin miembros</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          </div>
        </div>
      </DragDropContext>

      <MemberDetailModal
        member={selectedMember}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
