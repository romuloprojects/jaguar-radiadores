# Jaguar Frontend V1.8.8 — Miniatura usa URL exata

## Correção

A miniatura do estoque passou a usar exatamente a mesma URL pública da imagem que é usada na ampliação/abertura da foto.

Foi removida a variação de URL com `thumb`, `product` e `retry`, pois a imagem original já foi comprovada em produção e a falha permanecia apenas na URL modificada da miniatura.

Nenhuma alteração foi feita em upload, persistência, PostgreSQL, n8n ou mobile.

## Comportamento esperado

- a miniatura usa `product.imageUrl` normalizada sem parâmetros adicionais;
- `object-fit: contain` permanece;
- clique continua abrindo a imagem original;
- em erro real, permanece o fallback `Abrir foto`.
