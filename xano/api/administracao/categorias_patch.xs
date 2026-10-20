query "categorias/{id}" verb=PATCH {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Atualiza uma categoria"

  input {
    int id
    text nome filters=trim
  }

  stack {
    db.edit "categorias" {
      field_name = "id"
      field_value = $input.id
      data = { nome: $input.nome, updated_at: now }
    } as $categoria
  }

  response = $categoria
}
