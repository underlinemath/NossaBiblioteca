// Remove uma associação entre livro e autor
query "livros_autores/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id filters=min:1
  }

  stack {
    db.get livros_autores {
      field_name = "id"
      field_value = $input.id
    } as $associacao_existente
  
    precondition ($associacao_existente != null) {
      error_type = "notfound"
      error = "Associação não encontrada"
    }
  
    db.del livros_autores {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = {deleted: true, id: $input.id}
}