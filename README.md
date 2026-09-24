# Jaguar Radiadores — Frontend Mock V0.1

Derivação técnica do frontend ANCAR v5.9.1 para homologação visual e funcional da Jaguar Radiadores.

## Estado deste pacote

Este pacote contempla os marcos 1 e 2 do projeto:

- shell Jaguar com navegação horizontal;
- identidade grafite, branco e vermelho;
- login responsivo;
- dashboard / Visão Geral;
- clientes e detalhe do cliente;
- orçamentos / atendimentos;
- wizard de novo orçamento em 5 etapas;
- estoque;
- financeiro com fluxo de caixa, receber e pagar;
- fornecedores;
- relatórios;
- configurações visuais;
- dados 100% mockados locais.

Nenhum endpoint n8n, banco PostgreSQL, PIX real ou geração real de PDF está conectado nesta versão.

## Acesso ao protótipo

Na tela de login, qualquer usuário e senha não vazios são aceitos. O formulário vem preenchido com:

- usuário: `admin`
- senha: `demo`

## Desenvolvimento

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

Validação estrutural do pacote Jaguar:

```bash
npm run validate:jaguar
```

## Rotas principais

- `/` — Visão Geral
- `/clientes`
- `/clientes/:clienteId`
- `/orcamentos`
- `/orcamentos/novo`
- `/orcamentos/:orcamentoId`
- `/estoque`
- `/financeiro`
- `/fornecedores`
- `/relatorios`
- `/configuracoes`

## Próxima fase

Após homologação do frontend, o Marco 3 conectará PostgreSQL + n8n, autenticação real, persistência, geração de PDF, PIX e regras transacionais.
