import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes, PackageSearch, Plus, Search, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar, InternalPage, StatCard, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stockItems } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/estoque")({ component: InventoryPage });

function InventoryPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => stockItems.filter((i) => `${i.code} ${i.description} ${i.category} ${i.supplier}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const inventoryValue = stockItems.reduce((s, i) => s + i.current * i.unitCost, 0);
  const low = stockItems.filter((i) => i.status !== "Normal").length;
  return (
    <InternalPage>
      <PageHeader title="Estoque" subtitle="Controle de peças, reservas, custos, preços de venda e níveis mínimos." icon={Warehouse} right={<Button><Plus className="mr-2 h-4 w-4"/>Novo item</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Itens cadastrados" value={stockItems.length} icon={Boxes} accent="blue" />
        <StatCard label="Estoque baixo / crítico" value={low} detail="Requer reposição" icon={AlertTriangle} accent="red" />
        <StatCard label="Valor estimado em estoque" value={brl(inventoryValue)} icon={Warehouse} accent="green" />
        <StatCard label="Itens reservados" value={stockItems.reduce((s, i) => s + i.reserved, 0)} detail="Ligados a atendimentos" icon={PackageSearch} accent="orange" />
      </div>
      <FilterBar><div className="relative max-w-2xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por código, descrição, categoria ou fornecedor..."/></div></FilterBar>
      <div className="panel data-table-wrap">
        <table className="data-table min-w-[1050px]"><thead><tr><th>Código</th><th>Descrição</th><th>Categoria</th><th>Fornecedor</th><th>Atual</th><th>Reservado</th><th>Disponível</th><th>Mínimo</th><th>Custo</th><th>Venda</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td className="font-semibold">{item.code}</td><td>{item.description}</td><td>{item.category}</td><td>{item.supplier}</td><td>{item.current}</td><td>{item.reserved}</td><td className="font-semibold">{item.current - item.reserved}</td><td>{item.minimum}</td><td>{brl(item.unitCost)}</td><td>{brl(item.salePrice)}</td><td><StatusPill label={item.status} tone={item.status === "Normal" ? "positive" : item.status === "Baixo" ? "warning" : "danger"}/></td></tr>)}</tbody></table>
      </div>
      <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-xs text-muted-foreground"><b className="text-foreground">Regra prevista:</b> itens de peça serão reservados quando o orçamento for aprovado e baixados do estoque na conclusão do atendimento.</div>
    </InternalPage>
  );
}
