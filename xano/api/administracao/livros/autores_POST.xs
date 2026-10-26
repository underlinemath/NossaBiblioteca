// Associa um autor existente a um livro
query "livros/{id}/autores" verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
    int autor_id
  }

  stack {
    db.get livros {field_name = "id", field_value = $input.id} as $livro
    db.get autores {field_name = "id", field_value = $input.autor_id} as $autor
    conditional {
      if ($livro == null || $livro.ativo != true) {throw {name: "NotFoundError", value: "Livro não encontrado"}}
      if ($autor == null) {throw {name: "NotFoundError", value: "Autor não encontrado"}}
    }
    db.query livros_autores {
      where = $db.livros_autores.livro_id == $input.id && $db.livros_autores.autor_id == $input.autor_id
      return = {type: "exists"}
    } as $duplicada
    conditional {
      if ($duplicada) {throw {name: "ConflictError", value: "Autor já associado ao livro"}}
    }
    db.add livros_autores {
      data = {livro_id: $input.id, autor_id: $input.autor_id}
    } as $associacao
  }

  response = {data: $associacao, error: null}
}
