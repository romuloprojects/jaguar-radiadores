# Jaguar Frontend V1.8.4 — saudação do usuário

- Header passa a exibir `Olá, <primeiro nome>!` usando o `displayName` da sessão.
- Compatibilidade visual: enquanto o usuário legado `admin` ainda estiver salvo como `Administrador`/`Administrador Jaguar`, o header mostra `Eduardo`.
- O perfil continua exibido separadamente como `Administrador` ou `Operador`; esse texto é a permissão, não o nome.
- Para persistir o nome real no PostgreSQL, usar Configurações > Usuários e permissões > Editar > Nome = Eduardo.
- Nenhuma rota/API/backend foi alterada nesta revisão.
