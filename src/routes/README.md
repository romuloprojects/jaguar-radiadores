# Rotas Jaguar Radiadores

O frontend de homologação usa rotas TanStack file-based para Visão Geral, Clientes, Orçamentos, Estoque, Financeiro, Fornecedores, Relatórios e Configurações. As rotas com sufixo `_` antes do ponto (`clientes_.$clienteId`, `orcamentos_.$orcamentoId`, `orcamentos_.novo`) permanecem top-level no layout para que as telas de detalhe não sejam renderizadas dentro das páginas de listagem.
