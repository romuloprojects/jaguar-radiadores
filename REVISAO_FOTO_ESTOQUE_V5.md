# Foto de produto — revisão pontual v5

Base mobile: v4 desta conversa. Base web: `jaguar-radiadores-frontend-api-real-v1-8-1.zip` enviado pelo usuário. A revisão está implementada no código; a homologação física S24+ → HTTPS Jaguar → n8n/PostgreSQL → volume do serviço permanece pendente. Não houve deploy nem alteração de dados de produção.

## Causas confirmadas

1. A câmera usava `allowsEditing: true` e `aspect`, provocando o editor/recorte obrigatório.
2. O estado mantinha apenas a URI temporária, descartando nome, MIME, tamanho e dimensões do asset.
3. O upload dependia do fetch global e do MIME inferido pelo arquivo nativo. Na versão anterior à v4, o objeto legado `{uri,name,type}` também era incompatível com o serializador Expo; há teste que reproduz essa exceção.
4. O endpoint do frontend rejeitava MIME vazio/`application/octet-stream`, mesmo com nome JPEG válido. `image/jpg` não constava da lista aceita.
5. Falhas de filesystem eram agrupadas em erro genérico 500. A validação da sessão ficava fora do tratamento de exceções.
6. O web tinha `staleTime: Infinity` e refetch por foco desativado globalmente, podendo manter a URL antiga do produto.

## Comportamento implementado no app

- Câmera traseira, imagens somente, `allowsEditing: false`, qualidade 0,7 e sem `aspect`/recorte. O usuário confirma a captura na câmera e volta ao formulário.
- Galeria também sem editor; seleção única. Cancelar mantém a foto anterior.
- Preview com os mesmos estilos existentes, ações Tirar foto, Escolher da galeria, Trocar foto e Remover foto. Apenas a área de foto recebeu novas ações.
- `ProductPhoto` guarda o asset relevante completo e `original` com os metadados originais. O estado de envio inclui URI controlada, filename, MIME, tamanho e dimensões finais.
- Assim que o picker retorna, a imagem é copiada e a cópia é aguardada em `Paths.document/jaguar/products/<UUID>-source.<extensão>`. O processamento não depende mais do cache temporário da câmera.
- Redimensionamento proporcional, sem recorte, maior lado de até 1600 px e saída JPEG com qualidade 0,7. Uma segunda compressão 0,5 é tentada se necessário; o envio é bloqueado acima de 4 MiB. A saída fica em `Paths.document/jaguar/products/<UUID>.jpg`. PNG/WebP/HEIC que o Android consiga decodificar são convertidos efetivamente para JPEG; não se trata apenas de renomear a extensão. A origem fica registrada em `original`.
- A cópia intermediária e o resultado temporário do manipulador são apagados. A foto preparada permanece durante falhas de upload; substituição, remoção e conclusão bem-sucedida liberam a cópia controlada. Não se apaga a foto original da galeria/câmera.
- O upload importa explicitamente `fetch` de `expo/fetch`. Um `File` real lê o arquivo; seu Blob recebe MIME explícito, e `FormData.append` recebe o filename. O boundary é definido pelo fetch, sem Content-Type multipart manual.
- “Salvando produto...” e “Enviando foto...” são estados distintos. Uma falha da imagem exibe “Produto cadastrado com sucesso, mas não foi possível enviar a foto.”
- “Reenviar foto” reutiliza o `productId` já retornado, sem chamar cadastro novamente. Há trava síncrona de duplo toque. O vínculo de reenvio fica na tela atual; não foi implementada retomada automática após encerrar o processo/sair da tela. Consulte o estoque antes de iniciar outro cadastro.
- Logs de homologação incluem código, status HTTP, resumo limitado da resposta, MIME enviado, bytes, nome e URI local, sem cabeçalho de autenticação.

## MIME e servidor

Endpoint mantido: `POST /api/mobile/media/product-image`, multipart com `productId` e `image`, autenticado com Bearer.

O app normaliza `image/jpg` para `image/jpeg`; se o tipo estiver vazio ou for `application/octet-stream`, usa a extensão do filename/URI. Na preparação normal, a saída é um JPEG real e sempre usa `image/jpeg` e `.jpg`.

O servidor aceita JPEG/JPG, PNG e WebP. Para tipo vazio/octet-stream, infere pela extensão. Confere também a assinatura binária e rejeita tipo divergente ou conteúdo sem assinatura de imagem. Essa checagem não equivale a uma decodificação integral de pixels no servidor. O limite do servidor permanece 8 MiB, verificado antes da leitura do arquivo e novamente sobre os bytes.

Destino confirmado no código: `JAGUAR_UPLOAD_DIR=/data/jaguar/uploads`, subdiretório `products/`. O diretório é criado recursivamente. A gravação usa arquivo temporário exclusivo e rename, evitando servir conteúdo parcial. Falha de filesystem retorna JSON `UPLOAD_FILESYSTEM_ERROR`/503; falta de espaço retorna `UPLOAD_STORAGE_FULL`/507. Formato inválido usa 415, excesso de tamanho 413 e sessão ausente 401.

O vínculo continua sendo `PATCH product-update` para o workflow existente, com `{id, imageUrl}`. Nenhum binário/base64 é enviado ao PostgreSQL. O workflow/SQL n8n não veio no ZIP e não foi alterado.

Cada envio ganha uma URL com filename único; não há reaproveitamento da URL antiga no cache de imagem. A consulta de produtos da tela Estoque web passa a revalidar silenciosamente ao montar a tela, recuperar foco ou reconectar, preservando os dados enquanto carrega. Não há polling. Uma aba que permanece continuamente aberta não recebe push instantâneo do celular; ela atualiza ao recuperar foco/reentrar ou pela atualização existente.

