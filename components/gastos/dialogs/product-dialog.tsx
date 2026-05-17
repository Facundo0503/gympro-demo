"use client";

import { useState, useTransition, useEffect } from "react";
import type { Product, ProductCategory } from "@/lib/types";
import { createProduct, updateProduct } from "@/app/dashboard/gastos/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORY_OPTIONS, UNIT_OPTIONS } from "@/lib/gastos/constants";

interface FormState {
  name: string;
  category: ProductCategory;
  unit: "unidad" | "kg" | "g";
  salePrice: string;
  cost: string;
  stock: string;
  description: string;
}

function defaultState(product?: Product): FormState {
  return {
    name: product?.name ?? "",
    category: product?.category ?? "otro",
    unit: product?.unit ?? "unidad",
    salePrice: product?.sale_price ? String(product.sale_price) : "",
    cost: product?.purchase_price ? String(product.purchase_price) : "",
    stock: String(product?.stock_quantity ?? "0"),
    description: product?.description ?? "",
  };
}

interface FormProps {
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
}

function ProductForm({ mode, product, onClose }: FormProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => defaultState(product));

  const salePriceNum = parseFloat(form.salePrice) || 0;
  const costNum = parseFloat(form.cost) || 0;
  const margin =
    salePriceNum > 0
      ? (((salePriceNum - costNum) / salePriceNum) * 100).toFixed(1)
      : null;

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("El nombre es requerido"); return; }
    if (!form.salePrice) { toast.error("El precio de venta es requerido"); return; }

    const fd = new FormData();
    fd.set("name", form.name.trim());
    fd.set("category", form.category);
    fd.set("unit", form.unit);
    fd.set("sale_price", form.salePrice);
    fd.set("purchase_price", form.cost || "0");
    fd.set("stock_quantity", form.stock || "0");
    fd.set("description", form.description.trim());

    startTransition(async () => {
      const result =
        mode === "edit" && product
          ? await updateProduct(product.id, fd)
          : await createProduct(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "edit" ? "Producto actualizado" : "Producto creado");
        onClose();
      }
    });
  }

  const inputCls = "border-zinc-700 bg-zinc-800 text-zinc-100 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Nombre *</Label>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ej: Whey Protein 1kg"
          required
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Categoría *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => set("category", v)}
          >
            <SelectTrigger className={inputCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
              {PRODUCT_CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-700">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Unidad</Label>
          <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
            <SelectTrigger className={inputCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
              {UNIT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-700">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Precio venta ($) *</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              $
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => set("salePrice", e.target.value)}
              className={`${inputCls} pl-7 font-mono tabular-nums`}
              placeholder="0"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Precio costo ($)</Label>
            {margin !== null && (
              <span className="text-[11px] text-zinc-500">Margen {margin}%</span>
            )}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              $
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) => set("cost", e.target.value)}
              className={`${inputCls} pl-7 font-mono tabular-nums`}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-300">Stock inicial</Label>
        <Input
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={(e) => set("stock", e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-300">Descripción</Label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Descripción opcional..."
          className={`${inputCls} resize-none`}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-yellow-500 text-black hover:bg-yellow-400"
        >
          {isPending ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}

interface Props {
  open: boolean;
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
}

export function ProductDialog({ open, mode, product, onClose }: Props) {
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (open) setFormKey((k) => k + 1);
  }, [open, product?.id]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {mode === "edit" ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm key={formKey} mode={mode} product={product} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
