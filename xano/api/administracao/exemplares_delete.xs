query "exemplares/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Inativa um exemplar"

  input {
    int id
  }

  stack {
    db.edit "exemplares" {
      field_name = "id"
      field_value = $input.id
      data = { disponivel: false, situacao: "inativo", updated_at: now }
    } as $exemplar
  }

  response = $exemplar
}
