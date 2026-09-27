# Jaguar Frontend V1.8.6 — miniatura integral + recuperação de produto

Correções desta revisão:

- miniatura do estoque ampliada e forçada para `object-fit: contain`, sem corte;
- clique na miniatura abre a foto original em nova aba;
- modal de edição mostra uma prévia integral da foto e link para abrir o original;
- `product-create` ganhou recuperação no proxy mobile: após falha/5xx, procura o SKU exato e só confirma recuperação quando código, descrição e marca batem;
- a recuperação pode ocorrer tanto em erro HTTP 5xx quanto em falha de transporte, evitando uma segunda criação do mesmo produto.

Validações locais:

- teste do upload/leitura de foto: aprovado;
- validações Jaguar/API real: aprovadas;
- teste específico de recuperação do `product-create`: aprovado;
- transpile sintático dos arquivos alterados: aprovado.
