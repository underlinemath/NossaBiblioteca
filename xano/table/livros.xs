table "livros" {
  schema {
    int id
    int categoria_id
    text titulo filters=trim
    text autor filters=trim
    text isbn filters=trim
    text descricao
    bool ativo = true
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    { type: "primary", field: [{ name: "id" }] },
    { type: "btree", field: [{ name: "categoria_id" }] },
    { type: "btree|unique", field: [{ name: "isbn" }] }
  ]
}
