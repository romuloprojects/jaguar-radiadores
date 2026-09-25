# Jaguar Frontend V1.2 — Validação

## Escopo

- limpeza do cabeçalho do Orçamento/OS impresso;
- título/nome de impressão baseado em `ORC-xxxxx`;
- exclusão administrativa dos registros criáveis;
- correção de recebimentos e pagamentos de teste;
- proxy server-side com método DELETE.

## Cobertura de exclusão no frontend

- Cliente
- Veículo/equipamento
- Fornecedor
- Produto/peça
- Serviço
- Usuário (exceto o próprio usuário logado)
- Compra
- Orçamento/OS
- Conta a pagar/parcela
- Movimentação manual de estoque
- Lançamento financeiro manual
- Recebimento registrado
- Pagamento registrado

Registros automáticos de estoque/caixa não são apagados isoladamente; devem ser desfeitos na origem para evitar inconsistência.

## Validações executadas

- `validate-jaguar.mjs`: OK
- `validate-api-real.mjs`: OK, 54 endpoints mapeados
- `validate-v1-1.mjs`: OK
- `validate-v1-2.mjs`: OK
- parser TypeScript/TSX: sem diagnóstico de sintaxe

O build/runtime final é validado pelo EasyPanel (`bun install` + `bun run build`).
