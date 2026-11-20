// Consulta autores de um livro ativo do catálogo
query "livros/{id}/autores" verb=GET {
  api_group = "catalogo"

  input {
    int id
  }

  stack {
    db.query livros_autores {
      join = {
        autores: {
          table: "autores"
          where: $db.livros_autores.autor_id == $db.autores.id
        }
      }
    
      where = $db.livros_autores.livro_id == $input.id
      eval = {
        autor_id  : $db.autores.id
        nome_autor: $db.autores.nome_autor
      }
    
      return = {type: "list"}
    } as $autores
  }

  response = $autores
}