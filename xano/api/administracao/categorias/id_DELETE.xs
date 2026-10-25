// Exclui uma categoria
query "categorias/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
  }

  stack {
    db.del categorias {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = {deleted: true, id: $input.id}
  guid = "xDH3uQi39rdJL4V3i9UabnuJoPw"
}