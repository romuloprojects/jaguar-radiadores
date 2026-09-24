# Jaguar Radiadores — Validação V1.1

## Objetivo

Evoluir o frontend API real sem alterar a baseline visual homologada (dark/light), cobrindo os pontos levantados após os primeiros testes reais:

- orçamento/atendimento realmente utilizável;
- pagamento à vista ou a prazo/"na confiança";
- parcelas com vencimento mensal, intervalo de dias ou datas personalizadas;
- baixa de entrada/pagamento já recebido no momento da criação;
- contas a receber agrupadas por atendimento e parcelas marcáveis como pagas;
- contas a pagar genéricas (não apenas fornecedor), parceladas e com parcelas já pagas;
- documento A4 homologado para impressão/Salvar como PDF;
- PIX vindo das Configurações, com Copia e Cola + QR Code quando a chave estiver cadastrada;
- Relatórios com áreas específicas de faturamento, custos, fluxo de caixa, receber, pagar e estoque;
- exportação CSV e impressão/Salvar como PDF dos relatórios.

## Regras preservadas

- Orçamento/atendimento: `in_progress`, `completed`, `cancelled`.
- Financeiro separado: `open`, `partial`, `paid`, `overdue`.
- Faturado não é igual a recebido.
- Estoque físico, reservado e disponível continuam derivados do PostgreSQL.
- Fotos reais permanecem somente no Estoque.
- A chave PIX pode permanecer vazia até a confirmação pelo cliente.

## Documento do orçamento

O botão **Imprimir / Salvar PDF** usa `quote-document` + dados reais do atendimento para abrir uma página A4 isolada, sem navegação do sistema.

O documento contém:

- logo oficial;
- dados da empresa;
- dados do cliente;
- veículo/equipamento;
- problema relatado;
- serviços;
- peças;
- subtotais, desconto e total;
- parcelas e vencimentos reais;
- PIX Copia e Cola;
- QR Code PIX quando configurado;
- autorização e assinaturas.

A impressão usa o diálogo nativo do navegador. O usuário pode imprimir fisicamente ou selecionar **Salvar como PDF**.

## PIX

A geração do payload continua no PostgreSQL (`jaguar.pix_payload`). O frontend somente transforma o payload oficial em QR Code para o documento.

Se a chave estiver vazia, o orçamento continua funcionando e o documento informa que o PIX ainda não está configurado.

## Validações executadas

- JSON/package válido;
- 89 arquivos TS/TSX transpilados sintaticamente sem erro;
- `validate-jaguar.mjs`: OK;
- `validate-api-real.mjs`: OK;
- 91 fontes sem referências ANCAR;
- 90 fontes sem imports mock/legados;
- teste unitário local do gerador de parcelas: 3x mensal e entrada + 3x conferidos.

## Limitação do ambiente

O ambiente de geração não acessa o registry npm, portanto a nova dependência `qrcode` não pôde ser instalada localmente e o `vite build` completo não foi executado aqui.

O EasyPanel usa `bun install` (sem `--frozen-lockfile`) e deverá instalar `qrcode` durante o deploy. O build do EasyPanel é a validação final de dependências/runtime.

## Serviço livre/manual no orçamento

O orçamento agora permite adicionar um serviço sem cadastro prévio no Catálogo. No campo **Catálogo** do item de serviço existe a opção **Serviço livre / descrição manual**; a descrição e o valor podem ser digitados diretamente.

Para isso, aplicar uma vez o patch de backend `04_JAGUAR_V1_1_PATCH_SERVICO_LIVRE.json` usando a credencial `jaguar-db`. O patch apenas substitui a função `jaguar.api_quote_save`; os workflows de API ativos não precisam ser recriados.

## Relatórios

A tela Relatórios possui áreas reais para Faturamento, Custos, Fluxo de Caixa, A Receber, A Pagar e Estoque. Cada aba pode ser exportada para CSV e impressa/salva como PDF pelo navegador. A impressão recebe tratamento específico para ficar legível tanto se o sistema estiver em dark quanto em light.
