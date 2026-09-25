import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => { throw new Error(message); };

const requiredFiles = [
  'src/routes/api/jaguar/$.ts',
  'src/services/apiClient.ts',
  'src/services/jaguarApi.ts',
  'src/services/authService.ts',
  'src/types/api.ts',
  'src/auth/AuthContext.tsx',
  'src/auth/AuthGate.tsx',
  'src/routes/login.tsx',
  'src/routes/alterar-senha.tsx',
  'src/routes/index.tsx',
  'src/routes/clientes.tsx',
  'src/routes/clientes_.$clienteId.tsx',
  'src/routes/orcamentos.tsx',
  'src/routes/orcamentos_.novo.tsx',
  'src/routes/orcamentos_.$orcamentoId.tsx',
  'src/routes/estoque.tsx',
  'src/routes/financeiro.tsx',
  'src/routes/fornecedores.tsx',
  'src/routes/relatorios.tsx',
  'src/routes/configuracoes.tsx',
  '.env.example',
];
for (const file of requiredFiles) if (!exists(file)) fail(`Arquivo obrigatório ausente: ${file}`);

const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(name)) files.push(full);
  }
}
walk(src);

const forbiddenMockImports = [];
const forbiddenLegacy = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  if (/from\s+["']@\/data\/mock\/jaguar["']/.test(text)) forbiddenMockImports.push(rel);
  if (/VITE_ANCAR|ancar-access|\/ancar\//i.test(text)) forbiddenLegacy.push(rel);
}
if (forbiddenMockImports.length) fail(`Rotas/serviços ainda importam mocks Jaguar: ${forbiddenMockImports.join(', ')}`);
if (forbiddenLegacy.length) fail(`Referências legadas ANCAR encontradas: ${forbiddenLegacy.join(', ')}`);

const api = read('src/services/jaguarApi.ts');
const expectedPaths = [
  'auth/login','auth/session','auth/logout','auth/change-password','settings','users','user-create','user-update',
  'clients','client-detail','client-create','client-update','vehicle-create','vehicle-update',
  'suppliers','supplier-detail','supplier-create','supplier-update','products','product-create','product-update','services','service-create','service-update','catalog',
  'stock/movements','stock/movement','purchases','purchase-detail','purchase-create','purchase-update','purchase-confirm','purchase-cancel',
  'quotes','quote-detail','quote-create','quote-update','quote-complete','quote-cancel','quote-document',
  'finance/receivables','finance/receivable-payment','finance/payables','finance/payable-create','finance/payable-payment','finance/cash-flow','finance/manual-transaction',
  'dashboard/overview','reports/annual','reports/costs','reports/finance','reports/stock','reports/periods','reports/snapshot','health','entity-delete',
];
const missingPaths = expectedPaths.filter((p) => !api.includes(`"${p}`) && !api.includes(`\`${p}`));
if (missingPaths.length) fail(`Endpoints do backend sem wrapper no frontend: ${missingPaths.join(', ')}`);

const proxy = read('src/routes/api/jaguar/$.ts');
for (const token of ['JAGUAR_N8N_WEBHOOK_BASE_URL','jaguar_session','HttpOnly','SameSite=Lax','Authorization','auth/login']) {
  if (!proxy.includes(token)) fail(`Proxy Jaguar sem requisito de segurança/integração: ${token}`);
}
if (!/GET:\s*handler/.test(proxy) || !/POST:\s*handler/.test(proxy) || !/PATCH:\s*handler/.test(proxy) || !/DELETE:\s*handler/.test(proxy)) fail('Proxy Jaguar não expõe GET/POST/PATCH/DELETE esperados.');

const env = read('.env.example');
if (!env.includes('JAGUAR_N8N_WEBHOOK_BASE_URL=')) fail('.env.example não documenta JAGUAR_N8N_WEBHOOK_BASE_URL.');

const config = read('src/config.ts');
if (!config.includes('APP_MODE = "api"')) fail('APP_MODE não está em api.');

const uiCoverage = {
  dashboard: ['jaguarApi.dashboard.overview','jaguarApi.reports.annual','jaguarApi.finance.cashFlow'],
  clients: ['jaguarApi.clients.list','jaguarApi.clients.detail','jaguarApi.clients.create','jaguarApi.clients.update','jaguarApi.clients.createVehicle','jaguarApi.clients.updateVehicle'],
  quotes: ['jaguarApi.quotes.list','jaguarApi.quotes.create','jaguarApi.quotes.detail','jaguarApi.quotes.update','jaguarApi.quotes.complete','jaguarApi.quotes.cancel','jaguarApi.quotes.document'],
  stock: ['jaguarApi.catalog.products','jaguarApi.stock.movements','jaguarApi.stock.movement','jaguarApi.purchases.list','jaguarApi.purchases.create','jaguarApi.purchases.update','jaguarApi.purchases.confirm','jaguarApi.purchases.cancel'],
  suppliers: ['jaguarApi.suppliers.list','jaguarApi.suppliers.detail','jaguarApi.suppliers.create','jaguarApi.suppliers.update'],
  finance: ['jaguarApi.finance.receivables','jaguarApi.finance.receive','jaguarApi.finance.payables','jaguarApi.finance.createPayable','jaguarApi.finance.pay','jaguarApi.finance.cashFlow','jaguarApi.finance.manualTransaction'],
  reports: ['jaguarApi.reports.periods','jaguarApi.reports.annual','jaguarApi.reports.costs','jaguarApi.reports.finance','jaguarApi.reports.snapshot','jaguarApi.quotes.list','jaguarApi.settings.get'],
  settings: ['jaguarApi.settings.get','jaguarApi.settings.save','jaguarApi.settings.users','jaguarApi.settings.createUser','jaguarApi.settings.updateUser','jaguarApi.catalog.services','jaguarApi.catalog.createService','jaguarApi.catalog.updateService','jaguarApi.health'],
};
const routeTexts = {
  dashboard: read('src/routes/index.tsx'),
  clients: read('src/routes/clientes.tsx') + read('src/routes/clientes_.$clienteId.tsx'),
  quotes: read('src/routes/orcamentos.tsx') + read('src/routes/orcamentos_.novo.tsx') + read('src/routes/orcamentos_.$orcamentoId.tsx'),
  stock: read('src/routes/estoque.tsx'),
  suppliers: read('src/routes/fornecedores.tsx'),
  finance: read('src/routes/financeiro.tsx'),
  reports: read('src/routes/relatorios.tsx'),
  settings: read('src/routes/configuracoes.tsx'),
};
const missingUiCalls = [];
for (const [area, calls] of Object.entries(uiCoverage)) {
  for (const call of calls) if (!routeTexts[area].includes(call)) missingUiCalls.push(`${area}:${call}`);
}
if (missingUiCalls.length) fail(`Cobertura UI/API incompleta: ${missingUiCalls.join(', ')}`);

const vite = read('vite.config.ts');
if (!vite.includes('jaguar-radiadores.facilities-ai.com.br')) fail('Host EasyPanel Jaguar ausente do Vite.');
if (!vite.includes('port: 8003')) fail('Porta 8003 ausente do Vite.');

console.log(`Jaguar API real validation OK: ${expectedPaths.length} endpoints mapeados, ${Object.keys(uiCoverage).length} áreas reais, ${files.length} fontes sem imports mock/legados.`);
