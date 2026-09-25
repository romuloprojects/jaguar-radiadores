import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2, FileText, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterBar, InternalPage, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { DeleteAction } from "@/components/DeleteAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jaguarApi } from "@/services/jaguarApi";
import { brl } from "@/utils/format";
import { asNumber, datePt, paymentMethodLabel, paymentStatusLabel, quoteStatusLabel, statusToneForPayment, statusToneForQuote } from "@/utils/api-format";

export const Route = createFileRoute("/orcamentos")({ component: QuotesPage });

function QuotesPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const deferredQuery = useDeferredValue(query);
  const quotes = useQuery({ queryKey:["quotes",deferredQuery,status], queryFn:()=>jaguarApi.quotes.list({search:deferredQuery,status,limit:300}), staleTime:15000 });
  const statuses = [{code:"",label:"Todos"},{code:"in_progress",label:"Em andamento"},{code:"completed",label:"Concluído"},{code:"cancelled",label:"Cancelado"}];
  return <InternalPage>
    <PageHeader title="Orçamentos / Atendimentos" subtitle="O orçamento acompanha o serviço até a conclusão; o financeiro é controlado separadamente." icon={FileText} right={<Button asChild><Link to="/orcamentos/novo"><FilePlus2 className="mr-2 h-4 w-4"/>Novo orçamento</Link></Button>} />
    <FilterBar><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="relative w-full max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por número, cliente, veículo ou placa..."/></div><div className="segmented-control flex-wrap">{statuses.map(s=><button key={s.code} onClick={()=>setStatus(s.code)} className={status===s.code?"is-active":""}>{s.label}</button>)}</div></div></FilterBar>
    <div className="panel data-table-wrap"><table className="data-table min-w-[1080px]"><thead><tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Veículo</th><th>Pagamento</th><th>Valor</th><th>Atendimento</th><th>Financeiro</th><th className="text-right">Ação</th></tr></thead><tbody>
      {quotes.isLoading && <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">Carregando atendimentos...</td></tr>}
      {quotes.data?.items.map(q=><tr key={q.id}><td className="font-semibold">{q.number}</td><td>{datePt(q.date)}</td><td>{q.customerName}</td><td>{q.vehicle || "—"}{q.plate&&<small className="block text-muted-foreground">{q.plate}</small>}</td><td>{paymentMethodLabel(q.paymentMethod)}</td><td className="font-semibold">{brl(asNumber(q.total))}</td><td><StatusPill label={quoteStatusLabel(q.status)} tone={statusToneForQuote(q.status)}/></td><td><StatusPill label={paymentStatusLabel(q.paymentStatus)} tone={statusToneForPayment(q.paymentStatus)}/></td><td className="text-right"><div className="flex justify-end gap-1"><Button asChild variant="outline" size="sm"><Link to="/orcamentos/$orcamentoId" params={{orcamentoId:q.id}}>Abrir</Link></Button><DeleteAction iconOnly title={`Excluir ${q.number}?`} description="O orçamento/OS será removido juntamente com parcelas, pagamentos, reservas e movimentações de estoque vinculadas a ele." onDelete={()=>jaguarApi.remove("quote",q.id)} onDone={()=>qc.invalidateQueries({queryKey:["quotes"]})}/></div></td></tr>)}
      {!quotes.isLoading && !(quotes.data?.items.length) && <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">Nenhum orçamento encontrado.</td></tr>}
    </tbody></table></div>
  </InternalPage>;
}
