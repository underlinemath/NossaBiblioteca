# Spec Delta

## ADDED Requirements

### Requirement: Consulta administrativa de empréstimos
O sistema SHALL fornecer aos bibliotecários uma consulta autenticada de empréstimos com os respectivos itens, leitores e exemplares para suportar o painel administrativo.

#### Scenario: Bibliotecário consulta empréstimos
- **WHEN** um bibliotecário autenticado solicita a lista de empréstimos
- **THEN** a API SHALL retornar registros paginados com identificadores e estados dos itens relacionados

#### Scenario: Leitor não autorizado consulta lista administrativa
- **WHEN** uma requisição sem token de bibliotecário acessa a consulta administrativa
- **THEN** a API SHALL retornar 401 ou 403 sem expor dados de outros leitores
