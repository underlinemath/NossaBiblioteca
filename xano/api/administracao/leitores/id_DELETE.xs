// Inativa um leitor
query "leitores/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
  }

  stack {
    db.edit leitores {
      field_name = "id"
      field_value = $input.id
      data = {status: "inativo", updated_at: now}
    } as $leitor
  }

  response = {data: $leitor, error: null}
  guid = "KO9FCsJ9ojXbRBd9zufvSpcWA20"
}
