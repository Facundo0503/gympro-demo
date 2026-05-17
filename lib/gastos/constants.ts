import type { ProductCategory, ExpenseCategory } from "@/lib/types";

export type CategoryConfig = {
  label: string;
  bgClass: string;
  textClass: string;
  ringClass: string;
};

export const PRODUCT_CATEGORIES: Record<ProductCategory, CategoryConfig> = {
  proteina: {
    label: "Proteína",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-300",
    ringClass: "ring-blue-500/30",
  },
  creatina: {
    label: "Creatina",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-300",
    ringClass: "ring-purple-500/30",
  },
  barra: {
    label: "Barra",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-300",
    ringClass: "ring-amber-500/30",
  },
  merch: {
    label: "Merch",
    bgClass: "bg-pink-500/10",
    textClass: "text-pink-300",
    ringClass: "ring-pink-500/30",
  },
  otro: {
    label: "Otro",
    bgClass: "bg-zinc-500/10",
    textClass: "text-zinc-400",
    ringClass: "ring-zinc-500/30",
  },
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  alquiler: {
    label: "Alquiler",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-300",
    ringClass: "ring-blue-500/30",
  },
  servicios: {
    label: "Servicios",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-300",
    ringClass: "ring-purple-500/30",
  },
  equipamiento: {
    label: "Equipamiento",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-300",
    ringClass: "ring-orange-500/30",
  },
  sueldos: {
    label: "Sueldos",
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-300",
    ringClass: "ring-yellow-500/30",
  },
  marketing: {
    label: "Marketing",
    bgClass: "bg-green-500/10",
    textClass: "text-green-300",
    ringClass: "ring-green-500/30",
  },
  otro: {
    label: "Otro",
    bgClass: "bg-zinc-500/10",
    textClass: "text-zinc-400",
    ringClass: "ring-zinc-500/30",
  },
  clases: {
    label: "Clases",
    bgClass: "bg-teal-500/10",
    textClass: "text-teal-300",
    ringClass: "ring-teal-500/30",
  },
  ingresos_varios: {
    label: "Ingresos varios",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-300",
    ringClass: "ring-emerald-500/30",
  },
};

export const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "proteina", label: "Proteína" },
  { value: "creatina", label: "Creatina" },
  { value: "barra", label: "Barra energética" },
  { value: "merch", label: "Merch" },
  { value: "otro", label: "Otro" },
];

export const EXPENSE_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: "alquiler", label: "Alquiler" },
  { value: "servicios", label: "Servicios" },
  { value: "equipamiento", label: "Equipamiento" },
  { value: "sueldos", label: "Sueldos" },
  { value: "marketing", label: "Marketing" },
  { value: "otro", label: "Otro" },
];

export const INCOME_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: "clases", label: "Clases" },
  { value: "ingresos_varios", label: "Ingresos varios" },
];

export const UNIT_OPTIONS = [
  { value: "unidad", label: "Unidad" },
  { value: "kg", label: "Kg" },
  { value: "g", label: "Gramos" },
] as const;
