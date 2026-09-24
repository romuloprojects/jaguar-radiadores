import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Boxes, ClipboardCheck, CreditCard, FileClock, PackageCheck, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { InternalPage, SectionPanel, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { cashFlowProjection, monthlyRevenue, quotes } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/")({ component: DashboardPage });

function statusTone(status: string) {
  if (["Pago", "Concluído", "Aprovado"].includes(status)) return "positive" as const;
  if (["Aguardando"].includes(status)) return "warning" as const;
  if (["Em execução"].includes(status)) return "info" as const;
  return "neutral" as const;
}

function DashboardPage() {
  return (
    <InternalPage>
      <PageHeader
        eyebrow="CENTRO DE OPERAÇÕES"
        title="Visão Geral"
        subtitle="Acompanhe comercial, oficina, estoque e financeiro em um único lugar."
        right={<div className="rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Período:</span> Setembro de 2026</div>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Banknote} label="Faturamento do mês" value={brl(28450)} detail="↑ 12% vs. mês anterior" tone="green" />
        <KpiCard icon={CreditCard} label="A receber" value={brl(12300)} detail="5 títulos em aberto" tone="blue" />
        <KpiCard icon={Wallet} label="A pagar" value={brl(8750)} detail="4 compromissos em aberto" tone="red" />
        <KpiCard icon={Banknote} label="Saldo projetado" value={brl(21500)} detail="Próximos 30 dias" tone="amber" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FileClock} label="Orçamentos" value="4" detail="Aguardando aprovação" tone="slate" />
        <KpiCard icon={ClipboardCheck} label="Em execução" value="3" detail="Serviços em andamento" tone="blue" />
        <KpiCard icon={PackageCheck} label="Prontos" value="2" detail="Aguardando entrega" tone="green" />
        <KpiCard icon={AlertTriangle} label="Estoque baixo" value="5" detail="Itens precisam de atenção" tone="red" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.15fr_1.15fr_.8fr]">
        <SectionPanel title="Faturamento mensal" subtitle="Comparativo 2025 × 2026" icon={Banknote}>
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ left: -10, right: 4, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar name="2025" dataKey="previous" fill="var(--chart-muted)" radius={[4,4,0,0]} />
                <Bar name="2026" dataKey="current" fill="var(--accent-blue)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Fluxo de caixa" subtitle="Projeção dos próximos 30 dias" icon={Wallet}>
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowProjection} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line name="Saldo projetado" type="monotone" dataKey="balance" stroke="var(--accent-blue)" strokeWidth={2.5} dot={false} />
                <Line name="Receitas" type="monotone" dataKey="income" stroke="var(--accent-green)" strokeWidth={1.8} dot={false} />
                <Line name="Despesas" type="monotone" dataKey="expense" stroke="var(--accent-red)" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Últimos orçamentos" subtitle="Movimentações recentes" icon={Boxes} right={<Button asChild variant="ghost" size="sm"><Link to="/orcamentos">Ver todos</Link></Button>}>
          <div className="space-y-1.5">
            {quotes.slice(0,5).map((quote) => (
              <Link key={quote.id} to="/orcamentos/$orcamentoId" params={{ orcamentoId: quote.id }} className="dashboard-quote-row">
                <div className="min-w-0"><b>{quote.number}</b><span>{quote.customerName}</span></div>
                <div className="text-right"><b>{brl(quote.total)}</b><StatusPill label={quote.status} tone={statusTone(quote.status)} /></div>
              </Link>
            ))}
          </div>
        </SectionPanel>
      </div>
    </InternalPage>
  );
}
