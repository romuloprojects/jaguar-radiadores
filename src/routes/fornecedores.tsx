import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Truck,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  FilterBar,
  InternalPage,
  StatCard,
  StatusPill,
  chartTooltipStyle,
} from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suppliers } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/fornecedores")({ component: SuppliersPage });

const supplierHistory = [
  { month: "Abr", value: 4200 },
  { month: "Mai", value: 7800 },
  { month: "Jun", value: 6100 },
  { month: "Jul", value: 9200 },
  { month: "Ago", value: 11400 },
  { month: "Set", value: 12800 },
];

function SuppliersPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(suppliers[0].id);
  const selected = suppliers.find((supplier) => supplier.id === selectedId) ?? suppliers[0];
  const filtered = useMemo(
    () =>
      suppliers.filter((s) =>
        `${s.name} ${s.document} ${s.contact} ${s.city}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <InternalPage>
      <PageHeader
        title="Fornecedores"
        subtitle="Organize parceiros, contatos, compras e pendências financeiras."
        right={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo fornecedor
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Fornecedores ativos"
          value="42"
          icon={Building2}
          accent="red"
          detail="Base cadastrada"
        />
        <StatCard
          label="Compras do mês"
          value={brl(124580)}
          icon={ShoppingCart}
          accent="green"
          detail="Peças e consumíveis"
        />
        <StatCard
          label="Em aberto"
          value={brl(suppliers.reduce((s, x) => s + x.openBalance, 0))}
          icon={WalletCards}
          accent="red"
          detail="Contas com fornecedores"
        />
        <StatCard
          label="Prazo médio"
          value="23 dias"
          icon={CalendarDays}
          accent="graphite"
          detail="Condição média de pagamento"
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-3 min-w-0">
          <FilterBar>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome, CNPJ, contato ou cidade..."
                />
              </div>
              <Button variant="outline">Todas as categorias</Button>
              <Button variant="outline">Todas as cidades</Button>
            </div>
          </FilterBar>
          <div className="panel data-table-wrap">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Documento</th>
                  <th>Contato</th>
                  <th>Telefone</th>
                  <th>Cidade</th>
                  <th>Última compra</th>
                  <th>Em aberto</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={selectedId === s.id ? "is-selected-row" : ""}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <td className="font-semibold">
                      <button>{s.name}</button>
                      <small className="block text-muted-foreground">Peças e componentes</small>
                    </td>
                    <td>{s.document}</td>
                    <td>{s.contact}</td>
                    <td>{s.phone}</td>
                    <td>{s.city}</td>
                    <td>{s.lastPurchase}</td>
                    <td
                      className={
                        s.openBalance
                          ? "font-semibold text-[var(--accent-red)]"
                          : "font-semibold text-[var(--accent-green)]"
                      }
                    >
                      {brl(s.openBalance)}
                    </td>
                    <td>
                      <StatusPill label="Ativo" tone="positive" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel supplier-detail-panel">
          <div className="supplier-detail-panel__header">
            <div className="supplier-monogram">
              {selected.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2>{selected.name}</h2>
                <StatusPill label="Ativo" tone="positive" />
              </div>
              <p>{selected.document}</p>
            </div>
          </div>
          <div className="supplier-detail-tabs">
            <button className="is-active">Visão Geral</button>
            <button>Produtos</button>
            <button>Compras</button>
            <button>Financeiro</button>
          </div>
          <div className="grid gap-3">
            <section className="detail-section">
              <h3>Dados do fornecedor</h3>
              <div className="detail-line">
                <Building2 />
                <span>{selected.document}</span>
              </div>
              <div className="detail-line">
                <Phone />
                <span>{selected.phone}</span>
              </div>
              {selected.email && (
                <div className="detail-line">
                  <Mail />
                  <span>{selected.email}</span>
                </div>
              )}
              <div className="detail-line">
                <MapPin />
                <span>{selected.city}</span>
              </div>
              <div className="detail-line">
                <Truck />
                <span>Contato: {selected.contact}</span>
              </div>
            </section>
            <section className="detail-section">
              <h3>Compras nos últimos 6 meses</h3>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supplierHistory}
                    margin={{ left: -18, right: 4, top: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v / 1000}k`}
                      tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                    <Bar dataKey="value" fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <section className="detail-section">
              <h3>Produtos fornecidos</h3>
              {[
                "Colmeia linha pesada",
                "Conexão superior 45 mm",
                "Intercooler linha pesada",
                "Tampa de radiador",
              ].map((item, index) => (
                <div className="compact-line" key={item}>
                  <span>RAD-{String(index + 1).padStart(3, "0")}</span>
                  <b>{item}</b>
                </div>
              ))}
            </section>
            <section className="detail-section">
              <h3>Resumo financeiro</h3>
              <div className="money-line">
                <span>Compras no ano</span>
                <b>{brl(selected.purchasesYtd)}</b>
              </div>
              <div className="money-line">
                <span>Em aberto</span>
                <b className="text-[var(--accent-red)]">{brl(selected.openBalance)}</b>
              </div>
              <div className="money-line">
                <span>Última compra</span>
                <b>{selected.lastPurchase}</b>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </InternalPage>
  );
}
