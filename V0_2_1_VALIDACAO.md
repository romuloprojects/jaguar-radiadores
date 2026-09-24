# Jaguar Radiadores Frontend V0.2.1 — correção visual / cache / Vite

## Diagnóstico
O deploy V0.2 estava exibindo o JSX novo com o CSS anterior. O arquivo `src/routes/__root.tsx` ainda usava o identificador de stylesheet `jaguar-ui=0.1.0` e o metadado `0.1.0-mock`. Isso explica o comportamento observado no login: o lado direito permanecia estilizado por classes antigas, enquanto as novas classes do painel esquerdo apareciam praticamente sem estilo.

## Correções aplicadas
- stylesheet principal renomeado de `src/styles.css` para `src/jaguar-v021.css` para gerar nova identidade de asset;
- cache-buster alterado para `jaguar-ui=0.2.1`;
- metadado de UI alterado para `0.2.1-visual-fix`;
- Vite configurado explicitamente para `jaguar-radiadores.facilities-ai.com.br`;
- Vite dev/preview configurado em `0.0.0.0:8003`;
- mantida a direção visual V0.2 homologada: header horizontal, dashboard financeiro, vermelho/verde/grafite e fotos reais somente em Estoque.

## Validações executadas
- `node scripts/validate-jaguar.mjs`: OK;
- 85 fontes verificadas sem referências ANCAR;
- 11 arquivos-chave verificados;
- CSS com 401 chaves de abertura e 401 de fechamento;
- seletores visuais críticos presentes (`jaguar-login__brand-panel`, `jaguar-header`, `finance-chart-card`, `inventory-photo`).

## EasyPanel
Variáveis recomendadas:

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
```

Após publicar esta versão, recomenda-se um redeploy limpo/sem cache e uma atualização forçada do navegador na primeira abertura.
