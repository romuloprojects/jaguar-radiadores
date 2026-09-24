import { createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  CalendarDays,
  Download,
  Plus,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InternalPage, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cashFlow, cashFlowProjection, payables, receivables } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/financeiro")({ component: FinancePage });

function FinancePage() {
  const totalReceivable = receivables
    .filter((r) => r.status !== "Pago")
    .reduce((s, r) => s + (r.amount - r.paid), 0);
  const totalPayable = payables
    .filter((p) => p.status !== "Pago")
    .reduce((s, p) => s + p.amount, 0);
  const dueItems = [
    ...receivables
      .filter((r) => r.status !== "Pago")
      .map((r) => ({
        id: r.id,
        date: r.dueDate,
        title: r.customer,
        reference: r.reference,
        type: "A receber",
        amount: r.amount - r.paid,
        status: r.status,
      })),
    ...payables
      .filter((p) => p.status !== "Pago")
      .map((p) => ({
        id: p.id,
        date: p.dueDate,
        title: p.supplier,
        reference: p.category,
        type: "A pagar",
        amount: p.amount,
        status: p.status,
      })),
  ].slice(0, 6);

  return (
    <InternalPage>
      <PageHeader
        title="Financeiro"
        subtitle="Acompanhe fluxo de caixa, contas a receber e contas a pagar em um só lugar."
        right={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo lançamento
            </Button>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saldo atual"
          value={brl(18200)}
          icon={Banknote}
          accent="green"
          detail="Caixa e contas configuradas"
        />
        <StatCard
          label="A receber"
          value={brl(totalReceivable)}
          icon={TrendingUp}
          accent="green"
          detail={`${receivables.filter((r) => r.status !== "Pago").length} títulos em aberto`}
        />
        <StatCard
          label="A pagar"
          value={brl(totalPayable)}
          icon={TrendingDown}
          accent="red"
          detail={`${payables.filter((p) => p.status !== "Pago").length} compromissos`}
        />
        <StatCard
          label="Saldo projetado"
          value={brl(21500)}
          icon={CalendarDays}
          accent="graphite"
          detail="Próximos 30 dias"
        />
      </div>

      <Tabs defaultValue="cashflow" className="space-y-4">
        <TabsList className="finance-tabs">
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
        </TabsList>
        <TabsContent value="cashflow" className="space-y-4">
          <div className="grid min-w-0 gap-4 xl:grid-cols-[1.6fr_.8fr]">
            <section className="panel finance-chart-card">
              <div className="finance-chart-card__header">
                <div>
                  <span>FLUXO PROJETADO</span>
                  <h2>Fluxo de caixa — próximos 30 dias</h2>
                </div>
                <div className="chart-legend-inline">
                  <span>
                    <i className="income" />
                    Entradas
                  </span>
                  <span>
                    <i className="expense" />
                    Saídas
                  </span>
                  <span>
                    <i className="balance" />
                    Saldo projetado
                  </span>
                </div>
              </div>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={cashFlowProjection}
                    margin={{ left: -4, right: 14, top: 14, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--chart-grid)"
                      strokeDasharray="3 3"
                    />
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
                    <Bar
                      dataKey="income"
                      name="Entradas"
                      fill="var(--accent-green)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Saídas"
                      fill="var(--accent-red)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Saldo projetado"
                      stroke="var(--accent-graphite)"
                      strokeWidth={2.6}
                      dot={{ r: 3, fill: "var(--card)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="panel due-card">
              <div className="financial-summary">
                <h2>Resumo financeiro</h2>
                <p>Recebimentos e pagamentos em aberto.</p>
                <div className="financial-summary__item" data-tone="green">
                  <TrendingUp />
                  <div>
                    <span>Contas a receber</span>
                    <b>{brl(totalReceivable)}</b>
                  </div>
                </div>
                <div className="financial-summary__item" data-tone="red">
                  <TrendingDown />
                  <div>
                    <span>Contas a pagar</span>
                    <b>{brl(totalPayable)}</b>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="panel">
            <div className="table-section-heading">
              <div>
                <span>MOVIMENTAÇÕES</span>
                <h2>Movimentações financeiras</h2>
              </div>
              <Button variant="outline" size="sm">
                Filtros
              </Button>
            </div>
            <div className="data-table-wrap border-0">
              <table className="data-table min-w-[900px]">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Histórico</th>
                    <th>Categoria</th>
                    <th>Entrada</th>
                    <th>Saída</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlow.map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td className="font-medium">{e.description}</td>
                      <td>{e.category}</td>
                      <td className="font-semibold text-[var(--accent-green)]">
                        {e.kind === "Entrada" ? brl(e.amount) : "—"}
                      </td>
                      <td className="font-semibold text-[var(--accent-red)]">
                        {e.kind === "Saída" ? brl(e.amount) : "—"}
                      </td>
                      <td>
                        <StatusPill label={e.status} tone="warning" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel due-card">
            <div className="due-card__header">
              <div>
                <span>VENCIMENTOS</span>
                <h2>Próximos compromissos</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="due-card__tabs">
              <button className="is-active">Todos</button>
              <button>A receber</button>
              <button>A pagar</button>
            </div>
            <div className="due-card__list">
              {dueItems.map((item) => (
                <div key={item.id} className="due-row">
                  <div className="due-row__date">
                    <b>{item.date.slice(0, 2)}</b>
                    <span>SET</span>
                  </div>
                  <div className="min-w-0">
                    <b>{item.title}</b>
                    <span>{item.reference}</span>
                  </div>
                  <div className="text-right">
                    <StatusPill
                      label={item.type}
                      tone={item.type === "A receber" ? "positive" : "danger"}
                    />
                    <strong>{brl(item.amount)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="receber">
          <div className="panel data-table-wrap">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Referência</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Recebido</th>
                  <th>Saldo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.customer}</td>
                    <td>{r.reference}</td>
                    <td>{r.dueDate}</td>
                    <td>{brl(r.amount)}</td>
                    <td>{brl(r.paid)}</td>
                    <td className="font-semibold">{brl(r.amount - r.paid)}</td>
                    <td>
                      <StatusPill
                        label={r.status}
                        tone={
                          r.status === "Pago"
                            ? "positive"
                            : r.status === "Vencido"
                              ? "danger"
                              : r.status === "Parcial"
                                ? "warning"
                                : "info"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="pagar">
          <div className="panel data-table-wrap">
            <table className="data-table min-w-[850px]">
              <thead>
                <tr>
                  <th>Fornecedor / despesa</th>
                  <th>Categoria</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payables.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.supplier}</td>
                    <td>{p.category}</td>
                    <td>{p.dueDate}</td>
                    <td className="font-semibold">{brl(p.amount)}</td>
                    <td>
                      <StatusPill
                        label={p.status}
                        tone={
                          p.status === "Pago"
                            ? "positive"
                            : p.status === "Vencido"
                              ? "danger"
                              : "warning"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </InternalPage>
  );
}
