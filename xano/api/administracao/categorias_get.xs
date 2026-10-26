// Lista categorias
query categorias verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
  }

  stack {
    db.query categorias {
      sort = {nome: "asc"}
      return = {
        type  : "list"
        paging: {page: 1, per_page: 100, totals: true}
      }
    } as $categorias
  }

  response = {data: $categorias, error: null}
  guid = "MWBD2lgBxHpc7xKU9Ujj3AY8HK4"
}
