// Cadastra um livro
query livros verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int categoria_id
    text titulo filters=trim
    text autor filters=trim
    int[] autor_ids?
    text isbn filters=trim
    text descricao?
  }

  stack {
    db.get categorias {field_name = "id", field_value = $input.categoria_id} as $categoria
    conditional {
      if ($categoria == null) {throw {name: "ValidationError", value: "Categoria não encontrada"}}
    }
    db.get livros {field_name = "isbn", field_value = $input.isbn} as $livro_existente
    conditional {
      if ($livro_existente != null) {throw {name: "ConflictError", value: "Já existe um livro com este ISBN"}}
    }
    foreach ($input.autor_ids) {
      each as $autor_id {
        db.get autores {field_name = "id", field_value = $autor_id} as $autor
        conditional {
          if ($autor == null) {throw {name: "ValidationError", value: "Autor não encontrado"}}
        }
      }
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

    foreach ($input.autor_ids) {
      each as $autor_id {
        db.add livros_autores {
          data = {livro_id: $livro.id, autor_id: $autor_id}
        } as $associacao
      }
    }
  }

  response = {data: $livro, error: null}
  guid = "YQnw93KDY0PNqjBP9oC9LC6h0xc"
}
