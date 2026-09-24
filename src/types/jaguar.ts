export type CustomerKind = "PF" | "PJ";
export type QuoteStatus = "Rascunho" | "Aguardando" | "Aprovado" | "Em execução" | "Concluído" | "Pago" | "Recusado";
export type StockStatus = "Normal" | "Baixo" | "Crítico";
export type PayableStatus = "Aberto" | "Vencido" | "Pago";
export type ReceivableStatus = "Aberto" | "Vencido" | "Pago" | "Parcial";

export interface Vehicle {
  id: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  type: string;
  mileage?: string;
  application?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  kind: CustomerKind;
  name: string;
  document: string;
  registration?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  responsible?: string;
  vehicles: Vehicle[];
  totalBilled: number;
  openBalance: number;
  lastService: string;
}

export interface QuoteItem {
  id: string;
  type: "Serviço" | "Peça";
  description: string;
  quantity: number;
  unitPrice: number;
  stockAvailable?: number;
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  customerId: string;
  customerName: string;
  vehicle: string;
  plate?: string;
  items: QuoteItem[];
  total: number;
  status: QuoteStatus;
  paymentMethod: string;
  approvalMethod?: string;
  notes?: string;
}

export interface StockItem {
  id: string;
  code: string;
  description: string;
  category: string;
  supplier: string;
  current: number;
  reserved: number;
  minimum: number;
  unitCost: number;
  salePrice: number;
  status: StockStatus;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  phone: string;
  email?: string;
  city: string;
  contact: string;
  purchasesYtd: number;
  openBalance: number;
  lastPurchase: string;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  kind: "Entrada" | "Saída";
  amount: number;
  status: string;
}

export interface Receivable {
  id: string;
  customer: string;
  reference: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: ReceivableStatus;
}

export interface Payable {
  id: string;
  supplier: string;
  category: string;
  dueDate: string;
  amount: number;
  status: PayableStatus;
}
