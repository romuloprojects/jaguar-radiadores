import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, CalendarDays, Mail, MapPin, Pencil, Phone, Plus, Search, ShoppingCart, Truck, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterBar, InternalPage, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { DeleteAction } from "@/components/DeleteAction";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { jaguarApi } from "@/services/jaguarApi";
import type { SupplierDetailApi, SupplierListItemApi } from "@/types/api";
import { asNumber, datePt } from "@/utils/api-format";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/fornecedores")({ component: SuppliersPage });

function SuppliersPage() {
  const [query,setQuery]=useState("");
  const list=useQuery({queryKey:["suppliers",query],queryFn:()=>jaguarApi.suppliers.list({search:query||undefined,limit:200})});
  const suppliers=list.data?.items??[];
  const [selectedId,setSelectedId]=useState("");
  useEffect(()=>{if(!selectedId&&suppliers[0])setSelectedId(suppliers[0].id);if(selectedId&&suppliers.length&&!suppliers.some(s=>s.id===selectedId))setSelectedId(suppliers[0].id)},[suppliers,selectedId]);
  const detail=useQuery({queryKey:["supplier",selectedId],queryFn:()=>jaguarApi.suppliers.detail(selectedId),enabled:!!selectedId});
  const selectedList=suppliers.find(s=>s.id===selectedId);
  const selected=detail.data?.supplier;
  const openBalance=suppliers.reduce((s,x)=>s+asNumber(x.openBalance),0);
  const purchasesYtd=suppliers.reduce((s,x)=>s+asNumber(x.purchasesYtd),0);
  const history=useMemo(()=>monthlyHistory(selected),[selected]);
  const qc=useQueryClient();
  async function refresh(){await Promise.all([qc.invalidateQueries({queryKey:["suppliers"]}),qc.invalidateQueries({queryKey:["supplier"]}),qc.invalidateQueries({queryKey:["purchases"]})]);}
  return <InternalPage>
    <PageHeader title="Fornecedores" subtitle="Parceiros, produtos fornecidos, compras e pendências financeiras em dados reais." right={<SupplierDialog onDone={refresh}/>}/>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Fornecedores ativos" value={list.data?.total??suppliers.length} icon={Building2} accent="red" detail="Base cadastrada"/>
      <StatCard label="Compras no ano" value={brl(purchasesYtd)} icon={ShoppingCart} accent="green" detail="Compras confirmadas"/>
      <StatCard label="Em aberto" value={brl(openBalance)} icon={WalletCards} accent="red" detail="Contas com fornecedores"/>
      <StatCard label="Últimas compras" value={suppliers.filter(s=>s.lastPurchase).length} icon={CalendarDays} accent="graphite" detail="Fornecedores com histórico"/>
    </div>
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="space-y-3 min-w-0">
        <FilterBar><div className="flex flex-col gap-3 lg:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nome, CNPJ ou telefone..."/></div></div></FilterBar>
        <div className="panel data-table-wrap"><table className="data-table min-w-[900px]"><thead><tr><th>Fornecedor</th><th>Documento</th><th>Contato</th><th>Telefone</th><th>Cidade</th><th>Última compra</th><th>Em aberto</th><th>Status</th></tr></thead><tbody>
          {suppliers.map(s=><tr key={s.id} className={selectedId===s.id?"is-selected-row":""} onClick={()=>setSelectedId(s.id)}><td className="font-semibold"><button>{s.name}</button><small className="block text-muted-foreground">{brl(asNumber(s.purchasesYtd))} em compras no ano</small></td><td>{s.document||"—"}</td><td>{s.contact||"—"}</td><td>{s.phone||"—"}</td><td>{s.city||"—"}</td><td>{datePt(s.lastPurchase)}</td><td className={asNumber(s.openBalance)>0?"font-semibold text-[var(--accent-red)]":"font-semibold text-[var(--accent-green)]"}>{brl(asNumber(s.openBalance))}</td><td><StatusPill label="Ativo" tone="positive"/></td></tr>)}
          {!list.isLoading&&suppliers.length===0&&<tr><td colSpan={8} className="py-10 text-center text-muted-foreground">Nenhum fornecedor cadastrado.</td></tr>}
        </tbody></table></div>
      </div>
      <aside className="panel supplier-detail-panel">
        {!selected?<div className="py-16 text-center text-sm text-muted-foreground">Selecione um fornecedor para visualizar os detalhes.</div>:<>
          <div className="supplier-detail-panel__header"><div className="supplier-monogram">{initials(selected.name)}</div><div className="min-w-0"><div className="flex items-center gap-2"><h2>{selected.name}</h2><StatusPill label="Ativo" tone="positive"/></div><p>{selected.document||"Documento não informado"}</p></div><div className="flex items-center gap-1"><SupplierDialog supplier={selected} onDone={refresh}/><DeleteAction iconOnly title={`Excluir ${selected.name}?`} description="O fornecedor será removido. Se houver compras vinculadas, exclua essas compras primeiro para preservar a integridade financeira e do estoque." onDelete={()=>jaguarApi.remove("supplier",selected.id)} onDone={async()=>{setSelectedId("");await refresh();}}/></div></div>
          <div className="supplier-detail-tabs"><button className="is-active">Visão Geral</button><button>Produtos</button><button>Compras</button><button>Financeiro</button></div>
          <div className="grid gap-3">
            <section className="detail-section"><h3>Dados do fornecedor</h3><div className="detail-line"><Building2/><span>{selected.legalName||selected.name}</span></div><div className="detail-line"><Phone/><span>{selected.phone||selected.whatsapp||"—"}</span></div>{selected.email&&<div className="detail-line"><Mail/><span>{selected.email}</span></div>}<div className="detail-line"><MapPin/><span>{[selected.street,selected.number,selected.city,selected.state].filter(Boolean).join(" • ")||"—"}</span></div><div className="detail-line"><Truck/><span>Contato: {selected.contact||"—"}</span></div></section>
            <section className="detail-section"><h3>Compras recentes</h3><div className="h-[170px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={history} margin={{left:-18,right:4,top:8,bottom:0}}><CartesianGrid vertical={false} stroke="var(--chart-grid)"/><XAxis dataKey="month" tick={{fontSize:9,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tickFormatter={v=>`${v/1000}k`} tick={{fontSize:9,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number)=>brl(v)}/><Bar dataKey="value" fill="var(--accent-red)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></section>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <section className="detail-section"><h3>Produtos fornecidos</h3>{selected.products.slice(0,8).map(item=><div className="compact-line" key={item.id}><span>{item.code||"—"}</span><b>{item.description}</b><small>{brl(asNumber(item.lastUnitCost))}</small></div>)}{selected.products.length===0&&<p className="text-sm text-muted-foreground">Os vínculos serão criados automaticamente nas compras.</p>}</section>
            <section className="detail-section"><h3>Últimas compras</h3>{selected.purchases.slice(0,8).map(p=><div className="money-line" key={p.id}><span>{p.number}<small className="block text-muted-foreground">{datePt(p.date)}</small></span><b>{brl(asNumber(p.total))}</b></div>)}{selected.purchases.length===0&&<p className="text-sm text-muted-foreground">Nenhuma compra registrada.</p>}<div className="money-line"><span>Em aberto</span><b className="text-[var(--accent-red)]">{brl(asNumber(selectedList?.openBalance))}</b></div></section>
          </div>
        </>}
      </aside>
    </div>
  </InternalPage>
}

