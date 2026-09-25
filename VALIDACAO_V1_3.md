# Jaguar Radiadores — Validação V1.3

## Objetivo
Eliminar recarregamentos automáticos sem utilidade operacional e reduzir a latência percebida da tela de Orçamentos.

## Ajustes
- React Query não refaz consultas por foco de janela, reconexão ou remontagem de componente.
- Cache de tela permanece por 12 horas e é invalidado explicitamente pelas operações de criar/editar/excluir/pagar/concluir.
- Retries automáticos de consulta foram desabilitados.
- Healthcheck deixou de consultar o backend a cada 60 segundos e passou a ter `Verificar agora`.
- Tela de Orçamentos faz uma única carga da lista e filtra busca/status no navegador.
- Criação de orçamento invalida explicitamente Orçamentos, Dashboard, Financeiro e Relatórios.
- Texto de Visão Geral deixou de dizer “em tempo real”.

## Backend
Aplicar o patch `07_JAGUAR_V1_3_PATCH_PERFORMANCE_ORCAMENTOS` para otimizar `jaguar.api_quotes_list` e os índices de listagem.
