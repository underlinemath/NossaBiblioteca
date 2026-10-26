// Atualiza uma categoria
query "categorias/{id}" verb=PATCH {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
    text nome filters=trim
  }

  stack {
    db.get categorias {field_name = "id", field_value = $input.id} as $existente
    conditional {
      if ($existente == null) {throw {name: "NotFoundError", value: "Categoria não encontrada"}}
    }
    db.edit categorias {
      field_name = "id"
      field_value = $input.id
      data = {nome: $input.nome, updated_at: now}
    } as $categoria
  }

  response = {data: $categoria, error: null}
  guid = "daDtPjBNLnqxiA37kHoXmSGbPBQ"
}
