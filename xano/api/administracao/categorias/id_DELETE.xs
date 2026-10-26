// Exclui uma categoria
query "categorias/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
  }

  stack {
    db.get categorias {field_name = "id", field_value = $input.id} as $categoria
    conditional {
      if ($categoria == null) {throw {name: "NotFoundError", value: "Categoria não encontrada"}}
    }
    db.del categorias {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = {data: {deleted: true, id: $input.id}, error: null}
  guid = "xDH3uQi39rdJL4V3i9UabnuJoPw"
}
