// Update leitores record
query "leitores/{leitores_id}" verb=PUT {
  api_group = "auth"

  input {
    int leitores_id? filters=min:1
    dblink {
      table = "leitores"
    }
  }

  stack {
    db.edit leitores {
      field_name = "id"
      field_value = $input.leitores_id
      enforce_hidden_fields = false
      data = {
        nome      : $input.nome
        email     : $input.email
        telefone  : $input.telefone
        status    : $input.status
        created_at: $input.created_at
        updated_at: $input.updated_at
      }
    } as $model
  }

  response = $model
}