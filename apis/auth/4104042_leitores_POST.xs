// Add leitores record
query leitores verb=POST {
  api_group = "auth"

  input {
    dblink {
      table = "leitores"
    }
  }

  stack {
    db.add leitores {
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