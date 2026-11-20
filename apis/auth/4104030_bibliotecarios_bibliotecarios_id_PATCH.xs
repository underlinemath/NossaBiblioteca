// Edit bibliotecarios record
query "bibliotecarios/{bibliotecarios_id}" verb=PATCH {
  api_group = "auth"
  auth = "bibliotecarios"

  input {
    int bibliotecarios_id filters=min:1
    dblink {
      table = "bibliotecarios"
    }
  }

  stack {
    db.get bibliotecarios {
      field_name = "id"
      field_value = $input.bibliotecarios_id
    } as $existente
  
    precondition ($existente != null) {
      error_type = "notfound"
      error = "Bibliotecário não encontrado"
    }
  
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $raw_input
  
    db.patch bibliotecarios {
      field_name = "id"
      field_value = $input.bibliotecarios_id
      data = `$input|pick:($raw_input|keys)`|filter_null|filter_empty_text
    } as $model
  }

  response = $model
}