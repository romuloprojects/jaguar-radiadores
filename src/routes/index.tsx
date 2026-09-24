import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Boxes, CalendarDays, ClipboardCheck, CreditCard, FileClock, PackageCheck, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { InternalPage, SectionPanel, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { cashFlowProjection, monthlyRevenue, payables, quotes, receivables, stockItems } from "@/data/mock/jaguar";
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
    ...receivables.filter((item) => item.status !== "Pago").slice(0, 3).map((item) => ({
      date: item.dueDate,
      description: item.customer,
      kind: "A receber",
      amount: item.amount - item.paid,
      status: item.status,
    })),
    ...payables.filter((item) => item.status !== "Pago").slice(0, 2).map((item) => ({
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
        right={<div className="period-chip"><CalendarDays className="h-4 w-4"/><span>Período</span><b>Setembro de 2026</b></div>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Banknote} label="Faturamento do mês" value={brl(28450)} detail="↑ 12% em relação a agosto" tone="red" />
        <KpiCard icon={CreditCard} label="A receber" value={brl(12300)} detail="5 títulos em aberto" tone="green" />
        <KpiCard icon={Wallet} label="A pagar" value={brl(8750)} detail="4 compromissos em aberto" tone="red" />
        <KpiCard icon={Banknote} label="Saldo projetado" value={brl(21500)} detail="Próximos 30 dias" tone="graphite" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FileClock} label="Orçamentos abertos" value="4" detail="Aguardando retorno do cliente" tone="graphite" />
        <KpiCard icon={ClipboardCheck} label="Em execução" value="3" detail="Serviços em andamento" tone="amber" />
        <KpiCard icon={PackageCheck} label="Prontos para entrega" value="2" detail="Aguardando retirada" tone="green" />
        <KpiCard icon={AlertTriangle} label="Estoque crítico" value="5" detail="Itens precisam de reposição" tone="red" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.05fr_1.05fr_.9fr]">
        <SectionPanel title="Faturamento mensal" subtitle="Comparativo dos últimos meses" icon={Banknote}>
          <div className="h-[285px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue.slice(3, 9)} margin={{ left: -10, right: 6, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar name="2025" dataKey="previous" fill="var(--chart-graphite-muted)" radius={[5,5,0,0]} />
                <Bar name="2026" dataKey="current" fill="var(--accent-red)" radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Fluxo de caixa" subtitle="Próximos 30 dias" icon={Wallet}>
          <div className="h-[285px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlowProjection} margin={{ left: -10, right: 8, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar name="Entradas" dataKey="income" fill="var(--accent-green)" radius={[4,4,0,0]} />
                <Bar name="Saídas" dataKey="expense" fill="var(--accent-red)" radius={[4,4,0,0]} />
                <Line name="Saldo projetado" type="monotone" dataKey="balance" stroke="var(--accent-graphite)" strokeWidth={2.5} dot={{ r: 2.5, fill: "var(--card)" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Últimos orçamentos" subtitle="Atendimentos recentes" icon={Boxes} right={<Button asChild variant="ghost" size="sm"><Link to="/orcamentos">Ver todos</Link></Button>}>
          <div className="space-y-1.5">
            {quotes.slice(0,6).map((quote) => (
              <Link key={quote.id} to="/orcamentos/$orcamentoId" params={{ orcamentoId: quote.id }} className="dashboard-list-row">
                <div className="min-w-0"><b>{quote.number}</b><span>{quote.customerName}</span></div>
                <div className="text-right"><b>{brl(quote.total)}</b><StatusPill label={quote.status} tone={statusTone(quote.status)} /></div>
              </Link>
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionPanel title="Contas com vencimento próximo" subtitle="Receber e pagar no mesmo acompanhamento" icon={CalendarDays}>
          <div className="data-table-wrap border-0"><table className="data-table min-w-[620px]"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Tipo</th><th>Valor</th><th>Status</th></tr></thead><tbody>{upcoming.map((item, idx) => <tr key={`${item.description}-${idx}`}><td>{item.date}</td><td className="font-medium">{item.description}</td><td><StatusPill label={item.kind} tone={item.kind === "A receber" ? "positive" : "danger"}/></td><td className="font-semibold">{brl(item.amount)}</td><td><StatusPill label={item.status} tone={item.status === "Vencido" ? "danger" : "warning"}/></td></tr>)}</tbody></table></div>
        </SectionPanel>
        <SectionPanel title="Itens com estoque baixo" subtitle="Itens que precisam de reposição" icon={AlertTriangle} right={<Button asChild variant="ghost" size="sm"><Link to="/estoque">Ver estoque</Link></Button>}>
          <div className="data-table-wrap border-0"><table className="data-table min-w-[560px]"><thead><tr><th>Produto</th><th>Atual</th><th>Mínimo</th><th>Status</th></tr></thead><tbody>{lowStock.map((item) => <tr key={item.id}><td className="font-medium">{item.description}</td><td>{item.current}</td><td>{item.minimum}</td><td><StatusPill label={item.status} tone={item.status === "Crítico" ? "danger" : "warning"}/></td></tr>)}</tbody></table></div>
        </SectionPanel>
      </div>
    </InternalPage>
  );
}
