export type ApiOk = { ok: true };

export type ApiUser = {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  role: "ADMIN" | "OPERATOR" | "admin" | "operator" | string;
  active?: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthPayload = ApiOk & {
  expiresAt: string | null;
  mustChangePassword: boolean;
  user: ApiUser;
};

export type VehicleApi = {
  id: string;
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  type?: string | null;
  notes?: string | null;
};

export type ClientListItemApi = {
  id: string;
  kind: "PF" | "PJ";
  name: string;
  document?: string | null;
  registration?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  responsible?: string | null;
  totalBilled: number | string;
  openBalance: number | string;
  overdueBalance?: number | string;
  lastService?: string | null;
};

export type ClientDetailApi = ClientListItemApi & {
  legalName?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  vehicles: VehicleApi[];
  financial?: {
    openAmount?: number | string;
    overdueAmount?: number | string;
    nextDueDate?: string | null;
    lastPaymentDate?: string | null;
  };
  quotes?: Array<{
    id: string;
    number: string;
    date: string;
    status: string;
    total: number | string;
    paymentStatus?: string | null;
  }>;
};

export type SupplierListItemApi = {
  id: string;
  name: string;
  document?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  contact?: string | null;
  purchasesYtd: number | string;
  openBalance: number | string;
  lastPurchase?: string | null;
};

export type ProductApi = {
  id: string;
  imageUrl?: string | null;
  code?: string | null;
  description: string;
  brand?: string | null;
  category?: string | null;
  categoryId?: string | null;
  supplier?: string | null;
  supplierId?: string | null;
  unit?: string | null;
  current: number | string;
  reserved: number | string;
  available: number | string;
  minimum: number | string;
  unitCost: number | string;
  salePrice: number | string;
  status: "Normal" | "Baixo" | "Crítico" | string;
  statusCode?: string;
};

export type ServiceApi = {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  category?: string | null;
  defaultPrice: number | string;
  defaultCost?: number | string;
};

export type CatalogApi = ApiOk & {
  products: Array<{
    id: string;
    code?: string | null;
    description: string;
    brand?: string | null;
    available: number | string;
    unitCost: number | string;
    salePrice: number | string;
  }>;
  services: ServiceApi[];
  paymentMethods: Array<{ code: string; name: string }>;
};

export type QuoteListItemApi = {
  id: string;
  number: string;
  date: string;
  customerId: string;
  customerName: string;
  vehicle?: string | null;
  plate?: string | null;
  total: number | string;
  status: "in_progress" | "completed" | "cancelled" | string;
  paymentStatus?: "open" | "partial" | "paid" | "overdue" | string | null;
  paymentMethod?: string | null;
  authorizationMethod?: string | null;
};

export type QuoteDetailApi = {
  id: string;
  number: string;
  date: string;
  customerId: string;
  vehicleId?: string | null;
  customer: Record<string, any>;
  vehicle: Record<string, any>;
  status: string;
  issueReported?: string | null;
  diagnosis?: string | null;
  authorizationMethod?: string | null;
  authorizedAt?: string | null;
  partsSubtotal: number | string;
  servicesSubtotal: number | string;
  subtotal: number | string;
  discountType?: string | null;
  discountValue: number | string;
  discountAmount: number | string;
  total: number | string;
  paymentTerms?: Record<string, any>;
  notes?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  billedAt?: string | null;
  items: Array<{
    id: string;
    type: "Peça" | "Serviço";
    typeCode: "product" | "service";
    productId?: string | null;
    serviceId?: string | null;
    description: string;
    quantity: number | string;
    unitPrice: number | string;
    unitCost?: number | string | null;
    total: number | string;
    reserveStock?: boolean;
    stockAvailable?: number | string | null;
  }>;
  financial?: {
    receivableTotal?: number | string;
    paidTotal?: number | string;
    balance?: number | string;
    overdueInstallments?: number;
    paymentStatus?: string;
  };
  receivables?: Array<{
    id: string;
    number: number;
    count: number;
    dueDate: string;
    amount: number | string;
    paid: number | string;
    balance: number | string;
    status: string;
    methodCode?: string | null;
  }>;
};

export type PaymentRecordApi = {
  id: string;
  amount: number | string;
  date: string;
  methodCode?: string | null;
  reference?: string | null;
  notes?: string | null;
};

export type ReceivableApi = {
  id: string;
  customerId?: string | null;
  customer?: string | null;
  reference?: string | null;
  installment?: number;
  installmentCount?: number;
  dueDate: string;
  amount: number | string;
  paid: number | string;
  balance: number | string;
  status: string;
  isOverdue?: boolean;
  methodCode?: string | null;
  payments?: PaymentRecordApi[];
};

export type PayableApi = {
  id: string;
  supplierId?: string | null;
  supplier?: string | null;
  category?: string | null;
  categoryId?: string | null;
  reference?: string | null;
  installment?: number;
  installmentCount?: number;
  dueDate: string;
  amount: number | string;
  paid: number | string;
  balance: number | string;
  status: string;
  isOverdue?: boolean;
  methodCode?: string | null;
  payments?: PaymentRecordApi[];
};

export type CashFlowEntryApi = {
  id: string;
  date: string;
  description: string;
  category?: string | null;
  kind: "Entrada" | "Saída";
  amount: number | string;
  status: string;
  sourceType?: string | null;
  sourceId?: string | null;
};

export type DashboardOverviewApi = ApiOk & {
  period: { from: string; to: string };
  kpis: {
    billed: number | string;
    receivableOpen: number | string;
    receivableOverdue: number | string;
    payableOpen: number | string;
    cashBalance: number | string;
    quotesInProgress: number;
    completedInPeriod: number;
    criticalStock: number;
  };
  latestQuotes: QuoteListItemApi[];
  overdueReceivables: Array<{ id: string; customer: string; dueDate: string; balance: number | string; daysOverdue: number }>;
  criticalProducts: Array<{ id: string; code?: string; description: string; available: number | string; minimum: number | string; status: string }>;
};

export type SettingsApi = ApiOk & {
  company: Record<string, any>;
  paymentMethods: Array<{ code: string; name: string }>;
  financialCategories: Array<{ id: string; code: string; name: string; direction: string }>;
  productCategories: Array<{ id: string; name: string }>;
  serviceCategories: Array<{ id: string; name: string }>;
};

export type SupplierDetailApi = {
  id: string;
  name: string;
  legalName?: string | null;
  document?: string | null;
  registration?: string | null;
  contact?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  street?: string | null;
  number?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  products: Array<{ id: string; code?: string | null; description: string; lastUnitCost: number | string }>;
  purchases: Array<{ id: string; number: string; date: string; total: number | string; status: string }>;
};

export type StockMovementApi = {
  id: string;
  productId: string;
  product: string;
  code?: string | null;
  type: string;
  quantity: number | string;
  unitCost?: number | string | null;
  notes?: string | null;
  createdAt: string;
  purchaseId?: string | null;
  quoteId?: string | null;
};

export type PurchaseListItemApi = {
  id: string;
  number: string;
  date: string;
  supplierId: string;
  supplier: string;
  documentNumber?: string | null;
  status: "draft" | "confirmed" | "cancelled" | string;
  total: number | string;
};

export type PurchaseDetailApi = {
  id: string;
  number: string;
  supplierId: string;
  date: string;
  documentNumber?: string | null;
  status: string;
  subtotal: number | string;
  discountAmount: number | string;
  freightAmount: number | string;
  otherCostsAmount: number | string;
  total: number | string;
  paymentTerms?: Record<string, any>;
  notes?: string | null;
  items: Array<{ id: string; productId: string; description: string; quantity: number | string; unitCost: number | string; total: number | string }>;
  payables: Array<{ id: string; number: number; dueDate: string; amount: number | string; paid: number | string; balance: number | string; status: string }>;
};

export type AnnualReportApi = ApiOk & {
  year: number;
  months: Array<{ month: number; current: number | string; previous: number | string }>;
  totals: { current: number | string; previous: number | string };
};

export type CostsReportApi = ApiOk & {
  from: string;
  to: string;
  billed: number | string;
  partsCost: number | string;
  operatingExpenses: number | string;
  purchasesPaid: number | string;
  byCategory: Array<{ category: string; amount: number | string }>;
};

export type FinanceReportApi = ApiOk & {
  from: string;
  to: string;
  inflow: number | string;
  outflow: number | string;
  receivableOpen: number | string;
  receivableOverdue: number | string;
  payableOpen: number | string;
  payableOverdue: number | string;
  daily: Array<{ date: string; inflow: number | string; outflow: number | string; net: number | string }>;
};

export type StockReportApi = ApiOk & {
  physicalValue: number | string;
  availableValue: number | string;
  criticalCount: number;
  lowCount: number;
  items: Array<{
    id: string;
    code?: string | null;
    description: string;
    physical: number | string;
    reserved: number | string;
    available: number | string;
    averageCost: number | string;
    stockValue: number | string;
    status: string;
  }>;
};

export type ReportPeriodItemApi = {
  key: string;
  year: number;
  month: number;
  from: string;
  to: string;
  isCurrent: boolean;
};

export type ReportPeriodsApi = ApiOk & {
  months: ReportPeriodItemApi[];
  years: number[];
  generatedAt?: string;
};

export type ReportSnapshotApi = ApiOk & {
  from: string;
  to: string;
  receivableSummary: {
    open: number | string;
    overdue: number | string;
    paidInPeriod: number | string;
    customersOverdue: number;
  };
  payableSummary: {
    open: number | string;
    overdue: number | string;
    paidInPeriod: number | string;
  };
  receivables: ReceivableApi[];
  payables: PayableApi[];
  stock: Omit<StockReportApi, "ok">;
  generatedAt?: string;
};
