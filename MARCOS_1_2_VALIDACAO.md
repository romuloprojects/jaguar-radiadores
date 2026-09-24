# Jaguar Radiadores — Marcos 1 + 2

Data da consolidação: 23/09/2026

## Marco 1 — Fundação Jaguar

Concluído no código-fonte:

- derivação independente da base técnica ANCAR v5.9.1;
- remoção das páginas e regras de domínio de shoppings/CAG;
- navegação vertical removida e substituída por header horizontal responsivo;
- identidade visual Jaguar aplicada com vermelho, grafite, branco e cores semânticas independentes;
- tema claro definido como padrão e tema escuro preservado;
- login reconstruído para Jaguar;
- namespace de autenticação e tema alterado para `jaguar-*`;
- autenticação substituída por mock local sem chamadas de backend;
- assets da Jaguar extraídos do material enviado pelo cliente;
- rotas não aninhadas para detalhes e novo orçamento, preservando o AppLayout global;
- remoção de integrações, serviços e componentes específicos da aplicação anterior.

## Marco 2 — UI Jaguar com dados mockados

Telas implementadas:

1. Visão Geral
2. Clientes
3. Detalhe do Cliente
4. Orçamentos / Atendimentos
5. Detalhe do Orçamento
6. Novo Orçamento em cinco etapas
7. Estoque
8. Financeiro
9. Fornecedores
10. Relatórios
11. Configurações
12. Login

### Fluxo de novo orçamento

1. Cliente
2. Veículo / equipamento
3. Peças e serviços
4. Pagamento / PIX ilustrativo / forma de aprovação
5. Revisão

O fluxo usa dados locais e simula a experiência final, mas não persiste alterações.

## Dados mockados

A base local contempla clientes PF/PJ, veículos leves e pesados, máquinas agrícolas, equipamentos industriais, orçamentos em diferentes status, estoque, fornecedores, contas a receber, contas a pagar, fluxo de caixa e séries mensais de faturamento.

## Fora do escopo nesta versão

- PostgreSQL;
- workflows n8n;
- APIs reais;
- autenticação real;
- persistência de cadastros;
- baixa/reserva transacional de estoque;
- geração real de PDF;
- PIX real;
- emissão fiscal;
- envio por WhatsApp;
- regras definitivas de permissões.

## Validações executadas

- `npm run validate:jaguar`: aprovado;
- 85 arquivos TypeScript/TSX transpilaram sem erro sintático usando TypeScript 5.x disponível no ambiente;
- verificação de imports internos `@/`: aprovada;
- nenhuma referência textual a ANCAR permanece nos arquivos TS/TSX do `src`;
- rotas e arquivos-chave Jaguar presentes.

### Limitação do ambiente de validação

O `npm install` não concluiu dentro do limite de execução disponível e o cache local não continha todas as dependências. Portanto, o build Vite completo não foi executado neste ambiente. Antes de publicação, executar localmente:

```bash
npm install
npm run validate:jaguar
npm run build
npm run dev
```

A validação visual em navegador deve ser a próxima etapa de homologação antes do Marco 3.
