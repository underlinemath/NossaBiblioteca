// Cadastra um livro
query livros verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int categoria_id
    text titulo filters=trim
    text autor filters=trim
    text isbn filters=trim
    text descricao?
  }

  stack {
    db.get categorias {field_name = "id", field_value = $input.categoria_id} as $categoria
    conditional {
      if ($categoria == null) {throw {name: "ValidationError", value: "Categoria não encontrada"}}
    }
    db.add livros {
      data = {
        categoria_id: $input.categoria_id
        titulo      : $input.titulo
        autor       : $input.autor
        isbn        : $input.isbn
        descricao   : $input.descricao
        ativo       : true
      }
    } as $livro
  }

  response = {data: $livro, error: null}
  guid = "YQnw93KDY0PNqjBP9oC9LC6h0xc"
}
