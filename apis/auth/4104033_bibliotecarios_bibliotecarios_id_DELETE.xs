// Delete bibliotecarios record
query "bibliotecarios/{bibliotecarios_id}" verb=DELETE {
  api_group = "auth"

  input {
    int bibliotecarios_id? filters=min:1
  }

  stack {
    db.del bibliotecarios {
      field_name = "id"
      field_value = $input.bibliotecarios_id
    }
  }

  response = null
}