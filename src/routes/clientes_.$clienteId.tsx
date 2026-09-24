import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CarFront, FileText, MapPin, Phone, UserRound, WalletCards } from "lucide-react";
import { InternalPage, SectionPanel, StatCard, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { customers, quotes } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/clientes_/$clienteId")({ component: CustomerDetailPage });

function CustomerDetailPage() {
  const { clienteId } = Route.useParams();
  const customer = customers.find((c) => c.id === clienteId) ?? customers[0];
  const customerQuotes = quotes.filter((q) => q.customerId === customer.id);
  return (
    <InternalPage>
      <PageHeader eyebrow={customer.kind === "PJ" ? "PESSOA JURÍDICA" : "PESSOA FÍSICA"} title={customer.name} subtitle={`${customer.document} · ${customer.phone}`} icon={UserRound} right={<Button asChild variant="outline"><Link to="/clientes"><ArrowLeft className="mr-2 h-4 w-4"/>Voltar</Link></Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturado no histórico" value={brl(customer.totalBilled)} icon={WalletCards} accent="green" />
        <StatCard label="Saldo em aberto" value={brl(customer.openBalance)} icon={WalletCards} accent={customer.openBalance ? "red" : "green"} />
        <StatCard label="Veículos / equipamentos" value={customer.vehicles.length} icon={CarFront} accent="blue" />
        <StatCard label="Último atendimento" value={customer.lastService} icon={FileText} accent="orange" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionPanel title="Dados cadastrais" icon={UserRound}>
          <div className="detail-grid"><div><span>Cliente</span><b>{customer.name}</b></div><div><span>Documento</span><b>{customer.document}</b></div><div><span>Telefone</span><b>{customer.phone}</b></div><div><span>Responsável</span><b>{customer.responsible ?? "—"}</b></div><div className="sm:col-span-2"><span>Endereço</span><b>{customer.address}, {customer.city} - {customer.state}</b></div></div>
        </SectionPanel>
        <SectionPanel title="Veículos / equipamentos" icon={CarFront}>
          <div className="space-y-2">{customer.vehicles.map((v) => <div key={v.id} className="record-card"><div><b>{[v.brand,v.model].filter(Boolean).join(" ") || v.type}</b><span>{v.plate ? `Placa ${v.plate} · ` : ""}{v.year ?? ""}</span></div><div className="text-right"><StatusPill label={v.type} tone="info"/><small>{v.application}</small></div></div>)}</div>
        </SectionPanel>
      </div>
      <SectionPanel title="Histórico de orçamentos e atendimentos" icon={FileText} right={<Button asChild size="sm"><Link to="/orcamentos/novo">Novo orçamento</Link></Button>}>
        <div className="data-table-wrap border-0"><table className="data-table min-w-[700px]"><thead><tr><th>Nº</th><th>Data</th><th>Veículo</th><th>Pagamento</th><th>Valor</th><th>Status</th></tr></thead><tbody>{customerQuotes.length ? customerQuotes.map((q) => <tr key={q.id}><td><Link to="/orcamentos/$orcamentoId" params={{ orcamentoId: q.id }} className="font-semibold hover:text-primary">{q.number}</Link></td><td>{q.date}</td><td>{q.vehicle}</td><td>{q.paymentMethod}</td><td>{brl(q.total)}</td><td><StatusPill label={q.status} tone={q.status === "Pago" ? "positive" : q.status === "Em execução" ? "info" : "warning"}/></td></tr>) : <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum orçamento encontrado.</td></tr>}</tbody></table></div>
      </SectionPanel>
    </InternalPage>
  );
}
