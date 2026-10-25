query "exemplares/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Exclui os dados de um exemplar"

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
  guid = "DvbpxEcHQKjac7BTGc8B0kRz0AI"
}
