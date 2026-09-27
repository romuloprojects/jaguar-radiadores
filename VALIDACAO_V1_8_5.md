# Jaguar Frontend V1.8.5 — rota exata de leitura das fotos

## Correção

- O upload continua em `POST /api/mobile/media/product-image?productId=<uuid>`.
- A leitura pública da imagem passa a usar a MESMA rota exata, em `GET /api/mobile/media/product-image?file=<arquivo>`.
- Isso elimina a dependência da rota dinâmica `/api/mobile/media/products/$`, que em produção estava retornando `Cannot GET`.
- Novos `imageUrl` são gravados no novo formato.
- URLs antigas `/api/mobile/media/products/<arquivo>` são normalizadas automaticamente na tela de Estoque, sem exigir migração imediata do PostgreSQL.
- O handler legado foi mantido como compatibilidade adicional.

## Diagnóstico esperado

Após o deploy, abrir `GET /api/mobile/media/product-image?file=<arquivo>` deve:

- mostrar a imagem quando o arquivo existe;
- retornar JSON 404 `Imagem não encontrada` quando a rota funciona, mas o arquivo não existe no volume.

A resposta `Cannot GET` não deve mais ocorrer nessa rota exata.
