import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CarFront, FileText, Pencil, Plus, Save, UserRound, WalletCards } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InternalPage, SectionPanel, StatCard, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { DeleteAction } from "@/components/DeleteAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { jaguarApi } from "@/services/jaguarApi";
import { brl } from "@/utils/format";
import { asNumber, datePt, paymentStatusLabel, quoteStatusLabel, statusToneForPayment, statusToneForQuote } from "@/utils/api-format";
import { silentInvalidate } from "@/utils/query-sync";
import type { VehicleApi } from "@/types/api";

export const Route = createFileRoute("/clientes_/$clienteId")({ component: CustomerDetailPage });

function CustomerDetailPage() {
  const { clienteId } = Route.useParams();
  const qc = useQueryClient();
  const query = useQuery({ queryKey:["client",clienteId], queryFn:()=>jaguarApi.clients.detail(clienteId) });
  const customer = query.data?.customer;
  const [form,setForm]=useState<any>({});
  useEffect(()=>{ if(customer) setForm({id:customer.id,kind:customer.kind,name:customer.name,document:customer.document??"",registration:customer.registration??"",phone:customer.phone??"",whatsapp:customer.whatsapp??"",email:customer.email??"",street:customer.street??customer.address??"",number:customer.number??"",city:customer.city??"",state:customer.state??"",responsible:customer.responsible??"",notes:customer.notes??""}); },[customer]);
  const save=useMutation({mutationFn:()=>jaguarApi.clients.update(form),onSuccess:()=>{toast.success("Cliente atualizado.");silentInvalidate(qc,[["client",clienteId],["clients"]]);},onError:e=>toast.error(e.message)});
  if(query.isLoading) return <InternalPage><div className="panel p-8 text-muted-foreground">Carregando cliente...</div></InternalPage>;
  if(query.error || !customer) return <InternalPage><div className="panel p-8 text-destructive">{query.error?.message ?? "Cliente não encontrado."}</div></InternalPage>;
  const overdue=asNumber(customer.financial?.overdueAmount);
  const open=asNumber(customer.financial?.openAmount);
  return <InternalPage>
    <PageHeader eyebrow={customer.kind==="PJ"?"PESSOA JURÍDICA":"PESSOA FÍSICA"} title={customer.name} subtitle={`${customer.document || "Sem documento"} · ${customer.phone || "Sem telefone"}`} icon={UserRound} right={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/clientes"><ArrowLeft className="mr-2 h-4 w-4"/>Voltar</Link></Button><Button onClick={()=>save.mutate()} disabled={save.isPending}><Save className="mr-2 h-4 w-4"/>{save.isPending?"Salvando...":"Salvar"}</Button><DeleteAction title={`Excluir ${customer.name}?`} description="O cadastro será removido. Veículos vinculados ao cliente também serão excluídos; documentos históricos mantêm os dados gravados no orçamento." onDelete={()=>jaguarApi.remove("customer",customer.id)} onDone={()=>{window.location.href="/clientes";}}/></div>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Faturado no histórico" value={brl(asNumber(customer.totalBilled))} icon={WalletCards} accent="green"/><StatCard label="Saldo em aberto" value={brl(open)} icon={WalletCards} accent={open?"red":"green"}/><StatCard label="Veículos / equipamentos" value={customer.vehicles.length} icon={CarFront} accent="blue"/><StatCard label="Situação financeira" value={paymentStatusLabel(overdue>0?"overdue":open>0?"open":"paid")} icon={FileText} accent={overdue>0?"red":open>0?"orange":"green"}/></div>
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionPanel title="Dados cadastrais" icon={UserRound}><div className="form-grid"><label className="form-field"><span>Nome / razão social</span><Input value={form.name??""} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="form-field"><span>CPF / CNPJ</span><Input value={form.document??""} onChange={e=>setForm({...form,document:e.target.value})}/></label><label className="form-field"><span>Telefone</span><Input value={form.phone??""} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label className="form-field"><span>Responsável</span><Input value={form.responsible??""} onChange={e=>setForm({...form,responsible:e.target.value})}/></label><label className="form-field sm:col-span-2"><span>Endereço</span><Input value={form.street??""} onChange={e=>setForm({...form,street:e.target.value})}/></label><label className="form-field"><span>Cidade</span><Input value={form.city??""} onChange={e=>setForm({...form,city:e.target.value})}/></label><label className="form-field"><span>UF</span><Input value={form.state??""} onChange={e=>setForm({...form,state:e.target.value.toUpperCase()})}/></label><label className="form-field sm:col-span-2"><span>Observações</span><Textarea value={form.notes??""} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div></SectionPanel>
      <SectionPanel title="Veículos / equipamentos" icon={CarFront} right={<VehicleDialog customerId={customer.id}/>}><div className="space-y-2">{customer.vehicles.length?customer.vehicles.map(v=><div key={v.id} className="record-card"><div><b>{[v.brand,v.model].filter(Boolean).join(" ") || v.type || "Veículo/equipamento"}</b><span>{v.plate?`Placa ${v.plate}`:"Sem placa"}</span></div><div className="flex items-center gap-2 text-right"><div><StatusPill label={v.type || "Equipamento"} tone="info"/><small className="block">{v.notes || ""}</small></div><VehicleDialog customerId={customer.id} vehicle={v}/><DeleteAction iconOnly title="Excluir veículo/equipamento?" description="O veículo/equipamento será removido do cadastro. Orçamentos já emitidos mantêm o snapshot histórico." onDelete={()=>jaguarApi.remove("vehicle",v.id)} onDone={()=>silentInvalidate(qc,[["client",customer.id],["clients"]])}/></div></div>):<p className="detail-empty">Nenhum veículo/equipamento cadastrado.</p>}</div></SectionPanel>
    </div>
    <SectionPanel title="Histórico de orçamentos e atendimentos" icon={FileText} right={<Button asChild size="sm"><Link to="/orcamentos/novo">Novo orçamento</Link></Button>}><div className="data-table-wrap border-0"><table className="data-table min-w-[760px]"><thead><tr><th>Nº</th><th>Data</th><th>Valor</th><th>Atendimento</th><th>Financeiro</th></tr></thead><tbody>{customer.quotes?.length?customer.quotes.map(q=><tr key={q.id}><td><Link to="/orcamentos/$orcamentoId" params={{orcamentoId:q.id}} className="font-semibold hover:text-primary">{q.number}</Link></td><td>{datePt(q.date)}</td><td>{brl(asNumber(q.total))}</td><td><StatusPill label={quoteStatusLabel(q.status)} tone={statusToneForQuote(q.status)}/></td><td><StatusPill label={paymentStatusLabel(q.paymentStatus)} tone={statusToneForPayment(q.paymentStatus)}/></td></tr>):<tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum orçamento encontrado.</td></tr>}</tbody></table></div></SectionPanel>
  </InternalPage>;
}

function VehicleDialog({customerId,vehicle}:{customerId:string;vehicle?:VehicleApi}){
  const qc=useQueryClient(); const [open,setOpen]=useState(false); const [form,setForm]=useState({plate:vehicle?.plate||"",brand:vehicle?.brand||"",model:vehicle?.model||"",type:vehicle?.type||"",notes:vehicle?.notes||""});
  useEffect(()=>{if(open)setForm({plate:vehicle?.plate||"",brand:vehicle?.brand||"",model:vehicle?.model||"",type:vehicle?.type||"",notes:vehicle?.notes||""})},[open,vehicle?.id]);
  const mutation=useMutation({mutationFn:()=>vehicle?jaguarApi.clients.updateVehicle({id:vehicle.id,...form}):jaguarApi.clients.createVehicle({customerId,...form}),onSuccess:()=>{toast.success(vehicle?"Veículo/equipamento atualizado.":"Veículo/equipamento adicionado.");setOpen(false);silentInvalidate(qc,[["client",customerId],["clients"]]);},onError:e=>toast.error(e.message)});
  function submit(e:FormEvent){e.preventDefault();mutation.mutate();}
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{vehicle?<Button size="sm" variant="ghost"><Pencil className="h-4 w-4"/></Button>:<Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4"/>Adicionar</Button>}</DialogTrigger><DialogContent><form onSubmit={submit}><DialogHeader><DialogTitle>{vehicle?"Editar veículo / equipamento":"Novo veículo / equipamento"}</DialogTitle><DialogDescription>Somente os campos essenciais do atendimento.</DialogDescription></DialogHeader><div className="form-grid py-4"><label className="form-field"><span>Placa</span><Input value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})}/></label><label className="form-field"><span>Marca</span><Input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label><label className="form-field"><span>Modelo</span><Input value={form.model} onChange={e=>setForm({...form,model:e.target.value})}/></label><label className="form-field"><span>Veículo / equipamento</span><Input value={form.type} onChange={e=>setForm({...form,type:e.target.value})}/></label><label className="form-field sm:col-span-2"><span>Observações</span><Textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending}>{mutation.isPending?"Salvando...":"Salvar"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
