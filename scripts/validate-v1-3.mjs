import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const checks = [];
function check(ok, message){ if(!ok) throw new Error(message); checks.push(message); }

const router = read('src/router.tsx');
check(router.includes('staleTime: Infinity'), 'cache sem expiração automática habilitado');
check(router.includes('refetchOnWindowFocus: false'), 'refetch ao focar janela desabilitado');
check(router.includes('refetchOnReconnect: false'), 'refetch ao reconectar desabilitado');
check(router.includes('refetchOnMount: false'), 'refetch automático ao remontar desabilitado');
check(router.includes('retry: 0'), 'retry automático de queries desabilitado');

const settings = read('src/routes/configuracoes.tsx');
check(!settings.includes('refetchInterval:'), 'healthcheck sem polling automático');
check(settings.includes('Verificar agora'), 'healthcheck manual disponível');

const quotes = read('src/routes/orcamentos.tsx');
check(quotes.includes('queryKey:["quotes"]'), 'lista de orçamentos usa uma única query/cache');
check(quotes.includes('filteredQuotes'), 'busca/status de orçamentos filtrados localmente');
check(!quotes.includes('useDeferredValue'), 'busca não dispara consulta remota a cada digitação');

const dashboard = read('src/routes/index.tsx');
check(!dashboard.includes('em tempo real'), 'texto não promete atualização em tempo real');

console.log(`Jaguar V1.3 validation OK — ${checks.length} checks`);
