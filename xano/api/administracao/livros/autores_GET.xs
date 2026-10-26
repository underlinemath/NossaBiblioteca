// Lista os autores associados a um livro
query "livros/{id}/autores" verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {int id}

  stack {
    db.query livros_autores {
      where = $db.livros_autores.livro_id == $input.id
      return = {type: "list", paging: {page: 1, per_page: 100, totals: true}}
    } as $associacoes
  }

  response = {data: $associacoes, error: null}
}
