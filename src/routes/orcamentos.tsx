import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar, InternalPage, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quotes } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/orcamentos")({ component: QuotesPage });

function tone(status: string) {
  if (["Pago", "Concluído", "Aprovado"].includes(status)) return "positive" as const;
  if (status === "Em execução") return "info" as const;
  if (status === "Recusado") return "danger" as const;
  return "warning" as const;
}

function QuotesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const statuses = ["Todos", "Aguardando", "Aprovado", "Em execução", "Concluído", "Pago"];
  const filtered = useMemo(() => quotes.filter((q) => {
    const hit = `${q.number} ${q.customerName} ${q.vehicle} ${q.plate ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return hit && (status === "Todos" || q.status === status);
  }), [query, status]);
  return (
    <InternalPage>
      <PageHeader title="Orçamentos / Atendimentos" subtitle="O mesmo documento acompanha o atendimento desde o orçamento até a conclusão e o recebimento." icon={FileText} right={<Button asChild><Link to="/orcamentos/novo"><FilePlus2 className="mr-2 h-4 w-4"/>Novo orçamento</Link></Button>} />
      <FilterBar>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por número, cliente, veículo ou placa..."/></div>
          <div className="segmented-control flex-wrap">{statuses.map((s) => <button key={s} onClick={() => setStatus(s)} className={status === s ? "is-active" : ""}>{s}</button>)}</div>
        </div>
      </FilterBar>
      <div className="panel data-table-wrap">
        <table className="data-table min-w-[980px]"><thead><tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Veículo</th><th>Pagamento</th><th>Valor</th><th>Status</th><th className="text-right">Ação</th></tr></thead><tbody>{filtered.map((q) => <tr key={q.id}><td className="font-semibold">{q.number}</td><td>{q.date}</td><td>{q.customerName}</td><td>{q.vehicle}{q.plate && <small className="block text-muted-foreground">{q.plate}</small>}</td><td>{q.paymentMethod}</td><td className="font-semibold">{brl(q.total)}</td><td><StatusPill label={q.status} tone={tone(q.status)}/></td><td className="text-right"><Button asChild variant="outline" size="sm"><Link to="/orcamentos/$orcamentoId" params={{ orcamentoId: q.id }}>Abrir</Link></Button></td></tr>)}</tbody></table>
      </div>
    </InternalPage>
  );
}
