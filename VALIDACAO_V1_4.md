# Jaguar Frontend V1.4 — atualização silenciosa

## Objetivo
Eliminar recarregamentos perceptíveis após criar, editar, excluir, pagar, movimentar estoque ou alterar cadastros.

## Comportamento
- dados continuam em cache durante sincronização;
- nenhum refetch por foco de janela ou reconexão;
- navegação normal não refaz chamadas automaticamente;
- após mutações, apenas caches relacionados são invalidados em segundo plano;
- caches inativos marcados como alterados revalidam silenciosamente na próxima montagem;
- exclusões principais removem o item imediatamente do cache local;
- buscas de Clientes, Fornecedores, Estoque, Orçamentos e Financeiro usam dados já carregados, sem chamada por digitação/filtro.

## Backend
Nenhum patch de n8n/PostgreSQL é necessário para esta versão.

## Validação
Execute `npm run validate:jaguar` ou `node scripts/validate-v1-4.mjs`.
