# Jaguar Frontend V1.8.12 — dados oficiais protegidos

## Objetivo
Evitar que dados essenciais da empresa e do PIX desapareçam por edição acidental na tela de Configurações.

## Campos protegidos
- Razão social / nome: Jaguar Radiadores
- Nome fantasia: Jaguar Radiadores
- CNPJ: 64.683.207/0001-90
- WhatsApp: (41) 99648-4298
- Endereço: PR 151 (Trevo)
- Bairro: Distrito Industrial
- Cidade: Jaguariaiva
- UF: PR
- Tipo de chave PIX: CNPJ
- Chave PIX: 64683207000190
- Nome do recebedor: Jaguar Radiadores
- Cidade do recebedor: Jaguariaiva

Os campos são somente leitura na interface e não são enviados pelo PATCH normal de Configurações.

## Campos complementares ainda editáveis
Inscrição estadual, telefone, e-mail, número, complemento, CEP e preferências operacionais.

## Proteção de backend
Aplicar o workflow/SQL V1.6 em conjunto. Ele grava os valores oficiais e altera `jaguar.api_settings_save` para preservar/restaurar os campos protegidos mesmo se um cliente antigo enviar valores vazios ou diferentes.
