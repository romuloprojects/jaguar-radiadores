# EasyPanel / Nixpacks — Jaguar Radiadores v0.1.2

## Variáveis recomendadas

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
```

## Comandos esperados no log

```text
install │ bun install
build   │ bun run build
start   │ node .output/server/index.mjs
```

## Por que não usamos `--frozen-lockfile`

O `bun.lock` veio da base ANCAR e o manifesto foi adaptado para Jaguar. No EasyPanel,
Bun 1.3.0 detectou que precisaria atualizar o lockfile e abortou porque ele estava
congelado. Nesta fase de homologação mockada permitimos ao Bun reconciliar o lockfile
durante o build.

Quando estabilizarmos as dependências, podemos regenerar e commitar um lockfile novo
com a mesma versão do Bun e voltar a usar `--frozen-lockfile`.

## Porta

O processo Nitro/TanStack Start deve escutar `PORT=8003`. Configure a porta interna/
target do serviço no EasyPanel também como 8003.

## Observação sobre Caddy

O Nixpacks pode ainda exibir uma fase `caddy` por detectar Vite. Isso não é o processo
que inicia a aplicação: o comando de start explícito continua sendo o servidor Node
em `.output/server/index.mjs`.
