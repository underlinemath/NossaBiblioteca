// Edit leitores record
query "leitores/{leitores_id}" verb=PATCH {
  api_group = "auth"

  input {
    int leitores_id? filters=min:1
    dblink {
      table = "leitores"
    }
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $raw_input
  
    db.patch leitores {
      field_name = "id"
      field_value = $input.leitores_id
      data = `$input|pick:($raw_input|keys)`|filter_null|filter_empty_text
    } as $model
  }

  response = $model
}