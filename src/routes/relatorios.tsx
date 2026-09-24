import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarRange, Download, FileBarChart, FileText, ReceiptText, WalletCards } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InternalPage, SectionPanel, StatCard, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { monthlyRevenue } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/relatorios")({ component: ReportsPage });

const reports = [
  { title: "Faturamento mensal", description: "Resumo de valores faturados por período e comparação com o mês anterior.", icon: ReceiptText },
  { title: "Demonstrativo anual", description: "Consolidação de janeiro a dezembro com comparativo mês a mês.", icon: BarChart3 },
  { title: "Relatório de custos", description: "Peças consumidas, compras, despesas e visão de margem por atendimento.", icon: FileBarChart },
  { title: "Fluxo de caixa", description: "Entradas, saídas, realizado e projeção do período selecionado.", icon: WalletCards },
  { title: "Contas a receber", description: "Títulos em aberto, parciais, vencidos e recebidos.", icon: FileText },
  { title: "Contas a pagar", description: "Compromissos por fornecedor, categoria, vencimento e situação.", icon: CalendarRange },
];

export function ReportsPage() {
  return (
    <InternalPage>
      <PageHeader title="Relatórios" subtitle="Demonstrativos para análise financeira, custos e desempenho da empresa." icon={FileBarChart} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento 2026" value={brl(202950)} icon={ReceiptText} accent="green" />
        <StatCard label="Média mensal" value={brl(22550)} icon={BarChart3} accent="blue" />
        <StatCard label="Custos acumulados" value={brl(92700)} icon={FileBarChart} accent="red" />
        <StatCard label="Resultado bruto estimado" value={brl(110250)} icon={WalletCards} accent="orange" />
      </div>
      <SectionPanel title="Demonstrativo de faturamento anual" subtitle="Comparativo mês a mês entre 2025 e 2026" icon={BarChart3} right={<div className="rounded-lg border bg-background px-3 py-1.5 text-xs">Ano: <b>2026</b></div>}>
        <div className="h-[310px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyRevenue} margin={{left:-10,right:10,top:10}}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="month" tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tickFormatter={(v) => `${v/1000}k`} tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number)=>brl(v)}/><Bar dataKey="previous" name="2025" fill="var(--chart-muted)" radius={[4,4,0,0]}/><Bar dataKey="current" name="2026" fill="var(--accent-blue)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
      </SectionPanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map(({ title, description, icon: Icon }) => <article key={title} className="panel report-card"><span><Icon className="h-5 w-5"/></span><div><h3>{title}</h3><p>{description}</p></div><Button variant="outline" className="mt-auto w-full"><Download className="mr-2 h-4 w-4"/>Gerar relatório</Button></article>)}</div>
    </InternalPage>
  );
}
