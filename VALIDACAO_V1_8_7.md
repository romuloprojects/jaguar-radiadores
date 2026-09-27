# Jaguar Frontend V1.8.7 — miniatura de estoque resiliente

## Correção

- miniaturas usam uma URL de renderização própria (`thumb=v187`) para não reaproveitar respostas 404 antigas em cache;
- removido `loading=lazy` das fotos da tabela de estoque;
- a miniatura tenta uma segunda URL caso a primeira carga falhe;
- se a imagem continuar indisponível, exibe um fallback clicável em vez do ícone nativo de imagem quebrada;
- dimensionamento alterado para largura/altura automáticas com `max-width`/`max-height`, preservando integralmente a proporção sem corte;
- respostas 404 do serviço de imagens recebem `Cache-Control: no-store`.

O upload, PostgreSQL, n8n e mobile não foram alterados nesta revisão.
