# Jaguar Frontend V1.8.2 — upload binário de foto do estoque

Correção focada na integração Mobile ↔ Frontend, mantendo n8n/PostgreSQL inalterados.

- `POST /api/mobile/media/product-image` aceita o novo protocolo binário direto;
- `productId` vem em query string, a imagem é o corpo HTTP e MIME/nome vêm nos headers;
- validação continua conferindo assinatura real JPEG/PNG/WebP, limite e persistência em `/data/jaguar/uploads/products`;
- o endpoint mantém compatibilidade com multipart de APKs antigos durante a transição;
- URL pública da foto passa a respeitar `X-Forwarded-Proto` / `X-Forwarded-Host` quando presentes;
- apenas `id + imageUrl` continuam sendo enviados ao workflow `product-update` do n8n;
- versão frontend: 1.8.2.
