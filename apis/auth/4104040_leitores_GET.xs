// Query all leitores records
query leitores verb=GET {
  api_group = "auth"

  input {
  }

  stack {
    db.query leitores {
      return = {type: "list"}
    } as $model
  }

  response = $model
}