import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarDays, FileText, MapPin, Pencil, Phone, Plus, Search, UserRound, Users, WalletCards } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FilterBar, InternalPage, StatCard, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { DeleteAction } from "@/components/DeleteAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { jaguarApi } from "@/services/jaguarApi";
import { brl } from "@/utils/format";
import { asNumber, datePt, paymentStatusLabel, quoteStatusLabel, statusToneForPayment, statusToneForQuote } from "@/utils/api-format";

export const Route = createFileRoute("/clientes")({ component: CustomersPage });

function CustomersPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"ALL" | "PF" | "PJ">("ALL");
  const clients = useQuery({ queryKey: ["clients", query], queryFn: () => jaguarApi.clients.list({ search: query, limit: 200 }) });
  const filtered = useMemo(() => (clients.data?.items ?? []).filter((c) => kind === "ALL" || c.kind === kind), [clients.data, kind]);
  const [selectedId, setSelectedId] = useState<string>("");
  const effectiveId = selectedId || filtered[0]?.id || "";
  const detail = useQuery({ queryKey: ["client", effectiveId], queryFn: () => jaguarApi.clients.detail(effectiveId), enabled: Boolean(effectiveId) });
  const selected = detail.data?.customer;

  const total = clients.data?.items.length ?? 0;
  const pj = clients.data?.items.filter((x) => x.kind === "PJ").length ?? 0;
  const pf = total - pj;
  const withOpen = clients.data?.items.filter((x) => asNumber(x.openBalance) > 0).length ?? 0;

  return (
    <InternalPage>
      <PageHeader title="Clientes" subtitle="Cadastre, pesquise e acompanhe o histórico de cada cliente." right={<NewCustomerDialog />} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes ativos" value={total} detail="Cadastros no PostgreSQL" icon={Users} accent="red" />
        <StatCard label="Pessoa Jurídica (PJ)" value={pj} detail={total ? `${Math.round((pj/total)*100)}% da carteira` : "—"} icon={Building2} accent="graphite" />
        <StatCard label="Pessoa Física (PF)" value={pf} detail={total ? `${Math.round((pf/total)*100)}% da carteira` : "—"} icon={UserRound} accent="graphite" />
        <StatCard label="Com saldo em aberto" value={withOpen} detail="Requer acompanhamento" icon={WalletCards} accent="orange" />
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="space-y-3 min-w-0">
          <FilterBar><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nome, telefone, CPF ou CNPJ..."/></div><div className="segmented-control">{(["ALL","PJ","PF"] as const).map((item)=><button key={item} onClick={()=>setKind(item)} className={kind===item?"is-active":""}>{item==="ALL"?"Todos":item}</button>)}</div></div></FilterBar>
          <div className="panel data-table-wrap"><table className="data-table min-w-[880px]"><thead><tr><th>Cliente</th><th>Documento</th><th>Telefone</th><th>Cidade</th><th>Tipo</th><th>Último atendimento</th><th>Status</th></tr></thead><tbody>
            {clients.isLoading && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Carregando clientes...</td></tr>}
            {filtered.map((c)=><tr key={c.id} className={effectiveId===c.id?"is-selected-row":""} onClick={()=>setSelectedId(c.id)}><td><button className="text-left font-semibold text-foreground">{c.name}</button>{c.responsible&&<small className="block text-muted-foreground">Resp. {c.responsible}</small>}</td><td>{c.document || "—"}</td><td>{c.phone || "—"}</td><td>{[c.city,c.state].filter(Boolean).join(" - ") || "—"}</td><td><StatusPill label={c.kind} tone={c.kind==="PJ"?"info":"neutral"}/></td><td>{datePt(c.lastService)}</td><td><StatusPill label={asNumber(c.overdueBalance)>0?"Vencido":asNumber(c.openBalance)>0?"Em aberto":"Ativo"} tone={asNumber(c.overdueBalance)>0?"danger":asNumber(c.openBalance)>0?"warning":"positive"}/></td></tr>)}
            {!clients.isLoading && !filtered.length && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>}
          </tbody></table></div>
        </div>

        {selected ? <aside className="panel customer-detail-panel">
          <div className="customer-detail-panel__header"><div className="customer-mark">{selected.kind==="PJ"?<Building2/>:<UserRound/>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2>{selected.name}</h2><StatusPill label="Ativo" tone="positive"/></div><p>Cód. {selected.id.slice(0,8)}</p></div><div className="ml-auto flex items-center gap-1"><Button asChild variant="outline" size="sm"><Link to="/clientes/$clienteId" params={{clienteId:selected.id}}><Pencil className="mr-2 h-3.5 w-3.5"/>Editar</Link></Button><DeleteAction iconOnly title={`Excluir ${selected.name}?`} description="O cadastro do cliente será removido. Orçamentos antigos preservam o snapshot do cliente; veículos vinculados ao cadastro também serão removidos." onDelete={()=>jaguarApi.remove("customer",selected.id)} onDone={async()=>{setSelectedId("");await Promise.all([qc.invalidateQueries({queryKey:["clients"]}),qc.invalidateQueries({queryKey:["client"]})]);}}/></div></div>
          <div className="customer-detail-grid"><section><h3>Informações de contato</h3><div className="detail-line"><Building2/><span>{selected.document || "—"}</span></div><div className="detail-line"><Phone/><span>{selected.phone || "—"}</span></div><div className="detail-line"><MapPin/><span>{selected.address || "—"}<br/>{[selected.city,selected.state].filter(Boolean).join(" - ")}</span></div></section><section><h3>Resumo financeiro</h3><div className="money-line"><span>Faturado</span><b>{brl(asNumber(selected.totalBilled))}</b></div><div className="money-line"><span>Em aberto</span><b className={asNumber(selected.openBalance)?"text-[var(--accent-red)]":"text-[var(--accent-green)]"}>{brl(asNumber(selected.openBalance))}</b></div><div className="money-line"><span>Vencido</span><b className="text-[var(--accent-red)]">{brl(asNumber(selected.financial?.overdueAmount))}</b></div></section></div>
          <section className="detail-section"><div className="detail-section__title"><h3>Veículos / equipamentos vinculados</h3><span>{selected.vehicles.length}</span></div><div className="grid gap-2 sm:grid-cols-2">{selected.vehicles.map((vehicle)=><div key={vehicle.id} className="vehicle-chip"><div className="vehicle-chip__icon">{(vehicle.type || vehicle.brand || "V").slice(0,1)}</div><div><b>{[vehicle.brand,vehicle.model].filter(Boolean).join(" ") || vehicle.type || "Veículo/equipamento"}</b><span>{vehicle.plate || "Sem placa"}</span></div></div>)}</div></section>
          <div className="grid gap-3 lg:grid-cols-2"><section className="detail-section"><div className="detail-section__title"><h3>Últimos orçamentos</h3><FileText className="h-4 w-4"/></div>{selected.quotes?.length ? selected.quotes.slice(0,4).map((quote)=><div className="compact-line" key={quote.id}><div><Link to="/orcamentos/$orcamentoId" params={{orcamentoId:quote.id}}><b>{quote.number}</b></Link><span>{datePt(quote.date)}</span></div><div className="text-right"><b>{brl(asNumber(quote.total))}</b><StatusPill label={quoteStatusLabel(quote.status)} tone={statusToneForQuote(quote.status)}/></div></div>) : <p className="detail-empty">Nenhum orçamento recente.</p>}</section><section className="detail-section"><div className="detail-section__title"><h3>Situação financeira</h3><CalendarDays className="h-4 w-4"/></div><div className="money-line"><span>Próximo vencimento</span><b>{datePt(selected.financial?.nextDueDate)}</b></div><div className="money-line"><span>Último pagamento</span><b>{datePt(selected.financial?.lastPaymentDate)}</b></div><div className="money-line"><span>Status</span><StatusPill label={paymentStatusLabel(asNumber(selected.financial?.overdueAmount)>0?"overdue":asNumber(selected.financial?.openAmount)>0?"open":"paid")} tone={statusToneForPayment(asNumber(selected.financial?.overdueAmount)>0?"overdue":asNumber(selected.financial?.openAmount)>0?"open":"paid")}/></div></section></div>
        </aside> : <div className="panel p-8 text-sm text-muted-foreground">Selecione ou cadastre um cliente.</div>}
      </div>
    </InternalPage>
  );
}

