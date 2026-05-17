"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  Product,
  ProductSale,
  Expense,
  GestionStats,
  MonthlyGestionData,
  TopProduct,
} from "@/lib/types";

const REVALIDATE_PATH = "/dashboard/gastos";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// ============================================================
// PRODUCTOS
// ============================================================

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) return [];
  return data as Product[];
}

export async function createProduct(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const sale_price_raw = formData.get("sale_price") as string;
  const purchase_price_raw = formData.get("purchase_price") as string;
  const stock_raw = formData.get("stock_quantity") as string;
  const unit = (formData.get("unit") as string) || "unidad";
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !category || !sale_price_raw) {
    return { error: "Nombre, categoría y precio de venta son requeridos." };
  }

  const sale_price = parseFloat(sale_price_raw);
  const purchase_price = parseFloat(purchase_price_raw || "0");
  const stock_quantity = parseInt(stock_raw || "0", 10);

  if (isNaN(sale_price) || sale_price < 0) {
    return { error: "Precio de venta inválido." };
  }

  const { error } = await supabase.from("products").insert({
    name,
    description,
    category,
    sale_price,
    purchase_price,
    stock_quantity,
    unit,
  });

  if (error) return { error: error.message };

  revalidatePath(REVALIDATE_PATH);
  return {};
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const sale_price_raw = formData.get("sale_price") as string;
  const purchase_price_raw = formData.get("purchase_price") as string;
  const stock_raw = formData.get("stock_quantity") as string;
  const unit = (formData.get("unit") as string) || "unidad";
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !category || !sale_price_raw) {
    return { error: "Nombre, categoría y precio de venta son requeridos." };
  }

  const sale_price = parseFloat(sale_price_raw);
  const purchase_price = parseFloat(purchase_price_raw || "0");
  const stock_quantity = parseInt(stock_raw || "0", 10);

  if (isNaN(sale_price) || sale_price < 0) {
    return { error: "Precio de venta inválido." };
  }

  const { error } = await supabase
    .from("products")
    .update({ name, description, category, sale_price, purchase_price, stock_quantity, unit })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(REVALIDATE_PATH);
  return {};
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "No se puede eliminar el producto porque tiene ventas registradas." };
    }
    return { error: error.message };
  }

  revalidatePath(REVALIDATE_PATH);
  return {};
}

// ============================================================
// VENTAS
// ============================================================

