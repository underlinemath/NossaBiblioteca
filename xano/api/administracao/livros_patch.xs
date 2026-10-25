query "livros/{id}" verb=PATCH {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Atualiza um livro"

  input {
    int id
    int categoria_id
    text titulo filters=trim
    text autor filters=trim
    text isbn filters=trim
    text descricao?
    bool ativo
  }

  stack {
    db.edit "livros" {
      field_name = "id"
      field_value = $input.id
      data = {
        categoria_id: $input.categoria_id,
        titulo: $input.titulo,
        autor: $input.autor,
        isbn: $input.isbn,
        descricao: $input.descricao,
        ativo: $input.ativo,
        updated_at: now
      }
    } as $livro
  }

  response = $livro
  guid = "lgnTxyCQ1XsOUkaiPZOF6M4iHns"
}
