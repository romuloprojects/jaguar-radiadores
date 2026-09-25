import { deleteJson, getJson, patchJson, postJson, queryString } from "@/services/apiClient";
import type {
  ApiOk,
  ApiUser,
  AuthPayload,
  CashFlowEntryApi,
  CatalogApi,
  ClientDetailApi,
  ClientListItemApi,
  DashboardOverviewApi,
  PayableApi,
  ProductApi,
  QuoteDetailApi,
  QuoteListItemApi,
  ReceivableApi,
  ServiceApi,
  SettingsApi,
  SupplierListItemApi,
  SupplierDetailApi,
  StockMovementApi,
  PurchaseListItemApi,
  PurchaseDetailApi,
  AnnualReportApi,
  CostsReportApi,
  FinanceReportApi,
  StockReportApi,
} from "@/types/api";

export const jaguarApi = {
  remove: (entity: string, id: string) => deleteJson<ApiOk>("entity-delete", { entity, id }),
  auth: {
    login: (username: string, password: string, remember: boolean) =>
      postJson<AuthPayload>("auth/login", { username, password, remember }),
    session: () => getJson<AuthPayload>("auth/session"),
    logout: () => postJson<ApiOk>("auth/logout"),
    changePassword: (currentPassword: string, newPassword: string) =>
      postJson<ApiOk>("auth/change-password", { currentPassword, newPassword }),
  },

  settings: {
    get: () => getJson<SettingsApi>("settings"),
    save: (payload: Record<string, unknown>) => patchJson<ApiOk & { company: Record<string, any> }>("settings", payload),
    users: () => getJson<ApiOk & { items: ApiUser[] }>("users"),
    createUser: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("user-create", payload),
    updateUser: (payload: Record<string, unknown>) => patchJson<ApiOk>("user-update", payload),
  },

  clients: {
    list: (params: { search?: string; limit?: number; offset?: number } = {}) =>
      getJson<ApiOk & { items: ClientListItemApi[]; total: number; limit: number; offset: number }>(`clients${queryString(params)}`),
    detail: (id: string) => getJson<ApiOk & { customer: ClientDetailApi }>(`client-detail${queryString({ id })}`),
    create: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("client-create", payload),
    update: (payload: Record<string, unknown>) => patchJson<ApiOk>("client-update", payload),
    createVehicle: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("vehicle-create", payload),
    updateVehicle: (payload: Record<string, unknown>) => patchJson<ApiOk>("vehicle-update", payload),
  },

  suppliers: {
    list: (params: { search?: string; limit?: number; offset?: number } = {}) =>
      getJson<ApiOk & { items: SupplierListItemApi[]; total: number }>(`suppliers${queryString(params)}`),
    detail: (id: string) => getJson<ApiOk & { supplier: SupplierDetailApi }>(`supplier-detail${queryString({ id })}`),
    create: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("supplier-create", payload),
    update: (payload: Record<string, unknown>) => patchJson<ApiOk>("supplier-update", payload),
  },

  catalog: {
    products: (params: { search?: string; category?: string; status?: string; limit?: number; offset?: number } = {}) =>
      getJson<ApiOk & { items: ProductApi[]; total: number }>(`products${queryString(params)}`),
    createProduct: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("product-create", payload),
    updateProduct: (payload: Record<string, unknown>) => patchJson<ApiOk>("product-update", payload),
    services: (search?: string) => getJson<ApiOk & { items: ServiceApi[] }>(`services${queryString({ search })}`),
    createService: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("service-create", payload),
    updateService: (payload: Record<string, unknown>) => patchJson<ApiOk>("service-update", payload),
    all: () => getJson<CatalogApi>("catalog"),
  },

  stock: {
    movements: (params: { productId?: string; limit?: number } = {}) =>
      getJson<ApiOk & { items: StockMovementApi[] }>(`stock/movements${queryString(params)}`),
    movement: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("stock/movement", payload),
  },

  purchases: {
    list: (params: { search?: string; status?: string; limit?: number } = {}) =>
      getJson<ApiOk & { items: PurchaseListItemApi[] }>(`purchases${queryString(params)}`),
    detail: (id: string) => getJson<ApiOk & { purchase: PurchaseDetailApi }>(`purchase-detail${queryString({ id })}`),
    create: (payload: Record<string, unknown>) => postJson<ApiOk & { purchase: PurchaseDetailApi }>("purchase-create", payload),
    update: (payload: Record<string, unknown>) => patchJson<ApiOk & { purchase: PurchaseDetailApi }>("purchase-update", payload),
    confirm: (id: string) => postJson<ApiOk>("purchase-confirm", { id }),
    cancel: (id: string) => postJson<ApiOk>("purchase-cancel", { id }),
  },

  quotes: {
    list: (params: { search?: string; status?: string; from?: string; to?: string; limit?: number; offset?: number } = {}) =>
      getJson<ApiOk & { items: QuoteListItemApi[]; total: number }>(`quotes${queryString(params)}`),
    detail: (id: string) => getJson<ApiOk & { quote: QuoteDetailApi }>(`quote-detail${queryString({ id })}`),
    create: (payload: Record<string, unknown>) => postJson<ApiOk & { quote: QuoteDetailApi }>("quote-create", payload),
    update: (payload: Record<string, unknown>) => patchJson<ApiOk & { quote: QuoteDetailApi }>("quote-update", payload),
    complete: (id: string) => postJson<ApiOk & { quote: QuoteDetailApi }>("quote-complete", { id }),
    cancel: (id: string) => postJson<ApiOk & { quote: QuoteDetailApi }>("quote-cancel", { id }),
    document: (id: string) => getJson<ApiOk & { document: Record<string, any> }>(`quote-document${queryString({ id })}`),
  },

  finance: {
    receivables: (params: { search?: string; status?: string; from?: string; to?: string; limit?: number } = {}) =>
      getJson<ApiOk & { items: ReceivableApi[]; summary: Record<string, number | string> }>(`finance/receivables${queryString(params)}`),
    receive: (payload: Record<string, unknown>) => postJson<ApiOk>("finance/receivable-payment", payload),
    payables: (params: { search?: string; status?: string; from?: string; to?: string; limit?: number } = {}) =>
      getJson<ApiOk & { items: PayableApi[]; summary: Record<string, number | string> }>(`finance/payables${queryString(params)}`),
    createPayable: (payload: Record<string, unknown>) => postJson<ApiOk & { ids: string[] }>("finance/payable-create", payload),
    pay: (payload: Record<string, unknown>) => postJson<ApiOk>("finance/payable-payment", payload),
    cashFlow: (params: { from?: string; to?: string } = {}) =>
      getJson<ApiOk & { from: string; to: string; currentBalance: number | string; actual: CashFlowEntryApi[]; projected: CashFlowEntryApi[] }>(`finance/cash-flow${queryString(params)}`),
    manualTransaction: (payload: Record<string, unknown>) => postJson<ApiOk & { id: string }>("finance/manual-transaction", payload),
  },

  dashboard: {
    overview: (params: { from?: string; to?: string } = {}) =>
      getJson<DashboardOverviewApi>(`dashboard/overview${queryString(params)}`),
  },

  reports: {
    annual: (year: number) => getJson<AnnualReportApi>(`reports/annual${queryString({ year })}`),
    costs: (params: { from?: string; to?: string } = {}) => getJson<CostsReportApi>(`reports/costs${queryString(params)}`),
    finance: (params: { from?: string; to?: string } = {}) => getJson<FinanceReportApi>(`reports/finance${queryString(params)}`),
    stock: () => getJson<StockReportApi>("reports/stock"),
  },

  health: () => getJson<ApiOk & Record<string, any>>("health"),
};
