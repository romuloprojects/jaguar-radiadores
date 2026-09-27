# Jaguar Frontend V1.8.3 — correção de exibição das fotos do estoque

## Sintoma observado

O upload e o vínculo da foto ao produto concluíam, porém a URL pública gravada em `imageUrl` retornava:

`Cannot GET /api/mobile/media/products/<arquivo>.jpg`

Isso demonstra que o arquivo era aceito e a URL era persistida, mas a requisição GET não estava sendo atendida pelo runtime publicado.

## Correção

- o `src/server.ts` agora intercepta `GET` e `HEAD` em `/api/mobile/media/products/*` **antes** de delegar ao TanStack/Nitro;
- a imagem é lida diretamente do diretório persistente `/data/jaguar/uploads/products`;
- o nome do arquivo continua sanitizado por `safeProductImagePath`;
- respostas incluem MIME correto, `Content-Length`, cache imutável e `X-Content-Type-Options: nosniff`;
- a rota TanStack existente foi mantida como fallback e reutiliza o mesmo handler;
- nenhuma alteração foi feita no n8n/PostgreSQL nem no protocolo de upload do mobile V1.0.3.

## Motivo

O teste V1.8.2 exercitava diretamente o handler GET da rota e, por isso, não detectava que o runtime publicado não estava registrando/atendendo o splat da URL pública. A V1.8.3 não depende desse registro para servir arquivos persistidos.
