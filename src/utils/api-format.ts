export function asNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function datePt(value?: string | null, fallback = "—") {
  if (!value) return fallback;
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function dateTimePt(value?: string | null, fallback = "—") {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export function quoteStatusLabel(status?: string | null) {
  switch (status) {
    case "in_progress": return "Em andamento";
    case "completed": return "Concluído";
    case "cancelled": return "Cancelado";
    default: return status || "—";
  }
}

export function paymentStatusLabel(status?: string | null) {
  switch (status) {
    case "open": return "Em aberto";
    case "partial": return "Parcial";
    case "paid": return "Pago";
    case "overdue": return "Vencido";
    case "cancelled": return "Cancelado";
    case "none": return "Sem cobrança";
    default: return status || "—";
  }
}

export function paymentMethodLabel(code?: string | null, methods?: Array<{ code: string; name: string }>) {
  if (!code) return "—";
  return methods?.find((m) => m.code === code)?.name ?? ({
    pix: "PIX",
    cash: "Dinheiro",
    debit_card: "Cartão de débito",
    credit_card: "Cartão de crédito",
    bank_transfer: "Transferência",
    boleto: "Boleto",
    credit_agreement: "A prazo / combinado",
    other: "Outro",
  } as Record<string,string>)[code] ?? code;
}

export function authorizationLabel(code?: string | null) {
  return ({ verbal: "Verbal", whatsapp: "WhatsApp", signature: "Assinatura", other: "Outro" } as Record<string,string>)[code || ""] ?? code ?? "—";
}

export function statusToneForQuote(status?: string | null) {
  if (status === "completed") return "positive" as const;
  if (status === "cancelled") return "danger" as const;
  return "info" as const;
}

export function statusToneForPayment(status?: string | null) {
  if (status === "paid") return "positive" as const;
  if (status === "overdue") return "danger" as const;
  if (status === "partial") return "warning" as const;
  return "info" as const;
}
