// Lista leitores
query leitores verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    text busca?
    int page?=1
  }

  stack {
    db.query leitores {
      where = $input.busca == null || $db.leitores.nome includes $input.busca || $db.leitores.email includes $input.busca
      sort = {nome: "asc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: 20, totals: true}
      }
    } as $leitores
  }

  response = $leitores
  guid = "UANlrqcAvBqp-lqXIWizyc2e7JU"
}