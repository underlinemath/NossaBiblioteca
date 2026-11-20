// Get bibliotecarios record
query "bibliotecarios/{bibliotecarios_id}" verb=GET {
  api_group = "auth"
  auth = "bibliotecarios"

  input {
    int bibliotecarios_id filters=min:1
  }

  stack {
    db.get bibliotecarios {
      field_name = "id"
      field_value = $input.bibliotecarios_id
    } as $model
  
    precondition ($model != null) {
      error_type = "notfound"
      error = "Bibliotecário não encontrado"
    }
  }

  response = $model
}