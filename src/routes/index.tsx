import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Banknote,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FileClock,
  PackageCheck,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";
import {
  InternalPage,
  SectionPanel,
  StatusPill,
  chartTooltipStyle,
} from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import {
  cashFlowProjection,
  monthlyRevenue,
  payables,
  quotes,
  receivables,
  stockItems,
} from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/")({ component: DashboardPage });

function statusTone(status: string) {
  if (["Pago", "Concluído", "Aprovado"].includes(status)) return "positive" as const;
  if (["Aguardando"].includes(status)) return "warning" as const;
  if (["Em execução"].includes(status)) return "info" as const;
  if (["Recusado"].includes(status)) return "danger" as const;
  return "neutral" as const;
}

function DashboardPage() {
  const upcoming = [
    ...receivables
      .filter((item) => item.status !== "Pago")
      .slice(0, 3)
      .map((item) => ({
        date: item.dueDate,
        description: item.customer,
        kind: "A receber",
        amount: item.amount - item.paid,
        status: item.status,
      })),
    ...payables
      .filter((item) => item.status !== "Pago")
      .slice(0, 2)
      .map((item) => ({
        date: item.dueDate,
        description: item.supplier,
        kind: "A pagar",
        amount: item.amount,
        status: item.status,
      })),
  ];
  const lowStock = stockItems.filter((item) => item.status !== "Normal");

  return (
    <InternalPage>
      <PageHeader
        title="Visão Geral"
        subtitle="Acompanhe os principais indicadores da empresa em tempo real."
        right={
          <div className="period-chip">
            <CalendarDays className="h-4 w-4" />
            <span>Período</span>
            <b>Setembro de 2026</b>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Banknote}
          label="Faturamento do mês"
          value={brl(28450)}
          detail="↑ 12% em relação a agosto"
          tone="red"
        />
        <KpiCard
          icon={CreditCard}
          label="A receber"
          value={brl(12300)}
          detail="5 títulos em aberto"
          tone="green"
        />
        <KpiCard
          icon={Wallet}
          label="A pagar"
          value={brl(8750)}
          detail="4 compromissos em aberto"
          tone="red"
        />
        <KpiCard
          icon={Banknote}
          label="Saldo projetado"
          value={brl(21500)}
          detail="Próximos 30 dias"
          tone="graphite"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={FileClock}
          label="Orçamentos abertos"
          value="4"
          detail="Aguardando retorno do cliente"
          tone="graphite"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Em execução"
          value="3"
          detail="Serviços em andamento"
          tone="amber"
        />
        <KpiCard
          icon={PackageCheck}
          label="Prontos para entrega"
          value="2"
          detail="Aguardando retirada"
          tone="green"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Estoque crítico"
          value="5"
          detail="Itens precisam de reposição"
          tone="red"
        />
      </div>

      <div className="dashboard-charts">
        <SectionPanel
          title="Faturamento mensal"
          subtitle="Comparativo dos últimos meses"
          icon={Banknote}
        >
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyRevenue.slice(3, 9)}
                margin={{ left: -10, right: 6, top: 12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v / 1000}k`}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  name="2025"
                  dataKey="previous"
                  stroke="var(--chart-graphite-muted)"
                  fill="var(--chart-graphite-muted)"
                  fillOpacity={0.04}
                  strokeWidth={1.5}
                />
                <Area
                  name="2026"
                  dataKey="current"
                  type="monotone"
                  stroke="var(--accent-red)"
                  fill="var(--accent-red)"
                  fillOpacity={0.14}
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: "var(--accent-red)",
                    stroke: "var(--foreground)",
                    strokeWidth: 1,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Fluxo de caixa" subtitle="Próximos 30 dias" icon={Wallet}>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cashFlowProjection}
                margin={{ left: -10, right: 8, top: 12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v / 1000}k`}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  name="Entradas"
                  dataKey="income"
                  fill="var(--accent-green)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Saídas"
                  dataKey="expense"
                  fill="var(--accent-red)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  name="Saldo projetado"
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--accent-graphite)"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: "var(--card)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>
      </div>

      <div className="dashboard-lists">
        <SectionPanel
          title="Últimos orçamentos"
          subtitle="Atendimentos recentes"
          icon={Boxes}
          right={
            <Button asChild variant="ghost" size="sm">
              <Link to="/orcamentos">Ver todos</Link>
            </Button>
          }
        >
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Orçamento / Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.slice(0, 6).map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <Link
                        to="/orcamentos/$orcamentoId"
                        params={{ orcamentoId: quote.id }}
                        className="font-semibold"
                      >
                        {quote.number}
                        <small className="block mt-1 text-muted-foreground font-normal">
                          {quote.customerName}
                        </small>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap font-semibold">{brl(quote.total)}</td>
                    <td>
                      <StatusPill label={quote.status} tone={statusTone(quote.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
        <SectionPanel
          title="Contas com vencimento próximo"
          subtitle="Receber e pagar no mesmo acompanhamento"
          icon={CalendarDays}
        >
          <div className="data-table-wrap border-0">
            <table className="data-table min-w-[620px]">
              <thead>
                <tr>
                  <th>Vencimento</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((item, idx) => (
                  <tr key={`${item.description}-${idx}`}>
                    <td>{item.date}</td>
                    <td className="font-medium">{item.description}</td>
                    <td>
                      <StatusPill
                        label={item.kind}
                        tone={item.kind === "A receber" ? "positive" : "danger"}
                      />
                    </td>
                    <td className="font-semibold">{brl(item.amount)}</td>
                    <td>
                      <StatusPill
                        label={item.status}
                        tone={item.status === "Vencido" ? "danger" : "warning"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
        <SectionPanel
          title="Itens com estoque baixo"
          subtitle="Itens que precisam de reposição"
          icon={AlertTriangle}
          right={
            <Button asChild variant="ghost" size="sm">
              <Link to="/estoque">Ver estoque</Link>
            </Button>
          }
        >
          <div className="data-table-wrap border-0">
            <table className="data-table min-w-[560px]">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Atual</th>
                  <th>Mínimo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.description}</td>
                    <td>{item.current}</td>
                    <td>{item.minimum}</td>
                    <td>
                      <StatusPill
                        label={item.status}
                        tone={item.status === "Crítico" ? "danger" : "warning"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
      </div>
    </InternalPage>
  );
}
