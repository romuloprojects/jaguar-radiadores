# Jaguar Radiadores — V0.2 Visual

## Escopo aplicado

1. Login redesenhado sem fotografia.
2. Header horizontal refinado, com item ativo por sublinhado vermelho.
3. Dashboard redesenhado com foco monetário.
4. Gráficos sem azul como linguagem principal: vermelho Jaguar, verde e grafite.
5. Clientes com KPIs, busca/listagem e painel de contexto.
6. Orçamento com etapa de veículo simplificada.
7. Estoque como único módulo preparado para fotografias reais.
8. Financeiro com Cash Flow + receber + pagar.
9. Fornecedores com listagem e painel de contexto.
10. Relatórios com demonstrativo anual comparativo.

## Regra visual de fotografias

- Estoque: sim, fotos reais de itens/peças.
- Login: não.
- Visão Geral: não.
- Clientes: não.
- Orçamentos: não.
- Financeiro: não.
- Fornecedores: não.
- Relatórios: não.

## Validações realizadas

- `node scripts/validate-jaguar.mjs`: OK.
- 84 arquivos TS/TSX transpilados sintaticamente: 0 erros.
- imports internos: OK.
- referências ANCAR em `src`: 0.
- campos removidos do fluxo de orçamento: Ano, Tipo, KM/Horímetro, Aplicação/Tipo de radiador.

## Build

`npm install` não concluiu dentro do limite do ambiente, portanto o build completo com dependências deve ser confirmado no EasyPanel/GitHub após publicação.