## Arquivos alterados

Mobile:

- `App.tsx`: apenas importação do helper e `NewProductScreen`; comparação automática confirmou que Login, Home, OS, Clientes, movimentação de estoque, navegação e estilos globais permaneceram idênticos à v4.
- `src/api.ts`: apenas imports de foto e `uploadProductImage`; demais endpoints e lógica de sessão permaneceram idênticos.
- `src/productPhoto.ts`: novo preparo, armazenamento controlado, MIME, limites e diagnósticos.
- `package.json` e `package-lock.json`: `expo-image-manipulator` na versão compatível com SDK 57 e comando de teste.
- `tests/photo-flow-v5.cjs`: substitui o teste antigo de foto. Demais testes preservados.

Frontend/API:

- `src/lib/mobile-server.ts`: validação e gravação de imagem; demais funções preservadas.
- `src/routes/api/mobile/media/product-image.ts`: upload, vínculo e erros estruturados.
- `src/routes/estoque.tsx`: somente opções da consulta de produtos para atualização de foto.
- `package.json`: comando `test:photo`; nenhuma dependência web acrescentada/alterada.
- `scripts/test-product-photo.mjs`: integração HTTP e filesystem local.
- `scripts/verify-photo-volume.mjs`: verificação para rodar antes/depois do redeploy.

Arquivos de rotas gerados pelo build são regenerados normalmente durante a compilação; não houve alteração manual de rotas nem de navegação.

## Testes executados e limites

| Verificação | Resultado |
|---|---|
| TypeScript mobile (`npm run check`) | Aprovado |
| Quatro suítes mobile (`npm test`) | Aprovadas; câmera, filesystem nativo e rede mobile simulados |
| Configuração sem crop, traseira, qualidade, galeria, troca/preview | Código e testes de componente; aparelho pendente |
| Preservação de asset, cópia aguardada, resize/qualidade, MIME/filename | Aprovado com fronteiras nativas simuladas; compressão real S24+ pendente |
| Reenvio da foto e duplo toque | Aprovado: um cadastro, mesmo productId nos envios |
| Serialização multipart pelo código Expo | Aprovado com Blob real e arquivo nativo simulado |
| Exportação Android Metro/Hermes | Aprovada |
| Matriz de dependências Expo incluída no SDK | Aprovada em modo offline |
| HTTP multipart → endpoint → disco → URL da foto | Aprovado em servidor local; gravação/leitura reais, upstream n8n substituído por servidor de teste |
| JPEG e PNG reais, WebP de teste; MIME vazio/octet-stream/image-jpg | Aprovado |
| 401, 413, 415, erro de vínculo e erro de filesystem/503 | Aprovado |
| Banco recebe somente id e imageUrl | Payload de integração validado; PostgreSQL real não acessado |
| Persistência em leitura por novo processo Node | Aprovada no diretório de teste; não comprova volume de produção |
| Build web completo | Aprovado com `node scripts/build-local-windows.mjs`, script já existente no ZIP |
| `npm run build` no sandbox Windows | Etapa Nitro bloqueada por `EPERM readlink C:\Users\romul`; o script Windows existente completou a compilação |
| TypeScript global frontend | Após geração das rotas, restam 3 erros em arquivos preexistentes e não modificados: `__root.tsx`, `pix-qr.ts`, `orcamentos_.$orcamentoId.tsx`. Não corrigidos para respeitar escopo |
| S24+ real → HTTPS Jaguar → estoque web | **Pendente**: sem aparelho conectado, sessão de homologação e acesso ao ambiente implantado |
| Mount, UID/permissão e persistência após redeploy EasyPanel | **Pendente**: não há acesso ao serviço/container; apenas caminho e mkdir/gravação confirmados no código |

## Instalação e homologação no ambiente real

1. Publicar a versão do frontend/API com o processo já usado no EasyPanel. Manter `JAGUAR_UPLOAD_DIR=/data/jaguar/uploads` e montar volume persistente em `/data/jaguar`, com escrita pelo usuário do processo. O ZIP não permite confirmar a configuração efetivamente ativa.
2. No serviço, executar `node scripts/verify-photo-volume.mjs --write`; após um redeploy real, executar `node scripts/verify-photo-volume.mjs --check`. Não repetir `--write` entre essas etapas. O script registra mountinfo sob `/data` quando disponível e confere um marcador, sem apagar fotos.
3. Extrair o mobile em nova pasta, executar `npm install` e `npx expo start -c`. Encerrar Metro anterior e usar o novo QR Code. Para APK, gerar novo build por causa da dependência nativa de manipulação.
4. No S24+, abrir Novo produto; fotografar pela traseira e confirmar que não há crop. Conferir preview, Trocar foto, Remover foto, galeria e cancelamento. Salvar e observar as duas fases.
5. Conferir um único produto e a mesma imagem no Estoque mobile e no web. Voltar à aba Estoque web para disparar revalidação silenciosa.
6. Em homologação, interromper somente o upload após confirmar cadastro; conferir mensagem e reenviar a foto. O productId deve permanecer igual e não pode haver novo cadastro.
7. Repetir com JPEG real do S24+, verificar resposta HTTP e arquivo em `/data/jaguar/uploads/products/`; repetir a consulta da mesma URL após redeploy.

Não declarar esses passos físicos aprovados até executá-los. Os dois ZIPs incluem esta documentação; os relatórios das versões anteriores são históricos e não substituem estes resultados.
