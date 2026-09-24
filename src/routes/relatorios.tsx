import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarRange, Download, FileBarChart, FileText, ReceiptText, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InternalPage, StatCard, chartTooltipStyle } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { jaguarApi } from "@/services/jaguarApi";
import { asNumber } from "@/utils/api-format";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/relatorios")({ component: ReportsPage });
const months=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function periodForYear(year:number){const now=new Date();const to=year===now.getFullYear()?now:new Date(year,11,31);return {from:`${year}-01-01`,to:to.toISOString().slice(0,10)}}

export function ReportsPage(){
  const [year,setYear]=useState(new Date().getFullYear()); const period=useMemo(()=>periodForYear(year),[year]);
  const annual=useQuery({queryKey:["reports","annual",year],queryFn:()=>jaguarApi.reports.annual(year)});
  const costs=useQuery({queryKey:["reports","costs",period.from,period.to],queryFn:()=>jaguarApi.reports.costs(period)});
  const finance=useQuery({queryKey:["reports","finance",period.from,period.to],queryFn:()=>jaguarApi.reports.finance(period)});
  const stock=useQuery({queryKey:["reports","stock"],queryFn:jaguarApi.reports.stock});
  const chart=(annual.data?.months??[]).map(x=>({month:months[x.month-1]??String(x.month),current:asNumber(x.current),previous:asNumber(x.previous)}));
  const billed=asNumber(annual.data?.totals.current); const previous=asNumber(annual.data?.totals.previous); const partsCost=asNumber(costs.data?.partsCost); const operating=asNumber(costs.data?.operatingExpenses); const totalCosts=partsCost+operating; const result=billed-totalCosts; const growth=previous?((billed-previous)/previous)*100:0;
  const categoryData=(costs.data?.byCategory??[]).map((x,i)=>({...x,amount:asNumber(x.amount),color:["var(--accent-red)","var(--accent-orange)","var(--accent-graphite)","var(--accent-green)"][i%4]}));
  const reportCards=[
    {title:"Relatório de custos",description:"Peças consumidas e despesas operacionais.",value:totalCosts,icon:FileBarChart,accent:"orange"},
    {title:"Fluxo de caixa",description:"Entradas efetivas no período.",value:asNumber(finance.data?.inflow),icon:WalletCards,accent:"red"},
    {title:"Contas a receber",description:"Saldo atual ainda não recebido.",value:asNumber(finance.data?.receivableOpen),icon:ReceiptText,accent:"green"},
    {title:"Contas a pagar",description:"Obrigações ainda não quitadas.",value:asNumber(finance.data?.payableOpen),icon:CalendarRange,accent:"red"},
    {title:"Estoque",description:"Valor físico a custo médio.",value:asNumber(stock.data?.physicalValue),icon:FileText,accent:"graphite"},
  ] as const;
  function exportAnnual(){downloadCsv(`jaguar-faturamento-${year}.csv`,[["Mês",`Faturamento ${year}`,`Faturamento ${year-1}`],...chart.map(x=>[x.month,x.current,x.previous])])}
  return <InternalPage>
    <PageHeader title="Relatórios" subtitle="Faturamento, custos, caixa e estoque calculados diretamente no PostgreSQL." right={<div className="flex flex-wrap gap-2"><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={year} onChange={e=>setYear(Number(e.target.value))}>{[0,1,2,3].map(n=><option key={n} value={new Date().getFullYear()-n}>{new Date().getFullYear()-n}</option>)}</select><Button variant="outline" onClick={exportAnnual}><Download className="mr-2 h-4 w-4"/>Exportar faturamento</Button></div>}/>
    <aside className="report-kpis">
      <StatCard label={`Faturamento total (${year})`} value={brl(billed)} icon={ReceiptText} accent="red" detail={previous?`${growth>=0?"↑":"↓"} ${Math.abs(growth).toFixed(1)}% vs. ${year-1}`:"Sem base anterior"}/>
      <StatCard label="Entradas realizadas" value={brl(asNumber(finance.data?.inflow))} icon={ReceiptText} accent="green" detail="Caixa efetivamente recebido"/>
      <StatCard label="Custos diretos + despesas" value={brl(totalCosts)} icon={FileBarChart} accent="orange" detail={`${brl(partsCost)} em peças consumidas`}/>
      <StatCard label="Resultado operacional" value={brl(result)} icon={BarChart3} accent="graphite" detail="Faturamento - peças - despesas"/>
    </aside>
    <div className="report-layout">
      <section className="panel annual-report-card"><div className="annual-report-card__header"><div><span>FATURAMENTO</span><h2>Demonstrativo de Faturamento Anual</h2><p>Comparativo mensal — {year} × {year-1}</p></div><div className="chart-legend-inline"><span><i className="expense"/>{year}</span><span><i className="balance"/>{year-1}</span></div></div><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chart} margin={{left:-4,right:12,top:20,bottom:0}}><CartesianGrid vertical={false} stroke="var(--chart-grid)"/><XAxis dataKey="month" tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tickFormatter={v=>`${v/1000}k`} tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number)=>brl(v)}/><Legend wrapperStyle={{fontSize:11}}/><Area dataKey="current" name={String(year)} stroke="var(--accent-red)" fill="var(--accent-red)" fillOpacity={.14} strokeWidth={2.5}/><Area dataKey="previous" name={String(year-1)} stroke="var(--chart-graphite-muted)" fill="var(--chart-graphite-muted)" fillOpacity={.06} strokeWidth={1.5}/></ComposedChart></ResponsiveContainer></div></section>
    </div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{reportCards.map(({title,description,value,icon:Icon,accent})=><article key={title} className="panel report-metric-card"><div className="report-metric-card__top"><span data-accent={accent}><Icon className="h-5 w-5"/></span></div><h3>{title}</h3><p>{description}</p><b>{brl(value)}</b><div className="report-mini-bars">{chart.map((x,index)=><i key={index} style={{height:`${Math.max(10,Math.min(100,(x.current/(Math.max(...chart.map(v=>v.current),1))*100)))}%`}}/>)}</div></article>)}</div>
    <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
      <section className="panel report-table-card"><div className="table-section-heading"><div><span>RESUMO</span><h2>Faturamento mensal</h2></div><Button variant="outline" size="sm" onClick={exportAnnual}><Download className="mr-2 h-4 w-4"/>Exportar tabela</Button></div><div className="data-table-wrap border-0"><table className="data-table min-w-[680px]"><thead><tr><th>Mês</th><th>Faturamento {year}</th><th>Faturamento {year-1}</th><th>Variação</th></tr></thead><tbody>{chart.map(item=>{const variation=item.previous?((item.current-item.previous)/item.previous)*100:0;return <tr key={item.month}><td className="font-semibold">{item.month}</td><td>{brl(item.current)}</td><td>{brl(item.previous)}</td><td className={variation>=0?"text-[var(--accent-green)]":"text-[var(--accent-red)]"}>{item.previous?`${variation>=0?"+":""}${variation.toFixed(1)}%`:"—"}</td></tr>})}</tbody><tfoot><tr><td className="p-3 font-semibold">Total</td><td className="p-3 font-bold">{brl(billed)}</td><td className="p-3 font-bold">{brl(previous)}</td><td className="p-3 font-bold">{previous?`${growth>=0?"+":""}${growth.toFixed(1)}%`:"—"}</td></tr></tfoot></table></div></section>
      <section className="panel inventory-side-card"><h2>Despesas por categoria</h2><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={85}>{categoryData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={chartTooltipStyle} formatter={(v:number)=>brl(v)}/></PieChart></ResponsiveContainer></div><div className="inventory-legend">{categoryData.slice(0,6).map(e=><div key={e.category}><i style={{background:e.color}}/><span>{e.category}</span><b>{brl(e.amount)}</b></div>)}</div><div className="mt-4 grid gap-2 text-sm"><div className="money-line"><span>Estoque físico</span><b>{brl(asNumber(stock.data?.physicalValue))}</b></div><div className="money-line"><span>Estoque disponível</span><b>{brl(asNumber(stock.data?.availableValue))}</b></div><div className="money-line"><span>Itens críticos/baixos</span><b>{(stock.data?.criticalCount??0)+(stock.data?.lowCount??0)}</b></div><div className="money-line"><span>Recebíveis vencidos</span><b className="text-[var(--accent-red)]">{brl(asNumber(finance.data?.receivableOverdue))}</b></div></div></section>
    </div>
  </InternalPage>
}

function downloadCsv(filename:string,rows:Array<Array<string|number>>){const esc=(v:string|number)=>`"${String(v).replaceAll('"','""')}"`;const csv="\uFEFF"+rows.map(r=>r.map(esc).join(";")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
