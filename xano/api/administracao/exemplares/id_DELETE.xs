// Inativa um exemplar
query "exemplares/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
  }

  stack {
    db.edit exemplares {
      field_name = "id"
      field_value = $input.id
      data = {
        disponivel: false
        situacao  : "inativo"
        updated_at: now
      }
    } as $exemplar
  }

  response = {data: $exemplar, error: null}
  guid = "DvbpxEcHQKjac7BTGc8B0kRz0AI"
}
