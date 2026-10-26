// Lista autores para uso no catálogo
query autores verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    text busca?
    int page?=1
  }

  stack {
    db.query autores {
      where = $input.busca == null || $db.autores.nome includes $input.busca
      sort = {nome: "asc"}
      return = {type: "list", paging: {page: $input.page, per_page: 50, totals: true}}
    } as $autores
  }

  response = {data: $autores, error: null}
}
