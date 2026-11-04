# Spec Delta

## MODIFIED Requirements

### Requirement: Cadastro de livros
O sistema MUST permitir que bibliotecários cadastrem e atualizem livros com categoria válida e associações de autores válidas, e a validação MUST confirmar as associações persistidas.

#### Scenario: Cadastro válido
- **WHEN** um bibliotecário informa categoria e dados válidos para um livro
- **THEN** o sistema registra o livro no catálogo

#### Scenario: Cadastro incompleto
- **WHEN** um bibliotecário tenta cadastrar um livro sem um dado obrigatório
- **THEN** o sistema rejeita o cadastro e informa que há dados faltando

#### Scenario: Autores persistidos
- **WHEN** um livro válido é cadastrado com autores
- **THEN** cada associação válida aparece uma única vez em `livros_autores`

### Requirement: Cadastro de exemplares
O sistema MUST permitir que bibliotecários registrem exemplares associados a livros cadastrados, e a validação MUST confirmar que cada exemplar foi salvo em `exemplares` com o `livro_id` correto.

#### Scenario: Exemplar associado
- **WHEN** um bibliotecário registra um exemplar de um livro existente
- **THEN** o sistema salva o exemplar associado ao livro correto

#### Scenario: Exemplar não duplicado
- **WHEN** a carga é repetida para o mesmo código de exemplar
- **THEN** o sistema não cria uma segunda unidade para o mesmo código
