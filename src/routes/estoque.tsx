import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  Camera,
  CheckCircle2,
  PackageSearch,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { FilterBar, InternalPage, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { DeleteAction } from "@/components/DeleteAction";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jaguarApi } from "@/services/jaguarApi";
import type { ProductApi, PurchaseListItemApi } from "@/types/api";
import { asNumber, datePt, dateTimePt } from "@/utils/api-format";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/estoque")({ component: InventoryPage });

const movementLabels: Record<string, string> = {
  initial_balance: "Saldo inicial",
  adjustment_in: "Ajuste de entrada",
  adjustment_out: "Ajuste de saída",
  loss: "Perda",
  return_in: "Devolução / entrada",
  return_out: "Devolução / saída",
  purchase_entry: "Entrada por compra",
  quote_consumption: "Consumo em atendimento",
};

function InventoryPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const productsQuery = useQuery({ queryKey: ["products", query, status], queryFn: () => jaguarApi.catalog.products({ search: query || undefined, status: status || undefined, limit: 300 }) });
  const movementsQuery = useQuery({ queryKey: ["stock-movements"], queryFn: () => jaguarApi.stock.movements({ limit: 12 }) });
  const purchasesQuery = useQuery({ queryKey: ["purchases"], queryFn: () => jaguarApi.purchases.list({ limit: 30 }) });
  const products = productsQuery.data?.items ?? [];
  const movements = movementsQuery.data?.items ?? [];
  const purchases = purchasesQuery.data?.items ?? [];
  const inventoryValue = products.reduce((s, i) => s + asNumber(i.current) * asNumber(i.unitCost), 0);
  const reserved = products.reduce((s, i) => s + asNumber(i.reserved), 0);
  const normalCount = products.filter((i) => i.statusCode === "normal" || i.status === "Normal").length;
  const lowCount = products.filter((i) => i.statusCode === "low" || i.status === "Baixo").length;
  const criticalCount = products.filter((i) => i.statusCode === "critical" || i.status === "Crítico").length;
  const distribution = [
    { name: "Normal", value: normalCount, color: "var(--accent-green)" },
    { name: "Baixo", value: lowCount, color: "var(--accent-orange)" },
    { name: "Crítico", value: criticalCount, color: "var(--accent-red)" },
  ];
  async function refresh() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["products"] }),
      qc.invalidateQueries({ queryKey: ["stock-movements"] }),
      qc.invalidateQueries({ queryKey: ["purchases"] }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  }

  return (
    <InternalPage>
      <PageHeader
        title="Estoque"
        subtitle="Produtos, saldo físico, reservas, compras e movimentações reais do PostgreSQL Jaguar."
        right={<div className="flex flex-wrap gap-2"><StockMovementDialog products={products} onDone={refresh}/><PurchaseDialog onDone={refresh}/><ProductDialog onDone={refresh}/></div>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Itens cadastrados" value={productsQuery.data?.total ?? products.length} icon={Boxes} accent="red" detail="Catálogo ativo" />
        <StatCard label="Estoque crítico" value={criticalCount + lowCount} detail={`${criticalCount} críticos • ${lowCount} baixos`} icon={AlertTriangle} accent="red" />
        <StatCard label="Valor em estoque" value={brl(inventoryValue)} icon={Warehouse} accent="green" detail="Custo médio × estoque físico" />
        <StatCard label="Itens reservados" value={reserved} detail="Ligados a atendimentos" icon={PackageSearch} accent="graphite" />
      </div>

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList className="finance-tabs"><TabsTrigger value="produtos">Produtos</TabsTrigger><TabsTrigger value="compras">Compras</TabsTrigger></TabsList>
        <TabsContent value="produtos" className="space-y-4">
          <FilterBar>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar produto ou código..."/></div>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">Todos os status</option><option value="normal">Normal</option><option value="low">Baixo</option><option value="critical">Crítico</option></select>
              <Button variant="outline" onClick={refresh}><RefreshCw className="mr-2 h-4 w-4"/>Atualizar</Button>
            </div>
          </FilterBar>
          <div className="panel data-table-wrap">
            <table className="data-table min-w-[1160px]">
              <thead><tr><th>Item</th><th>Código</th><th>Produto</th><th>Categoria</th><th>Atual</th><th>Reservado</th><th>Disponível</th><th>Custo médio</th><th>Preço venda</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {products.map((item)=><tr key={item.id}>
                  <td>{item.imageUrl?<img src={item.imageUrl} alt={item.description} className="inventory-photo"/>:<div className="inventory-photo-slot"><Camera className="h-4 w-4"/><span>Foto</span></div>}</td>
                  <td className="font-semibold text-muted-foreground">{item.code || "—"}</td>
                  <td><b className="block text-foreground">{item.description}</b><small className="text-muted-foreground">{item.brand || item.supplier || "—"}</small></td>
                  <td>{item.category || "—"}</td><td>{asNumber(item.current)}</td><td>{asNumber(item.reserved)}</td>
                  <td className={asNumber(item.available)<=asNumber(item.minimum)?"font-bold text-[var(--accent-red)]":"font-bold text-[var(--accent-green)]"}>{asNumber(item.available)}</td>
                  <td>{brl(asNumber(item.unitCost))}</td><td>{brl(asNumber(item.salePrice))}</td>
                  <td><StatusPill label={item.status} tone={item.status==="Normal"?"positive":item.status==="Baixo"?"warning":"danger"}/></td>
                  <td><div className="flex items-center gap-1"><ProductDialog product={item} onDone={refresh}/><DeleteAction iconOnly title={`Excluir ${item.description}?`} description="O produto será removido do catálogo. Se houver compras vinculadas a ele, exclua essas compras primeiro. Orçamentos históricos preservam a descrição e os valores gravados." onDelete={()=>jaguarApi.remove("product",item.id)} onDone={refresh}/></div></td>
                </tr>)}
                {!productsQuery.isLoading && products.length===0 && <tr><td colSpan={11} className="py-10 text-center text-muted-foreground">Nenhum produto cadastrado.</td></tr>}
              </tbody>
            </table>
          </div>
          <aside className="grid gap-4 lg:grid-cols-2">
            <section className="panel inventory-side-card">
              <h2>Distribuição do estoque</h2>
              <div className="inventory-donut"><div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={2}>{distribution.map((entry)=><Cell key={entry.name} fill={entry.color}/>)}</Pie><Tooltip contentStyle={chartTooltipStyle}/></PieChart></ResponsiveContainer></div><div className="inventory-donut__center"><b>{products.length}</b><span>itens</span></div></div>
              <div className="inventory-legend">{distribution.map((entry)=><div key={entry.name}><i style={{background:entry.color}}/><span>{entry.name}</span><b>{entry.value}</b></div>)}</div>
            </section>
            <section className="panel inventory-side-card">
              <div className="flex items-center justify-between"><h2>Movimentações recentes</h2><StockMovementDialog products={products} onDone={refresh} compact/></div>
              <div className="mt-3 space-y-1">{movements.map((move)=>{
                const positive=asNumber(move.quantity)>=0; const manual=!move.purchaseId&&!move.quoteId; return <div className="stock-move" key={move.id}><span className={positive?"positive":"negative"}>{positive?<ArrowDown/>:<ArrowUp/>}</span><div><b>{movementLabels[move.type] || move.type}</b><small>{move.code?`${move.code} • `:""}{move.product}</small></div><div className="flex items-center gap-2 text-right"><div><b>{positive?"+":""}{asNumber(move.quantity)} un.</b><small>{dateTimePt(move.createdAt)}</small></div>{manual&&<DeleteAction iconOnly title="Excluir movimentação manual?" description="O lançamento será removido e o saldo físico será recalculado a partir do histórico restante." onDelete={()=>jaguarApi.remove("stock_movement",move.id)} onDone={refresh}/>}</div></div>;
              })}{!movementsQuery.isLoading && movements.length===0 && <p className="py-8 text-center text-sm text-muted-foreground">Sem movimentações ainda.</p>}</div>
            </section>
          </aside>
        </TabsContent>
        <TabsContent value="compras" className="space-y-4">
          <section className="panel">
            <div className="table-section-heading"><div><span>COMPRAS</span><h2>Entradas por fornecedor</h2></div><PurchaseDialog onDone={refresh}/></div>
            <div className="data-table-wrap border-0"><table className="data-table min-w-[900px]"><thead><tr><th>Compra</th><th>Data</th><th>Fornecedor</th><th>Documento</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody>{purchases.map((p)=><PurchaseRow key={p.id} purchase={p} onDone={refresh}/>)}{!purchasesQuery.isLoading&&purchases.length===0&&<tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Nenhuma compra registrada.</td></tr>}</tbody></table></div>
          </section>
        </TabsContent>
      </Tabs>
    </InternalPage>
  );
}

