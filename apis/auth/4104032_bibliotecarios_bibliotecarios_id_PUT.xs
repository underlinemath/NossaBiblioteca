// Update bibliotecarios record
query "bibliotecarios/{bibliotecarios_id}" verb=PUT {
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
  
    db.edit bibliotecarios {
      field_name = "id"
      field_value = $input.bibliotecarios_id
      enforce_hidden_fields = false
      data = {
        nome      : $input.nome
        email     : $input.email
        senha     : $input.senha
        permissoes: $input.permissoes
        status    : $input.status
        created_at: $input.created_at
        updated_at: $input.updated_at
      }
    } as $model
  }

  response = $model
}