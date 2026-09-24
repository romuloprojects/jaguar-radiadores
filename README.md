# Jaguar Radiadores — Frontend API Real V1.1

Frontend homologado da Jaguar Radiadores conectado ao backend real n8n + PostgreSQL.

## Arquitetura

```text
Browser
  -> TanStack Start (mesmo domínio Jaguar)
  -> /api/jaguar/* (proxy server-side)
  -> n8n /webhook/jaguar/*
  -> PostgreSQL schema jaguar
```

O token de sessão do n8n **não fica disponível para o JavaScript do navegador**. O login recebe o token no server/proxy e o persiste em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção.

## Backend esperado

- n8n 2.36.8
- PostgreSQL via credencial n8n `jaguar-db`
- workflows Jaguar V1 publicados/ativos: `10`, `20`, `30`, `40`, `50`, `60`, `70` e `90`
- `91_JAGUAR_ERROR_LOGGER` configurado como Error Workflow
- workflows de setup/validação `00`, `01`, `02`, `03` e `89` executados conforme documentação do backend e mantidos inativos

## Integrações reais por tela

- Login / troca de senha: autenticação PostgreSQL via workflow 10
- Visão Geral: dashboard, faturamento anual e fluxo projetado
- Clientes: listagem, busca, cadastro, edição, veículos/equipamentos e histórico
- Orçamentos: listagem, criação, edição, conclusão, cancelamento, parcelamento na confiança, PIX e impressão/Salvar como PDF no layout A4 homologado
- Estoque: produtos, fotos, saldos derivados, movimentações, compras, confirmação e cancelamento
- Fornecedores: cadastro, edição, produtos fornecidos, histórico de compras e contas em aberto
- Financeiro: contas a receber/pagar agrupadas por compromisso, parcelas marcáveis como pagas, pagamentos parciais/integrais, prazo combinado e vencidos automáticos
- Relatórios: abas de faturamento, custos, fluxo de caixa, receber, pagar e estoque, com CSV e impressão/Salvar como PDF
- Configurações: empresa, PIX, regras operacionais, serviços, usuários e healthcheck

## Variável obrigatória no servidor

```text
JAGUAR_N8N_WEBHOOK_BASE_URL=https://n8n.facilities-ai.com.br/webhook
```

Não use prefixo `VITE_` nessa variável; ela deve permanecer somente no runtime server-side.

## Execução

```bash
bun install
bun run validate:jaguar
bun run build
bun run dev
```

## EasyPanel / Nixpacks

```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
JAGUAR_N8N_WEBHOOK_BASE_URL=https://n8n.facilities-ai.com.br/webhook
```

O start de produção é:

```text
node .output/server/index.mjs
```

## Validação desta entrega

Foram executados na geração do pacote:

- validação estrutural Jaguar;
- validação da integração API real e cobertura das telas;
- verificação de ausência de imports dos mocks nas telas/serviços;
- transpile sintático de todos os TS/TSX;
- validação de imports locais;
- verificação de ausência de referências ANCAR no código fonte.

O build completo com instalação de dependências não pôde ser executado no ambiente de geração porque o acesso ao registry npm estava indisponível (`EAI_AGAIN`). O EasyPanel deve executar `bun install` + `bun run build` no deploy e é o teste de build/runtime definitivo.


## Novidades V1.1

- O PIX permanece configurável em **Configurações**; nenhuma chave está hardcoded.
- O orçamento abre um documento A4 isolado para impressão ou **Salvar como PDF**.
- O QR Code é gerado localmente no frontend a partir do Pix Copia e Cola fornecido pelo PostgreSQL.
- Contas a receber representam inclusive serviços feitos **na confiança** para clientes.
- Contas a pagar aceitam fornecedor opcional e também despesas como aluguel, energia, frete, contador e serviços terceirizados.
- Parcelamentos suportam dia fixo mensal, intervalo em dias e datas personalizadas.

### Complemento V1.1 — primeiro teste operacional

- Serviços podem ser lançados livremente no orçamento sem cadastro prévio no catálogo (requer o patch backend V1.1 fornecido junto da entrega).
- O documento **Orçamento / Ordem de Serviço** segue a baseline A4 homologada e pode ser impresso ou salvo como PDF.
- PIX fica opcional: sem chave cadastrada o documento continua funcionando; após configurar a chave em Configurações, o sistema exibe QR Code + Pix Copia e Cola automaticamente.
- Contas a Receber e Contas a Pagar exibem parcelas individualmente, permitem baixas parciais e destacam atraso automaticamente.
