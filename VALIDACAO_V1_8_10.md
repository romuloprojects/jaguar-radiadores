# Jaguar Frontend V1.8.10 — lightbox interno da foto do estoque

## Alteração
- clique na miniatura não abre mais nova aba;
- a foto usa o mesmo `blob:` já carregado e homologado pela miniatura da V1.8.9;
- a ampliação ocorre em `Dialog`/overlay dentro da própria aplicação;
- fechamento pelo botão X, tecla Esc ou clique fora do modal (comportamento nativo do Radix Dialog já usado no projeto);
- a imagem ampliada usa `object-fit: contain` e limites relativos ao viewport para não cortar;
- o cursor da miniatura indica zoom e há foco visível por teclado;
- nenhuma alteração em upload, endpoint de mídia, armazenamento persistente, PostgreSQL, n8n ou mobile.

## Base
Derivada diretamente da V1.8.9, em que a miniatura via Blob foi homologada no ambiente real.

## Validações executadas
- transpile sintático de `src/routes/estoque.tsx` com TypeScript 5.x: PASS;
- `npm run validate:jaguar`: PASS;
- `npm run test:photo`: PASS (executado com TypeScript global disponibilizado temporariamente ao runner; nenhum `node_modules` foi incluído no pacote);
- assert: clique da miniatura abre `ProductPhotoLightbox`: PASS;
- assert: trecho da miniatura não contém mais `target="_blank"`: PASS;
- assert: botão X do `DialogContent` possui estilização visível no lightbox: PASS;
- assert: imagem ampliada limitada ao viewport e com `object-fit: contain`: PASS;
- diff contra V1.8.9 limitado a `src/routes/estoque.tsx`, `src/jaguar-v021.css`, versão do `package.json` e este documento.
