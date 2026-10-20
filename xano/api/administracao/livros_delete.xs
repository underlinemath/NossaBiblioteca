query "livros/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Inativa um livro"

  input {
    int id
  }

  stack {
    db.edit "livros" {
      field_name = "id"
      field_value = $input.id
      data = { ativo: false, updated_at: now }
    } as $livro
  }

  response = $livro
}
