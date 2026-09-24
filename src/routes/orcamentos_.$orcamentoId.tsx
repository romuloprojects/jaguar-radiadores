import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CarFront, CheckCircle2, FileText, Printer, UserRound, WalletCards } from "lucide-react";
import { InternalPage, SectionPanel, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { quotes, customers } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/orcamentos_/$orcamentoId")({ component: QuoteDetailPage });

function QuoteDetailPage() {
  const { orcamentoId } = Route.useParams();
  const quote = quotes.find((q) => q.id === orcamentoId) ?? quotes[0];
  const customer = customers.find((c) => c.id === quote.customerId);
  return (
    <InternalPage>
      <PageHeader eyebrow="ORÇAMENTO / ATENDIMENTO" title={quote.number} subtitle={`Emitido em ${quote.date} · ${quote.customerName}`} icon={FileText} right={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/orcamentos"><ArrowLeft className="mr-2 h-4 w-4"/>Voltar</Link></Button><Button variant="outline"><Printer className="mr-2 h-4 w-4"/>Gerar PDF</Button></div>} />
      <div className="flex flex-wrap gap-2"><StatusPill label={quote.status} tone={quote.status === "Pago" ? "positive" : quote.status === "Em execução" ? "info" : "warning"}/>{quote.approvalMethod && <StatusPill label={`Aprovação: ${quote.approvalMethod}`} tone="neutral"/>}</div>
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionPanel title="Cliente" icon={UserRound}><div className="detail-grid"><div><span>Nome / Razão Social</span><b>{quote.customerName}</b></div><div><span>CPF / CNPJ</span><b>{customer?.document ?? "—"}</b></div><div><span>Telefone</span><b>{customer?.phone ?? "—"}</b></div><div><span>Responsável</span><b>{customer?.responsible ?? "—"}</b></div><div className="sm:col-span-2"><span>Endereço</span><b>{customer ? `${customer.address}, ${customer.city} - ${customer.state}` : "—"}</b></div></div></SectionPanel>
        <SectionPanel title="Veículo / equipamento" icon={CarFront}><div className="detail-grid"><div><span>Identificação</span><b>{quote.vehicle}</b></div><div><span>Placa</span><b>{quote.plate ?? "Não informado"}</b></div><div className="sm:col-span-2"><span>Observações</span><b>{quote.notes ?? "Sem observações"}</b></div></div></SectionPanel>
      </div>
      <SectionPanel title="Peças e serviços" icon={CheckCircle2}>
        <div className="data-table-wrap border-0"><table className="data-table min-w-[700px]"><thead><tr><th>Tipo</th><th>Descrição</th><th>Qtd.</th><th>Valor unit.</th><th>Total</th></tr></thead><tbody>{quote.items.length ? quote.items.map((item) => <tr key={item.id}><td><StatusPill label={item.type} tone={item.type === "Peça" ? "warning" : "info"}/></td><td>{item.description}</td><td>{item.quantity}</td><td>{brl(item.unitPrice)}</td><td className="font-semibold">{brl(item.quantity * item.unitPrice)}</td></tr>) : <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Itens resumidos no mock desta versão.</td></tr>}</tbody></table></div>
        <div className="mt-4 flex justify-end"><div className="quote-total-box"><span>Total geral</span><b>{brl(quote.total)}</b></div></div>
      </SectionPanel>
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionPanel title="Pagamento" icon={WalletCards}><div className="detail-grid"><div><span>Forma de pagamento</span><b>{quote.paymentMethod}</b></div><div><span>Status financeiro</span><b>{quote.status === "Pago" ? "Recebido" : "Pendente / conforme condição"}</b></div></div></SectionPanel>
        <SectionPanel title="Aprovação e assinatura" icon={CheckCircle2}><div className="detail-grid"><div><span>Forma de aprovação</span><b>{quote.approvalMethod ?? "Ainda não registrada"}</b></div><div><span>Assinatura</span><b>{quote.approvalMethod === "Assinatura" ? "Registrada" : "Opcional"}</b></div></div></SectionPanel>
      </div>
    </InternalPage>
  );
}
