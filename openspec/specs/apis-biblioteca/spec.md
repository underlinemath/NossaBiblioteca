# apis-biblioteca Specification

## Purpose

Define the REST APIs needed to manage the library catalog, readers, reservations, loans and returns while preserving validation, authorization and availability rules.

## Requirements

### Requirement: CRUD de recursos administrativos
O sistema SHALL expose GET, POST, PATCH and DELETE endpoints for categories, books, copies and readers, with backend validation, authorization, structured JSON errors and explicit success responses. A validação da change SHALL confirmar a persistência de cada escrita na tabela correspondente.

#### Scenario: Invalid resource request
- **WHEN** a request omits a required field, references a missing record, or violates a unique constraint
- **THEN** the API SHALL return HTTP 400 with `{error:{code,message}}` and SHALL NOT persist data

#### Scenario: Resource creation
- **WHEN** a librarian sends a valid POST request for a category, book, copy or reader
- **THEN** the API SHALL create the record and return its identifier and data

#### Scenario: Persistence is traceable
- **WHEN** the validation creates or updates an administrative resource
- **THEN** it SHALL find the resulting record in the expected Xano table and verify its foreign-key values

### Requirement: Catalog queries
The system SHALL expose public read endpoints for active books with pagination, search by title, author, ISBN or category, normalized author data, and availability information. The validation SHALL compare the response with the persisted fixture relationships.

#### Scenario: Book not found
- **WHEN** a client requests an inactive or unknown book identifier
- **THEN** the API SHALL return HTTP 404 with a structured error

#### Scenario: Search catalog
- **WHEN** a client sends GET with optional search and category parameters
- **THEN** the API SHALL return active books with availability information and pagination

#### Scenario: Fixture relationship is reflected
- **WHEN** a loaded book is queried by the catalog
- **THEN** the response SHALL include its category, normalized authors and availability derived from its exemplars

### Requirement: Reservations
The system SHALL allow an authenticated reader to create, list and cancel reservations, rejecting invalid targets and duplicate active reservations with structured conflicts.

#### Scenario: Reservation conflict
- **WHEN** a reader submits an unavailable target or duplicates an active reservation
- **THEN** the API SHALL return HTTP 409 and SHALL NOT create another reservation

#### Scenario: Create reservation
- **WHEN** an eligible reader reserves an available item
- **THEN** the API SHALL create a pending reservation associated with that reader

### Requirement: Loans and returns
The system SHALL expose endpoints to create and list loans and register individual returns using backend validation and atomic persistence for copy availability.

#### Scenario: Concurrent loan
- **WHEN** a copy is already unavailable at loan creation
- **THEN** the API SHALL return HTTP 409 and SHALL NOT create an active loan for that copy

#### Scenario: Create loan
- **WHEN** a librarian registers a loan with an available copy and reader
- **THEN** the API SHALL create the loan and item and set the copy unavailable

#### Scenario: Return item
- **WHEN** a librarian registers the return of an active loan item
- **THEN** the API SHALL set the effective return date and make the copy available

### Requirement: Authorization
The system SHALL enforce authentication and role authorization in the backend. Administrative mutations and returns SHALL be restricted to librarians.

#### Scenario: Unauthorized mutation
- **WHEN** an unauthenticated reader invokes an administrative mutation
- **THEN** the API SHALL return HTTP 401 or 403 and SHALL NOT change persisted data

### Requirement: Falha de autenticação administrativa segura e diagnosticável
A API de login de bibliotecário SHALL aceitar o contrato documentado e rejeitar credenciais inválidas com resposta estruturada e mensagem pública genérica, sem revelar se o e-mail existe, o status da conta ou detalhes do hash.

#### Scenario: Credenciais administrativas válidas
- **WHEN** uma conta bibliotecária ativa envia e-mail e senha válidos no contrato documentado
- **THEN** a API SHALL responder sucesso com token e identidade pública do bibliotecário, sem incluir senha ou hash

#### Scenario: Credenciais ou conta inválidas
- **WHEN** e-mail, senha ou status da conta não permite autenticação
- **THEN** a API SHALL responder erro de autenticação estruturado e genérico sem criar token nem revelar qual condição falhou

### Requirement: Erros de API preservam semântica e formato
As APIs da biblioteca SHALL converter erros esperados em respostas JSON estruturadas com código e mensagem, mantendo status HTTP apropriado e sem converter falhas em respostas de sucesso.

#### Scenario: Entrada inválida
- **WHEN** uma requisição viola validação de campo, relacionamento ou unicidade
- **THEN** a API SHALL retornar erro estruturado de validação e não persistir alterações parciais

#### Scenario: Conflito de integridade ou disponibilidade
- **WHEN** a operação conflita com um registro existente ou exemplar indisponível
- **THEN** a API SHALL retornar erro estruturado de conflito e preservar os registros confirmados antes da solicitação

#### Scenario: Falha interna inesperada
- **WHEN** uma execução falha por condição interna não prevista
- **THEN** a API SHALL retornar erro 5xx estruturado sem expor stack trace, segredos ou dados sensíveis
