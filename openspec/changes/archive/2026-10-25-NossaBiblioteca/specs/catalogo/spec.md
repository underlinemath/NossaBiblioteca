# Spec Delta: Catálogo

## Purpose

Definir como a biblioteca cadastra e consulta livros, categorias e exemplares, mantendo os dados organizados e permitindo verificar a disponibilidade do acervo.

## ADDED Requirements

### Requirement: Cadastro de livros
O sistema MUST permitir que bibliotecários cadastrem livros com seus dados obrigatórios.

#### Scenario: Cadastro válido
- **WHEN** um bibliotecário informa todos os dados obrigatórios de um livro
- **THEN** o sistema registra o livro no catálogo

#### Scenario: Cadastro incompleto
- **WHEN** um bibliotecário tenta cadastrar um livro sem um dado obrigatório
- **THEN** o sistema rejeita o cadastro e informa que há dados faltando

### Requirement: Consulta de livros
O sistema MUST permitir consultar os livros cadastrados.

#### Scenario: Livro existente
- **WHEN** uma pessoa consulta um livro cadastrado
- **THEN** o sistema apresenta os dados disponíveis desse livro

### Requirement: Cadastro de exemplares
O sistema MUST permitir que bibliotecários registrem exemplares associados a livros cadastrados.

#### Scenario: Exemplar associado
- **WHEN** um bibliotecário registra um exemplar de um livro existente
- **THEN** o sistema salva o exemplar associado ao livro correto

### Requirement: Consulta de disponibilidade
O sistema MUST permitir consultar se existem exemplares disponíveis de um livro.

#### Scenario: Existe exemplar disponível
- **WHEN** uma pessoa consulta a disponibilidade de um livro com exemplar disponível
- **THEN** o sistema informa que há exemplar disponível