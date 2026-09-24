import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDown, ArrowUp, Boxes, Camera, PackageSearch, Plus, Search, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { FilterBar, InternalPage, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stockItems } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/estoque")({ component: InventoryPage });

const recentMoves = [
  { id: 1, kind: "Entrada", description: "Colmeia caminhão linha pesada", amount: "+ 4 un.", date: "23/09/2026 14:32" },
  { id: 2, kind: "Saída", description: "Conexão superior 45 mm", amount: "- 2 un.", date: "23/09/2026 11:18" },
  { id: 3, kind: "Ajuste", description: "Mangueira reforçada 2\"", amount: "+ 2 un.", date: "22/09/2026 16:45" },
  { id: 4, kind: "Reserva", description: "Tampa de radiador 1.1 bar", amount: "- 1 un.", date: "22/09/2026 10:27" },
];

function InventoryPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => stockItems.filter((i) => `${i.code} ${i.description} ${i.category} ${i.supplier}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const inventoryValue = stockItems.reduce((s, i) => s + i.current * i.unitCost, 0);
  const low = stockItems.filter((i) => i.status !== "Normal").length;
  const normalCount = stockItems.filter((item) => item.status === "Normal").length;
  const lowCount = stockItems.filter((item) => item.status === "Baixo").length;
  const criticalCount = stockItems.filter((item) => item.status === "Crítico").length;
  const distribution = [
    { name: "Em estoque", value: normalCount, color: "var(--accent-green)" },
    { name: "Estoque baixo", value: lowCount, color: "var(--accent-orange)" },
    { name: "Crítico", value: criticalCount, color: "var(--accent-red)" },
  ];

  return (
    <InternalPage>
      <PageHeader title="Estoque" subtitle="Controle peças, saldos, reservas e movimentações. Fotos reais ficam restritas a este módulo." right={<Button><Plus className="mr-2 h-4 w-4"/>Novo item</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Itens cadastrados" value="435" icon={Boxes} accent="red" detail="Catálogo de peças e consumíveis" />
        <StatCard label="Estoque crítico" value="29" detail="Reposição prioritária" icon={AlertTriangle} accent="orange" />
        <StatCard label="Valor em estoque" value={brl(inventoryValue * 18.5)} icon={Warehouse} accent="green" detail="Custo estimado" />
        <StatCard label="Itens reservados" value={stockItems.reduce((s, i) => s + i.reserved, 0)} detail="Ligados a atendimentos" icon={PackageSearch} accent="graphite" />
      </div>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[1.55fr_.55fr]">
        <div className="space-y-3 min-w-0">
          <FilterBar><div className="flex flex-col gap-3 lg:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto, código, categoria ou fornecedor..."/></div><Button variant="outline">Todas as categorias</Button><Button variant="outline">Todos os fornecedores</Button><Button variant="outline">Todos os status</Button></div></FilterBar>
          <div className="panel data-table-wrap">
            <table className="data-table min-w-[1050px]"><thead><tr><th>Item</th><th>Código</th><th>Produto</th><th>Categoria</th><th>Atual</th><th>Reservado</th><th>Disponível</th><th>Custo médio</th><th>Preço venda</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{item.imageUrl ? <img src={item.imageUrl} alt={item.description} className="inventory-photo"/> : <div className="inventory-photo-slot" title="Espaço reservado para foto real do item"><Camera className="h-4 w-4"/><span>Foto</span></div>}</td><td className="font-semibold text-muted-foreground">{item.code}</td><td><b className="block text-foreground">{item.description}</b><small className="text-muted-foreground">{item.supplier}</small></td><td>{item.category}</td><td>{item.current}</td><td>{item.reserved}</td><td className={item.current-item.reserved <= item.minimum ? "font-bold text-[var(--accent-red)]" : "font-bold text-[var(--accent-green)]"}>{item.current - item.reserved}</td><td>{brl(item.unitCost)}</td><td>{brl(item.salePrice)}</td><td><StatusPill label={item.status} tone={item.status === "Normal" ? "positive" : item.status === "Baixo" ? "warning" : "danger"}/></td></tr>)}</tbody></table>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="panel inventory-side-card"><h2>Distribuição do estoque</h2><div className="inventory-donut"><div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={2}>{distribution.map((entry) => <Cell key={entry.name} fill={entry.color}/>)}</Pie><Tooltip contentStyle={chartTooltipStyle}/></PieChart></ResponsiveContainer></div><div className="inventory-donut__center"><b>435</b><span>itens</span></div></div><div className="inventory-legend">{distribution.map((entry) => <div key={entry.name}><i style={{background: entry.color}}/><span>{entry.name}</span><b>{entry.value}</b></div>)}</div></section>
          <section className="panel inventory-side-card"><div className="flex items-center justify-between"><h2>Movimentações recentes</h2><Button variant="ghost" size="sm">Ver todas</Button></div><div className="mt-3 space-y-1">{recentMoves.map((move) => <div className="stock-move" key={move.id}><span className={move.kind === "Entrada" || move.kind === "Ajuste" ? "positive" : "negative"}>{move.kind === "Entrada" || move.kind === "Ajuste" ? <ArrowDown/> : <ArrowUp/>}</span><div><b>{move.kind}</b><small>{move.description}</small></div><div className="text-right"><b>{move.amount}</b><small>{move.date}</small></div></div>)}</div></section>
        </aside>
      </div>
    </InternalPage>
  );
}
