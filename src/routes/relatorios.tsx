import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, CalendarDays, CalendarRange, Download, Eye, FileBarChart, FileDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { InternalPage } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { jaguarApi } from "@/services/jaguarApi";
import type { ReportPeriodItemApi } from "@/types/api";
import { buildManagementReportHtml, type ManagementReportBundle, type ManagementReportMeta } from "@/utils/report-print";
import { asNumber, datePt } from "@/utils/api-format";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/relatorios")({ component: ReportsPage });

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function yearPeriod(year:number){
  const now=new Date();
  const current=year===now.getFullYear();
  return {from:`${year}-01-01`,to:current?now.toISOString().slice(0,10):`${year}-12-31`,isCurrent:current};
}
function monthLabel(p:ReportPeriodItemApi){return `${MONTHS[p.month-1]} ${p.year}`}

export function ReportsPage(){
  const qc=useQueryClient();
  const periods=useQuery({queryKey:["reports","periods",6],queryFn:()=>jaguarApi.reports.periods(6),staleTime:0,refetchOnMount:"always",refetchOnWindowFocus:false,refetchOnReconnect:false});
  const [busy,setBusy]=useState<string|null>(null);
  const months=periods.data?.months??[];
  const years=periods.data?.years??[];
  const latest=months[0];
  const summary=useMemo(()=>({months:months.length,years:years.length,latest:latest?monthLabel(latest):"Nenhum período"}),[months,years,latest]);

  async function loadBundle(meta:ManagementReportMeta):Promise<ManagementReportBundle>{
    const range={from:meta.from,to:meta.to};
    const [settings,annual,costs,finance,snapshot,quotes]=await Promise.all([
      qc.fetchQuery({queryKey:["settings"],queryFn:jaguarApi.settings.get,staleTime:0}),
      qc.fetchQuery({queryKey:["reports","annual",meta.year],queryFn:()=>jaguarApi.reports.annual(meta.year),staleTime:0}),
      qc.fetchQuery({queryKey:["reports","costs",meta.from,meta.to],queryFn:()=>jaguarApi.reports.costs(range),staleTime:0}),
      qc.fetchQuery({queryKey:["reports","finance",meta.from,meta.to],queryFn:()=>jaguarApi.reports.finance(range),staleTime:0}),
      qc.fetchQuery({queryKey:["reports","snapshot",meta.from,meta.to],queryFn:()=>jaguarApi.reports.snapshot(range),staleTime:0}),
      qc.fetchQuery({queryKey:["reports","quotes",meta.from,meta.to],queryFn:()=>jaguarApi.quotes.list({...range,limit:500}),staleTime:0}),
    ]);
    return {company:settings.company||{},annual,costs,finance,snapshot,quotes:quotes.items||[]};
  }

  async function openReport(meta:ManagementReportMeta,autoPrint=false){
    const key=`${meta.kind}-${meta.year}-${meta.month??"year"}-${autoPrint?"pdf":"view"}`;
    const popup=window.open("","_blank");
    if(!popup){toast.error("O navegador bloqueou a janela do relatório. Libere pop-ups para este site.");return;}
    popup.document.write(`<html><body style="font-family:Arial;padding:32px;background:#111;color:#fff"><h2>Jaguar Radiadores</h2><p>Preparando relatório...</p></body></html>`);
    setBusy(key);
    try{
      const bundle=await loadBundle({...meta,autoPrint});
      const html=buildManagementReportHtml(bundle,{...meta,autoPrint});
      popup.document.open();popup.document.write(html);popup.document.close();
    }catch(e:any){
      popup.close();toast.error(e?.message||"Não foi possível gerar o relatório.");
    }finally{setBusy(null)}
  }

  async function exportCsv(meta:ManagementReportMeta){
    const key=`csv-${meta.kind}-${meta.year}-${meta.month??"year"}`;setBusy(key);
    try{const bundle=await loadBundle(meta);downloadManagementCsv(bundle,meta);}
    catch(e:any){toast.error(e?.message||"Não foi possível exportar o CSV.");}
    finally{setBusy(null)}
  }

  return <InternalPage>
    <PageHeader title="Relatórios" subtitle="Central de documentos gerenciais mensais e anuais da Jaguar Radiadores." />

    <section className="grid gap-4 md:grid-cols-3">
      <div className="panel report-metric-card"><div className="report-metric-card__top"><span><CalendarDays className="h-4 w-4"/></span></div><h3>Meses disponíveis</h3><p>Últimos períodos com movimentação registrada.</p><b>{summary.months}</b></div>
      <div className="panel report-metric-card"><div className="report-metric-card__top"><span data-accent="green"><Archive className="h-4 w-4"/></span></div><h3>Anos disponíveis</h3><p>Relatórios anuais construídos a partir da base real.</p><b>{summary.years}</b></div>
      <div className="panel report-metric-card"><div className="report-metric-card__top"><span data-accent="orange"><FileBarChart className="h-4 w-4"/></span></div><h3>Último período</h3><p>{latest?.isCurrent?"Mês em andamento — dados até hoje.":"Período mais recente com dados."}</p><b>{summary.latest}</b></div>
    </section>

    <section className="panel p-5">
      <div className="table-section-heading !px-0 !pt-0"><div><span>RELATÓRIOS MENSAIS</span><h2>Últimos 6 meses com dados</h2><p className="mt-1 text-xs text-muted-foreground">Só aparecem meses que possuem movimentação no PostgreSQL. O mês atual é identificado como parcial.</p></div></div>
      {periods.isLoading?<LoadingBlock/>:months.length===0?<EmptyBlock/>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{months.map(p=><MonthCard key={p.key} period={p} busy={busy} onView={()=>openReport({kind:"monthly",year:p.year,month:p.month,from:p.from,to:p.to,isCurrent:p.isCurrent})} onPdf={()=>openReport({kind:"monthly",year:p.year,month:p.month,from:p.from,to:p.to,isCurrent:p.isCurrent},true)} onCsv={()=>exportCsv({kind:"monthly",year:p.year,month:p.month,from:p.from,to:p.to,isCurrent:p.isCurrent})}/>)}</div>}
    </section>

    <section className="panel p-5">
      <div className="table-section-heading !px-0 !pt-0"><div><span>RELATÓRIOS ANUAIS</span><h2>Consolidados por ano</h2><p className="mt-1 text-xs text-muted-foreground">Incluem comparativo mensal com o ano anterior, custos, caixa, receber, pagar, estoque e atendimentos.</p></div></div>
      {periods.isLoading?<LoadingBlock/>:years.length===0?<EmptyBlock/>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{years.map(year=>{const p=yearPeriod(year);return <AnnualCard key={year} year={year} current={p.isCurrent} busy={busy} onView={()=>openReport({kind:"annual",year,from:p.from,to:p.to,isCurrent:p.isCurrent})} onPdf={()=>openReport({kind:"annual",year,from:p.from,to:p.to,isCurrent:p.isCurrent},true)} onCsv={()=>exportCsv({kind:"annual",year,from:p.from,to:p.to,isCurrent:p.isCurrent})}/>})}</div>}
    </section>

    <section className="panel p-5">
      <div className="flex items-start gap-3"><div className="rounded-lg border p-2 text-[var(--accent-red)]"><CalendarRange className="h-5 w-5"/></div><div><h2 className="font-semibold">Conteúdo dos documentos</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Cada PDF segue o padrão visual homologado e reúne: resumo gerencial, demonstrativo de faturamento, custos e resultado, fluxo de caixa, contas a receber, contas a pagar, estoque e atendimentos/OS. A posição financeira e o estoque são reconstruídos até a data final do relatório sempre que possível.</p></div></div>
    </section>
  </InternalPage>
}

