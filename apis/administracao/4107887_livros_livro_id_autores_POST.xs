// Associa um autor a um livro especificado pela rota
query "livros/{livro_id}/autores" verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id filters=min:1
    int autor_id filters=min:1
  }

  stack {
    db.get livros {
      field_name = "id"
      field_value = $input.livro_id
    } as $livro
  
    precondition ($livro != null) {
      error_type = "notfound"
      error = "Livro não encontrado"
    }
  
    db.get autores {
      field_name = "id"
      field_value = $input.autor_id
    } as $autor
  
    precondition ($autor != null) {
      error_type = "notfound"
      error = "Autor não encontrado"
    }
  
    db.query livros_autores {
      where = $db.livros_autores.livro_id == $input.livro_id && $db.livros_autores.autor_id == $input.autor_id
      return = {type: "exists"}
    } as $existe
  
    conditional {
      if ($existe) {
        throw {
          name = "ConflictError"
          value = "Associação entre livro e autor já existe"
        }
      }
    }
  
    db.add livros_autores {
      data = {livro_id: $input.livro_id, autor_id: $input.autor_id}
    } as $associacao
  }

  response = $associacao
}