function NewCustomerDialog() {
  const qc = useQueryClient();
  const [open,setOpen]=useState(false);
  const [kind,setKind]=useState<"PF"|"PJ">("PF");
  const [form,setForm]=useState({name:"",document:"",phone:"",responsible:"",street:"",city:"",state:"PR"});
  const mutation=useMutation({mutationFn:()=>jaguarApi.clients.create({...form,kind}),onSuccess:async()=>{toast.success("Cliente cadastrado.");setOpen(false);setForm({name:"",document:"",phone:"",responsible:"",street:"",city:"",state:"PR"});await qc.invalidateQueries({queryKey:["clients"]});},onError:(e)=>toast.error(e.message)});
  function submit(e:FormEvent){e.preventDefault();mutation.mutate();}
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4"/>Novo Cliente</Button></DialogTrigger><DialogContent className="sm:max-w-2xl"><form onSubmit={submit}><DialogHeader><DialogTitle>Novo cliente</DialogTitle><DialogDescription>O cadastro será gravado no PostgreSQL Jaguar.</DialogDescription></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2"><label className="form-field sm:col-span-2"><span>Tipo</span><div className="segmented-control w-fit"><button type="button" className={kind==="PF"?"is-active":""} onClick={()=>setKind("PF")}><UserRound className="h-3.5 w-3.5"/>Pessoa Física</button><button type="button" className={kind==="PJ"?"is-active":""} onClick={()=>setKind("PJ")}><Building2 className="h-3.5 w-3.5"/>Pessoa Jurídica</button></div></label><label className="form-field"><span>Nome / Razão Social</span><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="form-field"><span>CPF / CNPJ</span><Input value={form.document} onChange={e=>setForm({...form,document:e.target.value})}/></label><label className="form-field"><span>Telefone / WhatsApp</span><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label className="form-field"><span>Responsável</span><Input value={form.responsible} onChange={e=>setForm({...form,responsible:e.target.value})}/></label><label className="form-field sm:col-span-2"><span>Endereço</span><Input value={form.street} onChange={e=>setForm({...form,street:e.target.value})}/></label><label className="form-field"><span>Cidade</span><Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label className="form-field"><span>UF</span><Input value={form.state} maxLength={2} onChange={e=>setForm({...form,state:e.target.value.toUpperCase()})}/></label></div><DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending}>{mutation.isPending?"Salvando...":"Salvar cliente"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
