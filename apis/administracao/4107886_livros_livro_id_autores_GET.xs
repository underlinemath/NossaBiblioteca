// Lista os autores de um livro
query "livros/{livro_id}/autores" verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id filters=min:1
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
  
    db.query livros_autores {
      join = {
        autores: {
          table: "autores"
          where: $db.livros_autores.autor_id == $db.autores.id
        }
      }
    
      where = $db.livros_autores.livro_id == $input.livro_id
      eval = {nome_autor: $db.autores.nome_autor}
      return = {type: "list"}
    } as $autores_do_livro
  }

  response = $autores_do_livro
}