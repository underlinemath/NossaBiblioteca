# Spec Delta

## Purpose

Define the REST APIs needed to manage the library catalog, readers, reservations,
loans and returns while preserving validation, authorization and availability rules.

## ADDED Requirements

### Requirement: CRUD de recursos administrativos
O sistema SHALL expose GET, POST, PATCH and DELETE endpoints for categories,
books, copies and readers, with request validation and JSON responses.

#### Scenario: Resource creation
- **WHEN** a librarian sends a valid POST request for a category, book, copy or reader
- **THEN** the API SHALL create the record and return HTTP 201 with its identifier and data

#### Scenario: Invalid resource request
- **WHEN** a request omits a required field or violates a unique constraint
- **THEN** the API SHALL return HTTP 400 with a structured error and SHALL NOT persist data

### Requirement: Catalog queries
The system SHALL expose public read endpoints for books, categories, copies and
availability, supporting search by title, author, ISBN or category.

#### Scenario: Search catalog
- **WHEN** a client sends GET with optional search and category parameters
- **THEN** the API SHALL return active books with availability information and pagination

#### Scenario: Book not found
- **WHEN** a client requests an inactive or unknown book identifier
- **THEN** the API SHALL return HTTP 404 with a structured error

### Requirement: Reservations
The system SHALL allow an authenticated reader to create, list, update status and
cancel reservations for books or copies according to their availability.

#### Scenario: Create reservation
- **WHEN** an eligible reader reserves an available item
- **THEN** the API SHALL create a pending reservation associated with that reader

#### Scenario: Reservation conflict
- **WHEN** a reader reserves an unavailable item or duplicates an active reservation
- **THEN** the API SHALL return HTTP 409 and SHALL NOT create another reservation

### Requirement: Loans and returns
The system SHALL expose endpoints to create and list loans, list loan items and
register individual returns.

#### Scenario: Create loan
- **WHEN** a librarian registers a loan with at least one available copy and a reader
- **THEN** the API SHALL create the loan and items, set copies unavailable and return due dates

#### Scenario: Concurrent loan
- **WHEN** a copy is already unavailable at loan creation
- **THEN** the API SHALL return HTTP 409 and SHALL NOT create an active loan for that copy

#### Scenario: Return item
- **WHEN** a librarian registers the return of an active loan item
- **THEN** the API SHALL set the effective return date, mark the item returned and make the copy available

### Requirement: Authorization
The system SHALL enforce authentication and role authorization in the backend.
Administrative mutations and returns SHALL be restricted to librarians.

#### Scenario: Unauthorized mutation
- **WHEN** an unauthenticated reader invokes an administrative mutation
- **THEN** the API SHALL return HTTP 401 or 403 and SHALL NOT change persisted data
