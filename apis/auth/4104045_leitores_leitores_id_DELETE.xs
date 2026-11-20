// Delete leitores record
query "leitores/{leitores_id}" verb=DELETE {
  api_group = "auth"

  input {
    int leitores_id? filters=min:1
  }

  stack {
    db.del leitores {
      field_name = "id"
      field_value = $input.leitores_id
    }
  }

  response = null
}