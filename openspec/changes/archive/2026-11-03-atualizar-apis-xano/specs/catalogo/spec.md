# Spec Delta: Catálogo

## MODIFIED Requirements

### Requirement: Consulta de livros
O sistema MUST permitir consultar livros ativos com paginação, disponibilidade dos exemplares e autores normalizados, mantendo o campo textual legado durante a transição.

#### Scenario: Livro existente
- **WHEN** uma pessoa consulta um livro ativo cadastrado
- **THEN** o sistema apresenta os dados, autores e disponibilidade dos exemplares

### Requirement: Cadastro de livros
O sistema MUST permitir que bibliotecários cadastrem e atualizem livros com categoria válida e associações de autores válidas.

#### Scenario: Cadastro válido
- **WHEN** um bibliotecário informa categoria e dados válidos para um livro
- **THEN** o sistema registra o livro no catálogo

#### Scenario: Cadastro incompleto
- **WHEN** um bibliotecário tenta cadastrar um livro sem um dado obrigatório
- **THEN** o sistema rejeita o cadastro e informa que há dados faltando

