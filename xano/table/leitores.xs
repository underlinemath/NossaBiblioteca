table "leitores" {
  schema {
    int id
    text nome filters=trim
    email email
    text telefone
    text status
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    { type: "primary", field: [{ name: "id" }] },
    { type: "btree|unique", field: [{ name: "email" }] }
  ]
}
