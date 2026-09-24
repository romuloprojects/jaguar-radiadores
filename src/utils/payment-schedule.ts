export type ScheduleMode = "monthly" | "interval" | "custom";
export type ScheduleItem = { number:number; dueDate:string; amount:number };

function iso(d:Date){return d.toISOString().slice(0,10)}
function safeDate(value:string){const d=new Date(`${value}T12:00:00`);return Number.isNaN(d.getTime())?new Date():d}
function addMonthsClamped(base:Date,months:number,day:number){const y=base.getFullYear(),m=base.getMonth()+months;const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(Math.max(day,1),last),12,0,0)}
function addDays(base:Date,days:number){const d=new Date(base);d.setDate(d.getDate()+days);return d}

export function splitAmounts(total:number,count:number){const n=Math.max(1,Math.floor(count||1));const cents=Math.round(Math.max(0,total)*100);const base=Math.floor(cents/n);let used=0;return Array.from({length:n},(_,i)=>{const c=i===n-1?cents-used:base;used+=c;return c/100})}

export function buildSchedule(opts:{total:number;entryAmount?:number;installmentsCount:number;firstDueDate:string;dueDay?:number;mode?:ScheduleMode;intervalDays?:number;custom?:ScheduleItem[];entryDueDate?:string}){
 const total=Math.max(0,Number(opts.total)||0);const entry=Math.min(total,Math.max(0,Number(opts.entryAmount)||0));
 if(opts.mode==="custom"&&opts.custom?.length){const custom=opts.custom.map((x,i)=>({number:i+1,dueDate:x.dueDate,amount:Number(x.amount)||0}));return {entry:entry>0?{number:0,dueDate:opts.entryDueDate||iso(new Date()),amount:entry}:null,installments:custom};}
 const remaining=Math.max(0,total-entry);const count=Math.max(1,Math.floor(opts.installmentsCount||1));const amounts=splitAmounts(remaining,count);const first=safeDate(opts.firstDueDate);const dueDay=Math.min(31,Math.max(1,Number(opts.dueDay)||first.getDate()));const interval=Math.max(1,Number(opts.intervalDays)||30);
 const installments=amounts.map((amount,i)=>({number:i+1,dueDate:iso(opts.mode==="interval"?addDays(first,i*interval):addMonthsClamped(first,i,dueDay)),amount}));
 return {entry:entry>0?{number:0,dueDate:opts.entryDueDate||iso(new Date()),amount:entry}:null,installments};
}

export function paymentTermsFromSchedule(opts:{methodCode:string;mode:ScheduleMode;entryAmount:number;entryDueDate:string;installmentsCount:number;firstDueDate:string;dueDay:number;intervalDays:number;custom?:ScheduleItem[];total:number}){
 const built=buildSchedule(opts);
 if(opts.mode==="custom"){
   const all=[...(built.entry?[{number:1,dueDate:built.entry.dueDate,amount:built.entry.amount,methodCode:opts.methodCode}]:[]),...built.installments.map((x,i)=>({number:i+(built.entry?2:1),dueDate:x.dueDate,amount:x.amount,methodCode:opts.methodCode}))];
   return {methodCode:opts.methodCode,installments:all};
 }
 if(opts.mode==="interval"){
   const all=[...(built.entry?[{number:1,dueDate:built.entry.dueDate,amount:built.entry.amount,methodCode:opts.methodCode}]:[]),...built.installments.map((x,i)=>({number:i+(built.entry?2:1),dueDate:x.dueDate,amount:x.amount,methodCode:opts.methodCode}))];
   return {methodCode:opts.methodCode,installments:all};
 }
 return {methodCode:opts.methodCode,entryAmount:opts.entryAmount,entryDueDate:opts.entryDueDate,installmentsCount:opts.installmentsCount,firstDueDate:opts.firstDueDate,dueDay:opts.dueDay};
}
