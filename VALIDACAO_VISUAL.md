# Jaguar Radiadores — entrega visual

Referência: oito imagens de `mock telas validado.zip`. Esta entrega traduz a direção homologada para os componentes existentes, com tema escuro padrão, navegação horizontal, superfícies grafite, bordas discretas, vermelho de identidade e cores semânticas.

## Escopo entregue

- Login industrial sem fotografia, com o arquivo original da marca.
- Visão Geral com duas áreas de gráficos e três listas operacionais, indicadores compactos e hierarquia consistente.
- Clientes com tabela principal em largura total, filtros preservados e detalhes abaixo.
- Orçamentos e suas cinco etapas com os mesmos estados, campos, cálculos e ações; tratamento visual compartilhado, valores totais em verde e campos de quantidade dimensionados.
- Estoque com tabela principal, espaços existentes para fotos e distribuição/movimentações abaixo.
- Financeiro com abas preservadas, gráfico de barras/linha e resumo que reutiliza os saldos calculados existentes.
- Fornecedores com seleção e painel de detalhes.
- Relatórios com indicadores no topo, curvas comparativas e detalhamento por mês, sem alterar valores ou fórmulas.
- Configurações e páginas de detalhe também recebem os estilos compartilhados.
- Foco de teclado, nomes acessíveis nos controles de ícone, responsividade e redução de movimento.

O CSS foi consolidado por seletor, em um único arquivo, sem adicionar uma folha de correções paralela ou duplicar componentes.

## Preservação verificada

Comparação SHA-256 com o ZIP de entrada confirmou que permanecem idênticos:

- `src/data/mock/jaguar.ts`, `src/types/jaguar.ts` e `src/config.ts`;
- todos os arquivos de `src/auth` e `src/services`;
- logo oficial `public/images/jaguar-logo-source.jpg` e demais assets;
- `package.json`, `vite.config.ts`, `nixpacks.toml`, `Procfile`, `.env.example`, `bunfig.toml` e `EASYPANEL.md`.

TanStack, React, Tailwind, Radix e Recharts mantidos. Nenhuma integração ou persistência nova. Os números das imagens não substituem os mocks existentes. Nenhuma fotografia foi adicionada. O ZIP original não inclui fotos de produtos; os espaços de imagem do Estoque continuam preparados para recebê-las.

A navegação lateral presente em uma referência não foi adicionada, conforme a exigência de manter a navegação horizontal. O assistente de orçamento continua em cinco etapas para preservar seu funcionamento. Gráficos por categoria não foram inventados: o projeto não possui essa série de dados. Botões demonstrativos já sem implementação continuam com o comportamento original.

## Validação executada

- Node **22.23.3** e Bun **1.3.0**.
- Instalação com Bun 1.3.0; o lockfile foi normalizado pelo próprio Bun, sem alteração do manifesto de dependências.
- `tsc --noEmit`: aprovado, sem erros.
- `node scripts/validate-jaguar.mjs`: aprovado; 11 arquivos-chave e 85 fontes verificadas, sem referências à marca anterior no código da aplicação.
- Imports resolvidos pelo TypeScript e pelo bundler.
- Árvore de rotas regenerada pelo TanStack, mantendo as URLs existentes.
- Build completo de cliente, SSR e servidor Nitro: aprovado.
- Servidor compilado iniciado com `PORT=8003` e Node 22.
- HTTP 200 nas 13 rotas: `/`, `/login`, `/clientes`, `/clientes/cli-001`, `/orcamentos`, `/orcamentos/novo`, `/orcamentos/orc-0132`, `/estoque`, `/financeiro`, `/fornecedores`, `/relatorios`, `/configuracoes` e `/alterar-senha`.
- Navegador: login, filtro PF, abertura do cadastro, busca no estoque, abas receber/pagar, seleção de fornecedor, cinco etapas e total do orçamento, relatório e detalhe de cliente verificados.
- Responsividade: desktop e viewport de 390 px; transbordamento da barra de ações corrigido. Rolagem horizontal das tabelas mantida dentro dos respectivos contêineres.
- Build de produção aberto sem erros de console, com logo carregado e tema escuro.

### Correção técnica preexistente

`useAutoRefresh.ts`, sem consumidores no projeto, importava uma constante inexistente. O intervalo agora é um argumento explícito, eliminando o import inválido sem inventar um intervalo ou mudar qualquer fluxo em uso.

### Particularidade da validação no Windows

O comando padrão `bun run build` compilou cliente e SSR, mas o rastreamento de dependências do Nitro encontrou `EPERM` ao executar `readlink` em um diretório ancestral no Windows. O build completo foi validado com `scripts/build-local-windows.mjs`, que limita somente a base do rastreamento à pasta deste projeto. Não desativa o rastreamento e gera o servidor completo.

Esse auxiliar não participa do deploy. `vite.config.ts`, Nixpacks e os comandos do EasyPanel permanecem idênticos aos originais. O build em Linux/EasyPanel deve ser executado no próprio servidor. A aplicação não foi publicada nesta tarefa.

Há um aviso não bloqueante de chunk acima de 500 kB no Vite. Não foram feitas mudanças de arquitetura ou dependências para eliminá-lo nesta rodada visual.

## Deploy

Extrair o ZIP e usar a pasta que contém `package.json` como raiz do serviço Nixpacks.

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
```

Instalação: `bun install`. Build: `bun run build`. Inicialização: `node .output/server/index.mjs`.

Manter o domínio `jaguar-radiadores.facilities-ai.com.br` e target interno `8003`.

O pacote contém o código completo, lockfile, assets e configuração. `node_modules`, caches e o build específico de Windows não integram o ZIP; o EasyPanel gera os artefatos para o seu próprio sistema operacional.
