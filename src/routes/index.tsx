import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Boxes, CalendarDays, ClipboardCheck, CreditCard, PackageCheck, Wallet, FileClock } from "lucide-react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/KpiCard";
import { InternalPage, SectionPanel, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { jaguarApi } from "@/services/jaguarApi";
import { brl } from "@/utils/format";
import { asNumber, datePt, paymentStatusLabel, quoteStatusLabel, statusToneForPayment, statusToneForQuote } from "@/utils/api-format";

export const Route = createFileRoute("/")({ component: DashboardPage });

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const from30 = now.toISOString().slice(0, 10);
  const end = new Date(now); end.setDate(end.getDate() + 30);
  const to30 = end.toISOString().slice(0, 10);
  const overview = useQuery({ queryKey: ["dashboard", "overview"], queryFn: () => jaguarApi.dashboard.overview() });
  const annual = useQuery({ queryKey: ["reports", "annual", year], queryFn: () => jaguarApi.reports.annual(year) });
  const flow = useQuery({ queryKey: ["finance", "cash-flow", from30, to30], queryFn: () => jaguarApi.finance.cashFlow({ from: from30, to: to30 }) });

  if (overview.isLoading || annual.isLoading || flow.isLoading) return <InternalPage><div className="panel p-8 text-sm text-muted-foreground">Carregando dados reais da Jaguar...</div></InternalPage>;
  if (overview.error) return <InternalPage><div className="panel p-8 text-sm text-destructive">{overview.error.message}</div></InternalPage>;

  const data = overview.data!;
  const annualData = (annual.data?.months ?? []).map((m) => ({ month: months[Number(m.month) - 1] ?? String(m.month), current: asNumber(m.current), previous: asNumber(m.previous) }));
  let running = asNumber(flow.data?.currentBalance);
  const flowData = (flow.data?.projected ?? []).map((item) => {
    const incoming = item.kind === "Entrada" ? asNumber(item.amount) : 0;
    const expense = item.kind === "Saída" ? asNumber(item.amount) : 0;
    running += incoming - expense;
    return { day: datePt(item.date).slice(0, 5), income: incoming, expense, balance: running };
  });
  const upcoming = [
    ...(data.overdueReceivables ?? []).map((r) => ({ date: r.dueDate, description: r.customer, kind: "A receber", amount: asNumber(r.balance), status: "overdue" })),
    ...(flow.data?.projected ?? []).filter((x) => x.kind === "Saída").slice(0, 4).map((p) => ({ date: p.date, description: p.description, kind: "A pagar", amount: asNumber(p.amount), status: p.status === "Vencido" ? "overdue" : "open" })),
  ].slice(0, 6);

  return (
    <InternalPage>
      <PageHeader title="Visão Geral" subtitle="Indicadores calculados a partir dos dados registrados no PostgreSQL." right={<div className="period-chip"><CalendarDays className="h-4 w-4"/><span>Período</span><b>{datePt(data.period.from)} a {datePt(data.period.to)}</b></div>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Banknote} label="Faturamento do período" value={brl(asNumber(data.kpis.billed))} detail={`${data.kpis.completedInPeriod} atendimentos concluídos`} tone="red" />
        <KpiCard icon={CreditCard} label="A receber" value={brl(asNumber(data.kpis.receivableOpen))} detail={`${brl(asNumber(data.kpis.receivableOverdue))} vencidos`} tone="green" />
        <KpiCard icon={Wallet} label="A pagar" value={brl(asNumber(data.kpis.payableOpen))} detail="Compromissos em aberto" tone="red" />
        <KpiCard icon={Banknote} label="Saldo atual" value={brl(asNumber(data.kpis.cashBalance))} detail="Movimentos realizados" tone="graphite" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FileClock} label="Em andamento" value={String(data.kpis.quotesInProgress)} detail="Atendimentos ativos" tone="graphite" />
        <KpiCard icon={ClipboardCheck} label="Concluídos no período" value={String(data.kpis.completedInPeriod)} detail="Serviços finalizados" tone="amber" />
        <KpiCard icon={PackageCheck} label="Recebíveis vencidos" value={brl(asNumber(data.kpis.receivableOverdue))} detail="Cobranças que precisam de atenção" tone="green" />
        <KpiCard icon={AlertTriangle} label="Estoque crítico" value={String(data.kpis.criticalStock)} detail="Itens abaixo do mínimo" tone="red" />
      </div>

      <div className="dashboard-charts">
        <SectionPanel title="Faturamento mensal" subtitle={`${year} × ${year - 1}`} icon={Banknote}>
          <div className="h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={annualData} margin={{ left:-10,right:6,top:12,bottom:0 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3"/><XAxis dataKey="month" tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tickFormatter={(v)=>`${v/1000}k`} tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number)=>brl(v)}/><Legend wrapperStyle={{fontSize:11}}/><Area name={String(year-1)} dataKey="previous" stroke="var(--chart-graphite-muted)" fill="var(--chart-graphite-muted)" fillOpacity={0.04} strokeWidth={1.5}/><Area name={String(year)} dataKey="current" type="monotone" stroke="var(--accent-red)" fill="var(--accent-red)" fillOpacity={0.14} strokeWidth={2.5} dot={{r:3,fill:"var(--accent-red)",stroke:"var(--foreground)",strokeWidth:1}}/></AreaChart></ResponsiveContainer></div>
        </SectionPanel>
        <SectionPanel title="Fluxo de caixa" subtitle="Próximos 30 dias" icon={Wallet}>
          <div className="h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={flowData} margin={{left:-10,right:8,top:12,bottom:0}}><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3"/><XAxis dataKey="day" tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tickFormatter={(v)=>`${v/1000}k`} tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number)=>brl(v)}/><Legend wrapperStyle={{fontSize:11}}/><Bar name="Entradas" dataKey="income" fill="var(--accent-green)" radius={[4,4,0,0]}/><Bar name="Saídas" dataKey="expense" fill="var(--accent-red)" radius={[4,4,0,0]}/><Line name="Saldo projetado" type="monotone" dataKey="balance" stroke="var(--accent-graphite)" strokeWidth={2.5} dot={{r:2.5,fill:"var(--card)"}}/></ComposedChart></ResponsiveContainer></div>
        </SectionPanel>
      </div>

      <div className="dashboard-lists">
        <SectionPanel title="Últimos orçamentos" subtitle="Atendimentos recentes" icon={Boxes} right={<Button asChild variant="ghost" size="sm"><Link to="/orcamentos">Ver todos</Link></Button>}>
          <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Orçamento / Cliente</th><th>Valor</th><th>Atendimento</th><th>Financeiro</th></tr></thead><tbody>{data.latestQuotes.map((quote)=><tr key={quote.id}><td><Link to="/orcamentos/$orcamentoId" params={{orcamentoId:quote.id}} className="font-semibold">{quote.number}<small className="block mt-1 text-muted-foreground font-normal">{quote.customerName ?? (quote as any).customer}</small></Link></td><td className="whitespace-nowrap font-semibold">{brl(asNumber(quote.total))}</td><td><StatusPill label={quoteStatusLabel(quote.status)} tone={statusToneForQuote(quote.status)}/></td><td><StatusPill label={paymentStatusLabel(quote.paymentStatus)} tone={statusToneForPayment(quote.paymentStatus)}/></td></tr>)}</tbody></table></div>
        </SectionPanel>
        <SectionPanel title="Contas que exigem atenção" subtitle="Vencidos e próximos compromissos" icon={CalendarDays}>
          <div className="data-table-wrap border-0"><table className="data-table min-w-[620px]"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Tipo</th><th>Valor</th><th>Status</th></tr></thead><tbody>{upcoming.map((item,index)=><tr key={`${item.kind}-${index}`}><td>{datePt(item.date)}</td><td className="font-medium">{item.description}</td><td>{item.kind}</td><td className="font-semibold">{brl(item.amount)}</td><td><StatusPill label={paymentStatusLabel(item.status)} tone={statusToneForPayment(item.status)}/></td></tr>)}</tbody></table></div>
        </SectionPanel>
        <SectionPanel title="Estoque crítico" subtitle="Itens que precisam de reposição" icon={AlertTriangle}>
          <div className="space-y-2">{data.criticalProducts.length ? data.criticalProducts.map((item)=><div key={item.id} className="compact-line"><div><b>{item.description}</b><span>{item.code || "Sem código"}</span></div><div className="text-right"><b>{asNumber(item.available)} disp.</b><span>Mín. {asNumber(item.minimum)}</span></div></div>) : <p className="detail-empty">Nenhum item crítico.</p>}</div>
        </SectionPanel>
      </div>
    </InternalPage>
  );
}
