// Inativa um livro
query "livros/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
  }

  stack {
    db.edit livros {
      field_name = "id"
      field_value = $input.id
      data = {ativo: false, updated_at: now}
    } as $livro
  }

  response = {data: $livro, error: null}
  guid = "D9Y1OGB5FSbiwUkBnv5RTfXDVBI"
}
