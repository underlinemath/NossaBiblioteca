# Spec Delta: Autores do catálogo

## ADDED Requirements

### Requirement: Autores normalizados
O sistema SHALL persist authors independently from books and SHALL support associating one author with multiple books and one book with multiple authors through `livros_autores`.

#### Scenario: Create author association
- **WHEN** a librarian creates or updates a book with valid author identifiers
- **THEN** the backend SHALL validate each author and persist one unique association per book-author pair

#### Scenario: Invalid author association
- **WHEN** a book references an unknown author or repeats the same author
- **THEN** the API SHALL return a structured validation error and SHALL NOT persist a partial association

#### Scenario: Catalog response
- **WHEN** a client retrieves an active book
- **THEN** the response SHALL include normalized authors when available and SHALL preserve the legacy textual author field during migration

