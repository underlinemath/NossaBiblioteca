table leitores {
  auth = true

  schema {
    int id
    text nome filters=trim
    email email
    password senha
    text telefone
    text status
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email"}]}
  ]

  guid = "F81nr6MrdIo6wy-9El9BMM0n1sM"
}