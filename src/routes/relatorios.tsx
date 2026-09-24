import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarRange,
  Download,
  FileBarChart,
  FileText,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import {
  Area,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InternalPage, StatCard, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { monthlyRevenue } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/relatorios")({ component: ReportsPage });

const reports = [
  {
    title: "Relatório de custos",
    description: "Evolução dos custos operacionais.",
    value: 92700,
    icon: FileBarChart,
    accent: "orange",
  },
  {
    title: "Fluxo de caixa",
    description: "Entradas, saídas e saldo projetado.",
    value: 282430,
    icon: WalletCards,
    accent: "red",
  },
  {
    title: "Contas a receber",
    description: "Clientes e títulos em aberto.",
    value: 82430,
    icon: ReceiptText,
    accent: "green",
  },
  {
    title: "Contas a pagar",
    description: "Fornecedores e obrigações.",
    value: 37260,
    icon: CalendarRange,
    accent: "red",
  },
  {
    title: "Estoque",
    description: "Movimentação e posição atual.",
    value: 45170,
    icon: FileText,
    accent: "graphite",
  },
] as const;

const annual = monthlyRevenue.map((item, index) => ({
  ...item,
  trend: Math.max(item.current || item.previous * 1.12, item.previous * (1.12 + index * 0.008)),
}));

export function ReportsPage() {
  return (
    <InternalPage>
      <PageHeader
        title="Relatórios"
        subtitle="Analise faturamento, custos, caixa e estoque com poucos cliques."
        right={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Ano de 2026</Button>
            <Button variant="outline">Demonstrativo de Faturamento</Button>
            <Button>Aplicar filtros</Button>
          </div>
        }
      />

      <aside className="report-kpis">
        <StatCard
          label="Faturamento total (2026)"
          value={brl(202950)}
          icon={ReceiptText}
          accent="red"
          detail="↑ 18,7% vs. 2025"
        />
        <StatCard
          label="Valor recebido"
          value={brl(186430)}
          icon={ReceiptText}
          accent="green"
          detail="91,9% do faturado"
        />
        <StatCard
          label="Custos totais"
          value={brl(92700)}
          icon={FileBarChart}
          accent="orange"
          detail="45,7% do faturamento"
        />
        <StatCard
          label="Resultado bruto"
          value={brl(110250)}
          icon={BarChart3}
          accent="graphite"
          detail="Margem bruta estimada"
        />
      </aside>
      <div className="report-layout">
        <section className="panel annual-report-card">
          <div className="annual-report-card__header">
            <div>
              <span>FATURAMENTO</span>
              <h2>Demonstrativo de Faturamento Anual</h2>
              <p>Comparativo mensal de faturamento — 2026 × 2025</p>
            </div>
            <div className="chart-legend-inline">
              <span>
                <i className="expense" />
                2026
              </span>
              <span>
                <i className="balance" />
                2025
              </span>
              <span>
                <i className="trend" />
                Tendência
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={annual} margin={{ left: -4, right: 12, top: 20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
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
                  dataKey="current"
                  name="2026"
                  stroke="var(--accent-red)"
                  fill="var(--accent-red)"
                  fillOpacity={0.14}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Area
                  dataKey="previous"
                  name="2025"
                  stroke="var(--chart-graphite-muted)"
                  fill="var(--chart-graphite-muted)"
                  fillOpacity={0.06}
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                />
                <Line
                  dataKey="trend"
                  name="Tendência"
                  stroke="var(--accent-graphite)"
                  strokeWidth={2.2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {reports.map(({ title, description, value, icon: Icon, accent }) => (
          <article key={title} className="panel report-metric-card">
            <div className="report-metric-card__top">
              <span data-accent={accent}>
                <Icon className="h-5 w-5" />
              </span>
              <Button variant="ghost" size="sm">
                Abrir
              </Button>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <b>{brl(value)}</b>
            <div className="report-mini-bars">
              {[42, 58, 50, 71, 64, 78, 68, 82, 86, 92, 84, 96].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <Button variant="outline" className="mt-3 w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </article>
        ))}
      </div>

      <section className="panel report-table-card">
        <div className="table-section-heading">
          <div>
            <span>RESUMO</span>
            <h2>Principais indicadores do ano</h2>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar tabela
          </Button>
        </div>
        <div className="data-table-wrap border-0">
          <table className="data-table min-w-[680px]">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Faturamento 2026</th>
                <th>Faturamento 2025</th>
                <th>Custos 2026</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue.map((item, index) => (
                <tr key={item.month}>
                  <td className="font-semibold">{item.month}</td>
                  <td>{item.current ? brl(item.current) : "—"}</td>
                  <td>{brl(item.previous)}</td>
                  <td>
                    {item.current
                      ? brl(Math.round(item.current * (0.38 + (index % 3) * 0.025)))
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-3 font-semibold">Total anual</td>
                <td className="p-3 font-bold">
                  {brl(202950)} <small className="text-[var(--accent-green)]">+18,7%</small>
                </td>
                <td className="p-3">—</td>
                <td className="p-3 font-bold">
                  {brl(92700)} <small className="text-[var(--accent-red)]">+12,4%</small>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </InternalPage>
  );
}
