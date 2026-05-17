"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markAsPaid } from "@/app/dashboard/clientes/actions";

interface MarkPaidButtonProps {
  memberId: string;
  monthlyFee: number;
}

export function MarkPaidButton({ memberId, monthlyFee }: MarkPaidButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(monthlyFee.toString());
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Ingresá un monto válido.");
      return;
    }

    startTransition(async () => {
      const result = await markAsPaid(memberId, parsed);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pago registrado correctamente.");
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Marcar como pagado
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Confirmá el monto abonado. Esto actualizará el vencimiento +30
              días y marcará al cliente como al día.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="pay-amount" className="text-zinc-300">
              Monto ($)
            </Label>
            <Input
              id="pay-amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