export async function getProductSales(limit = 50): Promise<ProductSale[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("product_sales")
    .select("*, product:products(name, category, unit)")
    .order("sold_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as unknown as ProductSale[];
}

export async function recordSale(
  productId: string,
  quantity: number,
  unitPrice: number,
  paymentMethod: "efectivo" | "transferencia",
  notes?: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validar stock suficiente antes de insertar
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("stock_quantity, name")
    .eq("id", productId)
    .single();

  if (fetchError || !product) {
    return { error: "Producto no encontrado." };
  }

  if (product.stock_quantity < quantity) {
    return {
      error: `Stock insuficiente. Solo hay ${product.stock_quantity} unidad(es) de ${product.name}.`,
    };
  }

  const total_amount = quantity * unitPrice;

  const { error } = await supabase.from("product_sales").insert({
    product_id: productId,
    quantity,
    unit_price: unitPrice,
    total_amount,
    payment_method: paymentMethod,
    notes: notes?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath(REVALIDATE_PATH);
  return {};
}

export async function deleteSale(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener la venta antes de borrarla para revertir el stock
  const { data: sale, error: fetchError } = await supabase
    .from("product_sales")
    .select("product_id, quantity")
    .eq("id", id)
    .single();

  if (fetchError || !sale) return { error: "Venta no encontrada." };

  const { error: deleteError } = await supabase
    .from("product_sales")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  // Revertir stock del producto
  const { error: stockError } = await supabase.rpc("increment_product_stock", {
    p_product_id: sale.product_id,
    p_quantity: sale.quantity,
  });

  // Si el RPC no existe, actualizar directamente con una raw query via select + update
  if (stockError) {
    await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", sale.product_id)
      .single()
      .then(async ({ data }) => {
        if (data) {
          await supabase
            .from("products")
            .update({ stock_quantity: data.stock_quantity + sale.quantity })
            .eq("id", sale.product_id);
        }
      });
  }

  revalidatePath(REVALIDATE_PATH);
  return {};
}

// ============================================================
// GASTOS
// ============================================================

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("type", "gasto")
    .order("expense_date", { ascending: false });

  if (error) return [];
  return data as Expense[];
}

export async function getIncomes(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("type", "ingreso")
    .order("expense_date", { ascending: false });

  if (error) return [];
  return data as Expense[];
}

export async function createExpense(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const type = (formData.get("type") as string) || "gasto";
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string)?.trim();
  const amount_raw = formData.get("amount") as string;
  const expense_date = formData.get("expense_date") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!category || !description || !amount_raw || !expense_date) {
    return { error: "Categoría, descripción, monto y fecha son requeridos." };
  }

  if (!["gasto", "ingreso"].includes(type)) {
    return { error: "Tipo inválido." };
  }

  const amount = parseFloat(amount_raw);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Monto inválido." };
  }

  const { error } = await supabase.from("expenses").insert({
    type,
    category,
    description,
    amount,
    expense_date,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath(REVALIDATE_PATH);
  return {};
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(REVALIDATE_PATH);
  return {};
}

// ============================================================
// ESTADÍSTICAS
// ============================================================

export async function getGestionStats(): Promise<GestionStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startDate = new Date(currentYear, currentMonth - 11, 1);
  const startISO = startDate.toISOString();
  const endISO = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).toISOString();

  const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString();
  const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).toISOString();

  const [
    membershipPaymentsResult,
    productSalesResult,
    expensesResult,
    currentMembershipResult,
    currentProductSalesResult,
    currentExpensesResult,
    topProductsResult,
    lowStockResult,
    inventoryValueResult,
  ] = await Promise.all([
    // Cuotas últimos 12 meses
    supabase.from("payment_history").select("amount, paid_at").gte("paid_at", startISO).lte("paid_at", endISO),
    // Ventas de productos últimos 12 meses
    supabase.from("product_sales").select("total_amount, sold_at").gte("sold_at", startISO).lte("sold_at", endISO),
    // Gastos (type=gasto) últimos 12 meses
    supabase.from("expenses").select("amount, expense_date, type").gte("expense_date", startDate.toISOString().split("T")[0]).lte("expense_date", now.toISOString().split("T")[0]),
    // Cuotas mes actual
    supabase.from("payment_history").select("amount").gte("paid_at", currentMonthStart).lte("paid_at", currentMonthEnd),
    // Ventas mes actual
    supabase.from("product_sales").select("total_amount").gte("sold_at", currentMonthStart).lte("sold_at", currentMonthEnd),
    // Gastos mes actual (type=gasto)
    supabase.from("expenses").select("amount, type").gte("expense_date", new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]).lte("expense_date", now.toISOString().split("T")[0]),
    // Top 5 productos
    supabase.from("product_sales").select("product_id, quantity, total_amount, product:products(name)"),
    // Productos con stock bajo (<= 5)
    supabase.from("products").select("*").lte("stock_quantity", 5).order("stock_quantity"),
    // Valor total del inventario
    supabase.from("products").select("stock_quantity, purchase_price"),
  ]);

  // KPIs mes actual
  const thisMonthMembershipRevenue = (currentMembershipResult.data ?? []).reduce(
    (sum, p) => sum + Number(p.amount), 0
  );
  const thisMonthProductRevenue = (currentProductSalesResult.data ?? []).reduce(
    (sum, s) => sum + Number(s.total_amount), 0
  );
  const thisMonthExpenses = (currentExpensesResult.data ?? []).reduce(
    (sum, e) => (e.type === "gasto" ? sum + Number(e.amount) : sum), 0
  );
  const thisMonthOtherIncome = (currentExpensesResult.data ?? []).reduce(
    (sum, e) => (e.type === "ingreso" ? sum + Number(e.amount) : sum), 0
  );
  const thisMonthNetProfit =
    thisMonthMembershipRevenue + thisMonthProductRevenue + thisMonthOtherIncome - thisMonthExpenses;

  // Agregación mensual
  const membershipByMonth: Record<string, number> = {};
  for (const p of membershipPaymentsResult.data ?? []) {
    const d = new Date(p.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    membershipByMonth[key] = (membershipByMonth[key] ?? 0) + Number(p.amount);
  }

  const productByMonth: Record<string, number> = {};
  for (const s of productSalesResult.data ?? []) {
    const d = new Date(s.sold_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    productByMonth[key] = (productByMonth[key] ?? 0) + Number(s.total_amount);
  }

  const expensesByMonth: Record<string, number> = {};
  const otherIncomeByMonth: Record<string, number> = {};
  for (const e of expensesResult.data ?? []) {
    const d = new Date(e.expense_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (e.type === "ingreso") {
      otherIncomeByMonth[key] = (otherIncomeByMonth[key] ?? 0) + Number(e.amount);
    } else {
      expensesByMonth[key] = (expensesByMonth[key] ?? 0) + Number(e.amount);
    }
  }

  const monthlyData: MonthlyGestionData[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    const membershipRevenue = membershipByMonth[key] ?? 0;
    const productRevenue = productByMonth[key] ?? 0;
    const otherIncome = otherIncomeByMonth[key] ?? 0;
    const expenses = expensesByMonth[key] ?? 0;
    monthlyData.push({
      month: label,
      membershipRevenue,
      productRevenue,
      otherIncome,
      expenses,
      netProfit: membershipRevenue + productRevenue + otherIncome - expenses,
    });
  }

  // Top productos
  const productTotals: Record<string, { name: string; units: number; revenue: number }> = {};
  for (const s of topProductsResult.data ?? []) {
    const pid = s.product_id;
    const rawProduct = s.product as unknown as { name: string } | null;
    const name = rawProduct?.name ?? pid;
    if (!productTotals[pid]) productTotals[pid] = { name, units: 0, revenue: 0 };
    productTotals[pid].units += Number(s.quantity);
    productTotals[pid].revenue += Number(s.total_amount);
  }
  const topProducts: TopProduct[] = Object.entries(productTotals)
    .map(([product_id, { name, units, revenue }]) => ({
      product_id,
      name,
      total_units_sold: units,
      total_revenue: revenue,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);

  // Stock bajo
  const lowStockProducts = (lowStockResult.data ?? []) as Product[];

  // Valor total del inventario
  const totalInventoryValue = (inventoryValueResult.data ?? []).reduce(
    (sum, p) => sum + Number(p.stock_quantity) * Number(p.purchase_price),
    0
  );

  return {
    thisMonthMembershipRevenue,
    thisMonthProductRevenue,
    thisMonthOtherIncome,
    thisMonthExpenses,
    thisMonthNetProfit,
    monthlyData,
    topProducts,
    lowStockProducts,
    totalInventoryValue,
  };
}
