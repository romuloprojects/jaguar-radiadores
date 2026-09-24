# Jaguar Radiadores — Validação Frontend API Real V1

## Escopo

Esta revisão preserva o visual homologado em dark e light e substitui o uso funcional dos mocks por integração real com os workflows Jaguar n8n/PostgreSQL.

## Fluxo de sessão

- Browser envia credenciais para `/api/jaguar/auth/login`.
- O server TanStack encaminha para `/webhook/jaguar/auth/login`.
- O token retornado pelo backend é removido da resposta exposta ao navegador e armazenado em cookie HttpOnly.
- Chamadas seguintes recebem `Authorization: Bearer` somente no proxy server-side.
- 401 limpa a sessão local; logout revoga a sessão no backend e limpa o cookie.

## Cobertura funcional

1. Autenticação e troca obrigatória de senha.
2. Dashboard/Visão Geral.
3. Clientes e veículos/equipamentos.
4. Fornecedores.
5. Produtos, estoque, movimentações e compras.
6. Orçamento/atendimento com status simples (`in_progress`, `completed`, `cancelled`).
7. Financeiro independente (`open`, `partial`, `paid`, `overdue`).
8. Recebimentos a prazo/“na confiança”, inclusive parcial.
9. Contas a pagar e pagamentos.
10. Relatórios anuais, custos, financeiro e estoque.
11. Configurações, PIX, catálogo de serviços e usuários.
12. Healthcheck do backend.

## Validações estáticas executadas

- `node scripts/validate-jaguar.mjs`
- `node scripts/validate-api-real.mjs`
- transpile sintático TS/TSX com TypeScript 5.8.3
- resolução dos imports locais `@/` e relativos
- busca por imports diretos de `@/data/mock/jaguar`: zero ocorrências

## Limitação do ambiente de geração

O registry npm não estava acessível no ambiente de geração (`EAI_AGAIN`), portanto não foi possível instalar dependências e executar `vite build` localmente. A publicação no EasyPanel deverá executar o build real com Bun e servirá como validação de runtime/build.

## Roteiro mínimo de teste real pós-deploy

1. Login com o admin real criado no workflow 03.
2. Salvar dados/PIX em Configurações e validar Healthcheck online.
3. Cadastrar cliente e veículo/equipamento.
4. Cadastrar fornecedor, produto e serviço.
5. Registrar compra e confirmar; validar aumento de estoque e criação de conta a pagar.
6. Criar orçamento com serviço + peça; validar reserva de estoque e contas a receber.
7. Concluir atendimento; validar consumo/baixa da peça e faturamento.
8. Registrar recebimento parcial; validar status parcial e saldo remanescente.
9. Registrar pagamento de fornecedor; validar saída no Fluxo de Caixa.
10. Validar Dashboard e Relatórios após os movimentos.
