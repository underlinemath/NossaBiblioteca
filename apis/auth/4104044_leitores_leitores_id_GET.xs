// Get leitores record
query "leitores/{leitores_id}" verb=GET {
  api_group = "auth"

  input {
    int leitores_id? filters=min:1
  }

  stack {
    db.get leitores {
      field_name = "id"
      field_value = $input.leitores_id
    } as $model
  
    precondition ($model != null) {
      error_type = "notfound"
      error = "Not Found"
    }
  }

  response = $model
}