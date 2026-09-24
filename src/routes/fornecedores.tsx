import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Search, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar, InternalPage, StatCard } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suppliers } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/fornecedores")({ component: SuppliersPage });

function SuppliersPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => suppliers.filter((s) => `${s.name} ${s.document} ${s.contact} ${s.city}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <InternalPage>
      <PageHeader title="Fornecedores" subtitle="Cadastros conectados às peças, compras e contas a pagar." icon={Truck} right={<Button><Plus className="mr-2 h-4 w-4"/>Novo fornecedor</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Fornecedores ativos" value={suppliers.length} icon={Building2} accent="blue"/><StatCard label="Compras no ano" value={brl(suppliers.reduce((s, x) => s+x.purchasesYtd,0))} icon={Truck} accent="green"/><StatCard label="Contas em aberto" value={brl(suppliers.reduce((s, x) => s+x.openBalance,0))} icon={Truck} accent="red"/><StatCard label="Última compra" value="19/09/2026" icon={Truck} accent="orange"/></div>
      <FilterBar><div className="relative max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar fornecedor, CNPJ, contato ou cidade..."/></div></FilterBar>
      <div className="panel data-table-wrap"><table className="data-table min-w-[950px]"><thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Contato</th><th>Telefone</th><th>Cidade</th><th>Compras no ano</th><th>Em aberto</th><th>Última compra</th></tr></thead><tbody>{filtered.map((s) => <tr key={s.id}><td className="font-semibold">{s.name}</td><td>{s.document}</td><td>{s.contact}</td><td>{s.phone}</td><td>{s.city}</td><td>{brl(s.purchasesYtd)}</td><td className={s.openBalance ? "font-semibold text-[var(--accent-red)]" : "font-semibold text-[var(--accent-green)]"}>{brl(s.openBalance)}</td><td>{s.lastPurchase}</td></tr>)}</tbody></table></div>
    </InternalPage>
  );
}
