// Query all bibliotecarios records
query bibliotecarios verb=GET {
  api_group = "auth"
  auth = "bibliotecarios"

  input {
    int page?=1 filters=min:1
  }

  stack {
    db.query bibliotecarios {
      sort = {nome: "asc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: 50, totals: true}
      }
    } as $model
  }

  response = $model
}