# EasyPanel — Jaguar Radiadores V0.2

Use Nixpacks com estas variáveis:

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
```

A porta interna/target do serviço deve ser `8003`.

O arquivo `nixpacks.toml` define:

```toml
[phases.install]
cmds = ["bun install"]

[phases.build]
cmds = ["bun run build"]

[start]
cmd = "node .output/server/index.mjs"
```

Se o EasyPanel continuar utilizando artefatos de um build anterior, execute um novo deploy limpando cache. O log esperado deve exibir `bun install`, depois `bun run build`, e por fim `node .output/server/index.mjs`.
