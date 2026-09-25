import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const checks = [];
function check(ok, message){ if(!ok) throw new Error(message); checks.push(message); }

const sync = read('src/utils/query-sync.ts');
check(sync.includes('silentInvalidate'), 'utilitário de atualização silenciosa presente');
check(sync.includes('removeItemFromCachedLists'), 'remoção otimista de listas presente');

const router = read('src/router.tsx');
check(router.includes('staleTime: Infinity'), 'cache estável sem expiração automática');
check(router.includes('refetchOnWindowFocus: false'), 'sem refetch ao focar janela');
check(router.includes('refetchOnReconnect: false'), 'sem refetch ao reconectar');
check(router.includes('query.state.isInvalidated'), 'remount só revalida dados alterados');

const clients = read('src/routes/clientes.tsx');
check(clients.includes('queryKey: ["clients"]'), 'clientes carregam uma única lista em cache');
check(!clients.includes('queryKey: ["clients", query]'), 'busca de clientes não dispara nova consulta');

const suppliers = read('src/routes/fornecedores.tsx');
check(suppliers.includes('queryKey:["suppliers"]'), 'fornecedores usam cache único');
check(!suppliers.includes('queryKey:["suppliers",query]'), 'busca de fornecedores é local');

const stock = read('src/routes/estoque.tsx');
check(stock.includes('queryKey: ["products"]'), 'produtos usam cache único');
check(!stock.includes('queryKey: ["products", query, status]'), 'filtros de estoque não disparam nova consulta');

const finance = read('src/routes/financeiro.tsx');
check(finance.includes('queryKey:["receivables"]'), 'contas a receber usam cache único');
check(finance.includes('queryKey:["payables"]'), 'contas a pagar usam cache único');
check(!finance.includes('queryKey:["receivables",search,status]'), 'filtro de recebíveis é local');
check(!finance.includes('queryKey:["payables",search,status]'), 'filtro de pagáveis é local');

const deleteAction = read('src/components/DeleteAction.tsx');
check(deleteAction.includes('onDone?.();'), 'pós-exclusão não bloqueia a UI aguardando refetch');
check(!deleteAction.includes('await onDone?.();'), 'exclusão não aguarda sincronização remota');

for (const file of ['src/routes/clientes.tsx','src/routes/fornecedores.tsx','src/routes/estoque.tsx','src/routes/financeiro.tsx','src/routes/orcamentos.tsx','src/routes/configuracoes.tsx']) {
  check(!read(file).includes('invalidateQueries({'), `${file} não faz invalidate bloqueante direto`);
}

console.log(`Jaguar V1.4 validation OK — ${checks.length} checks`);
