import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Pencil, Plus, Search, Trash2, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { InternalPage, FilterBar, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { customers } from "@/data/mock/jaguar";

export const Route = createFileRoute("/clientes")({ component: CustomersPage });

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"ALL" | "PF" | "PJ">("ALL");
  const filtered = useMemo(() => customers.filter((c) => {
    const haystack = `${c.name} ${c.phone} ${c.document} ${c.city}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (kind === "ALL" || c.kind === kind);
  }), [query, kind]);

  return (
    <InternalPage>
      <PageHeader title="Clientes" subtitle="Busque por nome, telefone, CPF/CNPJ ou cidade e acesse todo o histórico do cliente." icon={Users} right={<NewCustomerDialog />} />
      <FilterBar>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar clientes por nome, telefone, CPF/CNPJ..." /></div>
          <div className="segmented-control">{(["ALL","PF","PJ"] as const).map((item) => <button key={item} onClick={() => setKind(item)} className={kind === item ? "is-active" : ""}>{item === "ALL" ? `Todos (${customers.length})` : item === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}</button>)}</div>
        </div>
      </FilterBar>
      <div className="panel data-table-wrap">
        <table className="data-table min-w-[900px]">
          <thead><tr><th>Nome / Razão Social</th><th>CPF / CNPJ</th><th>Telefone</th><th>Cidade</th><th>Tipo</th><th>Último atendimento</th><th className="w-28 text-right">Ações</th></tr></thead>
          <tbody>{filtered.map((c) => <tr key={c.id}><td><Link to="/clientes/$clienteId" params={{ clienteId: c.id }} className="font-semibold text-foreground hover:text-primary">{c.name}</Link>{c.responsible && <small className="block text-muted-foreground">Resp. {c.responsible}</small>}</td><td>{c.document}</td><td>{c.phone}</td><td>{c.city} - {c.state}</td><td><StatusPill label={c.kind} tone={c.kind === "PJ" ? "info" : "neutral"}/></td><td>{c.lastService}</td><td><div className="flex justify-end gap-1"><Button asChild variant="ghost" size="icon" className="h-8 w-8"><Link to="/clientes/$clienteId" params={{ clienteId: c.id }}><Pencil className="h-4 w-4"/></Link></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4"/></Button></div></td></tr>)}</tbody>
        </table>
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
