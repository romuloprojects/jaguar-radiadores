# EasyPanel / Nixpacks

Este projeto é TanStack Start com saída SSR/Nitro. Ele não deve ser executado pelo Caddy como SPA estática.

## Variáveis recomendadas

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=latest
PORT=8003
```

Não é necessário configurar `NIXPACKS_INSTALL_CMD`, `NIXPACKS_BUILD_CMD` ou `NIXPACKS_START_CMD`, pois `nixpacks.toml` já fixa:

- instalação: `bun install --frozen-lockfile`
- build: `bun run build`
- start: `node .output/server/index.mjs`

O `package.json` também possui `start` e `packageManager`, e o `bun.lock` foi restaurado para manter a instalação reproduzível.
