query "livros" verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Cadastra um livro"

  input {
    int categoria_id
    text titulo filters=trim
    text autor filters=trim
    text isbn filters=trim
    text descricao?
  }

  stack {
    db.add "livros" {
      data = {
        categoria_id: $input.categoria_id,
        titulo: $input.titulo,
        autor: $input.autor,
        isbn: $input.isbn,
        descricao: $input.descricao,
        ativo: true
      }
    } as $livro
  }

  response = $livro
}
