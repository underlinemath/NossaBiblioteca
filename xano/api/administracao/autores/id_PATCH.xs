// Atualiza um autor
query "autores/{id}" verb=PATCH {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
    text nome filters=trim
  }

  stack {
    db.get autores {field_name = "id", field_value = $input.id} as $autor
    conditional {
      if ($autor == null) {throw {name: "NotFoundError", value: "Autor não encontrado"}}
    }
    db.edit autores {
      field_name = "id"
      field_value = $input.id
      data = {nome: $input.nome, updated_at: now}
    } as $atualizado
  }

  response = {data: $atualizado, error: null}
}
