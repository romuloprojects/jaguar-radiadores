import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Banknote, CalendarDays, CreditCard, Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InternalPage, SectionPanel, StatCard, StatusPill, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cashFlow, cashFlowProjection, payables, receivables } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/financeiro")({ component: FinancePage });

function FinancePage() {
  const totalReceivable = receivables.filter((r) => r.status !== "Pago").reduce((s, r) => s + (r.amount - r.paid), 0);
  const totalPayable = payables.filter((p) => p.status !== "Pago").reduce((s, p) => s + p.amount, 0);
  return (
    <InternalPage>
      <PageHeader title="Financeiro" subtitle="Fluxo de caixa, contas a receber, contas a pagar e visão consolidada da operação." icon={WalletCards} right={<Button><Plus className="mr-2 h-4 w-4"/>Novo lançamento</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo atual" value={brl(18200)} icon={Banknote} accent="blue" detail="Caixa e contas configuradas" />
        <StatCard label="A receber" value={brl(totalReceivable)} icon={TrendingUp} accent="green" detail={`${receivables.filter((r) => r.status !== "Pago").length} títulos em aberto`} />
        <StatCard label="A pagar" value={brl(totalPayable)} icon={TrendingDown} accent="red" detail={`${payables.filter((p) => p.status !== "Pago").length} compromissos`} />
        <StatCard label="Saldo projetado" value={brl(21500)} icon={CalendarDays} accent="orange" detail="Próximos 30 dias" />
      </div>

      <Tabs defaultValue="cashflow" className="space-y-4">
        <TabsList className="finance-tabs"><TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger><TabsTrigger value="receber">Contas a Receber</TabsTrigger><TabsTrigger value="pagar">Contas a Pagar</TabsTrigger></TabsList>
        <TabsContent value="cashflow" className="space-y-4">
          <SectionPanel title="Projeção de caixa" subtitle="Entradas, saídas e saldo projetado do período" icon={WalletCards}>
            <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlowProjection} margin={{left:-10,right:8,top:8}}><defs><linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.28}/><stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="day" tick={{fontSize:10, fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tickFormatter={(v) => `${v/1000}k`} tick={{fontSize:10, fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number) => brl(v)}/><Area type="monotone" dataKey="balance" name="Saldo projetado" stroke="var(--accent-blue)" strokeWidth={2.5} fill="url(#balanceFill)"/></AreaChart></ResponsiveContainer></div>
          </SectionPanel>
          <div className="panel data-table-wrap"><table className="data-table min-w-[850px]"><thead><tr><th>Data</th><th>Histórico</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Status</th></tr></thead><tbody>{cashFlow.map((e) => <tr key={e.id}><td>{e.date}</td><td className="font-medium">{e.description}</td><td>{e.category}</td><td><StatusPill label={e.kind} tone={e.kind === "Entrada" ? "positive" : "danger"}/></td><td className={e.kind === "Entrada" ? "font-semibold text-[var(--accent-green)]" : "font-semibold text-[var(--accent-red)]"}>{e.kind === "Entrada" ? "+ " : "- "}{brl(e.amount)}</td><td>{e.status}</td></tr>)}</tbody></table></div>
        </TabsContent>
        <TabsContent value="receber"><div className="panel data-table-wrap"><table className="data-table min-w-[900px]"><thead><tr><th>Cliente</th><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Recebido</th><th>Saldo</th><th>Status</th></tr></thead><tbody>{receivables.map((r) => <tr key={r.id}><td className="font-medium">{r.customer}</td><td>{r.reference}</td><td>{r.dueDate}</td><td>{brl(r.amount)}</td><td>{brl(r.paid)}</td><td className="font-semibold">{brl(r.amount-r.paid)}</td><td><StatusPill label={r.status} tone={r.status === "Pago" ? "positive" : r.status === "Vencido" ? "danger" : r.status === "Parcial" ? "warning" : "info"}/></td></tr>)}</tbody></table></div></TabsContent>
        <TabsContent value="pagar"><div className="panel data-table-wrap"><table className="data-table min-w-[850px]"><thead><tr><th>Fornecedor / despesa</th><th>Categoria</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>{payables.map((p) => <tr key={p.id}><td className="font-medium">{p.supplier}</td><td>{p.category}</td><td>{p.dueDate}</td><td className="font-semibold">{brl(p.amount)}</td><td><StatusPill label={p.status} tone={p.status === "Pago" ? "positive" : p.status === "Vencido" ? "danger" : "warning"}/></td></tr>)}</tbody></table></div></TabsContent>
      </Tabs>
      <div className="grid gap-3 md:grid-cols-2"><div className="alert-card"><AlertCircle className="h-5 w-5"/><div><b>Recebimentos vencidos</b><span>Há títulos vencidos que merecem acompanhamento.</span></div></div><div className="alert-card"><CreditCard className="h-5 w-5"/><div><b>Separação contábil</b><span>Faturamento e recebimento permanecem conceitos distintos no sistema.</span></div></div></div>
    </InternalPage>
  );
}
