import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/components/JaguarHeader.tsx",
  "src/routes/index.tsx",
  "src/routes/clientes.tsx",
  "src/routes/orcamentos.tsx",
  "src/routes/orcamentos_.novo.tsx",
  "src/routes/estoque.tsx",
  "src/routes/financeiro.tsx",
  "src/routes/fornecedores.tsx",
  "src/routes/relatorios.tsx",
  "src/routes/configuracoes.tsx",
  "src/data/mock/jaguar.ts",
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
}
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(ts|tsx|css)$/.test(name)) files.push(full);
  }
}
walk(path.join(root, "src"));
const forbidden = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (/ancar/i.test(text)) forbidden.push(path.relative(root, file));
}
if (forbidden.length) throw new Error(`Referências ANCAR encontradas em: ${forbidden.join(", ")}`);
console.log(`Jaguar validation OK: ${required.length} arquivos-chave e ${files.length} fontes sem referências ANCAR.`);
