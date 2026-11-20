// Desassocia um autor de um livro
query "livros/{livro_id}/autores/{autor_id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id filters=min:1
    int autor_id filters=min:1
  }

  stack {
    db.query livros_autores {
      where = $db.livros_autores.livro_id == $input.livro_id && $db.livros_autores.autor_id == $input.autor_id
      return = {type: "exists"}
    } as $existe
  
    precondition ($existe) {
      error_type = "notfound"
      error = "Associação entre livro e autor não encontrada"
    }
  
    db.bulk.delete livros_autores {
      where = $db.livros_autores.livro_id == $input.livro_id && $db.livros_autores.autor_id == $input.autor_id
    } as $removidos
  }

  response = {
    deleted : true
    livro_id: $input.livro_id
    autor_id: $input.autor_id
    count   : $removidos
  }
}