function MonthCard({period,busy,onView,onPdf,onCsv}:{period:ReportPeriodItemApi;busy:string|null;onView:()=>void;onPdf:()=>void;onCsv:()=>void}){
  const prefix=`monthly-${period.year}-${period.month}`;return <article className="panel report-card !min-h-0">
    <span><CalendarDays className="h-5 w-5"/></span><div className="mt-3 flex items-center justify-between gap-2"><h3 className="!m-0">{monthLabel(period)}</h3>{period.isCurrent&&<em className="rounded-full bg-[color-mix(in_srgb,var(--accent-orange)_14%,transparent)] px-2 py-1 text-[9px] not-italic font-bold text-[var(--accent-orange)]">EM ANDAMENTO</em>}</div>
    <p>{datePt(period.from)} a {datePt(period.to)}{period.isCurrent?" · posição parcial":""}</p>
    <div className="mt-auto flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={onView} disabled={!!busy}>{busy===`${prefix}-view`?<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>:<Eye className="mr-2 h-3.5 w-3.5"/>}Visualizar</Button><Button size="sm" onClick={onPdf} disabled={!!busy}>{busy===`${prefix}-pdf`?<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>:<FileDown className="mr-2 h-3.5 w-3.5"/>}PDF</Button><Button size="sm" variant="ghost" onClick={onCsv} disabled={!!busy}><Download className="mr-2 h-3.5 w-3.5"/>CSV</Button></div>
  </article>
}
function AnnualCard({year,current,busy,onView,onPdf,onCsv}:{year:number;current:boolean;busy:string|null;onView:()=>void;onPdf:()=>void;onCsv:()=>void}){
  const prefix=`annual-${year}-year`;return <article className="panel report-card !min-h-0"><span><FileBarChart className="h-5 w-5"/></span><div className="mt-3 flex items-center justify-between gap-2"><h3 className="!m-0">Relatório Anual {year}</h3>{current&&<em className="rounded-full bg-[color-mix(in_srgb,var(--accent-orange)_14%,transparent)] px-2 py-1 text-[9px] not-italic font-bold text-[var(--accent-orange)]">ANO EM ANDAMENTO</em>}</div><p>{current?"Janeiro até a data atual.":"Exercício completo."} Comparativo automático com {year-1} quando houver base.</p><div className="mt-auto flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={onView} disabled={!!busy}>{busy===`${prefix}-view`?<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>:<Eye className="mr-2 h-3.5 w-3.5"/>}Visualizar</Button><Button size="sm" onClick={onPdf} disabled={!!busy}>{busy===`${prefix}-pdf`?<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>:<FileDown className="mr-2 h-3.5 w-3.5"/>}PDF</Button><Button size="sm" variant="ghost" onClick={onCsv} disabled={!!busy}><Download className="mr-2 h-3.5 w-3.5"/>CSV</Button></div></article>
}
function LoadingBlock(){return <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Carregando períodos disponíveis...</div>}
function EmptyBlock(){return <div className="py-8 text-sm text-muted-foreground">Ainda não há dados suficientes para gerar relatórios.</div>}

