# Jaguar Frontend V1.8.1 — Proxy mobile resiliente

- Mantém todas as funções V1.8.
- Em falha de conexão após POST `quote-create`, o proxy consulta as OS recentes e confirma a criação já persistida antes de devolver 502.
- Evita informar falha ao aplicativo quando o PostgreSQL/n8n já concluiu a OS.
- Não repete o POST automaticamente, evitando duplicidade.
- Proxy continua server-side; app não acessa n8n diretamente.
