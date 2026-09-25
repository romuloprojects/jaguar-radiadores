import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const fail=(m)=>{throw new Error(m)};
const pkg=JSON.parse(read('package.json'));
if(!/^1\.(?:[2-9]|[1-9]\d+)\./.test(pkg.version)) fail(`Versão mínima esperada 1.2.x, encontrada ${pkg.version}`);

const print=read('src/utils/quote-print.ts');
if(!print.includes('<title>${line(d.number || q.number || "Orçamento")}</title>')) fail('Título do documento não está baseado somente no número da OS.');
for(const forbidden of ['Documento emitido pelo sistema Jaguar Radiadores','quoteStatusLabel','class="status']) if(print.includes(forbidden)) fail(`Documento ainda contém elemento removido: ${forbidden}`);
if(!print.includes('<h1>ORÇAMENTO / ORDEM DE SERVIÇO</h1>')) fail('Título visual da OS ausente.');

const api=read('src/services/jaguarApi.ts');
if(!api.includes('remove: (entity: string, id: string)')) fail('Wrapper de exclusão ausente.');
const proxy=read('src/routes/api/jaguar/$.ts');
if(!/DELETE:\s*handler/.test(proxy)) fail('Proxy DELETE ausente.');
if(!proxy.includes('HAS_DEPENDENCIES')) fail('Mapeamento de dependências para exclusão ausente.');

const routes=['src/routes/clientes.tsx','src/routes/clientes_.$clienteId.tsx','src/routes/fornecedores.tsx','src/routes/estoque.tsx','src/routes/orcamentos.tsx','src/routes/orcamentos_.$orcamentoId.tsx','src/routes/financeiro.tsx','src/routes/configuracoes.tsx'].map(read).join('\n');
const directEntities=['customer','vehicle','supplier','product','service','user','stock_movement','purchase','quote','payable','financial_transaction'];
for(const entity of directEntities) if(!routes.includes(`jaguarApi.remove("${entity}"`)) fail(`UI sem exclusão para ${entity}`);
for(const entity of ['receivable_payment','payable_payment']) if(!routes.includes(`"${entity}"`)) fail(`UI sem exclusão para ${entity}`);

const finance=read('src/routes/financeiro.tsx');
for(const t of ['PaymentHistory','receivable_payment','payable_payment']) if(!finance.includes(t)) fail(`Financeiro sem correção/exclusão de pagamento: ${t}`);
const types=read('src/types/api.ts');
if(!types.includes('payments?: PaymentRecordApi[]')) fail('Tipos financeiros sem histórico de pagamentos.');

const deleteAction=read('src/components/DeleteAction.tsx');
for(const t of ['AlertDialog','Excluir definitivamente','toast.success']) if(!deleteAction.includes(t)) fail(`Confirmação de exclusão incompleta: ${t}`);
console.log('Jaguar V1.2 validation OK: OS limpa + exclusões administrativas/operacionais + correção de pagamentos.');
