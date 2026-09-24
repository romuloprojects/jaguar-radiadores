import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarDays, FileText, MapPin, Pencil, Phone, Plus, Search, UserRound, Users, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar, InternalPage, StatCard, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { customers, quotes, receivables } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/clientes")({ component: CustomersPage });

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"ALL" | "PF" | "PJ">("ALL");
  const [selectedId, setSelectedId] = useState(customers[0].id);
  const selected = customers.find((customer) => customer.id === selectedId) ?? customers[0];
  const filtered = useMemo(() => customers.filter((c) => {
    const haystack = `${c.name} ${c.phone} ${c.document} ${c.city}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (kind === "ALL" || c.kind === kind);
  }), [query, kind]);
  const selectedQuotes = quotes.filter((quote) => quote.customerId === selected.id);
  const selectedReceivables = receivables.filter((item) => item.customer === selected.name && item.status !== "Pago");

  return (
    <InternalPage>
      <PageHeader title="Clientes" subtitle="Cadastre, pesquise e acompanhe o histórico de cada cliente." right={<NewCustomerDialog />} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes ativos" value="127" detail="Base de homologação" icon={Users} accent="red" />
        <StatCard label="Pessoa Jurídica (PJ)" value="71" detail="56% da carteira" icon={Building2} accent="graphite" />
        <StatCard label="Pessoa Física (PF)" value="56" detail="44% da carteira" icon={UserRound} accent="graphite" />
        <StatCard label="Com saldo em aberto" value="18" detail="Requer acompanhamento" icon={WalletCards} accent="orange" />
      </div>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[1.45fr_.95fr]">
        <div className="space-y-3 min-w-0">
          <FilterBar>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, telefone, CPF ou CNPJ..." /></div>
              <div className="segmented-control">{(["ALL","PJ","PF"] as const).map((item) => <button key={item} onClick={() => setKind(item)} className={kind === item ? "is-active" : ""}>{item === "ALL" ? "Todos" : item}</button>)}</div>
            </div>
          </FilterBar>

          <div className="panel data-table-wrap">
            <table className="data-table min-w-[880px]">
              <thead><tr><th>Cliente</th><th>Documento</th><th>Telefone</th><th>Cidade</th><th>Tipo</th><th>Último atendimento</th><th>Status</th></tr></thead>
              <tbody>{filtered.map((c) => <tr key={c.id} className={selectedId === c.id ? "is-selected-row" : ""} onClick={() => setSelectedId(c.id)}><td><button className="text-left font-semibold text-foreground">{c.name}</button>{c.responsible && <small className="block text-muted-foreground">Resp. {c.responsible}</small>}</td><td>{c.document}</td><td>{c.phone}</td><td>{c.city} - {c.state}</td><td><StatusPill label={c.kind} tone={c.kind === "PJ" ? "info" : "neutral"}/></td><td>{c.lastService}</td><td><StatusPill label={c.openBalance > 0 ? "Em aberto" : "Ativo"} tone={c.openBalance > 0 ? "warning" : "positive"}/></td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <aside className="panel customer-detail-panel">
          <div className="customer-detail-panel__header">
            <div className="customer-mark">{selected.kind === "PJ" ? <Building2/> : <UserRound/>}</div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2>{selected.name}</h2><StatusPill label="Ativo" tone="positive"/></div><p>Cliente desde 2024 · Cód. {selected.id.replace("cli-", "#")}</p></div>
            <Button asChild variant="outline" size="sm" className="ml-auto"><Link to="/clientes/$clienteId" params={{ clienteId: selected.id }}><Pencil className="mr-2 h-3.5 w-3.5"/>Editar</Link></Button>
          </div>

          <div className="customer-detail-grid">
            <section><h3>Informações de contato</h3><div className="detail-line"><Building2/><span>{selected.document}</span></div><div className="detail-line"><Phone/><span>{selected.phone}</span></div><div className="detail-line"><MapPin/><span>{selected.address}<br/>{selected.city} - {selected.state}</span></div></section>
            <section><h3>Resumo financeiro</h3><div className="money-line"><span>Faturado</span><b>{brl(selected.totalBilled)}</b></div><div className="money-line"><span>Em aberto</span><b className={selected.openBalance ? "text-[var(--accent-red)]" : "text-[var(--accent-green)]"}>{brl(selected.openBalance)}</b></div><div className="money-line"><span>Último atendimento</span><b>{selected.lastService}</b></div></section>
          </div>

          <section className="detail-section"><div className="detail-section__title"><h3>Veículos / equipamentos vinculados</h3><span>{selected.vehicles.length}</span></div><div className="grid gap-2 sm:grid-cols-2">{selected.vehicles.map((vehicle) => <div key={vehicle.id} className="vehicle-chip"><div className="vehicle-chip__icon">{vehicle.type.slice(0,1)}</div><div><b>{[vehicle.brand,vehicle.model].filter(Boolean).join(" ") || vehicle.type}</b><span>{vehicle.plate ?? "Sem placa"}</span></div></div>)}</div></section>

          <div className="grid gap-3 lg:grid-cols-2">
            <section className="detail-section"><div className="detail-section__title"><h3>Últimos orçamentos</h3><FileText className="h-4 w-4"/></div>{selectedQuotes.length ? selectedQuotes.slice(0,4).map((quote) => <div className="compact-line" key={quote.id}><div><b>{quote.number}</b><span>{quote.date}</span></div><div className="text-right"><b>{brl(quote.total)}</b><StatusPill label={quote.status} tone={quote.status === "Pago" || quote.status === "Aprovado" ? "positive" : "warning"}/></div></div>) : <p className="detail-empty">Nenhum orçamento recente.</p>}</section>
            <section className="detail-section"><div className="detail-section__title"><h3>Contas em aberto</h3><CalendarDays className="h-4 w-4"/></div>{selectedReceivables.length ? selectedReceivables.map((item) => <div className="compact-line" key={item.id}><div><b>{item.dueDate}</b><span>{item.reference}</span></div><b>{brl(item.amount-item.paid)}</b></div>) : <p className="detail-empty">Nenhum título em aberto.</p>}</section>
          </div>
        </aside>
      </div>
    </InternalPage>
  );
}

function NewCustomerDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4"/>Novo Cliente</Button></DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Novo cliente</DialogTitle><DialogDescription>Protótipo visual. Os dados não serão persistidos nesta etapa.</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <label className="form-field sm:col-span-2"><span>Tipo</span><div className="segmented-control w-fit"><button className="is-active"><UserRound className="h-3.5 w-3.5"/>Pessoa Física</button><button><Building2 className="h-3.5 w-3.5"/>Pessoa Jurídica</button></div></label>
          <label className="form-field"><span>Nome / Razão Social</span><Input placeholder="Nome do cliente" /></label>
          <label className="form-field"><span>CPF / CNPJ</span><Input placeholder="000.000.000-00" /></label>
          <label className="form-field"><span>Telefone / WhatsApp</span><Input placeholder="(00) 00000-0000" /></label>
          <label className="form-field"><span>Responsável</span><Input placeholder="Opcional" /></label>
          <label className="form-field sm:col-span-2"><span>Endereço</span><Input placeholder="Rua, número, bairro, cidade - UF" /></label>
        </div>
        <DialogFooter><Button variant="outline">Cancelar</Button><Button>Salvar cliente</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
