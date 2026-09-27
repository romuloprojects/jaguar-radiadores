# Jaguar Frontend V1.8.9 — miniatura via Blob local

## Diagnóstico

No ambiente real, a URL da foto abre normalmente quando navegada em outra aba, mas o mesmo recurso falha quando usado diretamente como `src` do `<img>` da tabela. Isso prova que a imagem e a rota existem, mas o carregamento no contexto de imagem do navegador entra em `onError`.

## Correção

A miniatura não usa mais a URL HTTP diretamente como `src`. O fluxo agora é:

1. `fetch()` da URL original com `cache: no-store` e credenciais same-origin;
2. validação de HTTP 2xx, `Content-Type: image/*` e corpo não vazio;
3. conversão para `Blob`;
4. criação de `blob:` URL local com `URL.createObjectURL`;
5. uso do `blob:` como `src` da miniatura;
6. revogação do `blob:` ao trocar produto/URL ou desmontar o componente.

O link de ampliação continua usando a URL original.

## Validações executadas

- helper de Blob: PASS para imagem válida, HTTP 404, MIME inválido e corpo vazio;
- transpile sintático de `estoque.tsx` e `product-image-client.ts`: PASS;
- `validate-jaguar.mjs`: PASS;
- `validate-api-real.mjs`: PASS;
- validações V1.1, V1.2, V1.3, V1.4 e V1.6: PASS;
- `test-product-photo.mjs`: PASS para upload binário, fallback multipart, GET/HEAD da rota exata, JPEG/PNG/WebP, erros esperados, vínculo e persistência local;
- wiring check: PASS, a miniatura usa `fetch -> blob:` e não usa mais `src={original}`.

## Limitação do ambiente

Não foi possível executar um navegador Chromium contra HTTP local porque a política do ambiente bloqueia navegação para localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`). O caminho HTTP da foto foi validado pelo teste de integração Node, e o caminho `fetch -> Blob URL` foi validado separadamente com o helper exato usado no frontend.
