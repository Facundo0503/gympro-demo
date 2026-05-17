export type MemberStatus = "al_dia" | "proximo_vencer" | "vencido" | "inactivo";

export type ActivityType = "gimnasio" | "muay_thai" | "zumba" | "funcional";

export type Member = {
  id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  whatsapp: string | null;
  start_date: string;
  months_attended: number;
  monthly_fee: number;
  due_date: string;
  status: MemberStatus;
  activities: ActivityType[];
  notes: string | null;
  member_number: number | null;
  inactive_since: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentHistoryEntry = {
  id: string;
  member_id: string;
  amount: number;
  paid_at: string;
  notes: string | null;
  payment_method: "efectivo" | "transferencia" | null;
};

export type WhatsappMessage = {
  id: string;
  member_id: string;
  message_type: "reminder" | "overdue";
  message_body: string;
  sent_at: string;
};

// ============================================================
// Gestión de Gastos e Inventario
// ============================================================

export type ProductCategory = "proteina" | "creatina" | "barra" | "merch" | "otro";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  purchase_price: number;
  sale_price: number;
  stock_quantity: number;
  unit: "unidad" | "kg" | "g";
  created_at: string;
  updated_at: string;
};

export type ProductSale = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sold_at: string;
  payment_method: "efectivo" | "transferencia" | null;
  notes: string | null;
  created_at: string;
  product?: Pick<Product, "name" | "category" | "unit">;
};

export type ExpenseType = "gasto" | "ingreso";

export type ExpenseCategory =
  | "alquiler"
  | "servicios"
  | "equipamiento"
  | "sueldos"
  | "marketing"
  | "otro"
  | "clases"
  | "ingresos_varios";

export type Expense = {
  id: string;
  type: ExpenseType;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  notes: string | null;
  created_at: string;
};

export type MonthlyGestionData = {
  month: string;
  membershipRevenue: number;
  productRevenue: number;
  otherIncome: number;
  expenses: number;
  netProfit: number;
};

export type TopProduct = {
  product_id: string;
  name: string;
  total_units_sold: number;
  total_revenue: number;
};

export type GestionStats = {
  thisMonthMembershipRevenue: number;
  thisMonthProductRevenue: number;
  thisMonthOtherIncome: number;
  thisMonthExpenses: number;
  thisMonthNetProfit: number;
  monthlyData: MonthlyGestionData[];
  topProducts: TopProduct[];
  lowStockProducts: Product[];
  totalInventoryValue: number;
};
