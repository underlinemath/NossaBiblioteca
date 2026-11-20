# Spec Delta

## MODIFIED Requirements

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
