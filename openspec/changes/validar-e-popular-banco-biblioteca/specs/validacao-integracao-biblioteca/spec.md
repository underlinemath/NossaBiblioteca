# Spec Delta

## Purpose

Definir a validação reproduzível dos contratos e dos fluxos completos da
biblioteca, incluindo a carga coerente das entidades no Xano.

## ADDED Requirements

### Requirement: Suíte cobre todas as APIs documentadas
A validação SHALL executar cada método e rota documentados, verificando status, formato JSON, campos obrigatórios e erros estruturados.

#### Scenario: Rota documentada executada
- **WHEN** a suíte percorre uma rota do catálogo, administração, circulação ou autenticação
- **THEN** registra a requisição, a resposta e o resultado esperado sem omitir a rota

#### Scenario: Erro contratual
- **WHEN** uma entrada inválida ou não autorizada é enviada
- **THEN** confirma o status previsto, o objeto `error.code` e `error.message`, sem persistência indevida

### Requirement: Carga idempotente preserva relacionamentos
O sistema SHALL aceitar uma massa identificável de teste para todas as entidades e repetir sua carga sem duplicar registros ou quebrar vínculos.

#### Scenario: Carga completa
- **WHEN** a carga cria categorias, autores, livros, associações, exemplares, leitores, reservas e empréstimos
- **THEN** cada registro é persistido na tabela correspondente e as chaves estrangeiras apontam para registros existentes

#### Scenario: Reexecução da carga
- **WHEN** a mesma carga é executada novamente no mesmo ambiente isolado
- **THEN** os registros identificados pela massa são reutilizados ou atualizados, sem duplicação

### Requirement: Fluxos de circulação são verificados ponta a ponta
A validação SHALL verificar reserva, empréstimo, conflito por exemplar indisponível e devolução, incluindo o estado final do exemplar e do item.

#### Scenario: Empréstimo e devolução
- **WHEN** um exemplar disponível é emprestado e depois devolvido
- **THEN** são criados empréstimo e item, a disponibilidade muda para indisponível e retorna a disponível com a data efetiva

#### Scenario: Exemplar ocupado
- **WHEN** outro empréstimo tenta usar um exemplar com empréstimo ativo
- **THEN** a API retorna conflito e não cria novo empréstimo ou item ativo
