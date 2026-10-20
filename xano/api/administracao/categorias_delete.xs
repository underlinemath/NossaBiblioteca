query "categorias/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Exclui uma categoria"

  input {
    int id
  }

  stack {
    db.del "categorias" {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = { deleted: true, id: $input.id }
}
