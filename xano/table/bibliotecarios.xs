table "bibliotecarios" {
  schema {
    int id
    text nome filters=trim
    email email
    password senha
    text permissoes
    text status
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    { type: "primary", field: [{ name: "id" }] },
    { type: "btree|unique", field: [{ name: "email" }] }
  ]
}
