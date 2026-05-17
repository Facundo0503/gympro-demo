"use client";

import { useTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMember, updateMember } from "@/app/dashboard/clientes/actions";
import { ActivityToggle } from "@/components/clientes/activity-toggle";
import type { Member } from "@/lib/types";

interface MemberFormProps {
  member?: Member;
}

export function MemberForm({ member }: MemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!member;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit
        ? await updateMember(member.id, formData)
        : await createMember(formData);

      if (result?.error) setError(result.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="first_name" className="text-zinc-300">
            Nombre *
          </Label>
          <Input
            id="first_name"
            name="first_name"
            required
            defaultValue={member?.first_name}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="last_name" className="text-zinc-300">
            Apellido *
          </Label>
          <Input
            id="last_name"
            name="last_name"
            required
            defaultValue={member?.last_name}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="age" className="text-zinc-300">
            Edad
          </Label>
          <Input
            id="age"
            name="age"
            type="number"
            min="1"
            max="120"
            defaultValue={member?.age ?? ""}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="text-zinc-300">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="+54 9 11 1234-5678"
            defaultValue={member?.whatsapp ?? ""}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="start_date" className="text-zinc-300">
            Fecha de inicio *
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={member?.start_date}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="monthly_fee" className="text-zinc-300">
            Valor de cuota ($) *
          </Label>
          <Input
            id="monthly_fee"
            name="monthly_fee"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue={member?.monthly_fee}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="due_date" className="text-zinc-300">
            Vencimiento de cuota *
          </Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            required
            defaultValue={member?.due_date}
            disabled={isPending}
            className="border-zinc-700 bg-zinc-800 text-white"
          />
        </div>

        <ActivityToggle defaultActivities={member?.activities ?? ["gimnasio"]} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-zinc-300">
          Observaciones
        </Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Notas adicionales sobre el cliente..."
          defaultValue={member?.notes ?? ""}
          disabled={isPending}
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 resize-none"
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => history.back()}
          disabled={isPending}
          className="text-zinc-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Actualizar cliente" : "Guardar cliente"}
        </Button>
      </div>
    </form>
  );
}