function SupplierDialog({supplier,onDone}:{supplier?:SupplierDetailApi;onDone:()=>Promise<void>|void}){
  const [open,setOpen]=useState(false);
  const initial=()=>({name:supplier?.name||"",legalName:supplier?.legalName||"",document:supplier?.document||"",registration:supplier?.registration||"",contact:supplier?.contact||"",phone:supplier?.phone||"",whatsapp:supplier?.whatsapp||"",email:supplier?.email||"",street:supplier?.street||"",number:supplier?.number||"",city:supplier?.city||"",state:supplier?.state||"PR",notes:supplier?.notes||""});
  const [form,setForm]=useState(initial);
  useEffect(()=>{if(open)setForm(initial())},[open,supplier?.id]);
  const mutation=useMutation({mutationFn:()=>supplier?jaguarApi.suppliers.update({id:supplier.id,...form}):jaguarApi.suppliers.create(form),onSuccess:async()=>{toast.success(supplier?"Fornecedor atualizado.":"Fornecedor cadastrado.");setOpen(false);await onDone();},onError:e=>toast.error(e.message)});
  function submit(e:FormEvent){e.preventDefault();mutation.mutate()}
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{supplier?<Button variant="ghost" size="sm"><Pencil className="h-4 w-4"/></Button>:<Button><Plus className="mr-2 h-4 w-4"/>Novo fornecedor</Button>}</DialogTrigger><DialogContent className="sm:max-w-3xl"><form onSubmit={submit}><DialogHeader><DialogTitle>{supplier?"Editar fornecedor":"Novo fornecedor"}</DialogTitle><DialogDescription>Cadastro compartilhado por compras, estoque e contas a pagar.</DialogDescription></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2"><Field label="Nome"><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Razão social"><Input value={form.legalName} onChange={e=>setForm({...form,legalName:e.target.value})}/></Field><Field label="CNPJ / CPF"><Input value={form.document} onChange={e=>setForm({...form,document:e.target.value})}/></Field><Field label="Inscrição"><Input value={form.registration} onChange={e=>setForm({...form,registration:e.target.value})}/></Field><Field label="Contato"><Input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/></Field><Field label="Telefone"><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field><Field label="WhatsApp"><Input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></Field><Field label="E-mail"><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field><Field label="Endereço"><Input value={form.street} onChange={e=>setForm({...form,street:e.target.value})}/></Field><Field label="Número"><Input value={form.number} onChange={e=>setForm({...form,number:e.target.value})}/></Field><Field label="Cidade"><Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></Field><Field label="UF"><Input maxLength={2} value={form.state} onChange={e=>setForm({...form,state:e.target.value.toUpperCase()})}/></Field><label className="form-field sm:col-span-2"><span>Observações</span><Input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending}>{mutation.isPending?"Salvando...":"Salvar fornecedor"}</Button></DialogFooter></form></DialogContent></Dialog>
}

function monthlyHistory(s?:SupplierDetailApi){const months=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; const now=new Date(); const keys=Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return {key:`${d.getFullYear()}-${d.getMonth()}`,month:months[d.getMonth()],value:0}}); for(const p of s?.purchases??[]){const d=new Date(`${p.date}T12:00:00`); const k=`${d.getFullYear()}-${d.getMonth()}`; const row=keys.find(x=>x.key===k); if(row&&p.status==="confirmed")row.value+=asNumber(p.total)} return keys;}
function initials(name:string){return name.split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="form-field"><span>{label}</span>{children}</label>}
