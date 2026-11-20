// Lista associações entre livros e autores
query livros_autores verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id? filters=min:1
    int autor_id? filters=min:1
    int page?=1 filters=min:1
  }

  stack {
    db.query livros_autores {
      where = $db.livros_autores.livro_id ==? $input.livro_id && $db.livros_autores.autor_id ==? $input.autor_id
      sort = {id: "asc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: 50, totals: true}
      }
    } as $associacoes
  }

  response = $associacoes
}