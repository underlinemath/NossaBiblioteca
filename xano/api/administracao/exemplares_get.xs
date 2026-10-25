// Lista exemplares por livro
query exemplares verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id?
    int page?=1
  }

  stack {
    db.query exemplares {
      where = $db.exemplares.livro_id ==? $input.livro_id
      sort = {codigo: "asc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: 50, totals: true}
      }
    } as $exemplares
  }

  response = $exemplares
  guid = "wdQhyMsuPGD93jVH7EsE7b8ecGQ"
}