function ProductDialog({ product, onDone }: { product?: ProductApi; onDone: () => Promise<void> | void }) {
  const [open,setOpen]=useState(false); const settings=useQuery({queryKey:["settings-catalog"],queryFn:jaguarApi.settings.get,enabled:open}); const suppliers=useQuery({queryKey:["suppliers-dialog"],queryFn:()=>jaguarApi.suppliers.list({limit:200}),enabled:open});
  const [form,setForm]=useState({code:product?.code||"",description:product?.description||"",brand:product?.brand||"",categoryId:product?.categoryId||"",supplierId:product?.supplierId||"",unit:product?.unit||"un",imageUrl:product?.imageUrl||"",minimum:String(product?.minimum??0),unitCost:String(product?.unitCost??0),salePrice:String(product?.salePrice??0),initialStock:"0"});
  const mutation=useMutation({mutationFn:()=>product?jaguarApi.catalog.updateProduct({id:product.id,...form}):jaguarApi.catalog.createProduct(form),onSuccess:async()=>{toast.success(product?"Produto atualizado.":"Produto cadastrado.");setOpen(false);await onDone();},onError:(e)=>toast.error(e.message)});
  function submit(e:FormEvent){e.preventDefault(); mutation.mutate();}
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{product?<Button variant="ghost" size="sm"><Pencil className="h-4 w-4"/></Button>:<Button><Plus className="mr-2 h-4 w-4"/>Novo item</Button>}</DialogTrigger><DialogContent className="sm:max-w-3xl"><form onSubmit={submit}><DialogHeader><DialogTitle>{product?"Editar produto":"Novo produto"}</DialogTitle><DialogDescription>Foto real é opcional e utilizada somente no módulo de estoque.</DialogDescription></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2"><Field label="Código"><Input value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></Field><Field label="Descrição"><Input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field><Field label="Marca"><Input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></Field><Field label="Unidade"><Input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/></Field><Field label="Categoria"><select className="h-10 rounded-md border border-input bg-background px-3" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}><option value="">Sem categoria</option>{settings.data?.productCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Fornecedor principal"><select className="h-10 rounded-md border border-input bg-background px-3" value={form.supplierId} onChange={e=>setForm({...form,supplierId:e.target.value})}><option value="">Sem fornecedor</option>{suppliers.data?.items.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Estoque mínimo"><Input type="number" min="0" step="0.01" value={form.minimum} onChange={e=>setForm({...form,minimum:e.target.value})}/></Field>{!product&&<Field label="Saldo inicial"><Input type="number" min="0" step="0.01" value={form.initialStock} onChange={e=>setForm({...form,initialStock:e.target.value})}/></Field>}<Field label="Custo médio"><Input type="number" min="0" step="0.01" value={form.unitCost} onChange={e=>setForm({...form,unitCost:e.target.value})}/></Field><Field label="Preço de venda"><Input type="number" min="0" step="0.01" value={form.salePrice} onChange={e=>setForm({...form,salePrice:e.target.value})}/></Field><label className="form-field sm:col-span-2"><span>URL da foto real</span><Input value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://..."/></label></div><DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending}>{mutation.isPending?"Salvando...":"Salvar"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function StockMovementDialog({ products, onDone, compact=false }: { products: ProductApi[]; onDone:()=>Promise<void>|void; compact?:boolean }) {
  const [open,setOpen]=useState(false); const [productId,setProductId]=useState(""); const [type,setType]=useState("adjustment_in"); const [quantity,setQuantity]=useState("1"); const [unitCost,setUnitCost]=useState(""); const [notes,setNotes]=useState("");
  const mutation=useMutation({mutationFn:()=>jaguarApi.stock.movement({productId,type,quantity:Number(quantity),unitCost:unitCost?Number(unitCost):undefined,notes}),onSuccess:async()=>{toast.success("Movimentação registrada.");setOpen(false);setQuantity("1");setNotes("");await onDone();},onError:e=>toast.error(e.message)});
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={compact?"ghost":"outline"} size={compact?"sm":"default"}>{compact?"Movimentar":<><RefreshCw className="mr-2 h-4 w-4"/>Movimentar</>}</Button></DialogTrigger><DialogContent><form onSubmit={e=>{e.preventDefault();mutation.mutate();}}><DialogHeader><DialogTitle>Movimentação manual</DialogTitle><DialogDescription>Compras e atendimentos movimentam o estoque automaticamente; use isto para ajustes, perdas ou devoluções.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><Field label="Produto"><select required className="h-10 rounded-md border border-input bg-background px-3" value={productId} onChange={e=>setProductId(e.target.value)}><option value="">Selecione...</option>{products.map(p=><option key={p.id} value={p.id}>{p.code?`${p.code} • `:""}{p.description}</option>)}</select></Field><Field label="Tipo"><select className="h-10 rounded-md border border-input bg-background px-3" value={type} onChange={e=>setType(e.target.value)}><option value="adjustment_in">Ajuste de entrada</option><option value="adjustment_out">Ajuste de saída</option><option value="loss">Perda</option><option value="return_in">Devolução / entrada</option><option value="return_out">Devolução / saída</option></select></Field><Field label="Quantidade"><Input required type="number" min="0.01" step="0.01" value={quantity} onChange={e=>setQuantity(e.target.value)}/></Field><Field label="Custo unitário (opcional)"><Input type="number" min="0" step="0.01" value={unitCost} onChange={e=>setUnitCost(e.target.value)}/></Field><Field label="Observações"><Input value={notes} onChange={e=>setNotes(e.target.value)}/></Field></div><DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending}>Registrar</Button></DialogFooter></form></DialogContent></Dialog>;
}

type PurchaseDraftItem = { id: string; productId: string; quantity: number; unitCost: number };

function PurchaseDialog({ onDone }: { onDone:()=>Promise<void>|void }) {
  const [open,setOpen]=useState(false);
  const suppliers=useQuery({queryKey:["suppliers-purchase"],queryFn:()=>jaguarApi.suppliers.list({limit:200}),enabled:open});
  const catalog=useQuery({queryKey:["catalog-purchase"],queryFn:jaguarApi.catalog.all,enabled:open});
  const [supplierId,setSupplierId]=useState("");
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [documentNumber,setDocument]=useState("");
  const [items,setItems]=useState<PurchaseDraftItem[]>([]);
  const [discount,setDiscount]=useState("0");
  const [freight,setFreight]=useState("0");
  const [otherCosts,setOtherCosts]=useState("0");
  const [method,setMethod]=useState("bank_transfer");
  const [installments,setInstallments]=useState("1");
  const [firstDueDate,setFirstDueDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [dueDay,setDueDay]=useState(String(new Date().getDate()));
  const [notes,setNotes]=useState("");

  useEffect(()=>{
    if(!open) return;
    if(!items.length && catalog.data?.products[0]) {
      const first=catalog.data.products[0];
      setItems([{id:crypto.randomUUID(),productId:first.id,quantity:1,unitCost:asNumber(first.unitCost)}]);
    }
  },[open,catalog.data,items.length]);

  const subtotal=items.reduce((sum,item)=>sum+(asNumber(item.quantity)*asNumber(item.unitCost)),0);
  const total=Math.max(0,subtotal-asNumber(discount)+asNumber(freight)+asNumber(otherCosts));
  function addItem(){
    const first=catalog.data?.products[0];
    if(!first) return toast.error("Cadastre ao menos um produto antes de registrar uma compra.");
    setItems(list=>[...list,{id:crypto.randomUUID(),productId:first.id,quantity:1,unitCost:asNumber(first.unitCost)}]);
  }
  function changeProduct(id:string,productId:string){
    const product=catalog.data?.products.find(p=>p.id===productId);
    setItems(list=>list.map(item=>item.id===id?{...item,productId,unitCost:product?asNumber(product.unitCost):item.unitCost}:item));
  }
  function reset(){
    setSupplierId("");setDate(new Date().toISOString().slice(0,10));setDocument("");setItems([]);setDiscount("0");setFreight("0");setOtherCosts("0");setMethod("bank_transfer");setInstallments("1");setFirstDueDate(new Date().toISOString().slice(0,10));setDueDay(String(new Date().getDate()));setNotes("");
  }
  const mutation=useMutation({
    mutationFn:()=>{
      if(!supplierId) throw new Error("Selecione um fornecedor.");
      if(!items.length) throw new Error("Inclua ao menos um item na compra.");
      if(items.some(i=>!i.productId||i.quantity<=0||i.unitCost<0)) throw new Error("Revise os itens, quantidades e custos da compra.");
      return jaguarApi.purchases.create({
        supplierId,date,documentNumber,
        items:items.map((i,index)=>({productId:i.productId,quantity:i.quantity,unitCost:i.unitCost,sortOrder:index})),
        discountAmount:asNumber(discount),freightAmount:asNumber(freight),otherCostsAmount:asNumber(otherCosts),
        paymentTerms:{methodCode:method,installmentsCount:Number(installments||1),firstDueDate,dueDay:Number(dueDay||new Date().getDate())},notes,
      });
    },
    onSuccess:async()=>{toast.success("Compra salva como rascunho. Confirme na lista para dar entrada no estoque.");setOpen(false);reset();await onDone();},
    onError:e=>toast.error(e.message),
  });

  return <Dialog open={open} onOpenChange={v=>{setOpen(v);if(!v&&mutation.isIdle){} }}><DialogTrigger asChild><Button variant="outline"><ShoppingCart className="mr-2 h-4 w-4"/>Nova compra</Button></DialogTrigger><DialogContent className="sm:max-w-4xl"><form onSubmit={e=>{e.preventDefault();mutation.mutate();}}><DialogHeader><DialogTitle>Registrar compra</DialogTitle><DialogDescription>Registre todos os itens da compra. A confirmação gera entrada no estoque e as contas a pagar.</DialogDescription></DialogHeader>
    <div className="grid gap-4 py-4 sm:grid-cols-3"><Field label="Fornecedor"><select required className="h-10 rounded-md border border-input bg-background px-3" value={supplierId} onChange={e=>setSupplierId(e.target.value)}><option value="">Selecione...</option>{suppliers.data?.items.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Data da compra"><Input required type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field><Field label="Documento / NF"><Input value={documentNumber} onChange={e=>setDocument(e.target.value)}/></Field></div>
    <div className="rounded-xl border"><div className="flex items-center justify-between border-b px-4 py-3"><div><b className="text-sm">Itens comprados</b><p className="text-xs text-muted-foreground">Quantidade e custo de aquisição por produto.</p></div><Button type="button" size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-4 w-4"/>Adicionar item</Button></div><div className="data-table-wrap border-0"><table className="data-table min-w-[720px]"><thead><tr><th>Produto</th><th>Qtd.</th><th>Custo unit.</th><th>Total</th><th></th></tr></thead><tbody>{items.map(item=>{const product=catalog.data?.products.find(p=>p.id===item.productId);return <tr key={item.id}><td><select required className="h-9 w-full min-w-[280px] rounded-md border bg-background px-2 text-sm" value={item.productId} onChange={e=>changeProduct(item.id,e.target.value)}><option value="">Selecione...</option>{catalog.data?.products.map(p=><option key={p.id} value={p.id}>{p.code?`${p.code} • `:""}{p.description}</option>)}</select>{product&&<small className="mt-1 block text-muted-foreground">Estoque atual: {asNumber(product.available)}</small>}</td><td><Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e=>setItems(list=>list.map(i=>i.id===item.id?{...i,quantity:Number(e.target.value)}:i))}/></td><td><Input type="number" min="0" step="0.01" value={item.unitCost} onChange={e=>setItems(list=>list.map(i=>i.id===item.id?{...i,unitCost:Number(e.target.value)}:i))}/></td><td className="font-semibold">{brl(item.quantity*item.unitCost)}</td><td><Button type="button" variant="ghost" size="icon" className="text-destructive" disabled={items.length===1} onClick={()=>setItems(list=>list.filter(i=>i.id!==item.id))}><XCircle className="h-4 w-4"/></Button></td></tr>})}</tbody></table></div></div>
    <div className="grid gap-4 py-4 sm:grid-cols-3"><Field label="Desconto"><Input type="number" min="0" step="0.01" value={discount} onChange={e=>setDiscount(e.target.value)}/></Field><Field label="Frete"><Input type="number" min="0" step="0.01" value={freight} onChange={e=>setFreight(e.target.value)}/></Field><Field label="Outros custos"><Input type="number" min="0" step="0.01" value={otherCosts} onChange={e=>setOtherCosts(e.target.value)}/></Field><Field label="Forma prevista"><select className="h-10 rounded-md border border-input bg-background px-3" value={method} onChange={e=>setMethod(e.target.value)}>{catalog.data?.paymentMethods.map(m=><option key={m.code} value={m.code}>{m.name}</option>)}</select></Field><Field label="Parcelas"><Input type="number" min="1" max="60" value={installments} onChange={e=>setInstallments(e.target.value)}/></Field><Field label="Primeiro vencimento"><Input type="date" value={firstDueDate} onChange={e=>setFirstDueDate(e.target.value)}/></Field><Field label="Dia dos próximos vencimentos"><Input type="number" min="1" max="31" value={dueDay} onChange={e=>setDueDay(e.target.value)}/></Field><label className="form-field sm:col-span-2"><span>Observações</span><Input value={notes} onChange={e=>setNotes(e.target.value)}/></label></div>
    <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-2"><span>Subtotal dos itens <b className="ml-1">{brl(subtotal)}</b></span><span className="sm:text-right">Total da compra <b className="ml-1 text-base">{brl(total)}</b></span></div><DialogFooter className="mt-4"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending||!items.length}>{mutation.isPending?"Salvando...":"Salvar rascunho"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function PurchaseRow({purchase,onDone}:{purchase:PurchaseListItemApi;onDone:()=>Promise<void>|void}){
  const confirm=useMutation({mutationFn:()=>jaguarApi.purchases.confirm(purchase.id),onSuccess:async()=>{toast.success("Compra confirmada: estoque e contas a pagar atualizados.");await onDone();},onError:e=>toast.error(e.message)});
  const cancel=useMutation({mutationFn:()=>jaguarApi.purchases.cancel(purchase.id),onSuccess:async()=>{toast.success("Compra cancelada.");await onDone();},onError:e=>toast.error(e.message)});
  return <tr><td className="font-semibold">{purchase.number}</td><td>{datePt(purchase.date)}</td><td>{purchase.supplier}</td><td>{purchase.documentNumber||"—"}</td><td className="font-semibold">{brl(asNumber(purchase.total))}</td><td><StatusPill label={purchase.status==="draft"?"Rascunho":purchase.status==="confirmed"?"Confirmada":"Cancelada"} tone={purchase.status==="confirmed"?"positive":purchase.status==="cancelled"?"danger":"warning"}/></td><td><div className="flex gap-1">{purchase.status==="draft"&&<><PurchaseEditDialog purchase={purchase} onDone={onDone}/><Button size="sm" variant="outline" onClick={()=>confirm.mutate()} disabled={confirm.isPending}><CheckCircle2 className="mr-1 h-4 w-4"/>Confirmar</Button><Button size="sm" variant="ghost" onClick={()=>cancel.mutate()} disabled={cancel.isPending}><XCircle className="mr-1 h-4 w-4"/>Cancelar</Button></>}<DeleteAction iconOnly title={`Excluir ${purchase.number}?`} description="A compra será excluída. Se já estiver confirmada, suas entradas de estoque, contas a pagar e pagamentos vinculados também serão removidos para desfazer os efeitos do registro." onDelete={()=>jaguarApi.remove("purchase",purchase.id)} onDone={onDone}/></div></td></tr>;
}

function PurchaseEditDialog({purchase,onDone}:{purchase:PurchaseListItemApi;onDone:()=>Promise<void>|void}){
  const [open,setOpen]=useState(false);
  const detail=useQuery({queryKey:["purchase",purchase.id],queryFn:()=>jaguarApi.purchases.detail(purchase.id),enabled:open});
  const [date,setDate]=useState(purchase.date); const [documentNumber,setDocument]=useState(purchase.documentNumber||""); const [freight,setFreight]=useState("0"); const [notes,setNotes]=useState("");
  useEffect(()=>{const p=detail.data?.purchase;if(p){setDate(p.date);setDocument(p.documentNumber||"");setFreight(String(p.freightAmount??0));setNotes(p.notes||"")}},[detail.data]);
  const mutation=useMutation({mutationFn:()=>{const p=detail.data?.purchase;if(!p)throw new Error("Compra ainda não carregada.");return jaguarApi.purchases.update({id:p.id,supplierId:p.supplierId,date,documentNumber,items:p.items.map(i=>({productId:i.productId,description:i.description,quantity:asNumber(i.quantity),unitCost:asNumber(i.unitCost)})),discountAmount:asNumber(p.discountAmount),freightAmount:Number(freight||0),otherCostsAmount:asNumber(p.otherCostsAmount),paymentTerms:p.paymentTerms||{},notes})},onSuccess:async()=>{toast.success("Compra atualizada.");setOpen(false);await onDone();},onError:e=>toast.error(e.message)});
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant="ghost"><Pencil className="h-4 w-4"/></Button></DialogTrigger><DialogContent><form onSubmit={e=>{e.preventDefault();mutation.mutate();}}><DialogHeader><DialogTitle>Editar {purchase.number}</DialogTitle><DialogDescription>Somente compras em rascunho podem ser alteradas.</DialogDescription></DialogHeader>{detail.isLoading?<div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div>:<div className="grid gap-4 py-4 sm:grid-cols-2"><Field label="Data"><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field><Field label="Documento / NF"><Input value={documentNumber} onChange={e=>setDocument(e.target.value)}/></Field><Field label="Frete"><Input type="number" min="0" step="0.01" value={freight} onChange={e=>setFreight(e.target.value)}/></Field><Field label="Itens"><Input disabled value={`${detail.data?.purchase.items.length??0} item(ns) • ${brl(asNumber(detail.data?.purchase.total))}`}/></Field><label className="form-field sm:col-span-2"><span>Observações</span><Input value={notes} onChange={e=>setNotes(e.target.value)}/></label></div>}<DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={mutation.isPending||detail.isLoading}>Salvar alterações</Button></DialogFooter></form></DialogContent></Dialog>
}

function Field({label,children}:{label:string;children:ReactNode}){return <label className="form-field"><span>{label}</span>{children}</label>}
