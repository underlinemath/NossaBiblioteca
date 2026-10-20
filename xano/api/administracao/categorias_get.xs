query "categorias" verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Lista categorias"

  input { }

  stack {
    db.query "categorias" {
      sort = { nome: "asc" }
      return = { type: "list", paging: { page: 1, per_page: 100, totals: true } }
    } as $categorias
  }

  response = $categorias
}
