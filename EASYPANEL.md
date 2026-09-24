# EasyPanel — Jaguar Radiadores API Real V1

## Variáveis

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
JAGUAR_N8N_WEBHOOK_BASE_URL=https://n8n.facilities-ai.com.br/webhook
```

Porta interna/target do serviço: `8003`.

## Nixpacks

O projeto usa:

```text
install: bun install
build: bun run build
start: node .output/server/index.mjs
```

## Domínio

```text
jaguar-radiadores.facilities-ai.com.br
```

O Vite está liberado explicitamente para esse host.

## Importante

`JAGUAR_N8N_WEBHOOK_BASE_URL` é variável **server-side** e não deve ser publicada como `VITE_*`. O navegador chama apenas `/api/jaguar/*`; o servidor TanStack adiciona o Bearer token armazenado em cookie HttpOnly ao chamar o n8n.

Após publicar uma revisão, prefira redeploy limpo se houver artefatos de build anteriores.
