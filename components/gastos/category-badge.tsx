import type { ProductCategory, ExpenseCategory } from "@/lib/types";
import { PRODUCT_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/gastos/constants";

interface Props {
  category: ProductCategory | ExpenseCategory;
  type?: "product" | "expense";
}

export function CategoryBadge({ category, type = "product" }: Props) {
  const config =
    type === "expense"
      ? EXPENSE_CATEGORIES[category as ExpenseCategory]
      : PRODUCT_CATEGORIES[category as ProductCategory];

  if (!config) return null;

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${config.bgClass} ${config.textClass} ${config.ringClass}`}
    >
      {config.label}
    </span>
  );
}