function downloadManagementCsv(bundle:ManagementReportBundle,meta:ManagementReportMeta){
  const rows:Array<Array<string|number>>=[]; const add=(...r:Array<string|number>)=>rows.push(r); const n=asNumber;
  add("JAGUAR RADIADORES",meta.kind==="monthly"?"RELATÓRIO GERENCIAL MENSAL":"RELATÓRIO GERENCIAL ANUAL");add("Período",datePt(meta.from),datePt(meta.to));add();
  add("RESUMO","VALOR");add("Faturamento",n(bundle.costs.billed));add("Entradas",n(bundle.finance.inflow));add("Saídas",n(bundle.finance.outflow));add("Peças consumidas",n(bundle.costs.partsCost));add("Despesas operacionais",n(bundle.costs.operatingExpenses));add("A receber",n(bundle.snapshot.receivableSummary.open));add("Recebíveis vencidos",n(bundle.snapshot.receivableSummary.overdue));add("A pagar",n(bundle.snapshot.payableSummary.open));add("Pagáveis vencidos",n(bundle.snapshot.payableSummary.overdue));add();
  add("FATURAMENTO MENSAL","ATUAL","ANO ANTERIOR");for(const x of bundle.annual.months)add(MONTHS[x.month-1],n(x.current),n(x.previous));add();
  add("CONTAS A RECEBER","REFERÊNCIA","PARCELA","VENCIMENTO","VALOR","RECEBIDO","SALDO","STATUS");for(const x of bundle.snapshot.receivables)add(x.customer||"",x.reference||"",`${x.installment||1}/${x.installmentCount||1}`,x.dueDate,n(x.amount),n(x.paid),n(x.balance),x.status);add();
  add("CONTAS A PAGAR","CATEGORIA","REFERÊNCIA","PARCELA","VENCIMENTO","VALOR","PAGO","SALDO","STATUS");for(const x of bundle.snapshot.payables)add(x.supplier||"",x.category||"",x.reference||"",`${x.installment||1}/${x.installmentCount||1}`,x.dueDate,n(x.amount),n(x.paid),n(x.balance),x.status);add();
  add("ESTOQUE","CÓDIGO","FÍSICO","RESERVADO","DISPONÍVEL","CUSTO MÉDIO","VALOR","STATUS");for(const x of bundle.snapshot.stock.items)add(x.description,x.code||"",n(x.physical),n(x.reserved),n(x.available),n(x.averageCost),n(x.stockValue),x.status);add();
  add("ATENDIMENTOS","DATA","CLIENTE","VEÍCULO","VALOR","STATUS");for(const q of bundle.quotes)add(q.number,q.date,q.customerName,q.vehicle||q.plate||"",n(q.total),q.status);
  const esc=(v:string|number)=>`"${String(v??"").replaceAll('"','""')}"`;const csv="\uFEFF"+rows.map(r=>r.map(esc).join(";")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=meta.kind==="monthly"?`jaguar-relatorio-gerencial-${meta.year}-${String(meta.month||1).padStart(2,"0")}.csv`:`jaguar-relatorio-gerencial-anual-${meta.year}.csv`;a.click();URL.revokeObjectURL(url);toast.success(`CSV exportado · faturamento ${brl(n(bundle.costs.billed))}`);
}
