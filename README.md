# Jaguar Radiadores — Frontend V0.2 Visual

Versão de homologação visual com dados totalmente mockados. Nenhuma integração com n8n/PostgreSQL faz parte desta etapa.

## Direção homologada aplicada

- Navegação horizontal Jaguar.
- Login premium sem fotografia: identidade de marca + composição gráfica abstrata.
- Fotografias reais reservadas exclusivamente ao módulo de Estoque.
- Estoque já preparado com `StockItem.imageUrl` e pasta `public/images/stock/` para receber fotos reais.
- Gráficos com ênfase monetária e paleta Jaguar: vermelho, verde e grafite; azul deixa de ser cor principal dos gráficos.
- Visão Geral com KPIs, faturamento, fluxo de caixa, últimos orçamentos, vencimentos e estoque baixo.
- Clientes e Fornecedores com listagem + painel lateral de contexto, sem fotografias.
- Financeiro com Cash Flow, Contas a Receber e Contas a Pagar.
- Relatórios com demonstrativo anual comparativo e indicadores financeiros.
- Novo Orçamento simplificado na etapa Veículo/Equipamento: removidos Ano, Tipo, KM/Horímetro e Aplicação/Tipo de radiador.

## Login mock

Qualquer usuário e senha não vazios entram no protótipo. Sugestão:

- usuário: `admin`
- senha: `demo`

## Execução local

```bash
bun install
bun run validate:jaguar
bun run build
bun run dev
```

## EasyPanel / Nixpacks

Variáveis recomendadas:

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
```

O repositório contém `nixpacks.toml` com:

```text
install: bun install
build: bun run build
start: node .output/server/index.mjs
```

Configure a porta interna/target do serviço como `8003`.

## Observação de validação

O ambiente de geração não conseguiu concluir `npm install` dentro do limite disponível, portanto o build completo com dependências não foi executado aqui. Foram executados com sucesso:

- validação Jaguar do projeto;
- transpile sintático de todos os arquivos TS/TSX;
- validação de imports locais;
- verificação de ausência de referências ANCAR em `src`.


## V0.2.1 — correção de CSS/cache e host Vite

Esta revisão corrige a divergência visual observada no deploy, em que o HTML V0.2 estava sendo exibido com o stylesheet anterior da V0.1.

- stylesheet principal renomeado para `src/jaguar-v021.css`;
- cache-buster atualizado para `jaguar-ui=0.2.1`;
- metadado de versão atualizado para `0.2.1-visual-fix`;
- Vite liberado explicitamente para `jaguar-radiadores.facilities-ai.com.br`;
- `server` e `preview` configurados na porta 8003.

Após publicar, faça um redeploy limpo e, na primeira abertura, use atualização forçada do navegador para descartar o CSS anterior.
