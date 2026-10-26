# Spec Delta: APIs da biblioteca

## MODIFIED Requirements

### Requirement: CRUD de recursos administrativos
O sistema SHALL expose GET, POST, PATCH and DELETE endpoints for categories, books, copies and readers, with backend validation, authorization, structured JSON errors and explicit success responses.

#### Scenario: Invalid resource request
- **WHEN** a request omits a required field, references a missing record, or violates a unique constraint
- **THEN** the API SHALL return HTTP 400 with `{error:{code,message}}` and SHALL NOT persist data

#### Scenario: Resource creation
- **WHEN** a librarian sends a valid POST request for a category, book, copy or reader
- **THEN** the API SHALL create the record and return its identifier and data

### Requirement: Catalog queries
The system SHALL expose public read endpoints for active books with pagination, search by title, author, ISBN or category, normalized author data, and availability information.

#### Scenario: Book not found
- **WHEN** a client requests an inactive or unknown book identifier
- **THEN** the API SHALL return HTTP 404 with a structured error

#### Scenario: Search catalog
- **WHEN** a client sends GET with optional search and category parameters
- **THEN** the API SHALL return active books with availability information and pagination

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

